// ─── Product Theme Tagging System ────────────────────────────────────────────
// Each product can belong to multiple Occasions, Styles, and Ambiances.
// Tags are used for catalogue filtering to help clients find coherent product sets.

// ─── OCCASIONS ──────────────────────────────────────────────────────────────
export const OCCASIONS = [
  "Mariage romantique",
  "Mariage bohème",
  "Mariage champêtre",
  "Mariage chic",
  "Mariage moderne",
  "Mariage terracotta",
  "Mariage méditerranéen",
  "Anniversaire adulte",
  "Anniversaire enfant",
  "Baby Shower",
  "Baptême",
  "Communion",
  "Noël",
  "Nouvel An",
  "Halloween",
  "Pâques",
  "Saint-Valentin",
  "Garden Party",
  "Brunch",
  "Cocktail",
  "Soirée Gatsby",
  "Soirée Disco",
  "Soirée Tropicale",
  "Événement entreprise",
  "Inauguration",
  "Shooting photo",
  "Cérémonie laïque",
  "Coin photo",
  "Candy Bar",
  "Livre d'or",
] as const

// ─── STYLES ─────────────────────────────────────────────────────────────────
export const STYLES = [
  "Bohème",
  "Champêtre",
  "Romantique",
  "Vintage",
  "Moderne",
  "Minimaliste",
  "Industriel",
  "Rustique",
  "Méditerranéen",
  "Art Déco",
  "Scandinave",
  "Nature",
  "Tropical",
  "Luxe",
  "Glamour",
] as const

// ─── AMBIANCES / COULEURS ───────────────────────────────────────────────────
export const AMBIANCES = [
  "Blanc",
  "Doré",
  "Noir",
  "Rose poudré",
  "Terracotta",
  "Sauge",
  "Champagne",
  "Argent",
  "Transparent",
  "Bois",
  "Cristal",
] as const

export type OccasionTag = (typeof OCCASIONS)[number]
export type StyleTag = (typeof STYLES)[number]
export type AmbianceTag = (typeof AMBIANCES)[number]

export interface ProductTags {
  occasions: string[]
  styles: string[]
  ambiances: string[]
}

// ─── PRODUCT → TAGS MAPPING ─────────────────────────────────────────────────
// Key: product ID. Value: occasions + styles + ambiances that apply.

