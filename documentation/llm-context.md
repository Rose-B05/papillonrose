# Contexte LLM — Papillon Rose

## Usage

Ce document fournit un contexte optimisé pour les modèles de langage (LLM) travaillant sur ce codebase. Il resume les informations essentielles pour comprendre, maintenir et étendre le projet.

## Identité du projet

- **Nom** : Papillon Rose
- **Domaine** : `www.papillonrose.fr`
- **Type** : Site de location mobilier/décoration événementielle en Île-de-France
- **Stack** : Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Vercel KV, Stripe, Nodemailer

## Règles critiques

1. **Pas de NextAuth** — Auth admin avec bcrypt + httpOnly cookie (`admin_session`)
2. **Auth client** — Cookie `customer_session` (30 jours), bcrypt, KV (`customer:{email}`)
3. **Pas de modification du catalogue** — `data/produits.ts` est en lecture seule
4. **Stock deux couches** — Base statique dans `produits.ts`, overrides dynamiques en KV (`stock:{productId}`)
5. **Panier client-side** — localStorage uniquement, pas de réservation serveur temporaire
6. **Emails fire-and-forget** — Jamais bloquant, log dans `email_logs` en KV
7. **Dark mode** — Déclenché manuellement par l'utilisateur, jamais automatique
8. **`useTheme()`** — Hook unique pour le dark mode (ThemeContext)
9. **Mode site** — KV `site_mode` contrôle robots.txt, sitemap, meta robots dynamiquement
10. **Cron secrets** — Toujours requis, pas de bypass

## Structure des fichiers

```
app/
├── page.tsx                    # Homepage → <PapillonRoseSite />
├── layout.tsx                  # Providers (Cart, Theme), JSON-LD, fonts
├── compte/page.tsx             # Compte client (login, profil, favoris)
├── reservation/page.tsx        # Wizard 4 étapes (918 lignes)
├── admin/(authenticated)/      # 14 sections admin (sidebar AdminShell)
│   ├── layout.tsx             # AdminShell wrapper
│   ├── page.tsx               # Devis
│   ├── analytics/page.tsx     # GA4 dashboard
│   └── seo/page.tsx           # Toggle dev/prod
├── api/
│   ├── bookings/route.ts      # POST créer, GET lire
│   ├── quotes/route.ts        # POST créer devis
│   ├── payments/route.ts      # POST confirmer paiement
│   ├── chat/route.ts          # POST chatbot MiniMax
│   ├── admin/                 # Routes admin (auth requise)
│   ├── customer/              # Routes client (auth requise)
│   ├── newsletter/            # Double opt-in
│   └── cron/                  # Late alerts + browse reminders
├── robots.txt/route.ts        # Dynamique (mode dev/prod)
└── sitemap.xml/route.ts       # Dynamique (mode dev/prod)

components/
├── papillon-rose-site.tsx     # Composant principal (2270 lignes)
├── cart-context.tsx           # Context panier
├── calendar.tsx               # Calendrier disponibilités
├── catalog-*.tsx              # Catalogue (filtres + galerie)
├── chatbot.tsx                # Chatbot IA
├── accessibility-panel.tsx    # Panneau a11y + dark mode
└── admin/AdminShell.tsx       # Layout admin

lib/
├── db.ts                      # CRUD Vercel KV (toutes collections)
├── types.ts                   # Interfaces TypeScript
├── auth.ts                    # Auth admin (bcrypt, cookie)
├── customer-auth.ts           # Auth client (bcrypt, cookie)
├── email.ts                   # Fonctions email (nodemailer)
├── order-confirmation.ts      # Email confirmation (HTML)
├── browse-reminders.ts        # Rappels navigation (15j)
├── stock.ts                   # Stock dynamique (getStock, getAvailableStock)
├── rental-rules.ts            # Validation règles location
├── rental-dates.ts            # Calcul dates + pénalités
├── delivery.ts                # Frais livraison (Haversine)
├── security.ts                # Rate limit, validation, sanitization
├── newsletter.ts              # Double opt-in
├── ga4.ts / ga4-reports.ts   # Analytics GA4
├── theme-context.tsx          # ThemeContext (dark mode)
└── site-mode.ts               # getRobotsMeta()

data/
└── produits.ts                # 84 produits, 11 catégories
```

## Types principaux

