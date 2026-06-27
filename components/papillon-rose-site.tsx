"use client"

import { useState, useMemo, useEffect } from "react"
import {
  Search,
  ShoppingBag,
  Heart,
  X,
  Plus,
  Minus,
  Menu,
  SlidersHorizontal,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Trash2,

} from "lucide-react"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const PLACEHOLDER = img("/placeholder.svg")
const LOGO = img("/papillon-rose-logo.png")

// ─── Types ────────────────────────────────────────────────────────────────────
type Page = "home" | "catalogue" | "favorites" | "contact"
interface Product {
  id: string
  nom: string
  categorie: string
  stock: number
  dimensions: string
  prix: number
  image: string
  description: string
  couleur: string
}
interface QuoteItem {
  product: Product
  qty: number
}
// ─── Data ─────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  "Tous",
  "Mobilier",
  "Figurines & Jeux",
  "Bougeoirs & Lanternes",
  "Verreries",
  "Cadres",
  "Présentoirs",
  "Urnes",
  "Art de la Table",
  "Vases",
  "Décoration",
  "Fleurs & Feuillages",
]

const PRODUCTS: Product[] = [
  // ── Real catalogue photos ──
  {
    id: "mob-001",
    nom: "Chevalet Fer Forgé Noir",
    categorie: "Mobilier",
    stock: 1,
    dimensions: "175 × 54 cm",
    prix: 30,
    image: "/products/prod001.png",
    description:
      "Élégant chevalet en fer forgé noir mat aux volutes raffinées. Idéal pour présenter votre plan de table, menu ou tableau de bienvenue lors de vos événements les plus précieux.",
    couleur: "Noir",
  },
  {
    id: "mob-002",
    nom: "Arche Triangle Bois Naturel",
    categorie: "Mobilier",
    stock: 1,
    dimensions: "H 230 × 200 cm",
    prix: 40,
    image: "/products/prod005.png",
    description:
      "Arche triangulaire en bois brut aux allures bohèmes. Parfaite pour encadrer la cérémonie ou créer un fond de scène végétal unique pour vos photos.",
    couleur: "Bois naturel",
  },
  {
    id: "mob-004",
    nom: "Chaises Médaillon Blanches (paire)",
    categorie: "Mobilier",
    stock: 24,
    dimensions: "45 × 45 × H 95 cm",
    prix: 40,
    image: "/products/prod004.png",
    description:
      "Paire de chaises médaillon en bois patiné blanc, assise et dossier capitonnés en lin. Charme romantique et confort pour vos réceptions.",
    couleur: "Blanc",
  },
  {
    id: "dec-003",
    nom: "Arche Grillagée Blanche",
    categorie: "Décoration",
    stock: 2,
    dimensions: "200 × 200 cm",
    prix: 60,
    image: "/products/prod040.png",
    description:
      "Panneau grillagé sur pied en métal blanc. Support idéal pour fleurs, feuillages, photos ou plan de table suspendu.",
    couleur: "Blanc",
  },
  {
    id: "dec-004",
    nom: "Pompon Tulle Rose Poudré",
    categorie: "Décoration",
    stock: 30,
    dimensions: "Ø 30 cm",
    prix: 6,
    image: "/products/prod003.png",
    description:
      "Pompon en tulle rose poudré pour habiller chaises, arches ou dossiers de chaise haute. Touche tendre et féérique pour baby showers et baptêmes.",
    couleur: "Rose poudré",
  },
  {
    id: "dec-005",
    nom: "Masques Tiki Décoratifs (trio)",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 60 × 18 cm",
    prix: 28,
    image: "/products/prod006.png",
    description:
      "Trio de masques Tiki sculptés et peints à la main. Décor exotique parfait pour soirées tropicales, anniversaires à thème et fêtes polynésiennes.",
    couleur: "Multicolore",
  },
  {
    id: "fig-002",
    nom: "Figurines Animaux & Jungle",
    categorie: "Figurines & Jeux",
    stock: 1,
    dimensions: "Set de 14 pièces",
    prix: 22,
    image: "/products/prod056.png",
    description:
      "Collection de figurines d'animaux de la jungle et personnages emblématiques. Idéale pour scénographier une table d'anniversaire enfant sur le thème de la savane.",
    couleur: "Multicolore",
  },
  {
    id: "fig-003",
    nom: "Figurines Super-Héros",
    categorie: "Figurines & Jeux",
    stock: 4,
    dimensions: "Set de 4 · H 5 cm",
    prix: 10,
    image: "/products/prod047.png",
    description:
      "Lot de mini figurines super-héros métallisées. Parfait pour personnaliser un gâteau ou animer une fête d'enfants pleine d'énergie.",
    couleur: "Multicolore",
  },
  {
    id: "dec-006",
    nom: "Sculptures Africaines Bois",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 35 à 45 cm",
    prix: 25,
    image: "/products/prod009.png",
    description:
      "Trio de sculptures en bois d'ébène sculptées à la main. Pièces d'art ethniques pour une décoration élégante et dépaysante.",
    couleur: "Bois foncé",
  },
  {
    id: "dec-007",
    nom: "Oiseaux Tropicaux sur Pied (paire)",
    categorie: "Décoration",
    stock: 2,
    dimensions: "H 65 cm",
    prix: 5,
    image: "/products/prod010.png",
    description:
      "Duo d'oiseaux exotiques en métal peint à la main — un perroquet ara et un toucan — montés sur pieds. Décor coloré et dépaysant pour soirées tropicales et événements à thème.",
    couleur: "Multicolore",
  },
  {
    id: "bou-004",
    nom: "Bougeoir Pied Argenté",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 28 × Ø 14 cm",
    prix: 4,
    image: "/products/prod011.png",
    description:
      "Bougeoir sur pied en métal argenté au galbe travaillé. Présente une bougie pilier avec élégance sur vos tables et buffets.",
    couleur: "Argenté",
  },
  {
    id: "mob-006",
    nom: "Pouf Velours Noir Pieds Dorés",
    categorie: "Mobilier",
    stock: 3,
    dimensions: "Ø 45 × H 35 cm",
    prix: 22,
    image: "/products/prod030-2.png",
    description:
      "Pouf rond en velours noir aux fines pieds dorés en épingle. Assise d'appoint chic ou sellette décorative pour vos espaces lounge.",
    couleur: "Noir & Or",
  },
  {
    id: "bou-005",
    nom: "Bougeoirs Feuille Laiton (paire)",
    categorie: "Bougeoirs & Lanternes",
    stock: 4,
    dimensions: "H 22 × 8 cm",
    prix: 11,
    image: "/products/prod025-2.png",
    description:
      "Paire de bougeoirs en laiton patiné en forme de feuille nervurée. Touche vintage et raffinée pour une décoration de table végétale.",
    couleur: "Laiton",
  },
  {
    id: "bou-006",
    nom: "Bougeoirs Piliers Dorés (trio)",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 18 / 24 / 30 cm",
    prix: 4,
    image: "/products/prod022.png",
    description:
      "Trio de bougeoirs piliers en laiton doré de hauteurs graduées. Composez un centre de table lumineux et sophistiqué.",
    couleur: "Or",
  },
  {
    id: "pre-002",
    nom: "Plateau Miroir Doré",
    categorie: "Présentoirs",
    stock: 5,
    dimensions: "40 × 22 × H 8 cm",
    prix: 12,
    image: "/products/prod042.png",
    description:
      "Plateau rectangulaire à structure laiton doré et fond miroir. Idéal pour présenter parfums, bougies ou la verrerie du bar.",
    couleur: "Or & Miroir",
  },
  {
    id: "dec-008",
    nom: "Boîtes Géométriques Verre & Laiton (paire)",
    categorie: "Décoration",
    stock: 4,
    dimensions: "H 12 × 10 cm",
    prix: 10,
    image: "/products/prod030.png",
    description:
      "Paire de boîtes géométriques en verre et laiton doré. Parfaites comme porte-alliances, écrins à bijoux ou mini terrariums décoratifs.",
    couleur: "Or & Verre",
  },
  // ── Catalogue complémentaire ──
  {
    id: "bou-001",
    nom: "Lanterne Marocaine Dorée",
    categorie: "Bougeoirs & Lanternes",
    stock: 8,
    dimensions: "H 45 × Ø 20 cm",
    prix: 5,
    image: "/products/prod023.png",
    description:
      "Lanterne en métal ajouré doré de style oriental. Crée une ambiance lumineuse et envoûtante.",
    couleur: "Or",
  },
  {
    id: "bou-002",
    nom: "Bougeoir Cristal Haut",
    categorie: "Bougeoirs & Lanternes",
    stock: 12,
    dimensions: "H 30 × Ø 8 cm",
    prix: 8,
    image: "/products/prod022.png",
    description:
      "Chandelier en cristal soufflé d'une finesse rare. Mille reflets sur vos tables.",
    couleur: "Cristal",
  },
  {
    id: "bou-003",
    nom: "Photophore Doré",
    categorie: "Bougeoirs & Lanternes",
    stock: 30,
    dimensions: "H 10 × Ø 8 cm",
    prix: 0.50,
    image: "/products/prod034.png",
    description: "Photophore en verre texturé doré pour bougies chauffe-plat.",
    couleur: "Or",
  },
  {
    id: "ver-001",
    nom: "Vase Cylindrique Transparent",
    categorie: "Verreries",
    stock: 15,
    dimensions: "H 40 × Ø 15 cm",
    prix: 10,
    image: "/products/prod072.png",
    description:
      "Vase cylindrique en verre soufflé. Polyvalent pour compositions florales ou bougies flottantes.",
    couleur: "Transparent",
  },
  {
    id: "ver-002",
    nom: "Carafe Vintage Biseautée",
    categorie: "Verreries",
    stock: 10,
    dimensions: "H 30 × Ø 12 cm",
    prix: 4,
    image: "/products/prod036.png",
    description:
      "Carafe en cristal biseauté de style vintage. Pour l'eau, limonades ou cocktails signature.",
    couleur: "Transparent",
  },
  {
    id: "pre-001",
    nom: "Présentoir Gâteau 3 Étages",
    categorie: "Présentoirs",
    stock: 3,
    dimensions: "H 60 cm · plateaux Ø 20/30/40 cm",
    prix: 6,
    image: "/products/prod048.png",
    description:
      "Présentoir à gâteau en métal blanc 3 étages avec plateaux miroir.",
    couleur: "Blanc & Or",
  },
  {
    id: "urn-001",
    nom: "Urne à Enveloppes Bois",
    categorie: "Urnes",
    stock: 3,
    dimensions: "H 30 × 20 × 20 cm",
    prix: 8,
    image: "/products/prod049.png",
    description:
      "Urne en bois massif avec fente pour enveloppes. Sobre et élégante.",
    couleur: "Bois naturel",
  },
  {
    id: "art-002",
    nom: "Chemin de Table Lin Naturel",
    categorie: "Art de la Table",
    stock: 20,
    dimensions: "30 × 300 cm",
    prix: 2,
    image: "/products/prod057.png",
    description:
      "Chemin de table en lin lavé naturel, bords effilochés. Touche rustique et poétique.",
    couleur: "Beige",
  },
  {
    id: "vas-001",
    nom: "Vase Pampa Céramique Blanc",
    categorie: "Vases",
    stock: 6,
    dimensions: "H 45 × Ø 22 cm",
    prix: 0.90,
    image: "/products/prod072.png",
    description:
      "Grand vase en céramique blanche à l'émail mat. Pour pampa, branches ou fleurs séchées.",
    couleur: "Blanc",
  },
  {
    id: "vas-002",
    nom: "Vase Amphore Terracotta",
    categorie: "Vases",
    stock: 4,
    dimensions: "H 55 × Ø 30 cm",
    prix: 1.50,
    image: "/products/prod071.png",
    description:
      "Vase amphore en terracotta naturelle. Idéal pour une décoration bohème ou méditerranéenne.",
    couleur: "Terracotta",
  },
  {
    id: "dec-001",
    nom: "Guirlande Lumineuse 10 m",
    categorie: "Décoration",
    stock: 15,
    dimensions: "10 m · 100 LED blanc chaud",
    prix: 10,
    image: "/products/prod019.png",
    description:
      "Guirlande lumineuse avec 100 LED blanc chaud. Intérieur ou extérieur.",
    couleur: "Blanc chaud",
  },
  {
    id: "fle-002",
    nom: "Roses Artificielles Blanches ×12",
    categorie: "Fleurs & Feuillages",
    stock: 10,
    dimensions: "Tige 50 cm · Tête Ø 6 cm",
    prix: 15,
    image: "/products/prod080.png",
    description:
      "Lot de 12 roses artificielles blanches premium. Réutilisables à l'infini.",
    couleur: "Blanc",
  },

  // ── Nouveaux produits du catalogue ──
  {
    id: "bou-007",
    nom: "Lanterne Argentée",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 40 × Ø 18 cm",
    prix: 12,
    image: "/products/prod020.png",
    description: "Lanterne en métal argenté au design élégant. Parfaite pour une ambiance lumineuse raffinée.",
    couleur: "Argenté",
  },
  {
    id: "bou-008",
    nom: "Lanterne Noire",
    categorie: "Bougeoirs & Lanternes",
    stock: 6,
    dimensions: "H 40 × Ø 18 cm",
    prix: 5,
    image: "/products/prod021.png",
    description: "Lanterne en métal noir mat. Style moderne et sobre pour vos décorations.",
    couleur: "Noir",
  },
  {
    id: "bou-009",
    nom: "Bougeoir Étincelle Doré",
    categorie: "Bougeoirs & Lanternes",
    stock: 8,
    dimensions: "H 25 × Ø 10 cm",
    prix: 9,
    image: "/products/prod025.png",
    description: "Bougeoir doré aux reflets étincelants. Illumine vos tables avec élégance.",
    couleur: "Or",
  },
  {
    id: "dec-010",
    nom: "Boa Plume décoratif",
    categorie: "Décoration",
    stock: 5,
    dimensions: "150 cm",
    prix: 0.50,
    image: "/products/prod076.png",
    description: "Boa en plumes blanches. Accessoire décoratif pour chaises, arches ou espaces photo.",
    couleur: "Blanc",
  },
  {
    id: "dec-011",
    nom: "Candy Bar",
    categorie: "Décoration",
    stock: 3,
    dimensions: "80 × 40 × H 90 cm",
    prix: 20,
    image: "/products/prod032.png",
    description: "Présentoir candy bar pour buffets sucrés, anniversaires et goûters d'enfants.",
    couleur: "Multicolore",
  },
  {
    id: "dec-012",
    nom: "Feuille d'Or Décorative",
    categorie: "Décoration",
    stock: 10,
    dimensions: "H 45 cm",
    prix: 1.50,
    image: "/products/prod046.png",
    description: "Feuille décorative dorée. Idéale pour compositions florales et centres de table.",
    couleur: "Or",
  },
  {
    id: "dec-013",
    nom: "Fontaine à Agrumes",
    categorie: "Décoration",
    stock: 2,
    dimensions: "H 50 × Ø 25 cm",
    prix: 8,
    image: "/products/prod036.png",
    description: "Fontaine décorative à agrumes. Originale et rafraîchissante pour vos réceptions.",
    couleur: "Transparent",
  },
  {
    id: "dec-014",
    nom: "Gazon Artificiel à Suspendre",
    categorie: "Décoration",
    stock: 8,
    dimensions: "100 × 100 cm",
    prix: 10,
    image: "/products/prod084.png",
    description: "Panneau de gazon artificiel à suspendre. Crée un mur végétal pour vos événements.",
    couleur: "Vert",
  },
  {
    id: "dec-015",
    nom: "Horloge Décorative",
    categorie: "Décoration",
    stock: 3,
    dimensions: "Ø 40 cm",
    prix: 7,
    image: "/products/prod074.png",
    description: "Horloge décorative sur pied. Pièce unique pour habiller vos espaces réception.",
    couleur: "Noir & Or",
  },
  {
    id: "dec-016",
    nom: "Ours Blanc Décoratif",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 70 cm",
    prix: 5,
    image: "/products/prod011.png",
    description: "Ours blanc décoratif en résine. Parfait pour les baptêmes et événements hivernaux.",
    couleur: "Blanc",
  },
  {
    id: "mob-007",
    nom: "Coussins Velours pour Chaises (paire)",
    categorie: "Mobilier",
    stock: 12,
    dimensions: "40 × 40 cm",
    prix: 1,
    image: "/products/prod061.png",
    description: "Paire de coussins en velours pour chaises. Confort et élégance pour vos invités.",
    couleur: "Velours",
  },
  {
    id: "art-003",
    nom: "Nappe Papillon Rectangle",
    categorie: "Art de la Table",
    stock: 10,
    dimensions: "150 × 250 cm",
    prix: 2,
    image: "/products/prod058.png",
    description: "Nappe rectangulaire motif papillon. Douce et raffinée pour vos tables de réception.",
    couleur: "Rose",
  },
  {
    id: "art-004",
    nom: "Pack Candy Bar en Verre",
    categorie: "Art de la Table",
    stock: 4,
    dimensions: "Set de 6 pièces",
    prix: 20,
    image: "/products/prod032.png",
    description: "Set de verreries pour candy bar. Pots et coupes en verre pour buffets sucrés.",
    couleur: "Transparent",
  },
  {
    id: "ver-003",
    nom: "Pack Soupières en Verre",
    categorie: "Verreries",
    stock: 6,
    dimensions: "Set de 4 · H 12 cm",
    prix: 20,
    image: "/products/prod066.png",
    description: "Lot de soupières en verre. Idéales pour entrées et soupes lors de vos réceptions.",
    couleur: "Transparent",
  },
  {
    id: "art-005",
    nom: "Panier à Pain",
    categorie: "Art de la Table",
    stock: 8,
    dimensions: "25 × 15 × H 10 cm",
    prix: 2,
    image: "/products/prod065.png",
    description: "Panier à pain en osier. Pour servir le pain avec style sur vos tables.",
    couleur: "Naturel",
  },
  {
    id: "dec-017",
    nom: "Porte-Alliance Prisme",
    categorie: "Décoration",
    stock: 4,
    dimensions: "H 8 × 6 cm",
    prix: 7,
    image: "/products/prod029.png",
    description: "Porte-alliance en forme de prisme en cristal. Écrin parfait pour les alliances.",
    couleur: "Cristal",
  },
  {
    id: "dec-018",
    nom: "Porte-Alliance Rectangle",
    categorie: "Décoration",
    stock: 4,
    dimensions: "H 6 × 8 cm",
    prix: 7,
    image: "/products/prod031.png",
    description: "Porte-alliance rectangulaire en cristal. Présentez vos alliances avec élégance.",
    couleur: "Cristal",
  },
  {
    id: "pre-003",
    nom: "Porte-Carte Or",
    categorie: "Présentoirs",
    stock: 10,
    dimensions: "H 12 × 8 cm",
    prix: 0.90,
    image: "/products/prod060.png",
    description: "Porte-carte doré pour plans de table, menus ou marque-places. Raffinement garanti.",
    couleur: "Or",
  },
  {
    id: "art-006",
    nom: "Porte-Serviettes Doré",
    categorie: "Art de la Table",
    stock: 15,
    dimensions: "H 8 cm",
    prix: 4,
    image: "/products/prod052.png",
    description: "Porte-serviettes doré. Pour une présentation élégante de vos serviettes de table.",
    couleur: "Or",
  },
  {
    id: "dec-019",
    nom: "Prisme Décoratif Cristal",
    categorie: "Décoration",
    stock: 6,
    dimensions: "H 10 × 5 cm",
    prix: 6,
    image: "/products/prod026.png",
    description: "Prisme en cristal décoratif. Capte la lumière et crée des reflets sur vos tables.",
    couleur: "Cristal",
  },
  {
    id: "art-007",
    nom: "Salière et Poivrière",
    categorie: "Art de la Table",
    stock: 10,
    dimensions: "H 8 cm (paire)",
    prix: 2,
    image: "/products/prod063.png",
    description: "Paire de salière et poivrière en verre. Indispensables pour vos tables dressées.",
    couleur: "Transparent",
  },
  {
    id: "art-008",
    nom: "Saucière",
    categorie: "Art de la Table",
    stock: 8,
    dimensions: "H 10 × 15 cm",
    prix: 13,
    image: "/products/prod054.png",
    description: "Saucière en porcelaine blanche. Pour servir sauces et accompaniments avec élégance.",
    couleur: "Blanc",
  },
  {
    id: "art-009",
    nom: "Serviette de Table Émeraude",
    categorie: "Art de la Table",
    stock: 30,
    dimensions: "45 × 45 cm",
    prix: 0.50,
    image: "/products/prod055.png",
    description: "Serviette de table en lin vert émeraude. Touche de couleur pour vos tables habillées.",
    couleur: "Émeraude",
  },
  {
    id: "dec-020",
    nom: "Sonnette de Comptoir",
    categorie: "Décoration",
    stock: 5,
    dimensions: "H 8 × Ø 5 cm",
    prix: 5,
    image: "/products/prod075.png",
    description: "Sonnette de comptoir en laiton doré. Pour appeler vos convives ou servir le bar.",
    couleur: "Or",
  },
  {
    id: "dec-021",
    nom: "Sous-Assiette Or (lot de 6)",
    categorie: "Art de la Table",
    stock: 10,
    dimensions: "Ø 30 cm · lot de 6",
    prix: 6,
    image: "/products/prod053.png",
    description: "Lot de 6 sous-assiettes dorées. Rehaussez votre table avec une touche précieuse.",
    couleur: "Or",
  },
  {
    id: "dec-022",
    nom: "Top Cake Diamant®",
    categorie: "Décoration",
    stock: 5,
    dimensions: "H 12 cm",
    prix: 9,
    image: "/products/prod064.png",
    description: "Décoration de gâteau en forme de diamant doré. Sublime votre pièce montée.",
    couleur: "Or",
  },
  {
    id: "dec-023",
    nom: "Ombrelle Décorative",
    categorie: "Décoration",
    stock: 4,
    dimensions: "H 80 cm",
    prix: 4,
    image: "/products/prod078.png",
    description: "Ombrelle décorative en dentelle. Idéale pour séances photo et décoration bohème.",
    couleur: "Blanc",
  },
  {
    id: "dec-024",
    nom: "Oiseau Décoratif Scotch",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 25 cm",
    prix: 7,
    image: "/products/prod050.png",
    description: "Oiseau décoratif en métal. Duo d'oiseaux tropicaux pour une déco colorée.",
    couleur: "Multicolore",
  },
  {
    id: "dec-025",
    nom: "Lustre 12 Branches",
    categorie: "Bougeoirs & Lanternes",
    stock: 1,
    dimensions: "H 80 × Ø 60 cm",
    prix: 80,
    image: "/products/lustre-12-branches.png",
    description: "Lustre à 12 branches en métal doré. Pièce maîtresse pour vos réceptions et mariages.",
    couleur: "Or",
  },
  {
    id: "dec-026",
    nom: "Enseigne LED Bride to Be",
    categorie: "Décoration",
    stock: 2,
    dimensions: "60 × 30 cm",
    prix: 30,
    image: "/products/bride-to-be-led.png",
    description: "Enseigne lumineuse LED 'Bride to Be' blanc chaud. Parfaite pour EVJF et enterrements de vie de jeune fille.",
    couleur: "Blanc chaud",
  },
  {
    id: "dec-027",
    nom: "Vélo Décoratif Blanc",
    categorie: "Décoration",
    stock: 2,
    dimensions: "H 60 × L 40 cm",
    prix: 18,
    image: "/products/velo.png",
    description: "Vélo décoratif blanc en métal. Idéal pour compositions florales et décoration bohème.",
    couleur: "Blanc",
  },
  {
    id: "dec-028",
    nom: "Décoration Numéro 36",
    categorie: "Décoration",
    stock: 3,
    dimensions: "H 25 cm",
    prix: 12,
    image: "/products/36.png",
    description: "Chiffre décoratif 36 en métal doré. Parfait pour anniversaires et événements marquants.",
    couleur: "Or",
  },
]

