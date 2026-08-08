export interface DecorationLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

export interface Versement {
  id: string
  devis_id: string
  montant: number
  date_versement: string
  methode: string | null
  type: string | null
  commentaire: string | null
  date_enregistrement: string
}

export interface DecorationDevis {
  id: string
  numero: string
  token_public: string
  type_document: string
  client_nom: string
  client_email: string
  client_telephone?: string
  titre_projet: string
  date_evenement_debut: string
  date_evenement_fin?: string
  total_ht: number
  pourcentage_main_oeuvre: number
  montant_accompte: number
  date_echeance_accompte?: string
  montant_solde: number
  date_echeance_solde?: string
  iban: string
  bic: string
  date_creation: string
  statut: string
  notes_internes?: string
  lignes: DecorationLigne[]
  versements: Versement[]
  montant_total_verse: number
}
