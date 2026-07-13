# Site Overview — Papillon Rose

## Identité du projet

| Champ | Valeur |
|-------|--------|
| Nom | **Papillon Rose** |
| Domaine | `www.papillonrose.fr` |
| Type | Site vitrine + e-commerce (location de mobilier et décoration événementielle) |
| Zone | Île-de-France (94, 93, 95, 77, 91) |
| Stack technique | Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui |
| Hébergement | Vercel |
| Base de données | Vercel KV (Redis) |
| Paiements | Stripe (Checkout + PaymentIntent) |
| Emails | Nodemailer (SMTP Gmail) |
| Analytics | Google Analytics 4 (service account) |
| Chatbot | MiniMax M2.7 |

## Résumé du site

**Papillon Rose** est une plateforme de location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. Le site propose :

1. **Un catalogue de 84 produits** (11 catégories) avec photos, prix, disponibilités
2. **Un wizard de réservation en 4 étapes** (panier → dates → client → confirmation)
3. **Un système de devis** avec paiement en ligne (acompte 30% + solde 70%)
4. **Un back-office admin** avec gestion des devis, restitutions, statistiques, SEO, analytics
5. **Un chatbot IA** (MiniMax M2.7) pour les questions et collecte de leads
6. **Un compte client** avec historique, favoris, profil RGPD-compliant
7. **Un mode newsletter** avec double opt-in

## Flux utilisateur principal

```
Visiteur → Catalogue → Sélection produits → Panier → Dates → Infos client → Devis
  ↓
Email confirmation devis (admin + client)
  ↓
Paiement acompte 30% (Stripe Checkout)
  ↓
Vérification stock par l'admin → Email confirmé ou refusé
  ↓
Paiement solde 70% (lien Stripe envoyé par l'admin)
  ↓
Livraison le jour J → Restitution → Remboursement caution
```

## Catégories de produits

| Catégorie | Exemples |
|-----------|----------|
| Mobilier | Chaises, arches, chevalets, photocalls |
| Figurines & Jeux | Totems, figurines, tapis de jeu |
| Bougeoirs & Lustres | Bougeoirs argent/or, lanternes, lustres |
| Verreries | Photophores, fontaines, porte-alliances |
| Cadres | Cadres photo suspendus, moulures dorées |
| Présentoirs & Plateaux | Présentoires bois/velour, plateaux |
| Urnes & Accessoires | Urne cage, sweet bird scotch |
| Art de la Table | Sous-verres, serviettes, nappes, menagères |
| Vases & Pots | Vases laiton, géométriques, dame-jeanne |
| Décoration | Horloges, boas, cages porte-clés |
| Fleurs & Feuillages | Guirlandes glycine, bouquets, plumes |

## Sécurité

- Auth admin : bcrypt + httpOnly cookie (`admin_session`)
- Auth client : bcrypt + httpOnly cookie (`customer_session`), 30 jours
- Rate limiting : 5 tentatives / 15 min sur les logins
- Headers sécurité : CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy
- Cron jobs protégés par `CRON_SECRET`
- Input validation sur toutes les routes API publiques
- Messages d'erreur sanitizés (pas de fuite d'info serveur)
