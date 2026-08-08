export interface DecorationLigne {
  description: string
  quantite: number
  prix_unitaire: number
}

export interface DecorationDevis {
  id: string
  numero: string
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
  lignes: DecorationLigne[]
}
