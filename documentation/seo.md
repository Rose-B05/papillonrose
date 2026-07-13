# SEO — Papillon Rose

## Stratégie SEO

### Mode développement/production

Le site utilise un **système de bascule dynamique** stocké en Vercel KV :

| Mode | Robots.txt | Sitemap | Meta robots | Indexation |
|------|------------|---------|-------------|------------|
| `development` | `Disallow: /` | Vide | `noindex, nofollow` | Bloquée |
| `production` | `Allow: /` + sitemap | 6 pages | `index, follow` | Autorisée |

**Fichier** : `lib/site-mode.ts` — `getRobotsMeta()`

### Configuration

- **Admin panel** : `/admin/seo` — toggle entre modes
- **API** : `GET/PUT /api/admin/site-mode`
- **Clé KV** : `site_mode` (défaut : `development`)

## Balises meta

### Layout racine (`app/layout.tsx`)

```typescript
{
  metadataBase: new URL("https://www.papillonrose.fr"),
  title: {
    default: "Papillon Rose — Location mobilier & décoration événements en Île-de-France",
    template: "%s | Papillon Rose",
  },
  description: "Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. X références, devis sous 24h, livraison 94/93/95/77/91.",
  icons: {
    icon: [
      { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
      { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-icon.png",
  },
  robots: {
    index: <dynamique>, follow: <dynamique>,
    googleBot: { index: <dynamique>, follow: <dynamique> },
  },
}
```

### JSON-LD (Schema.org)

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Papillon Rose",
  "description": "Location de mobilier et décoration pour événements en Île-de-France",
  "url": "https://www.papillonrose.fr",
  "email": "papillonrosebertha@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Créteil",
    "addressRegion": "Île-de-France",
    "addressCountry": "FR"
  },
  "areaServed": ["94", "93", "95", "77", "91"],
  "priceRange": "€€"
}
```

## URLs canoniques

| Page | URL | Priorité |
|------|-----|----------|
| Homepage | `https://www.papillonrose.fr/` | 1.0 |
| Catalogue | `https://www.papillonrose.fr/` (section) | — |
| À propos | `https://www.papillonrose.fr/a-propos/` | 0.6 |
| FAQ | `https://www.papillonrose.fr/faq/` | 0.5 |
| Conditions | `https://www.papillonrose.fr/conditions-location/` | 0.3 |
| Mentions légales | `https://www.papillonrose.fr/mentions-legales/` | 0.2 |
| Réservation | `https://www.papillonrose.fr/reservation/` | 0.8 |
| Compte | `https://www.papillonrose.fr/compte/` | 0.4 |

## Sitemap dynamique (`app/sitemap.xml/route.ts`)

- **Mode production** : 6 pages statiques avec lastmod, changefreq, priority
- **Mode développement** : Sitemap vide (pas de pages indexées)

## Robots.txt dynamique (`app/robots.txt/route.ts`)

- **Mode production** :
  ```
  User-agent: *
  Allow: /
  Sitemap: https://www.papillonrose.fr/sitemap.xml
  ```
- **Mode développement** :
  ```
  User-agent: *
  Disallow: /
  ```

## Headers sécurité (SEO-adjacent)

| Header | Valeur |
|--------|--------|
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| X-XSS-Protection | `1; mode=block` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(self)` |
| CSP | Voir `next.config.mjs` |
| HSTS | `max-age=63072000; includeSubDomains; preload` (si SSL) |

## Pages indexables

| Page | Indexable | Priorité | Raison |
|------|-----------|----------|--------|
| Homepage | Oui | 1.0 | Page principale |
| À propos | Oui | 0.6 | Contenu informatif |
| FAQ | Oui | 0.5 | Contenu utile |
| Réservation | Oui | 0.8 | Conversion |
| Compte | Non* | 0.4 | *Contenu personnalisé |
| Conditions | Oui | 0.3 | Légal |
| Mentions légales | Oui | 0.2 | Légal |
| Admin/* | Non | — | Protégé par auth |
| API/* | Non | — | JSON uniquement |

## Analytics

- **Google Analytics 4** via service account (`lib/ga4.ts`)
- **Dashboard admin** : `/admin/analytics` avec KPIs, graphiques Recharts, canaux d'acquisition, top pages
- **Données** : Utilisateurs actifs, sessions, pages vues, événements clés
- **Périodes** : 7, 30, ou 90 jours

## Recommandations SEO

1. **Basculer en mode Production** via `/admin/seo` une fois le site prêt
2. **Configurer `NEXT_PUBLIC_SITE_URL`** en variable d'environnement Vercel
3. **Ajouter Google Search Console** pour le suivi d'indexation
4. **Configurer HSTS** uniquement quand le domaine a un certificat SSL actif
5. **Soumettre le sitemap** à Google Search Console
