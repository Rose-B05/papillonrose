export interface DevisLigne {
  productId: number
  nom: string
  quantite: number
  prixUnitaire: number
  sousTotal: number
  dimension?: string
}

export interface DevisAdresse {
  rue?: string
  codePostal?: string
  departement?: string
}

export type DevisStatut = "en_attente" | "en_preparation" | "envoye" | "accepte" | "refuse"

export interface Devis {
  id: string
  quoteNumber: string
  client: {
    nom: string
    prenom: string
    email: string
    telephone: string
  }
  lignes: DevisLigne[]
  dateDebut: string
  dateFin: string
  adresse?: DevisAdresse
  fraisLivraison: number
  remise: number
  notesInternes?: string
  totalHt: number
  totalTtc: number
  statut: DevisStatut
  creeLe: string
  envoyeLe?: string
  accepteLe?: string
  refuseLe?: string
}

export const DEVIS_STATUT_LABELS: Record<DevisStatut, string> = {
  en_attente: "En attente",
  en_preparation: "En préparation",
  envoye: "Envoyé",
  accepte: "Accepté",
  refuse: "Refusé",
}

export const DEVIS_STATUT_COLORS: Record<DevisStatut, string> = {
  en_attente: "bg-gray-100 text-gray-600 dark:bg-neutral-700 dark:text-white/70",
  en_preparation: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  envoye: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  accepte: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  refuse: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
}
