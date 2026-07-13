# Architecture — Papillon Rose

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│                    Vercel Edge                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │   Next.js    │  │  Vercel KV   │  │   Stripe   │ │
│  │   16.2.6    │  │   (Redis)    │  │  Webhook   │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                │                 │        │
│  ┌──────┴──────┐  ┌──────┴───────┐  ┌─────┴──────┐ │
│  │  React 19   │  │  Nodemailer  │  │  MiniMax   │ │
│  │  Tailwind 4 │  │  (SMTP)      │  │  M2.7 API  │ │
│  └─────────────┘  └──────────────┘  └────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Structure du projet

```
site papillon rose/
├── app/                        # Routes Next.js (App Router)
│   ├── layout.tsx              # Layout racine (providers, fonts, JSON-LD)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Thème Tailwind v4
│   ├── a-propos/               # Page à propos
│   ├── conditions-location/    # CGV
│   ├── faq/                    # FAQ
│   ├── mentions-legales/       # Mentions légales
│   ├── compte/                 # Compte client
│   ├── reservation/            # Wizard réservation
│   ├── robots.txt/             # robots.txt dynamique
│   ├── sitemap.xml/            # sitemap dynamique
│   └── admin/                  # Back-office
│       ├── layout.tsx          # Layout admin
│       ├── login/              # Login admin
│       └── (authenticated)/    # Pages protégées
│           ├── layout.tsx      # AdminShell
│           └── [pages]/        # 14 sections admin
├── components/                 # Composants React
│   ├── papillon-rose-site.tsx  # Composant principal (2270 lignes)
│   ├── cart-context.tsx        # Context panier
│   ├── calendar.tsx            # Calendrier disponibilités
│   ├── catalog-*.tsx           # Catalogue (filtres + galerie)
│   ├── chatbot.tsx             # Chatbot IA
│   ├── admin/                  # Composants admin
│   └── ui/                     # Composants shadcn
├── lib/                        # Logique métier
│   ├── db.ts                   # Couche Vercel KV
│   ├── types.ts                # Types TypeScript
│   ├── auth.ts                 # Auth admin
│   ├── customer-auth.ts        # Auth client
│   ├── email.ts                # Fonctions email
│   ├── stock.ts                # Gestion stock
│   ├── rental-rules.ts         # Règles location
│   ├── rental-dates.ts         # Calcul dates
│   ├── delivery.ts             # Calcul livraison
│   ├── stripe.ts               # Stripe helpers
│   ├── security.ts             # Sécurité
│   ├── ga4.ts / ga4-reports.ts # Analytics
│   └── ...                     # Autres modules
├── data/
│   └── produits.ts             # Catalogue statique (84 produits)
├── middleware.ts                # Protection routes admin
├── next.config.mjs             # Config Next.js + headers sécurité
├── vercel.json                 # Crons Vercel
└── package.json                # Dépendances
```

## Couches d'architecture

### 1. Présentation (React + Tailwind)

- **Pages** : Server Components (SSR) pour les pages statiques, Client Components pour l'interactif
- **Composants** : `papillon-rose-site.tsx` comme composant principal, modules dédiés
- **Styling** : Tailwind CSS v4 avec variables CSS pour le dark mode
- **UI** : shadcn/ui + Lucide React pour les icônes

### 2. Logique métier (lib/)

| Module | Responsabilité |
|--------|---------------|
| `db.ts` | CRUD Vercel KV (bookings, quotes, payments, etc.) |
| `types.ts` | Interfaces TypeScript partagées |
| `auth.ts` | Auth admin (bcrypt, cookie) |
| `customer-auth.ts` | Auth client (bcrypt, cookie 30j) |
| `email.ts` | Envoi d'emails (nodemailer/Gmail) |
| `order-confirmation.ts` | Email confirmation réservation (HTML) |
| `browse-reminders.ts` | Rappels navigation (15 jours) |
| `stock.ts` | Stock dynamique (overrides KV) |
| `rental-rules.ts` | Validation règles location |
| `rental-dates.ts` | Calcul dates pickup/retour + pénalités |
| `delivery.ts` | Calcul frais livraison (distance Haversine) |
| `stripe.ts` | Helpers Stripe (PaymentIntent) |
| `security.ts` | Rate limiting, validation input, sanitization |
| `newsletter.ts` | Double opt-in newsletter |
| `ga4.ts` | Client GA4 (service account) |
| `ga4-reports.ts` | Requêtes GA4 parallèles |

### 3. Données