```typescript
// lib/types.ts
Product { id, nom, categorie, stock, dimension?, prix, image, badge?, actif? }
CartItem { product: Product, quantity: number, dateStart?: string, dateEnd?: string }
Booking { id, items, client, totalTtc, totalHt, tva, deliveryFee, deposit, status, createdAt }
QuoteRequest { id, items, client, totalTtc, status, customerEmail?, createdAt }
ClientInfo { prenom, nom, email, telephone, eventType?, eventDate?, venue?, guests?, deliveryOption }
PaymentRecord { id, bookingId, amount, currency, stripePaymentIntentId, status, createdAt }
EmailLog { id, type, to, subject, status, error?, bookingId?, createdAt }
ProductView { id, email, productId, viewedAt }
NewsletterSubscriber { email, status, confirmToken, subscribedAt, confirmedAt?, unsubscribedAt? }
Customer { email, prenom, nom, telephone?, adresse?, passwordHash, marketingConsent?, createdAt }
```

## Statuts des devis

```
en_attente → stock_confirmant → acompte_paye → solde_paye
                ou
en_attente → stock_refuse
```

## Statuts des réservations

```
en_attente → acompte_paye → confirme → retourne
```

## Variables d'environnement critiques

| Variable | Côté | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SITE_URL` | Client | URL du site (défaut: papillonrose.fr) |
| `STRIPE_SECRET_KEY` | Serveur | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Serveur | Secret webhook |
| `SMTP_*` | Serveur | Config SMTP Gmail |
| `ADMIN_PASSWORD_HASH` | Serveur | Hash bcrypt admin |
| `CRON_SECRET` | Serveur | Secret cron jobs |
| `MINIMAX_API_KEY` | Serveur | Clé API MiniMax |
| `KV_REST_API_URL/TOKEN` | Serveur | Vercel KV |
| `GA4_PROPERTY_ID` | Serveur | ID GA4 |
| `GOOGLE_SERVICE_ACCOUNT_*` | Serveur | Credentials GA4 |

## Patterns importants

### Stock dynamique
```typescript
import { getStock, getAvailableStock, getMaxQtyForProduct } from '@/lib/stock'
const stock = await getStock()                    // Tous les stocks
const available = await getAvailableStock(id, start, end)  // Pour une date
const max = await getMaxQtyForProduct(id, start, end)     // Max commandable
```

### Auth admin
```typescript
import { verifyAdminSession } from '@/lib/security'
const admin = await verifyAdminSession(cookie)
if (!admin) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
```

### Dark mode
```typescript
import { useTheme } from '@/lib/theme-context'
const { theme, toggleTheme } = useTheme()
// theme: 'light' | 'dark'
```

### Email (fire-and-forget)
```typescript
import { sendBookingConfirmation } from '@/lib/order-confirmation'
try {
  await sendBookingConfirmation(booking)
  await saveEmailLog({ id, type, to, subject, status: 'sent' })
} catch (err) {
  await saveEmailLog({ id, type, to, subject, status: 'failed', error: sanitizeError(err) })
}
```

## Pièges connus

1. **`lib/stock.ts` est async** — Toujours `await getStock()`
2. **MiniMax thinking** — Les balises `<thinking>` ne sont pas désactivables, filtrées par regex
3. **Panier** — Soft guard côté client, vraie validation côté serveur (booking API)
4. **Cart context** (`components/cart-context.tsx` ligne 45) — Utilise `product.stock` (base statique)
5. **Logout admin** — Utilise `window.location.href` (reload complet) pour éviter le flash sidebar
6. **ThemeContext défaut** — `'light'` en `useState`, pas de `prefers-color-scheme`
7. **Cron secrets** — Toujours requis, même en développement
8. **`ignoreBuildErrors: true`** — Masque les erreurs TypeScript au build
9. **`@vercel/kv` v3** — Déprécié mais fonctionnel
10. **Images** — `unoptimized: true` (pas d'optimisation Vercel)

## Commandes utiles

```bash
pnpm run dev          # Serveur développement
pnpm run build        # Build production
pnpm run lint         # ESLint
```

## Fichiers à ne pas modifier

- `data/produits.ts` — Catalogue statique
- `_snapshot/` — Copies historiques
- `next.config.mjs` — Headers sécurité (sauf si nécessaire)
- `middleware.ts` — Protection routes (sauf si nécessaire)

## Extensions courantes

### Ajouter un produit
→ Modifier `data/produits.ts` (ajouter dans le tableau `produits`)

### Ajouter une route API
→ Créer `app/api/[nom]/route.ts` avec GET/POST/PUT/DELETE

### Ajouter une page admin
→ Créer `app/admin/(authenticated)/[nom]/page.tsx`

### Ajouter un composant
→ Créer `components/[nom].tsx` et l'importer

### Ajouter une collection KV
→ Ajouter les fonctions CRUD dans `lib/db.ts` avec index explicite
