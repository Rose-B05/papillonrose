# Pages — Papillon Rose

## Architecture des routes

```
app/
├── layout.tsx                    # Layout racine (fonts, CartProvider, ThemeProvider, JSON-LD)
├── globals.css                   # Tailwind v4, thème, a11y classes
├── page.tsx                      # Homepage (composant PapillonRoseSite)
├── a-propos/page.tsx             # Page à propos
├── conditions-location/page.tsx  # CGV location
├── faq/page.tsx                  # FAQ
├── mentions-legales/page.tsx     # Mentions légales
├── compte/page.tsx               # Compte client (login, profil, favoris, historique)
├── reservation/
│   ├── layout.tsx                # Metadata réservation
│   └── page.tsx                  # Wizard réservation 4 étapes
├── robots.txt/route.ts           # Génération dynamique robots.txt
├── sitemap.xml/route.ts          # Génération dynamique sitemap.xml
└── admin/
    ├── layout.tsx                # Layout admin (passthrough)
    ├── login/page.tsx            # Login admin
    └── (authenticated)/          # Groupe protégé par middleware
        ├── layout.tsx            # AdminShell (sidebar + topbar)
        ├── page.tsx              # Gestion des devis
        ├── dashboard/page.tsx    # Dashboard (placeholder)
        ├── statistiques/page.tsx # Statistiques locations
        ├── restitutions/page.tsx # Gestion des restitutions
        ├── analytics/page.tsx    # Dashboard GA4
        ├── seo/page.tsx          # Panel SEO (mode dev/prod)
        ├── ads/page.tsx          # Google Ads (placeholder)
        ├── audit/page.tsx        # Audit global (placeholder)
        ├── contenu/page.tsx      # Gestion contenu (placeholder)
        ├── formulaires/page.tsx  # Formulaires (placeholder)
        ├── notifications/page.tsx # Notifications (placeholder)
        ├── parametres/page.tsx   # Paramètres (placeholder)
        ├── performance/page.tsx  # Performance (placeholder)
        ├── securite/page.tsx     # Sécurité (placeholder)
        └── utilisateurs/page.tsx # Utilisateurs (placeholder)
```

## Pages publiques

### Homepage (`/`)
- **Type** : Client component (`PapillonRoseSite`)
- **Contenu** : Hero, carrousel catégories, produits phares, footer avec newsletter
- **Fonctionnalités** : Modale produit, panier latéral, chatbot, bouton WhatsApp, panneau d'accessibilité

### À propos (`/a-propos`)
- **Type** : Server Component
- **Contenu** : Hero, histoire, 3 valeurs (Élégance, Fiabilité, Proximité), statistiques, CTA

### Conditions de location (`/conditions-location`)
- **Type** : Server Component
- **Contenu** : 9 articles (Objet, Étendue, Risques, Conséquences financières, Caution, Assurance, Annulation, Livraison, Litiges)

### FAQ (`/faq`)
- **Type** : Server Component
- **Contenu** : 4 sections (Réservation, Retrait/livraison, Restitution, Paiement)

### Mentions légales (`/mentions-legales`)
- **Type** : Server Component
- **Contenu** : Éditeur, hébergeur, propriété intellectuelle, données personnelles (RGPD), cookies

### Compte client (`/compte`)
- **Type** : Client Component
- **Contenu** : Login/Register, profil éditable, historique devis, grille favoris, toggle newsletter
- **Auth** : Cookie `customer_session` (30 jours)

### Réservation (`/reservation`)
- **Type** : Client Component (918 lignes)
- **Étapes** :
  1. **Panier** : Quantités, suppressions, totaux (HT, TVA 20%, livraison, caution)
  2. **Dates** : Sélecteur calendrier par produit, vérification stock en temps réel
  3. **Client** : Formulaire complet, calcul livraison par code postal, conditions
  4. **Confirmation** : Numéro de réservation

## Pages admin (protégées)

### Login (`/admin/login`)
- **Type** : Client Component
- **Fonction** : Authentification admin, redirection vers la page demandée

### Devis (`/admin`)
- **Type** : Client Component
- **Fonction** : Liste des devis avec statuts, bouton "Envoyer lien solde"

### Statistiques (`/admin/statistiques`)
- **Type** : Client Component
- **Fonction** : Cards résumé + tableau produits (nb locations, revenus)

### Restitutions (`/admin/restitutions`)
- **Type** : Client Component
- **Fonction** : Liste des locations actives, bouton "Valider la restitution"

### Analytics (`/admin/analytics`)
- **Type** : Client Component
- **Fonction** : Dashboard GA4 (KPIs, graphique Recharts, canaux d'acquisition, top pages)

### SEO (`/admin/seo`)
- **Type** : Client Component
- **Fonction** : Toggle dev/prod, statut indexation, liens vérification

### Placeholders (Phase 1-5)
- Dashboard, Utilisateurs, Notifications, Formulaires, Performance, Paramètres, Sécurité, Contenu, Audit, Google Ads

## Routes API

Voir [api.md](./api.md) pour la documentation complète.

## Routes dynamiques

| Route | Type | Description |
|-------|------|-------------|
| `/robots.txt` | GET (dynamic) | robots.txt basé sur le mode site (KV) |
| `/sitemap.xml` | GET (dynamic) | sitemap.xml basé sur le mode site (KV) |
| `/api/products/[id]/view` | POST | Suivi des vues produit (clients connectés) |
