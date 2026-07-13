# Base de données — Papillon Rose

## Stack

- **Stockage** : Vercel KV (Redis-managed)
- **Client** : `@vercel/kv` v3.0.0 (déprécié mais fonctionnel)
- **Modèle** : Collections JSON, CRUD simple, pas de joins
- **Index explicites** : `kv.keys()` est fiable uniquement avec des index dédiés

## Structure des collections

### Bookings (Réservations)

| Clé KV | Type | Description |
|--------|------|-------------|
| `booking:{id}` | JSON | Détails de la réservation |
| `bookings:index` | JSON | Liste des IDs de réservations |

**Schéma Booking** :
```typescript
{
  id: string                    // UUID
  items: CartItem[]             // Produits réservés
  client: ClientInfo            // Infos client
  totalTtc: number              // Total TTC
  totalHt: number               // Total HT
  tva: number                   // TVA (20%)
  deliveryFee: number           // Frais de livraison
  deposit: number               // Acompte (30%)
  status: string                // "en_attente" | "acompte_paye" | "confirme" | "retourne"
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  createdAt: string             // ISO date
}
```

### Blocked Dates (Dates bloquées)

| Clé KV | Type | Description |
|--------|------|-------------|
| `blocked:product:{productId}` | JSON | Map `{ [date]: bookingId }` pour un produit |

**Logique** : Une date est bloquée si elle existe dans la map pour un produit donné.

### Quotes (Devis)

| Clé KV | Type | Description |
|--------|------|-------------|
| `quote:{id}` | JSON | Détails du devis |
| `quotes:index` | JSON | Liste des IDs de devis |

**Schéma QuoteRequest** :
```typescript
{
  id: string
  items: CartItem[]
  client: ClientInfo
  totalTtc: number
  status: string                // "en_attente" | "stock_confirmant" | "stock_refuse" | "acompte_paye" | "solde_paye"
  customerEmail?: string        // Email du client connecté
  createdAt: string
}
```

### Payments (Paiements)

| Clé KV | Type | Description |
|--------|------|-------------|
| `payment:{id}` | JSON | Détails du paiement |
| `payments:index` | JSON | Liste des IDs de paiements |

**Schéma PaymentRecord** :
```typescript
{
  id: string
  bookingId: string
  amount: number
  currency: string              // "eur"
  stripePaymentIntentId: string
  status: string                // "succeeded" | "failed"
  createdAt: string
}
```

### Late Alerts (Alertes de retard)

| Clé KV | Type | Description |
|--------|------|-------------|
| `late_alerts:index` | JSON | Liste des IDs d'alertes |
| `late_alert:{id}` | JSON | Détails de l'alerte |

**Schéma LateAlert** :
```typescript
{
  id: string
  bookingId: string
  daysLate: number
  penaltyPercentage: number     // min(10% + (j-1)*30%, 50%)
  emailSent: boolean
  createdAt: string
}
```

### Stock Overrides (Overrides de stock)

| Clé KV | Type | Description |
|--------|------|-------------|
| `stock:{productId}` | JSON | Overrides de stock dynamique |

**Utilisé par** : `lib/stock.ts` — `getStock()`, `getAvailableStock()`, `getMaxQtyForProduct()`

### Customer Favorites (Favoris client)

| Clé KV | Type | Description |
|--------|------|-------------|
| `favorites:{email}` | JSON | Liste d'IDs de produits favoris |

### Email Logs (Journalisation emails)

| Clé KV | Type | Description |
|--------|------|-------------|
| `email_logs:index` | JSON | Liste des IDs de logs |
| `email_logs:{id}` | JSON | Détails de l'envoi |

**Schéma EmailLog** :
```typescript
{
  id: string
  type: string                  // "booking_confirmation" | "browse_reminder" | ...
  to: string
  subject: string
  status: string                // "sent" | "failed"
  error?: string
  bookingId?: string
  createdAt: string
}
```

### Product Views (Vues produit)

| Clé KV | Type | Description |
|--------|------|-------------|
| `product_views:index` | JSON | Liste des IDs de vues |
| `product_views:{id}` | JSON | Détails de la vue |
| `product_view_dedup:{email}:{productId}` | String TTL 24h | Déduplication des vues |

**Schéma ProductView** :
```typescript
{
  id: string
  email: string
  productId: number
  viewedAt: string              // ISO date
}
```

**Retention** : Nettoyage automatique des vues > 90 jours (RGPD).

### Newsletter Subscribers (Inscrits newsletter)

| Clé KV | Type | Description |
|--------|------|-------------|
| `newsletter:{email}` | JSON | Détails de l'abonnement |
| `newsletter:index` | JSON | Liste des emails |

**Schéma NewsletterSubscriber** :
```typescript
{
  email: string
  status: "pending" | "confirmed" | "unsubscribed"
  confirmToken: string
  subscribedAt: string
  confirmedAt?: string
  unsubscribedAt?: string
}
```

### Site Mode (Mode du site)

| Clé KV | Type | Description |
|--------|------|-------------|
| `site_mode` | String | `"development"` ou `"production"` |

**Utilisé par** : `lib/site-mode.ts`, `app/robots.txt/route.ts`, `app/sitemap.xml/route.ts`

### Customers (Clients)

| Clé KV | Type | Description |
|--------|------|-------------|
| `customer:{email}` | JSON | Détails du client |

**Schéma Customer** :
```typescript
{
  email: string
  prenom: string
  nom: string
  telephone?: string
  adresse?: string
  passwordHash: string          // bcrypt
  marketingConsent?: boolean
  createdAt: string
}
```

### Admin Session (Session admin)

| Clé KV | Type | Description |
|--------|------|-------------|
| `admin:{token}` | String | Email de l'admin |

## Fonctions DB (`lib/db.ts`)

| Fonction | Description |
|----------|-------------|
| `getBooking(id)` / `getAllBookings()` / `saveBooking(booking)` | CRUD bookings |
| `getBlockedDates(productId)` / `setBlockedDates(productId, dates)` | CRUD dates bloquées |
| `getQuote(id)` / `getAllQuotes()` / `saveQuote(quote)` | CRUD devis |
| `savePayment(payment)` / `getPayment(id)` / `getAllPayments()` | CRUD paiements |
| `saveLateAlert(alert)` / `getAllLateAlerts()` | CRUD alertes retard |
| `getStockOverride(productId)` / `setStockOverride(productId, stock)` | Overrides stock |
| `getCustomerFavorites(email)` / `setCustomerFavorites(email, favorites)` | CRUD favoris |
| `saveEmailLog(log)` / `getAllEmailLogs()` | CRUD logs emails |
| `saveProductView(view)` / `getProductViewsByCustomer(email)` | CRUD vues produit |
| `getSiteMode()` / `setSiteMode(mode)` | Lecture/écriture mode site |

## Données statiques (`data/produits.ts`)

- **84 produits** dans un tableau TypeScript
- **11 catégories** : Mobilier, Figurines & Jeux, Bougeoirs & Lustres, Verreries, Cadres, Présentoirs & Plateaux, Urnes & Accessoires, Art de la Table, Vases & Pots, Décoration, Fleurs & Feuillages
- **Fonctions exportées** : `hasRealPhoto(product)`, `getActiveProductsCount()`, `getActiveCategoriesCount()`
- **Chaque produit** : `{ id, nom, categorie, stock, dimension?, prix, image, badge?, actif?, dateAjout? }`
