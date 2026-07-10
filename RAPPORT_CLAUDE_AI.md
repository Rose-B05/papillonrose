# Rapport d'intervention — Site Papillon Rose

## Informations générales
- **Projet** : Papillon Rose — Site de location mobilier & décoration événements
- **Stack** : Next.js 16 + Tailwind CSS + Framer Motion
- **Repo** : https://github.com/Rose-B05/papillonrose
- **Production** : https://papillon-rose.vercel.app
- **Vercel** : `rosedigitalcampus-4666s-projects/papillon-rose`
- **Période** : Juin–Juillet 2026

---

## 1. Corrections de build & déploiement

| Commit | Description |
|--------|-------------|
| `3c48612` | Désindexation complète du site (noindex) |
| `3454cbf` | Déplacement PROD098.png vers le bon dossier (`public/images/` au lieu de `public/images/prod/`) |
| `4eae463` | Déploiement Vercel avec cache nettoyé (erreur Turbopack `getPrixForProduct`) |

---

## 2. Image catégorie "Figurines & Jeux"

| Commit | Description |
|--------|-------------|
| `1c85f83` | Remplacement image catégorie par PROD011 (constante `CATEGORY_IMAGES`) |
| `b2ab799` | Remplacement image catégorie par PROD098 (constante + copie fichier) |
| `3e415e6` | Remplacement image dans le carrousel inline (`image:` prop) — la constante seule ne suffisait pas |
| `3454cbf` | Correction chemin fichier : `public/images/prod/` → `public/images/` |

**Leçon apprise** : Le carrousel utilise des props `image` inline, pas la constante `CATEGORY_IMAGES`. Les deux références doivent être mises à jour.

---

## 3. Carrousel "Nos Catégories" — Ajustements visuels

| Commit | Description |
|--------|-------------|
| `0b22f0b` | Agrandissement modéré cartes (+15-18%) + espacement section `py-8 mt-12` |
| `68c24da` | Uniformisation espacement image/titre (spacer `24px/32px`, `translateY` réduit) |
| `d82f971` | Recalibrage hauteur cartes + image container + spacer pour uniformité totale |

**Valeurs finales (mobile / desktop)** :
- Container : `300px` / `400px` / `540px`
- Card : `230px` / `330px`
- Image : `190px` / `320px`
- Image container : `85px` / `140px`
- `translateY` : `35%` / `40%`
- Spacer image→texte : `20px` / `28px`

---

## 4. Footer

| Commit | Description |
|--------|-------------|
| `1859bf1` | Menus empilés verticalement (Navigation → Catégories → Contact) dans un colonne unique |
| `d389299` | Agrandissement cage footer avec débordement vertical (`-mt-[140px]`, `overflow-visible`) |

---

## 5. Système de variants taille/prix

| Commit | Description |
|--------|-------------|
| `96e4fdd` | Sélecteur taille pour Lanterne Argent (template existant) |
| `4eae463` | Ajout `variants` explicites pour Bougeoir Or, Urne Cage, Large Bougeoir Or |

**Produits concernés** :

| Produit | Tailles | Prix/jour |
|---------|---------|-----------|
| Lanterne Argent | Moyen, Grand | 8€, 15€ |
| Bougeoir Or | 21,3cm, 18cm, 16,3cm | 6€, 4€, 2€ |
| Large Bougeoir Or | 15cm, 20cm, 25cm | 5€, 6€, 7€ |
| Urne Cage | Standard, Grand | 7€, 9€ |

**Fonctionnement** : Le modal produit détecte `product.variants` via `resolveVariants()` et affiche automatiquement les boutons pilules avec prix/jour inline + prix principal dynamique + bouton "Sélectionnez une taille" tant qu'aucune taille n'est choisie.

---

## 6. SEO — Désindexation

| Fichier | Modification |
|---------|-------------|
| `app/layout.tsx` | `robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } }` |
| `app/robots.ts` | Créé — `User-agent: * / Disallow: /` (Next.js `MetadataRoute.Robots`) |
| `next.config.mjs` | Header `X-Robots-Tag: noindex, nofollow` sur toutes les routes |

---

## 7. Fichiers modifiés (résumé)

| Fichier | Rôle |
|---------|------|
| `components/overflow-carousel.tsx` | Carrousel catégories (hauteur, espacement, images) |
| `components/papillon-rose-site.tsx` | Footer (empilement menus, cage), catégorie images, section vedette |
| `data/produits.ts` | Variants pour 3 produits (Bougeoir Or, Urne Cage, Large Bougeoir Or) |
| `app/layout.tsx` | Meta robots noindex |
| `app/robots.ts` | Créé — blocage total robots |
| `next.config.mjs` | Header X-Robots-Tag |
| `public/images/PROD098.png` | Ajouté (ours en peluche pour Figurines & Jeux) |

---

## 8. Conventions & pièges identifiés

1. **`data/produits.ts` est dans `.gitignore`** mais tracké — nécessite `git add -f` pour les nouveaux fichiers
2. **Carrousel utilise des props inline** pour les images, pas la constante `CATEGORY_IMAGES`
3. **Images catégories** : chemin `public/images/PRODxxx.png` (pas `public/images/prod/`)
4. **Vercel cache** : Le cache de build Vercel peut causer des erreurs Turbopack — résolu par un deploy CLI forcé
5. **WhatsApp désactivé** via `IS_FAKE` (numéro factuel) — réactivation via env var `NEXT_PUBLIC_WHATSAPP_NUMBER`
6. **Chatbot** : Seul bouton flottant (`fixed bottom-6 right-6 z-50`)

---

## 9. URLs couvertes par la désindexation

Toutes les routes sont concernées :
- `/` (accueil)
- `/catalogue`, `/reservation`, `/a-propos`, `/faq`
- `/conditions-location`, `/mentions-legales`
- `/admin/stats`
- `/api/*` (bookings, chat, availability, etc.)
- `/robots.txt`

---

*Rapport généré le 6 juillet 2026*
