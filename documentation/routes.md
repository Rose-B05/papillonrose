# Routes — Papillon Rose

## Tableau des routes

### Pages publiques

| Route | Méthode | Type | Description |
|-------|---------|------|-------------|
| `/` | GET | Page | Homepage (composant PapillonRoseSite) |
| `/a-propos/` | GET | Page | À propos (Server Component) |
| `/conditions-location/` | GET | Page | CGV location (Server Component) |
| `/faq/` | GET | Page | FAQ (Server Component) |
| `/mentions-legales/` | GET | Page | Mentions légales (Server Component) |
| `/compte/` | GET | Page | Compte client (Client Component) |
| `/reservation/` | GET | Page | Wizard réservation 4 étapes (Client Component) |

### Routes dynamiques

| Route | Méthode | Type | Description |
|-------|---------|------|-------------|
| `/robots.txt` | GET | Route Handler | robots.txt dynamique (mode dev/prod) |
| `/sitemap.xml` | GET | Route Handler | sitemap.xml dynamique (mode dev/prod) |

### Pages admin

| Route | Méthode | Type | Description |
|-------|---------|------|-------------|
| `/admin/login` | GET | Page | Login admin (hors middleware) |
| `/admin/` | GET | Page | Liste des devis |
| `/admin/dashboard/` | GET | Page | Dashboard (placeholder) |
| `/admin/statistiques/` | GET | Page | Statistiques locations |
| `/admin/restitutions/` | GET | Page | Gestion restitutions |
| `/admin/analytics/` | GET | Page | Dashboard GA4 |
| `/admin/seo/` | GET | Panel SEO | Mode dev/prod |
| `/admin/ads/` | GET | Page | Google Ads (placeholder) |
| `/admin/audit/` | GET | Page | Audit global (placeholder) |
| `/admin/contenu/` | GET | Page | Gestion contenu (placeholder) |
| `/admin/formulaires/` | GET | Page | Formulaires (placeholder) |
| `/admin/notifications/` | GET | Page | Notifications (placeholder) |
| `/admin/parametres/` | GET | Page | Paramètres (placeholder) |
| `/admin/performance/` | GET | Page | Performance (placeholder) |
| `/admin/securite/` | GET | Page | Sécurité (placeholder) |
| `/admin/utilisateurs/` | GET | Page | Utilisateurs (placeholder) |

### API publiques

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/products` | GET | Non | Liste produits |
| `/api/products/stock` | GET | Non | Stock dynamique |
| `/api/products/[id]/view` | POST | Client | Suivi vues produit |
| `/api/availability` | GET | Non | Disponibilité dates |
| `/api/bookings` | POST | Non | Créer réservation |
| `/api/bookings` | GET | Admin | Récupérer réservation |
| `/api/quotes` | POST | Non | Créer devis |
| `/api/payments` | POST | Non | Confirmer paiement |
| `/api/chat` | POST | Non | Chatbot IA |
| `/api/chat-quote` | POST | Non | Lead chatbot |

### API client (auth requise)

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/customer/register` | POST | Non | Inscription |
| `/api/customer/login` | POST | Non | Connexion |
| `/api/customer/logout` | POST | Client | Déconnexion |
| `/api/customer/me` | GET | Client | Infos client |
| `/api/customer/profile` | GET | Client | Profil complet |
| `/api/customer/profile` | PUT | Client | Mettre à jour profil |
| `/api/customer/favorites` | GET | Client | Lire favoris |
| `/api/customer/favorites` | PUT | Client | Sauvegarder favoris |
| `/api/customer/quotes` | GET | Client | Historique devis |

### API newsletter

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/newsletter/subscribe` | POST | Non | S'inscrire |
| `/api/newsletter/confirm` | GET | Non | Confirmer (token) |
| `/api/newsletter/unsubscribe` | GET | Non | Se désinscrire |

### API admin (auth requise)

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/admin/login` | POST | Non | Connexion admin |
| `/api/admin/logout` | POST | Admin | Déconnexion admin |
| `/api/admin/quotes` | GET | Admin | Liste devis |
| `/api/admin/stats` | GET | Admin | Statistiques |
| `/api/admin/active-bookings` | GET | Admin | Réservations actives |
| `/api/admin/returned` | GET | Admin | Historique retours |
| `/api/admin/returned` | POST | Admin | Valider restitution |
| `/api/admin/send-payment-link` | POST | Admin | Lien paiement Stripe |
| `/api/admin/site-mode` | GET | Admin | Lire mode site |
| `/api/admin/site-mode` | PUT | Admin | Changer mode site |
| `/api/admin/analytics` | GET | Admin | Données GA4 |

### API webhook/cron

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `/api/webhook/stripe` | POST | Stripe | Webhook Stripe |
| `/api/cron/late-alerts` | GET | CRON_SECRET | Alertes retard (09:00) |
| `/api/cron/browse-reminders` | GET | CRON_SECRET | Rappels navigation (10:00) |

## Middleware

**Fichier** : `middleware.ts`
**Matcher** : `/admin/:path*`
**Logique** : Redirige vers `/admin/login` si pas de cookie `admin_session`, sauf pour `/admin/login` et `/api/*`

## Crons Vercel (`vercel.json`)

| Cron | Schedule | Route |
|------|----------|-------|
| Late alerts | `0 9 * * *` | `/api/cron/late-alerts` |
| Browse reminders | `0 10 * * *` | `/api/cron/browse-reminders` |