const TAGS_BY_ID: Record<number, ProductTags> = {
  // ── MOBILIER ──
  1: { // Chevalet Fer Forgé Noir
    occasions: ["Mariage chic", "Shooting photo", "Inauguration", "Événement entreprise"],
    styles: ["Industriel", "Moderne"],
    ambiances: ["Noir", "Bois"],
  },
  2: { // Photocall Carré
    occasions: ["Anniversaire adulte", "Mariage chic", "Shooting photo", "Coin photo", "Événement entreprise"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Blanc", "Doré"],
  },
  3: { // Chaise Haute Bébé
    occasions: ["Anniversaire enfant", "Baby Shower", "Baptême", "Communion"],
    styles: ["Romantique", "Vintage"],
    ambiances: ["Blanc", "Doré"],
  },
  4: { // Chaise Médaillon
    occasions: ["Mariage romantique", "Mariage chic", "Cérémonie laïque", "Garden Party", "Shooting photo"],
    styles: ["Romantique", "Vintage", "Champêtre"],
    ambiances: ["Blanc", "Bois"],
  },
  5: { // Arche Triangle
    occasions: ["Mariage romantique", "Mariage bohème", "Cérémonie laïque", "Baby Shower", "Shooting photo"],
    styles: ["Bohème", "Romantique", "Moderne"],
    ambiances: ["Blanc", "Bois"],
  },

  // ── FIGURINES & JEUX ──
  6: { // Totem
    occasions: ["Anniversaire enfant", "Anniversaire adulte", "Soirée Tropicale"],
    styles: ["Tropical", "Nature"],
    ambiances: ["Bois", "Sauge"],
  },
  7: { // Figurines Avenger
    occasions: ["Anniversaire enfant"],
    styles: ["Moderne"],
    ambiances: ["Noir", "Blanc"],
  },
  8: { // Mowgli et les Animaux d'Afrique
    occasions: ["Anniversaire enfant", "Baby Shower"],
    styles: ["Nature", "Tropical"],
    ambiances: ["Sauge", "Bois", "Terracotta"],
  },
  9: { // Statue Africaine
    occasions: ["Shooting photo", "Événement entreprise", "Inauguration"],
    styles: ["Art Déco", "Luxe", "Glamour"],
    ambiances: ["Doré", "Terracotta", "Bois"],
  },
  10: { // Oiseaux
    occasions: ["Mariage romantique", "Baby Shower", "Baptême", "Shooting photo"],
    styles: ["Romantique", "Nature", "Vintage"],
    ambiances: ["Doré", "Blanc", "Champagne"],
  },
  11: { // Ours Blanc
    occasions: ["Baby Shower", "Anniversaire enfant", "Baptême"],
    styles: ["Romantique", "Scandinave"],
    ambiances: ["Blanc", "Rose poudré"],
  },
  12: { // Tricycle
    occasions: ["Anniversaire enfant", "Baby Shower", "Shooting photo"],
    styles: ["Vintage", "Champêtre"],
    ambiances: ["Bois", "Doré"],
  },
  13: { // Poussette Poupée
    occasions: ["Anniversaire enfant", "Baby Shower"],
    styles: ["Vintage", "Romantique"],
    ambiances: ["Rose poudré", "Blanc"],
  },
  // 14: Tapis de Jeu Nuage Rose — actif: false
  15: { // Ciel de Lit Princesse Saumon
    occasions: ["Anniversaire enfant", "Baby Shower", "Baptême"],
    styles: ["Romantique"],
    ambiances: ["Rose poudré", "Champagne"],
  },

  // ── BOUGEOIRS, LUSTRES, CHANDELIERS & LANTERNES ──
  16: { // Large Bougeoir Argent
    occasions: ["Mariage chic", "Soirée Gatsby", "Nouvel An", "Noël", "Cocktail"],
    styles: ["Glamour", "Luxe", "Art Déco"],
    ambiances: ["Argent", "Champagne", "Cristal"],
  },
  17: { // Bougeoir Argent
    occasions: ["Mariage chic", "Soirée Gatsby", "Nouvel An", "Noël", "Cocktail"],
    styles: ["Glamour", "Art Déco"],
    ambiances: ["Argent", "Champagne"],
  },
  18: { // Bougeoir Plume d'Or
    occasions: ["Mariage chic", "Mariage romantique", "Soirée Gatsby", "Noël", "Communion"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },
  19: { // Large Bougeoir Or
    occasions: ["Mariage chic", "Mariage romantique", "Soirée Gatsby", "Noël", "Nouvel An", "Communion", "Cocktail"],
    styles: ["Art Déco", "Glamour", "Luxe", "Romantique"],
    ambiances: ["Doré", "Champagne"],
  },
  20: { // Bougeoir Or
    occasions: ["Mariage chic", "Mariage romantique", "Soirée Gatsby", "Noël", "Nouvel An", "Communion"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },
  21: { // Lanterne Argent
    occasions: ["Mariage bohème", "Garden Party", "Noël", "Soirée Tropicale", "Cérémonie laïque"],
    styles: ["Bohème", "Champêtre", "Rustique"],
    ambiances: ["Argent", "Blanc"],
  },
  22: { // Lanterne Noir
    occasions: ["Halloween", "Soirée Gatsby", "Cocktail", "Événement entreprise"],
    styles: ["Industriel", "Moderne"],
    ambiances: ["Noir", "Argent"],
  },
  23: { // Lanterne Blanche
    occasions: ["Mariage romantique", "Mariage bohème", "Garden Party", "Baptême", "Cérémonie laïque", "Shooting photo"],
    styles: ["Romantique", "Bohème", "Champêtre", "Scandinave"],
    ambiances: ["Blanc", "Champagne"],
  },
  24: { // Lustre 12 Branches
    occasions: ["Mariage chic", "Mariage romantique", "Soirée Gatsby", "Noël", "Nouvel An", "Inauguration"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Cristal", "Champagne"],
  },
  25: { // Prisme
    occasions: ["Mariage chic", "Mariage moderne", "Cocktail", "Soirée Gatsby"],
    styles: ["Moderne", "Art Déco", "Minimaliste"],
    ambiances: ["Doré", "Champagne", "Cristal"],
  },
  26: { // Bride To Be LED Blanche
    occasions: ["Mariage romantique", "Mariage chic", "Bride to be", "Bachelorette"],
    styles: ["Romantique", "Moderne"],
    ambiances: ["Blanc", "Champagne"],
  },
  27: { // Bougeoire Etincelle
    occasions: ["Mariage romantique", "Mariage chic", "Noël", "Nouvel An", "Saint-Valentin"],
    styles: ["Romantique", "Glamour"],
    ambiances: ["Doré", "Champagne", "Cristal"],
  },

  // ── VERRERIES ──
  28: { // Plateau Verre et Laiton
    occasions: ["Mariage chic", "Cocktail", "Brunch", "Garden Party"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Doré", "Transparent"],
  },
  29: { // Coffret Verre et Laiton
    occasions: ["Mariage chic", "Mariage romantique", "Baptême", "Candy Bar"],
    styles: ["Art Déco", "Luxe"],
    ambiances: ["Doré", "Transparent"],
  },
  30: { // Porte Alliance Prisme
    occasions: ["Mariage romantique", "Mariage chic"],
    styles: ["Romantique", "Luxe"],
    ambiances: ["Doré", "Cristal", "Transparent"],
  },
  31: { // Porte Alliances Rectangle
    occasions: ["Mariage romantique", "Mariage chic", "Mariage moderne"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Doré", "Transparent"],
  },
  32: { // Pack Candy Bar en Verre
    occasions: ["Anniversaire adulte", "Anniversaire enfant", "Candy Bar", "Mariage chic", "Baptême"],
    styles: ["Moderne", "Luxe"],
    ambiances: ["Transparent", "Doré"],
  },
  // 33: Photophore Lisière — actif: false
  34: { // Photophore Transparent
    occasions: ["Mariage romantique", "Mariage chic", "Noël", "Saint-Valentin", "Cocktail", "Baptême"],
    styles: ["Romantique", "Minimaliste", "Scandinave"],
    ambiances: ["Transparent", "Blanc"],
  },
  35: { // Photophore Basic
    occasions: ["Mariage romantique", "Noël", "Cocktail"],
    styles: ["Minimaliste", "Scandinave"],
    ambiances: ["Transparent", "Blanc"],
  },
  36: { // Fontaine Agrume
    occasions: ["Garden Party", "Brunch", "Mariage méditerranéen", "Soirée Tropicale", "Cocktail"],
    styles: ["Méditerranéen", "Tropical", "Champêtre"],
    ambiances: ["Terracotta", "Bois"],
  },
  37: { // Fontaine à Boisson Carré
    occasions: ["Garden Party", "Brunch", "Cocktail", "Événement entreprise", "Anniversaire adulte"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Transparent", "Blanc"],
  },
  38: { // Pichet
    occasions: ["Garden Party", "Brunch", "Cocktail", "Mariage champêtre"],
    styles: ["Champêtre", "Rustique", "Vintage"],
    ambiances: ["Transparent", "Bois"],
  },

  // ── CADRES ──
  39: { // Cadre Photo Suspendu
    occasions: ["Mariage romantique", "Baptême", "Communion", "Livre d'or", "Shooting photo"],
    styles: ["Romantique", "Vintage"],
    ambiances: ["Doré", "Blanc"],
  },
  40: { // Cadre Photo Moulure Dorée (18x13)
    occasions: ["Mariage chic", "Mariage romantique", "Baptême", "Communion", "Livre d'or", "Inauguration"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },
  41: { // Cadre Photo Moulure Dorée (autre)
    occasions: ["Mariage chic", "Mariage romantique", "Baptême", "Communion", "Livre d'or", "Inauguration"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },

  // ── PRÉSENTOIRS & PLATEAUX ──
  42: { // Présentoire Bois
    occasions: ["Candy Bar", "Anniversaire adulte", "Mariage champêtre", "Brunch", "Événement entreprise"],
    styles: ["Champêtre", "Rustique", "Nature"],
    ambiances: ["Bois", "Sauge"],
  },
  43: { // Présentoir Velour
    occasions: ["Mariage chic", "Cocktail", "Soirée Gatsby", "Candy Bar"],
    styles: ["Glamour", "Luxe", "Art Déco"],
    ambiances: ["Rose poudré", "Doré", "Champagne"],
  },
  44: { // Étagère Présentoir
    occasions: ["Candy Bar", "Anniversaire adulte", "Événement entreprise", "Inauguration"],
    styles: ["Moderne", "Minimaliste", "Industriel"],
    ambiances: ["Doré", "Blanc", "Transparent"],
  },
  45: { // Plateau Noir
    occasions: ["Cocktail", "Événement entreprise", "Soirée Gatsby", "Soirée Disco"],
    styles: ["Moderne", "Industriel", "Minimaliste"],
    ambiances: ["Noir", "Argent"],
  },
  46: { // Feuille d'Or
    occasions: ["Mariage chic", "Mariage romantique", "Cocktail", "Soirée Gatsby", "Noël"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },
  47: { // Planche de Bois
    occasions: ["Mariage champêtre", "Garden Party", "Brunch", "Mariage bohème", "Candy Bar"],
    styles: ["Champêtre", "Rustique", "Bohème", "Nature"],
    ambiances: ["Bois", "Sauge", "Terracotta"],
  },
  48: { // Grand Présentoir à Gâteaux
    occasions: ["Mariage chic", "Mariage romantique", "Anniversaire adulte", "Candy Bar", "Baptême"],
    styles: ["Romantique", "Luxe"],
    ambiances: ["Doré", "Blanc", "Champagne"],
  },

  // ── URNES & ACCESSOIRES ──
  49: { // Urne Cage
    occasions: ["Mariage bohème", "Mariage romantique", "Mariage chic", "Shooting photo", "Garden Party"],
    styles: ["Bohème", "Romantique", "Vintage"],
    ambiances: ["Doré", "Bois", "Champagne"],
  },
  50: { // Sweet and Lovely Bird Scotch
    occasions: ["Mariage romantique", "Baptême", "Baby Shower", "Shooting photo"],
    styles: ["Romantique", "Vintage"],
    ambiances: ["Doré", "Rose poudré", "Champagne"],
  },

  // ── ART DE LA TABLE ──
  51: { // Pack Sous Verre
    occasions: ["Mariage chic", "Cocktail", "Brunch", "Garden Party", "Événement entreprise"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Transparent", "Blanc"],
  },
  52: { // Porte Serviettes
    occasions: ["Mariage chic", "Cocktail", "Brunch", "Garden Party"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Doré", "Champagne"],
  },
  53: { // Sous Assiette Or
    occasions: ["Mariage chic", "Mariage romantique", "Noël", "Nouvel An", "Cocktail", "Brunch"],
    styles: ["Art Déco", "Glamour", "Luxe"],
    ambiances: ["Doré", "Champagne"],
  },
  54: { // Saucière
    occasions: ["Mariage chic", "Garden Party", "Brunch", "Événement entreprise"],
    styles: ["Moderne", "Luxe"],
    ambiances: ["Doré", "Argent"],
  },
  55: { // Serviette Émeraude
    occasions: ["Mariage chic", "Mariage romantique", "Cocktail", "Noël"],
    styles: ["Luxe", "Glamour"],
    ambiances: ["Sauge", "Doré"],
  },
  56: { // Serviettes Papillon
    occasions: ["Mariage romantique", "Anniversaire adulte", "Brunch", "Garden Party"],
    styles: ["Romantique", "Champêtre"],
    ambiances: ["Blanc", "Doré"],
  },
  57: { // Chemin de Table
    occasions: ["Mariage romantique", "Mariage chic", "Mariage bohème", "Cocktail", "Noël", "Garden Party"],
    styles: ["Romantique", "Bohème", "Champêtre"],
    ambiances: ["Blanc", "Doré", "Champagne"],
  },
  58: { // Nappe Papillon Rectangle
    occasions: ["Mariage romantique", "Baptême", "Communion", "Anniversaire adulte"],
    styles: ["Romantique", "Champêtre"],
    ambiances: ["Blanc", "Rose poudré"],
  },
  59: { // Nœud de Chaise Corail
    occasions: ["Mariage romantique", "Mariage bohème", "Anniversaire adulte"],
    styles: ["Romantique", "Bohème"],
    ambiances: ["Rose poudré", "Terracotta"],
  },
  60: { // Porte Carte Or
    occasions: ["Mariage chic", "Mariage romantique", "Cocktail", "Inauguration"],
    styles: ["Art Déco", "Glamour"],
    ambiances: ["Doré", "Champagne"],
  },
  61: { // Ménagère Schumann 72 pièces
    occasions: ["Mariage chic", "Garden Party", "Brunch", "Événement entreprise"],
    styles: ["Luxe", "Moderne"],
    ambiances: ["Argent", "Doré"],
  },
  62: { // Ménagère La Cuisinière
    occasions: ["Garden Party", "Brunch", "Mariage champêtre"],
    styles: ["Champêtre", "Rustique", "Vintage"],
    ambiances: ["Bois", "Argent"],
  },
  63: { // Salière Poivrière
    occasions: ["Mariage chic", "Garden Party", "Brunch", "Cocktail"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Doré", "Champagne"],
  },
  64: { // Panier à Pain
    occasions: ["Mariage champêtre", "Garden Party", "Brunch", "Mariage bohème"],
    styles: ["Champêtre", "Rustique", "Nature"],
    ambiances: ["Bois", "Sauge"],
  },
  65: { // Coussins de Chaises Velour
    occasions: ["Mariage chic", "Mariage romantique", "Shooting photo", "Cérémonie laïque"],
    styles: ["Glamour", "Luxe", "Romantique"],
    ambiances: ["Rose poudré", "Doré", "Champagne"],
  },
  66: { // Top Cake Diamant
    occasions: ["Mariage chic", "Mariage romantique", "Anniversaire adulte", "Communion"],
    styles: ["Luxe", "Glamour", "Art Déco"],
    ambiances: ["Doré", "Cristal", "Champagne"],
  },
  // 67: Pack Service à Thé — actif: false

  // ── VASES & POTS ──
  68: { // Vase en Laiton
    occasions: ["Mariage chic", "Mariage bohème", "Shooting photo", "Garden Party", "Inauguration"],
    styles: ["Art Déco", "Moderne", "Bohème"],
    ambiances: ["Doré", "Champagne"],
  },
  // 69: Pot de Fleur — actif: false
  70: { // Vase Oval
    occasions: ["Mariage romantique", "Garden Party", "Baptême", "Shooting photo"],
    styles: ["Romantique", "Minimaliste", "Scandinave"],
    ambiances: ["Blanc", "Champagne"],
  },
  71: { // Vase Conique
    occasions: ["Mariage bohème", "Mariage romantique", "Garden Party", "Shooting photo"],
    styles: ["Bohème", "Romantique", "Nature"],
    ambiances: ["Bois", "Sauge", "Terracotta"],
  },
  72: { // Vase Géométrique Blanc
    occasions: ["Mariage moderne", "Événement entreprise", "Inauguration", "Cocktail"],
    styles: ["Moderne", "Minimaliste"],
    ambiances: ["Blanc", "Transparent"],
  },
  73: { // Vase Dame Jeanne
    occasions: ["Mariage bohème", "Mariage champêtre", "Garden Party", "Shooting photo"],
    styles: ["Bohème", "Champêtre", "Rustique", "Vintage"],
    ambiances: ["Bois", "Sauge", "Terracotta"],
  },

  // ── DÉCORATION ──
  74: { // Horloge
    occasions: ["Shooting photo", "Événement entreprise", "Inauguration"],
    styles: ["Vintage", "Industriel"],
    ambiances: ["Doré", "Bois"],
  },
  75: { // Sonnette de Comptoir
    occasions: ["Shooting photo", "Cocktail", "Événement entreprise"],
    styles: ["Vintage", "Industriel"],
    ambiances: ["Doré", "Argent"],
  },
  76: { // Boa
    occasions: ["Soirée Gatsby", "Soirée Disco", "Halloween", "Shooting photo"],
    styles: ["Glamour", "Luxe"],
    ambiances: ["Blanc", "Rose poudré", "Doré"],
  },
  77: { // Cage Porte Clé
    occasions: ["Shooting photo", "Mariage romantique"],
    styles: ["Vintage", "Romantique"],
    ambiances: ["Doré", "Bois"],
  },
  78: { // Umbrella
    occasions: ["Garden Party", "Soirée Tropicale", "Mariage méditerranéen"],
    styles: ["Tropical", "Méditerranéen"],
    ambiances: ["Bois", "Transparent"],
  },

  // ── FLEURS & FEUILLAGES ──
  79: { // Guirlande Glycine
    occasions: ["Mariage romantique", "Mariage bohème", "Garden Party", "Baptême", "Shooting photo", "Baby Shower"],
    styles: ["Romantique", "Bohème", "Nature"],
    ambiances: ["Rose poudré", "Sauge", "Blanc"],
  },
  80: { // Bouquet Artificiel Bas
    occasions: ["Mariage romantique", "Mariage chic", "Baptême", "Communion", "Shooting photo"],
    styles: ["Romantique", "Champêtre"],
    ambiances: ["Blanc", "Rose poudré", "Doré"],
  },
  81: { // Bouquet Artificiel Haut
    occasions: ["Mariage romantique", "Mariage chic", "Shooting photo", "Inauguration"],
    styles: ["Romantique", "Luxe"],
    ambiances: ["Blanc", "Doré", "Champagne"],
  },
  82: { // Plume d'Autruche
    occasions: ["Soirée Gatsby", "Mariage chic", "Soirée Disco", "Shooting photo"],
    styles: ["Glamour", "Art Déco", "Luxe"],
    ambiances: ["Blanc", "Doré", "Champagne"],
  },
  83: { // Gazon Artificiel à Suspendre (petit)
    occasions: ["Garden Party", "Mariage bohème", "Shooting photo"],
    styles: ["Nature", "Bohème"],
    ambiances: ["Sauge", "Bois"],
  },
  84: { // Gazon Artificiel à Suspendre (grand)
    occasions: ["Garden Party", "Mariage bohème", "Shooting photo", "Événement entreprise"],
    styles: ["Nature", "Bohème", "Moderne"],
    ambiances: ["Sauge", "Bois"],
  },
}

// ─── PUBLIC HELPERS ─────────────────────────────────────────────────────────

export function getTagsForProduct(productId: number): ProductTags {
  return TAGS_BY_ID[productId] || { occasions: [], styles: [], ambiances: [] }
}

/** Returns all unique occasion tags that have at least one product */
export function getActiveOccasions(): string[] {
  const set = new Set<string>()
  for (const tags of Object.values(TAGS_BY_ID)) {
    for (const o of tags.occasions) set.add(o)
  }
  return OCCASIONS.filter((o) => set.has(o))
}

/** Returns all unique style tags that have at least one product */
export function getActiveStyles(): string[] {
  const set = new Set<string>()
  for (const tags of Object.values(TAGS_BY_ID)) {
    for (const s of tags.styles) set.add(s)
  }
  return STYLES.filter((s) => set.has(s))
}

/** Returns all unique ambiance tags that have at least one product */
export function getActiveAmbiances(): string[] {
  const set = new Set<string>()
  for (const tags of Object.values(TAGS_BY_ID)) {
    for (const a of tags.ambiances) set.add(a)
  }
  return AMBIANCES.filter((a) => set.has(a))
}
