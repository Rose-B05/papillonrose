import { sql } from "@/lib/pg"
import type { DecorationDevis } from "./types"

export type { DecorationDevis }

export async function getDecorationDevis(id: string): Promise<DecorationDevis | null> {
  const { rows } = await sql`
    SELECT * FROM devis_decoration WHERE id = ${id} LIMIT 1
  `
  if (rows.length === 0) return null

  const devis = rows[0] as any

  const { rows: lignes } = await sql`
    SELECT description, quantite, prix_unitaire
    FROM lignes_devis_decoration
    WHERE devis_id = ${id}
    ORDER BY ordre ASC
  `

  return {
    id: devis.id,
    numero: devis.numero,
    client_nom: devis.client_nom,
    client_email: devis.client_email,
    client_telephone: devis.client_telephone,
    titre_projet: devis.titre_projet,
    date_evenement_debut: devis.date_evenement_debut,
    date_evenement_fin: devis.date_evenement_fin,
    total_ht: Number(devis.total_ht),
    pourcentage_main_oeuvre: Number(devis.pourcentage_main_oeuvre),
    montant_accompte: Number(devis.montant_accompte),
    date_echeance_accompte: devis.date_echeance_accompte,
    montant_solde: Number(devis.montant_solde),
    date_echeance_solde: devis.date_echeance_solde,
    iban: devis.iban,
    bic: devis.bic,
    date_creation: devis.date_creation,
    lignes: lignes.map((l: any) => ({
      description: l.description,
      quantite: Number(l.quantite),
      prix_unitaire: Number(l.prix_unitaire),
    })),
  }
}

export async function generateDecorationDevisPdf(devis: DecorationDevis): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer")
  const { decorationPdfTemplate } = await import("./pdf-template")
  const pdfElement = decorationPdfTemplate(devis)
  const buffer = await renderToBuffer(pdfElement)
  return buffer as unknown as Buffer
}