- **Statiques** : `data/produits.ts` (84 produits, prix, stock de base)
- **Dynamiques** : Vercel KV (bookings, quotes, payments, favoris, newsletter, etc.)
- **Index** : Clés explicites `collection:index` pour chaque collection

### 4. API

- **Routes** : App Router (`app/api/`)
- **Auth** : Middleware pour `/admin/*`, vérification cookie pour les routes API
- **Crons** : Vercel crons pour les tâches quotidiennes

## Flux de données

### Réservation

```
1. Client ajoute au panier → localStorage (CartContext)
2. Client clique "Réservation" → /reservation (wizard 4 étapes)
3. Étape "Dates" → GET /api/availability (vérifie dates bloquées)
4. Étape "Confirmation" → POST /api/bookings
   a. Vérifie stock (lib/stock.ts)
   b. Vérifie dates bloquées
   c. Calcule totaux + livraison
   d. Bloque les dates
   e. Crée PaymentIntent Stripe
   f. Retourne clientSecret
5. Client paie → Stripe Checkout
6. Webhook → POST /api/webhook/stripe → met à jour statut
```

### Email

```
1. Événement (booking, devis, etc.)
2. Fonction email (lib/email.ts ou lib/order-confirmation.ts)
3. nodemailer → SMTP Gmail → Destinataire
4. Log → email_logs en KV
```

### Stock

```
1. Stock de base → data/produits.ts (produit.stock)
2. Overrides → Vercel KV (stock:{productId})
3. Stock effectif → lib/stock.ts getStock()
4. Stock disponible → lib/stock.ts getAvailableStock()
   (stock effectif - quantités réservées pour les dates données)
```

## Contextes React

### CartProvider (`components/cart-context.tsx`)
- État : `CartItem[]`
- Persistance : `localStorage`
- Actions : addToCart, removeFromCart, updateQuantity, clearCart

### ThemeProvider (`lib/theme-context.tsx`)
- État : `'light' | 'dark'`
- Persistance : `localStorage('theme-preference')`
- Défaut : `'light'` (pas d'auto-activation)
- Applique : classe `.dark` sur `<html>`

## Sécurité

### Auth admin
- **Middleware** : Redirige `/admin/*` → `/admin/login` si pas de cookie
- **Cookie** : `admin_session` (httpOnly, sameSite: strict, 7 jours)
- **Verification** : bcrypt contre `ADMIN_PASSWORD_HASH`

### Auth client
- **Cookie** : `customer_session` (httpOnly, 30 jours)
- **Verification** : bcrypt contre `passwordHash` stocké en KV

### Rate limiting
- **Admin login** : 5 tentatives / 15 min (global)
- **Customer login** : 5 tentatives / 15 min (par email)
- **Implémentation** : In-memory Map (reset au cold start)

### Validation input
- Email : regex `isValidEmail()`
- Téléphone : regex `isValidPhone()`
- Chaînes : `sanitizeString()` (longueur max, XSS)
- Panier : taille max 100 items
- Messages : taille max 10 000 caractères

### Headers sécurité (next.config.mjs)
- CSP, X-Content-Type-Options, X-Frame-Options, HSTS
- Referrer-Policy, Permissions-Policy
- Cache-Control: no-store sur les API routes

## Déploiement

### Vercel
- **Build** : `npx next build`
- **Install** : `npm install`
- **Framework** : Next.js
- **Crons** : late-alerts (09:00), browse-reminders (10:00)

### Variables d'environnement requises

| Variable | Côté | Description |
|----------|------|-------------|
| `STRIPE_SECRET_KEY` | Serveur | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Serveur | Secret webhook Stripe |
| `SMTP_HOST/PORT/USER/PASS` | Serveur | SMTP Gmail |
| `SMTP_FROM` | Serveur | Email expéditeur |
| `CONTACT_EMAIL` | Serveur | Email admin réception |
| `ADMIN_EMAIL` | Serveur | Email admin |
| `ADMIN_PASSWORD_HASH` | Serveur | Hash bcrypt admin |
| `CRON_SECRET` | Serveur | Secret cron jobs |
| `MINIMAX_API_KEY` | Serveur | Clé API MiniMax |
| `KV_REST_API_URL/TOKEN` | Serveur | Vercel KV |
| `GA4_PROPERTY_ID` | Serveur | ID propriété GA4 |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Serveur | Email service account GA4 |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | Serveur | Clé privée service account GA4 |
| `NEXT_PUBLIC_SITE_URL` | Client | URL du site |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Client | Numéro WhatsApp |