let CATEGORY_IMAGES: Record<string, string> = {
  Mobilier: "/products/prod004.png",
  "Figurines & Jeux": "/products/prod056.png",
  "Bougeoirs & Lanternes": "/products/prod020.png",
  Verreries: "/products/prod071.png",
  Cadres: "/products/prod060.png",
  Présentoirs: "/products/prod048.png",
  Urnes: "/products/prod049.png",
  "Art de la Table": "/products/prod057.png",
  Vases: "/products/prod072.png",
  Décoration: "/products/prod006.png",
  "Fleurs & Feuillages": "/products/prod003.png",
}

// Images will be prefixed at render time

const DP = { fontFamily: "var(--font-playfair), serif" } as const
const GOLD = "#C8A97E"

// ─── ProductCard ──────────────────────────────────────────────────────────────
function ProductCard({
  product,
  isFav,
  onFav,
  onView,
  onAdd,
}: {
  product: Product
  isFav: boolean
  onFav: () => void
  onView: () => void
  onAdd: () => void
}) {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
      <div
        className="relative m-2.5 overflow-hidden rounded-lg bg-[#F8F5F0] cursor-pointer"
        style={{ aspectRatio: "1 / 1" }}
        onClick={onView}
      >
        <img
          src={product.image ? img(product.image) : PLACEHOLDER}
          alt={product.nom}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">
              Indisponible
            </span>
          </div>
        )}
        {product.stock <= 2 && product.stock > 0 && (
          <span className="absolute top-2.5 left-2.5 bg-amber-400 text-white text-[9px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
            Dernière{product.stock > 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onFav()
          }}
          aria-label="Ajouter aux favoris"
          className={`absolute top-2.5 right-2.5 w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-colors ${
            isFav ? "text-[#C8A97E]" : "text-gray-300 hover:text-[#C8A97E]"
          }`}
        >
          <Heart size={13} fill={isFav ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="px-3.5 pb-4 pt-0.5 flex flex-col flex-1">
        <p className="text-[10px] font-medium text-[#C8A97E] uppercase tracking-wider truncate">
          {product.categorie}
        </p>
        <h3
          style={DP}
          className="text-[13px] font-semibold text-[#2E2E2E] mt-0.5 leading-snug line-clamp-2 cursor-pointer hover:text-[#C8A97E] transition-colors"
          onClick={onView}
        >
          {product.nom}
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
          {product.dimensions}
        </p>
        <div className="flex items-center justify-between mt-auto pt-2">
          <span style={DP} className="text-base font-bold text-[#2E2E2E]">
            {product.prix}{" "}
            <span className="text-sm font-normal text-gray-400">€<span className="text-xs">/jour</span></span>
          </span>
          <button
            onClick={onAdd}
            disabled={product.stock === 0}
            aria-label="Ajouter au devis"
            className="w-8 h-8 rounded-full bg-[#C8A97E] text-white flex items-center justify-center hover:bg-[#B8926E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            <Plus size={15} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CategoryPills ─────────────────────────────────────────────────────────────
function CategoryPills({
  active,
  onChange,
}: {
  active: string
  onChange: (c: string) => void
}) {
  return (
    <div
      className="flex gap-2 overflow-x-auto pb-1"
      style={{ scrollbarWidth: "none" } as React.CSSProperties}
    >
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
            active === cat
              ? "bg-[#C8A97E] text-white shadow-sm"
              : "bg-[#F0EBE3] text-[#2E2E2E]/60 hover:bg-[#C8A97E]/20 hover:text-[#C8A97E]"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer({
  onNav,
  onCatalogue,
}: {
  onNav: (p: Page) => void
  onCatalogue: (cat?: string) => void
}) {
  return (
    <footer className="bg-[#2E2E2E] text-white pt-14 pb-8 mt-16 rounded-t-[2.5rem]">
      <div className="max-w-7xl mx-auto px-6 md:px-10 grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
        <div className="col-span-2 md:col-span-1">
          <p className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-light">
            Location décoration
          </p>
          <p style={DP} className="text-white text-2xl font-semibold mt-1 mb-4">
            Papillon Rose
          </p>
          <p className="text-white/45 text-sm leading-relaxed">
            Location de mobilier et décoration pour événements, mariages et
            réceptions.
          </p>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Navigation
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
              (p) => (
                <li key={p}>
                  <button
                    onClick={() => onNav(p)}
                    className="hover:text-[#C8A97E] transition-colors"
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Catégories
          </p>
          <ul className="space-y-3 text-sm text-white/55">
            {CATEGORIES.slice(1, 7).map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCatalogue(cat)}
                  className="hover:text-[#C8A97E] transition-colors"
                >
                  {cat}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-[#C8A97E] text-[10px] tracking-[0.3em] uppercase mb-5">
            Contact
          </p>
          <ul className="space-y-3.5 text-sm text-white/55">
            <li className="flex items-center gap-2.5">
              <Phone size={13} className="text-[#C8A97E]" />
              06 12 34 56 78
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={13} className="text-[#C8A97E]" />
              contact@papillonrose.fr
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin size={13} className="text-[#C8A97E] mt-0.5" />
              <span>
                Île-de-France
                <br />
                Livraison nationale
              </span>
            </li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-6 border-t border-white/10">
        <p className="text-white/25 text-xs text-center">
          © 2025 Papillon Rose — Location décoration événements · Tous droits
          réservés
        </p>
      </div>
    </footer>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function PapillonRoseSite() {
  const [page, setPage] = useState<Page>("home")
  const [category, setCategory] = useState("Tous")
  const [search, setSearch] = useState("")
  const [modalProduct, setModalProduct] = useState<Product | null>(null)
  const [quote, setQuote] = useState<QuoteItem[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [showQuote, setShowQuote] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [priceMax, setPriceMax] = useState(200)
  const [inStockOnly, setInStockOnly] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showQuoteSent, setShowQuoteSent] = useState(false)

  useEffect(() => {
    const check = () => setScrolled(window.scrollY > window.innerHeight)
    check()
    window.addEventListener("scroll", check)
    window.addEventListener("resize", check)
    return () => {
      window.removeEventListener("scroll", check)
      window.removeEventListener("resize", check)
    }
  }, [])

  const filtered = useMemo(
    () =>
      PRODUCTS.filter(
        (p) =>
          (category === "Tous" || p.categorie === category) &&
          (!search ||
            p.nom.toLowerCase().includes(search.toLowerCase()) ||
            p.categorie.toLowerCase().includes(search.toLowerCase())) &&
          p.prix <= priceMax &&
          (!inStockOnly || p.stock > 0),
      ),
    [category, search, priceMax, inStockOnly],
  )

  const addToQuote = (p: Product) => {
    setQuote((prev) => {
      const ex = prev.find((i) => i.product.id === p.id)
      return ex
        ? prev.map((i) =>
            i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
          )
        : [...prev, { product: p, qty: 1 }]
    })
    setShowQuote(true)
  }

  const updateQty = (id: string, delta: number) => {
    setQuote((prev) =>
      prev
        .map((i) =>
          i.product.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i,
        )
        .filter((i) => i.qty > 0),
    )
  }

  const toggleFav = (id: string) => {
    setFavorites((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  const quoteTotal = quote.reduce((s, i) => s + i.product.prix * i.qty, 0)
  const quoteCount = quote.reduce((s, i) => s + i.qty, 0)
  const navTo = (p: Page) => {
    setPage(p)
    setShowMenu(false)
    window.scrollTo(0, 0)
  }
  const goToCatalogue = (cat?: string) => {
    setPage("catalogue")
    if (cat) setCategory(cat)
    window.scrollTo(0, 0)
  }
  const resetFilters = () => {
    setSearch("")
    setCategory("Tous")
    setPriceMax(200)
    setInStockOnly(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] font-sans text-[#2E2E2E]">
      {/* ── Navbar ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-white/80 backdrop-blur-xl shadow-sm" : "opacity-0 pointer-events-none"}`}>
        <div className="max-w-7xl mx-auto px-5 md:px-10 flex items-center justify-between h-16">
          <button onClick={() => navTo("home")} aria-label="Accueil Papillon Rose">
            <img
              src={LOGO || PLACEHOLDER}
              alt="Papillon Rose"
              className="h-10 w-auto"
            />
          </button>

          <div className="hidden md:flex items-center gap-8 mr-8">
            {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() =>
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }
                    className={`text-sm transition-colors ${
                      page === p || p === "home"
                        ? scrolled
                          ? "text-[#C8A97E] font-bold"
                          : "text-white"
                        : scrolled
                          ? "text-[#2E2E2E]/60 hover:text-[#C8A97E]"
                          : "text-white/70 hover:text-white"
                    }`}
                  >
                  {p === "home"
                    ? "Accueil"
                    : p === "catalogue"
                      ? "Catalogue"
                      : p === "favorites"
                        ? "Favoris"
                        : "Contact"}
                </button>
              ),
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navTo("favorites")}
              aria-label="Favoris"
              className="relative p-2 hover:text-[#C8A97E] transition-colors"
            >
              <Heart
                size={19}
                fill={favorites.size > 0 ? GOLD : "none"}
                className={
                  favorites.size > 0
                    ? "text-[#C8A97E]"
                    : scrolled
                      ? "text-[#2E2E2E]/40"
                      : "text-white/70"
                }
              />
              {favorites.size > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8A97E] text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowQuote(true)}
              className="relative flex items-center gap-2 bg-[#C8A97E] text-white px-4 py-2 rounded-full text-sm hover:bg-[#B8926E] transition-colors"
            >
              <ShoppingBag size={15} />
              <span className="hidden md:inline font-medium">Devis</span>
              {quoteCount > 0 && (
                <span className="w-5 h-5 bg-white text-[#C8A97E] text-[10px] rounded-full flex items-center justify-center font-bold">
                  {quoteCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowMenu(true)}
              aria-label="Menu"
              className={`md:hidden p-2 ${scrolled ? "text-[#2E2E2E]/60" : "text-white/70"}`}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      {showMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setShowMenu(false)}
        >
          <div
            className="absolute right-0 top-0 bottom-0 w-72 bg-white rounded-l-3xl shadow-2xl p-8 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-10">
              <img
                src={LOGO || PLACEHOLDER}
                alt="Papillon Rose"
                className="h-9 w-auto"
              />
              <button
                onClick={() => setShowMenu(false)}
                aria-label="Fermer le menu"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {(["home", "catalogue", "favorites", "contact"] as Page[]).map(
                (p) => (
                  <button
                    key={p}
                    onClick={() =>
                      p === "catalogue" ? goToCatalogue() : navTo(p)
                    }
                    className="text-left text-[#2E2E2E]/70 hover:text-[#C8A97E] transition-colors text-lg"
                    style={DP}
                  >
                    {p === "home"
                      ? "Accueil"
                      : p === "catalogue"
                        ? "Catalogue"
                        : p === "favorites"
                          ? "Favoris"
                          : "Contact"}
                  </button>
                ),
              )}
            </div>
            <div className="mt-auto text-sm text-[#2E2E2E]/35 space-y-1">
              <p>contact@papillonrose.fr</p>
              <p>06 12 34 56 78</p>
            </div>
          </div>
        </div>
      )}

      <div>
        {/* ─── HOME ─── */}
        {page === "home" && (
          <div>
            {/* Hero */}
            <section className="relative" style={{ height: "100vh", maxHeight: "100vh" }}>
              <video
                src="https://raw.githubusercontent.com/Rose-B05/papillonrose/master/public/products/hero.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
              />
            </section>

            {/* Hero text */}
            <section className="max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-20">
              <p className="text-[#C8A97E] text-xs tracking-[0.5em] uppercase mb-3 font-medium">
                LOCATION DÉCORATION ÉVÉNEMENT
              </p>
              <h1 style={DP} className="text-[#2E2E2E] text-5xl md:text-7xl font-semibold leading-[1.1] mb-6">
                Papillon
                <br />
                <em className="font-normal italic">Rose</em>
              </h1>
            </section>

            {/* Stats strip */}
            <section className="max-w-3xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { val: "+200", label: "références" },
                { val: "11", label: "catégories" },
                { val: "Stock", label: "mis à jour" },
                { val: "Devis", label: "en 24h" },
              ].map((s) => (
                <div key={s.val} className="text-center">
                  <p style={DP} className="text-2xl font-bold text-[#C8A97E]">
                    {s.val}
                  </p>
                  <p className="text-xs text-[#2E2E2E]/45 uppercase tracking-wider mt-0.5">
                    {s.label}
                  </p>
                </div>
              ))}
            </section>

            {/* Featured products */}
            <section className="max-w-7xl mx-auto px-5 md:px-10">
              <div className="flex items-end justify-between mb-5">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Sélection du moment
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Articles en vedette
                  </h2>
                </div>
                <button
                  onClick={() => goToCatalogue()}
                  className="hidden md:flex items-center gap-1.5 text-sm text-[#C8A97E] font-medium hover:gap-2.5 transition-all"
                >
                  Tout voir <ArrowRight size={14} />
                </button>
              </div>

              <div className="mb-6">
                <CategoryPills active={category} onChange={setCategory} />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter(
                  (p) => category === "Tous" || p.categorie === category,
                )
                  .slice(0, 10)
                  .map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      isFav={favorites.has(p.id)}
                      onFav={() => toggleFav(p.id)}
                      onView={() => setModalProduct(p)}
                      onAdd={() => addToQuote(p)}
                    />
                  ))}
              </div>

              <div className="text-center mt-8">
                <button
                  onClick={() => goToCatalogue()}
                  className="inline-flex items-center gap-2 bg-[#2E2E2E] text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-[#C8A97E] transition-colors"
                >
                  Voir tout le catalogue <ArrowRight size={15} />
                </button>
              </div>
            </section>

            {/* Category showcase */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                    Explorer par thème
                  </p>
                  <h2
                    style={DP}
                    className="text-2xl md:text-3xl font-semibold text-[#2E2E2E]"
                  >
                    Nos Catégories
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {CATEGORIES.slice(1).map((cat) => {
                  const count = PRODUCTS.filter(
                    (p) => p.categorie === cat,
                  ).length
                  return (
                    <button
                      key={cat}
                      onClick={() => goToCatalogue(cat)}
                      className="group relative overflow-hidden rounded-3xl bg-[#EDE8DF]"
                      style={{ aspectRatio: "4/3" }}
                    >
                      <img
                        src={img(CATEGORY_IMAGES[cat] || "/placeholder.svg")}
                        alt={cat}
                        className="w-full h-full object-cover opacity-75 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E]/80 via-[#2E2E2E]/10 to-transparent rounded-3xl" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                        <p
                          style={DP}
                          className="text-white text-sm font-semibold leading-tight"
                        >
                          {cat}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[#C8A97E] text-[11px]">
                            {count} article{count > 1 ? "s" : ""}
                          </span>
                          <ArrowRight
                            size={11}
                            className="text-[#C8A97E] group-hover:translate-x-1 transition-transform"
                          />
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            {/* CTA */}
            <section className="max-w-7xl mx-auto px-5 md:px-10 mt-16">
              <div className="relative overflow-hidden rounded-3xl bg-[#2E2E2E] px-10 py-16 text-center">
                <div className="absolute inset-0">
                  <img
                    src={img("/products/prod005.png")}
                    alt=""
                    aria-hidden
                    className="w-full h-full object-cover opacity-15 rounded-3xl"
                  />
                </div>
                <div className="relative z-10 max-w-xl mx-auto">
                  <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase mb-4 font-medium">
                    Votre événement, notre passion
                  </p>
                  <h2
                    style={DP}
                    className="text-3xl md:text-4xl text-white font-semibold mb-5 leading-snug"
                  >
                    Un projet en tête&nbsp;?
                  </h2>
                  <p className="text-white/55 text-base mb-8 leading-relaxed">
                    Constituez votre sélection et envoyez-nous votre demande de
                    devis.
                    <br />
                    Réponse sous 24h.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => goToCatalogue()}
                      className="bg-[#C8A97E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#B8926E] transition-colors"
                    >
                      Parcourir le catalogue
                    </button>
                    <button
                      onClick={() => navTo("contact")}
                      className="border border-white/30 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
                    >
                      Nous contacter
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CATALOGUE ─── */}
        {page === "catalogue" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-8">
            <div className="mb-7">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Explorer
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Catalogue de Location
              </h1>
            </div>

            <div className="flex gap-3 mb-5">
              <div className="relative flex-1">
                <Search
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Rechercher un article…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white pl-11 pr-4 py-3 rounded-2xl text-sm outline-none border border-black/[0.07] focus:border-[#C8A97E]/50 transition-colors placeholder:text-gray-400 shadow-sm"
                />
              </div>
              <label className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl text-sm cursor-pointer border border-black/[0.07] shadow-sm hover:border-[#C8A97E]/40 transition-colors select-none whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="accent-[#C8A97E] w-3.5 h-3.5"
                />
                <SlidersHorizontal size={14} className="text-[#C8A97E]" />
                En stock
              </label>
            </div>

            <div className="flex items-center gap-4 mb-5 bg-white rounded-2xl px-5 py-3.5 border border-black/[0.07] shadow-sm">
              <span className="text-[11px] text-gray-400 uppercase tracking-wider whitespace-nowrap">
                Prix max
              </span>
              <input
                type="range"
                min={0}
                max={200}
                value={priceMax}
                onChange={(e) => setPriceMax(Number(e.target.value))}
                className="flex-1 accent-[#C8A97E] h-1"
              />
              <span
                style={DP}
                className="text-[#C8A97E] font-bold text-base w-16 text-right"
              >
                {priceMax} €
              </span>
            </div>

            <div className="mb-7">
              <CategoryPills active={category} onChange={setCategory} />
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-gray-400">
                <span className="text-[#2E2E2E] font-semibold">
                  {filtered.length}
                </span>{" "}
                résultat{filtered.length > 1 ? "s" : ""}
                {category !== "Tous" && (
                  <span>
                    {" "}
                    — <span className="text-[#C8A97E]">{category}</span>
                  </span>
                )}
              </p>
              {(search ||
                category !== "Tous" ||
                priceMax < 200 ||
                inStockOnly) && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-400 hover:text-[#C8A97E] transition-colors underline"
                >
                  Réinitialiser
                </button>
              )}
            </div>

            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filtered.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav={favorites.has(p.id)}
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center">
                <p className="text-gray-400 text-base mb-5">
                  Aucun produit ne correspond à votre sélection.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-[#C8A97E] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            )}

            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── FAVORITES ─── */}
        {page === "favorites" && (
          <div className="max-w-7xl mx-auto px-5 md:px-10 pt-24 pb-8 min-h-[60vh]">
            <div className="mb-8">
              <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-1">
                Mes préférences
              </p>
              <h1
                style={DP}
                className="text-3xl md:text-4xl font-semibold text-[#2E2E2E]"
              >
                Favoris
              </h1>
            </div>
            {favorites.size === 0 ? (
              <div className="py-24 text-center">
                <div className="w-20 h-20 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Heart size={32} className="text-[#C8A97E]/40" />
                </div>
                <p className="text-gray-400 text-base mb-6">
                  Vous n&apos;avez pas encore de favoris.
                </p>
                <button
                  onClick={() => goToCatalogue()}
                  className="bg-[#C8A97E] text-white px-10 py-3.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {PRODUCTS.filter((p) => favorites.has(p.id)).map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    isFav
                    onFav={() => toggleFav(p.id)}
                    onView={() => setModalProduct(p)}
                    onAdd={() => addToQuote(p)}
                  />
                ))}
              </div>
            )}
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}

        {/* ─── CONTACT ─── */}
        {page === "contact" && (
          <div>
            <div className="max-w-4xl mx-auto px-5 md:px-10 pt-24 pb-12">
              <div className="text-center mb-14">
                <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
                  Parlons de votre projet
                </p>
                <h1
                  style={DP}
                  className="text-4xl md:text-5xl font-semibold text-[#2E2E2E]"
                >
                  Contactez-nous
                </h1>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                <div>
                  <div className="space-y-7">
                    {[
                      {
                        Icon: Phone,
                        label: "Téléphone",
                        val: "06 12 34 56 78",
                      },
                      {
                        Icon: Mail,
                        label: "Email",
                        val: "contact@papillonrose.fr",
                      },
                      {
                        Icon: MapPin,
                        label: "Zone",
                        val: "Île-de-France\nLivraison nationale",
                      },
                    ].map(({ Icon, label, val }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-[#C8A97E]/12 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Icon size={17} className="text-[#C8A97E]" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">
                            {label}
                          </p>
                          <p className="font-medium text-sm whitespace-pre-line text-[#2E2E2E]">
                            {val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-10 p-6 bg-[#2E2E2E] rounded-3xl text-white">
                    <p style={DP} className="text-lg font-semibold mb-3">
                      Horaires
                    </p>
                    <div className="space-y-2 text-sm text-white/60">
                      <div className="flex justify-between">
                        <span>Lundi – Vendredi</span>
                        <span className="text-white/90">9h – 18h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Samedi</span>
                        <span className="text-white/90">10h – 16h</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dimanche</span>
                        <span className="text-white/35">Fermé</span>
                      </div>
                    </div>
                  </div>
                </div>
                <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                  {[
                    {
                      label: "Nom complet",
                      type: "text",
                      placeholder: "Marie Dupont",
                    },
                    {
                      label: "Adresse email",
                      type: "email",
                      placeholder: "marie@exemple.fr",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                        {f.label}
                      </label>
                      <input
                        type={f.type}
                        placeholder={f.placeholder}
                        className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Date de l&apos;événement
                    </label>
                    <input
                      type="date"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">
                      Votre message
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Décrivez votre projet, nombre d'invités, lieu…"
                      className="w-full bg-white border border-black/[0.08] rounded-2xl px-4 py-3 text-sm outline-none focus:border-[#C8A97E]/60 transition-colors resize-none shadow-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#C8A97E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors shadow-md"
                  >
                    Envoyer ma demande
                  </button>
                </form>
              </div>
            </div>
            <Footer onNav={navTo} onCatalogue={goToCatalogue} />
          </div>
        )}
      </div>

      {/* ── Product Modal ── */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setModalProduct(null)}
        >
          <div
            className="bg-white w-full md:max-w-2xl max-h-[95vh] overflow-y-auto shadow-2xl rounded-t-3xl md:rounded-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
              <div
                className="relative bg-white rounded-t-3xl md:rounded-l-3xl md:rounded-tr-none overflow-hidden"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={modalProduct.image ? img(modalProduct.image) : PLACEHOLDER}
                  alt={modalProduct.nom}
                  className="w-full h-full object-contain p-4"
                />
                <button
                  onClick={() => setModalProduct(null)}
                  aria-label="Fermer"
                  className="absolute top-4 right-4 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50 hover:text-red-400 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="p-7 flex flex-col">
                <span className="text-[#C8A97E] text-[10px] tracking-[0.35em] uppercase font-medium mb-2">
                  {modalProduct.categorie}
                </span>
                <h2
                  style={DP}
                  className="text-2xl font-semibold text-[#2E2E2E] mb-3 leading-snug"
                >
                  {modalProduct.nom}
                </h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {modalProduct.description}
                </p>

                <div className="space-y-2.5 bg-[#F8F5F0] rounded-2xl p-4 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Dimensions
                    </span>
                    <span className="font-medium text-[#2E2E2E] text-right max-w-[55%] text-sm">
                      {modalProduct.dimensions}
                    </span>
                  </div>
                  {modalProduct.couleur && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                        Couleur
                      </span>
                      <span className="font-medium text-[#2E2E2E]">
                        {modalProduct.couleur}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400 text-[11px] uppercase tracking-wider">
                      Stock
                    </span>
                    <span
                      className={`font-semibold ${
                        modalProduct.stock === 0
                          ? "text-red-400"
                          : modalProduct.stock <= 2
                            ? "text-amber-500"
                            : "text-green-500"
                      }`}
                    >
                      {modalProduct.stock === 0
                        ? "Indisponible"
                        : `${modalProduct.stock} disponible${
                            modalProduct.stock > 1 ? "s" : ""
                          }`}
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  <p
                    style={DP}
                    className="text-3xl font-bold text-[#2E2E2E] mb-5"
                  >
                    {modalProduct.prix} €
                    <span className="text-sm font-normal text-gray-400 ml-1">
                      / jour
                    </span>
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        addToQuote(modalProduct)
                        setModalProduct(null)
                      }}
                      disabled={modalProduct.stock === 0}
                      className="flex-1 bg-[#2E2E2E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#C8A97E] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Ajouter au devis
                    </button>
                    <button
                      onClick={() => toggleFav(modalProduct.id)}
                      aria-label="Ajouter aux favoris"
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center transition-colors ${
                        favorites.has(modalProduct.id)
                          ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                          : "border-gray-200 hover:border-[#C8A97E] hover:text-[#C8A97E]"
                      }`}
                    >
                      <Heart
                        size={18}
                        fill={
                          favorites.has(modalProduct.id)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quote sidebar ── */}
      {showQuote && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setShowQuote(false)}
        >
          <div
            className="bg-white w-full max-w-sm h-full flex flex-col shadow-2xl rounded-l-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-black/[0.07]">
              <div>
                <h3
                  style={DP}
                  className="text-xl font-semibold text-[#2E2E2E]"
                >
                  Demande de devis
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {quoteCount} article{quoteCount > 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowQuote(false)}
                aria-label="Fermer"
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {quote.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
                <div className="w-16 h-16 bg-[#C8A97E]/10 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag size={24} className="text-[#C8A97E]/50" />
                </div>
                <p className="text-gray-400 mb-5 text-sm">
                  Votre sélection est vide.
                </p>
                <button
                  onClick={() => {
                    setShowQuote(false)
                    goToCatalogue()
                  }}
                  className="bg-[#C8A97E] text-white px-7 py-2.5 rounded-full text-sm font-medium hover:bg-[#B8926E] transition-colors"
                >
                  Parcourir le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
                  {quote.map(({ product: p, qty }) => (
                    <div
                      key={p.id}
                      className="flex gap-3.5 items-start bg-[#F8F5F0] rounded-2xl p-3"
                    >
                      <img
                        src={p.image ? img(p.image) : PLACEHOLDER}
                        alt={p.nom}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-xs text-[#2E2E2E] leading-tight line-clamp-2">
                          {p.nom}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {p.prix} € / jour
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQty(p.id, -1)}
                            aria-label="Diminuer"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQty(p.id, 1)}
                            aria-label="Augmenter"
                            className="w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center hover:bg-[#C8A97E] hover:text-white transition-colors"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm text-[#2E2E2E]">
                          {p.prix * qty} €
                        </p>
                        <button
                          onClick={() => updateQty(p.id, -qty)}
                          aria-label="Supprimer"
                          className="text-gray-300 hover:text-red-400 transition-colors mt-1.5"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-black/[0.07] px-5 py-5">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-[11px] text-gray-400 uppercase tracking-wider">
                      Total estimé
                    </span>
                    <span
                      style={DP}
                      className="text-2xl font-bold text-[#2E2E2E]"
                    >
                      {quoteTotal} €
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      setShowQuoteSent(true)
                      setTimeout(() => setShowQuoteSent(false), 3000)
                      navTo("contact")
                    }}
                    className="w-full bg-[#C8A97E] text-white py-3.5 rounded-2xl text-sm font-semibold hover:bg-[#B8926E] transition-colors mb-2.5"
                  >
                    Envoyer ma demande
                  </button>
                  <button
                    onClick={() => {
                      setShowQuote(false)
                      goToCatalogue()
                    }}
                    className="w-full bg-[#F0EBE3] text-[#2E2E2E]/70 py-3 rounded-2xl text-sm font-medium hover:bg-[#E8E0D5] transition-colors"
                  >
                    Continuer mes choix
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {showQuoteSent && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] bg-[#2E2E2E] text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-[fade-in-up_0.3s_ease-out]">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          <span className="text-sm font-medium">Demande de devis envoyée avec succès</span>
        </div>
      )}
    </div>
  )
}
