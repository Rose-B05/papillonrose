import type { Produit } from "@/data/produits"

const THEME_MAP: Record<string, string[]> = {
  Mobilier: ["Mariage", "Anniversaire", "Événement pro"],
  "Figurines & Jeux": ["Anniversaire"],
  "Bougeoirs & Lustres": ["Mariage", "Soirée", "Noël"],
  Verreries: ["Mariage", "Événement pro", "Soirée"],
  Cadres: ["Mariage", "Baptême"],
  "Présentoirs & Plateaux": ["Événement pro", "Mariage"],
  "Urnes & Accessoires": ["Mariage"],
  "Art de la Table": ["Mariage", "Anniversaire", "Noël", "Événement pro"],
  "Vases & Pots": ["Mariage", "Baptême"],
  Décoration: ["Mariage", "Anniversaire", "Noël", "Soirée"],
  "Fleurs & Feuillages": ["Mariage", "Baptême", "Anniversaire"],
}

const COLOR_WORDS: [RegExp, string][] = [
  [/blanc|blanche|ivoire/i, "Blanc"],
  [/noir|noire/i, "Noir"],
  [/dor[eé]|dor[eé]e|or\b|lation/i, "Doré"],
  [/rose|saumon|prune|poudr[eé]e/i, "Rose"],
  [/rouge/i, "Rouge"],
  [/argent|argent[eé]/i, "Argent"],
  [/vert|meraude|emeraude/i, "Vert"],
  [/bois|naturel|lin|velour/i, "Naturel"],
  [/transparent|cristal/i, "Transparent"],
  [/multicolore|color[eé]/i, "Multicolore"],
]

export function getThemes(p: Produit): string[] {
  return THEME_MAP[p.categorie] ?? []
}

export function getCouleurs(p: Produit): string[] {
  const found = new Set<string>()
  for (const [pattern, color] of COLOR_WORDS) {
    if (pattern.test(p.nom)) found.add(color)
  }
  return [...found]
}

export function parsePrixVal(prix: number | string): number {
  if (typeof prix === "number") return prix
  const m = prix.match(/[\d.]+/)
  return m ? Number(m[0]) : 0
}

export const THEMES = [
  "Mariage",
  "Anniversaire",
  "Événement pro",
  "Baptême",
  "Noël",
  "Soirée",
] as const

export const COULEURS = [
  "Blanc",
  "Doré",
  "Noir",
  "Rose",
  "Naturel",
  "Argent",
  "Rouge",
  "Vert",
  "Transparent",
  "Multicolore",
] as const

export const BUDGET_RANGES = [
  { label: "- de 50€", min: 0, max: 50 },
  { label: "50 – 150€", min: 50, max: 150 },
  { label: "150 – 300€", min: 150, max: 300 },
  { label: "+ de 300€", min: 300, max: Infinity },
] as const

export type FilterState = {
  themes: string[]
  couleurs: string[]
  budgetMin: number
  budgetMax: number
  dateDebut: string
  dateFin: string
}
