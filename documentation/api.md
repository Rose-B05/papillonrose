# API Routes — Papillon Rose

## Routes publiques

### `GET /api/products`
Retourne la liste complète des produits depuis `data/produits.ts`.

### `GET /api/products/stock`
Retourne la carte de stock dynamique (overrides depuis KV).
```json
{ "1": { "stock": 5 }, "42": { "stock": 3 } }
```

### `POST /api/products/[id]/view`
Suivi des vues produit pour les clients connectés avec consentement marketing.
- **Body** : `{ productId: number }`
- **Dédup** : 24h par client+produit (`product_view_dedup:{email}:{productId}`)
- **Auth** : Requiert `customer_session` cookie

### `GET /api/availability`
Vérifie la disponibilité pour un produit et une plage de dates.
- **Query** : `productId`, `startDate`, `endDate`
- **Retourne** : `{ blocked: Record<string, string>, availableStock: number }`

### `POST /api/bookings`
Crée une réservation depuis le panier.
- **Body** : `{ items: CartItem[], client: ClientInfo, dates, deliveryOption, totalTtc }`
- **Logique** : Vérifie stock, vérifie dates bloquées, calcule totaux, bloque dates, crée PaymentIntent Stripe
- **Retourne** : `{ bookingId, clientSecret }`

### `GET /api/bookings`
Récupère une réservation par ID (admin uniquement).
- **Query** : `id`

### `POST /api/quotes`
Crée un devis à partir d'un panier.
- **Body** : `{ items, client, dateEdits, totalTtc }`
- **Logique** : Sanitize input, vérifie stock, envoie email confirmation ou refus
- **Emails** : `sendQuoteConfirmation` + `sendAdminQuoteNotification` ou `sendQuoteStockRefused`

### `POST /api/payments`
Confirme un paiement Stripe.
- **Runtime** : Node.js
- **Body** : `{ paymentIntentId }`
- **Logique** : Vérifie le PaymentIntent, enregistre le paiement, met à jour le booking, envoie emails

### `POST /api/chat`
Chatbot IA (MiniMax M2.7).
- **Body** : `{ messages: {role, content}[] }`
- **Réponse** : `{ reply: string }` avec filtrage des balises `<thinking>`

### `POST /api/chat-quote`
Envoie les données d'un lead collecté par le chatbot.
- **Body** : `{ client, message }`

### `POST /api/newsletter/subscribe`
Inscrit à la newsletter (double opt-in).
- **Body** : `{ email }`
- **Crée** : `NewsletterSubscriber` avec statut `pending`

### `GET /api/newsletter/confirm?token=xxx`
Confirme l'inscription newsletter (double opt-in).
- **Redirige** vers `/?newsletter=confirmed`

### `GET /api/newsletter/unsubscribe?email=xxx`
Désinscrit de la newsletter.
- **Redirige** vers `/?newsletter=unsubscribed`

## Routes client (authentification requise)

### `POST /api/customer/register`
Inscription client.
- **Body** : `{ email, password, prenom, nom, telephone?, adresse?, newsletterConsent? }`
- **Crée** : Compte + cookie `customer_session` (30 jours) + email bienvenue (fire-and-forget)

### `POST /api/customer/login`
Connexion client.
- **Body** : `{ email, password }`
- **Rate limit** : 5 tentatives / 15 min
- **Retourne** : cookie `customer_session`

### `POST /api/customer/logout`
Déconnexion client. Supprime le cookie.

### `GET /api/customer/me`
Retourne les infos du client connecté.

### `GET /api/customer/profile`
Retourne le profil complet du client.

### `PUT /api/customer/profile`
Met à jour le profil client.
- **Body** : `{ prenom?, nom?, telephone?, adresse?, marketingConsent? }`

### `GET /api/customer/favorites`
Retourne les IDs des produits favoris du client.

### `PUT /api/customer/favorites`
Sauvegarde les favoris du client.
- **Body** : `{ favorites: number[] }`

### `GET /api/customer/quotes`
Retourne l'historique des devis du client (triés par date).

## Routes admin (authentification requise)

### `POST /api/admin/login`
Connexion admin.
- **Body** : `{ email, password }`
- **Rate limit** : 5 tentatives / 15 min (global)
- **Cookie** : `admin_session` (httpOnly, sameSite: strict)

### `POST /api/admin/logout`
Déconnexion admin.

### `GET /api/admin/quotes`
Retourne tous les devis (triés par date).

### `GET /api/admin/stats`
Statistiques par produit (nombre de locations, revenus).
- **Calcule** : Depuis les bookings confirmés/retournés

### `GET /api/admin/active-bookings`
Retourne les réservations actives (statut confirmé ou acompte_paye).

### `GET /api/admin/returned`
Historique des alertes de retard pour un booking.
- **Query** : `bookingId`

### `POST /api/admin/returned`
Marque un booking comme retourné.
- **Body** : `{ bookingId }`
- **Logique** : Incrémente le stock, débloque les dates, met à jour le statut

### `POST /api/admin/send-payment-link`
Crée une session Stripe Checkout pour le solde (70%).
- **Body** : `{ quoteId }`
- **Email** : Envoie le lien de paiement au client

### `GET /api/admin/site-mode`
Retourne le mode actuel du site (development/production).

### `PUT /api/admin/site-mode`
Change le mode du site.
- **Body** : `{ mode: "development" | "production" }`

### `GET /api/admin/analytics`
Données GA4 pour le dashboard.
- **Query** : `period` (7, 30, ou 90 jours)
- **Runtime** : Node.js

## Routes webhook/cron

### `POST /api/webhook/stripe`
Webhook Stripe.
- **Runtime** : Node.js
- **Événement** : `checkout.session.completed` pour les soldes
- **Logique** : Met à jour le devis en `solde_paye`, envoie email confirmation

### `GET /api/cron/late-alerts`
Alertes de retard quotidiennes (09:00).
- **Auth** : `CRON_SECRET` (Bearer token)
- **Logique** : Trouve les bookings en retard, envoie alertes email

### `GET /api/cron/browse-reminders`
Rappels de navigation quotidiens (10:00).
- **Auth** : `CRON_SECRET` (Bearer token)
- **Logique** : Envoie un email pour les produits vus il y a 15 jours sans réservation
