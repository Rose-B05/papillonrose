# Composants — Papillon Rose

## Composants principaux (site public)

### `papillon-rose-site.tsx` (2270 lignes)
**Le cœur du site.** Composant client monolithique contenant :
- **Navbar** : logo, navigation (Accueil, Catalogue, Réservation, FAQ, Contact), icône compte/panier
- **Hero** : vidéo de fond + CTA
- **Carrousel catégories** : coverflow 3D avec rotation auto
- **Catalogue** : grille produits avec filtres (`CatalogFilters` + `CatalogGallery`)
- **Modale produit** : images, sélecteur dates/quantité, prix dynamique, bouton panier/favoris
- **Panier latéral** : sidebar avec récapitulatif, bouton réservation
- **Page contact** : formulaire + carte Leaflet avec itinéraire
- **Footer** : liens, réseaux sociaux, newsletter (`FooterNewsletterForm`)
- **Intégrations** : Chatbot, bouton WhatsApp, panneau accessibilité

### `cart-context.tsx` (73 lignes)
- `CartProvider` : context React pour l'état du panier
- Persistance localStorage
- Actions : `addToCart`, `removeFromCart`, `updateQuantity`, `clearCart`
- Validation stock côté client (soft guard)

### `calendar.tsx` (258 lignes)
- `AvailabilityCalendar` : calendrier double mois
- Détecte les dates bloquées (appel API `/api/availability`)
- Affiche le stock disponible par date
- Validation des règles de location (début/fin)
- Affiche les jours bloqués en rouge, disponibles en vert

### `catalog-filters.tsx` (297 lignes)
- Panneau de filtres multi-sections
- Thèmes, couleurs, budget, stock, disponibilité dates
- Inputs date empilés verticalement
- Pilules de tags actifs pour suppression

### `catalog-gallery.tsx` (127 lignes)
- Grille de produits avec intégration lightbox
- Actions panier/favoris sur chaque carte
- Stock effectif affiché (`getEffectiveStock`)

### `chatbot.tsx` (256 lignes)
- Chatbot IA flottant (MiniMax M2.7)
- Limite de 20 messages par session
- Extraction devis depuis les réponses IA (`[DEVIS]...[/DEVIS]`)
- Soumission de leads via `/api/chat-quote`
- Filtre des balises `<thinking>` des réponses

### `whatsapp-button.tsx` (33 lignes)
- Bouton flottant WhatsApp (caché si pas de numéro configuré)
- Ouvre une conversation avec le numéro du site

### `accessibility-panel.tsx` (222 lignes)
- Panneau flottant avec bouton trigger
- Options : taille texte, contraste élevé, réduire animations, police dyslexie (OpenDyslexic), mode sombre
- Utilise `useTheme()` pour le dark mode
- Piégeage clavier pour l'accessibilité

### `delivery-map.tsx` (163 lignes)
- Carte Leaflet avec routage OSRM
- Géocodage Nominatim
- Support dark/light tiles
- Itinéraire entre deux points

### `gallery-lightbox.tsx` (113 lignes)
- Lightbox plein écran avec navigation clavier/tactile
- Zoom, fermeture sur ESC ou clic extérieur

### `overflow-carousel.tsx` (250 lignes)
- Carrousel coverflow avec rotation auto et drag

### `category-coverflow.tsx` (249 lignes)
- Carrousel 3D avec transforms perspective

### `product-carousel.tsx` (95 lignes)
- Carrousel d'images tactile avec flèches et points

### `before-after.tsx` (67 lignes)
- Comparateur d'images avant/après avec drag

### `faq-accordion.tsx` (56 lignes)
- Accordion FAQ avec animation expand/collapse

## Composants admin

### `admin/AdminShell.tsx` (62 lignes)
- Layout wrapper avec sidebar + topbar
- Bannière mode développement (ambre)
- Titre de page dynamique basé sur le pathname

### `admin/AdminSidebar.tsx` (160 lignes)
- Sidebar navigation avec 14 sections
- Toggle mobile (hamburger)
- Déconnexion via `window.location.href` (reload complet)

### `admin/ModulePlaceholder.tsx` (35 lignes)
- Placeholder pour les modules admin non construits (Phase 1-5)

## Composants UI

### `ui/button.tsx` (58 lignes)
- Bouton shadcn/ui avec primitive Base UI
- Système de variantes/tailles via CVA (class-variance-authority)
