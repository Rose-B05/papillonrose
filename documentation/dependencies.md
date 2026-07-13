# Dépendances — Papillon Rose

## Dépendances principales

| Package | Version | Usage |
|---------|---------|-------|
| `next` | 16.2.6 | Framework React (App Router) |
| `react` | ^19 | UI library |
| `react-dom` | ^19 | React DOM renderer |
| `typescript` | 5.7.3 | Typage statique |
| `tailwindcss` | ^4.2.0 | CSS framework (v4, config CSS) |
| `@tailwindcss/postcss` | ^4.2.0 | PostCSS plugin Tailwind |
| `postcss` | ^8.5.16 | CSS processor |
| `shadcn` | ^4.8.0 | Composants UI (CLI) |
| `@base-ui/react` | ^1.5.0 | Primitives UI (shadcn) |
| `class-variance-authority` | ^0.7.1 | Variantes de composants (CVA) |
| `clsx` | ^2.1.1 | Utilitaire de classes CSS |
| `tailwind-merge` | ^3.3.1 | Fusion de classes Tailwind |
| `tw-animate-css` | ^1.4.0 | Animations Tailwind |
| `lucide-react` | ^1.16.0 | Icônes |

## Base de données

| Package | Version | Usage |
|---------|---------|-------|
| `@vercel/kv` | ^3.0.0 | Client Vercel KV (Redis) |

## Authentification

| Package | Version | Usage |
|---------|---------|-------|
| `bcryptjs` | ^3.0.3 | Hashage de mots de passe |

## Paiements

| Package | Version | Usage |
|---------|---------|-------|
| `stripe` | ^22.3.0 | API Stripe (PaymentIntent, Checkout) |

## Emails

| Package | Version | Usage |
|---------|---------|-------|
| `nodemailer` | ^9.0.1 | Envoi d'emails (SMTP Gmail) |

## Analytics

| Package | Version | Usage |
|---------|---------|-------|
| `@google-analytics/data` | ^6.1.0 | API GA4 (service account) |
| `@vercel/analytics` | 1.6.1 | Analytics Vercel (Web Vitals) |
| `recharts` | ^3.9.2 | Graphiques (dashboard analytics) |

## Chatbot

| Package | Version | Usage |
|---------|---------|-------|
| `@anthropic-ai/sdk` | ^0.106.0 | SDK Anthropic (non utilisé activement) |

## Carte

| Package | Version | Usage |
|---------|---------|-------|
| `leaflet` | ^1.9.4 | Carte OpenStreetMap |
| `@types/leaflet` | ^1.9.21 | Types TypeScript Leaflet |
| `react-leaflet` | ^5.0.0 | Composants React pour Leaflet |

## Utilitaires

| Package | Version | Usage |
|---------|---------|-------|
| `date-fns` | ^4.4.0 | Manipulation de dates |
| `uuid` | ^14.0.1 | Génération d'UUID |
| `sharp` | ^0.35.2 | Optimisation d'images |

## UI

| Package | Version | Usage |
|---------|---------|-------|
| `react-day-picker` | ^10.0.1 | Sélecteur de dates |

## Dev Dependencies

| Package | Version | Usage |
|---------|---------|-------|
| `@types/node` | ^24 | Types Node.js |
| `@types/react` | ^19 | Types React |
| `@types/react-dom` | ^19 | Types React DOM |
| `pngjs` | ^7.0.0 | Manipulation PNG (scripts) |

## Scripts npm

| Script | Commande | Description |
|--------|----------|-------------|
| `dev` | `next dev` | Serveur de développement |
| `build` | `next build` | Build de production |
| `start` | `next start` | Serveur de production |
| `lint` | `eslint .` | Linting |

## Vérifications de sécurité

| Package | Version | Vulnerabilité | Statut |
|---------|---------|---------------|--------|
| `postcss` | 8.5.16 | XSS (< 8.5.13) | ✅ Corrigé |
| `hono` | 4.12.25 | — | ✅ Via override pnpm |

## Notes techniques

- **Tailwind CSS v4** : Pas de `tailwind.config.ts` — configuration via CSS dans `globals.css`
- **shadcn/ui** : Composants dans `components/ui/` (uniquement `button.tsx` pour l'instant)
- **@vercel/kv v3.0.0** : Déprécié mais fonctionnel
- **pnpm 11** : Les `overrides` de `package.json` ne sont pas respectés (bug connu)
- **Node.js 24** : Bug arborist avec npm — utiliser pnpm
