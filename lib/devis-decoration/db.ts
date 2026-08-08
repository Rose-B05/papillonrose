import { sql } from "@/lib/pg"
import type { DecorationDevis, Versement } from "./types"

export type { DecorationDevis, Versement }

async function fetchVersements(devisId: string): Promise<Versement[]> {
  const { rows } = await sql`
    SELECT id, devis_id, montant, date_versement, methode, type, commentaire, date_enregistrement
    FROM versements_decoration
    WHERE devis_id = ${devisId}
    ORDER BY date_versement ASC, date_enregistrement ASC
  `
  return rows.map((v: any) => ({
    id: v.id,
    devis_id: v.devis_id,
    montant: Number(v.montant),
    date_versement: v.date_versement,
    methode: v.methode,
    type: v.type,
    commentaire: v.commentaire,
    date_enregistrement: v.date_enregistrement,
  }))
}

function mapDevis(row: any, lignes: any[], versements: Versement[]): DecorationDevis {
  return {
    id: row.id,
    numero: row.numero,
    token_public: row.token_public,
    type_document: row.type_document || "devis",
    client_nom: row.client_nom,
    client_email: row.client_email,
    client_telephone: row.client_telephone,
    titre_projet: row.titre_projet,
    date_evenement_debut: row.date_evenement_debut,
    date_evenement_fin: row.date_evenement_fin,
    total_ht: Number(row.total_ht),
    pourcentage_main_oeuvre: Number(row.pourcentage_main_oeuvre),
    montant_accompte: Number(row.montant_accompte),
    date_echeance_accompte: row.date_echeance_accompte,
    montant_solde: Number(row.montant_solde),
    date_echeance_solde: row.date_echeance_solde,
    iban: row.iban,
    bic: row.bic,
    date_creation: row.date_creation,
    statut: row.statut,
    notes_internes: row.notes_internes,
    lignes: lignes.map((l: any) => ({
      description: l.description,
      quantite: Number(l.quantite),
      prix_unitaire: Number(l.prix_unitaire),
    })),
    versements,
    montant_total_verse: versements.reduce((sum, v) => sum + v.montant, 0),
  }
}

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

  const versements = await fetchVersements(id)
  return mapDevis(devis, lignes, versements)
}

export async function getDecorationDevisByToken(token: string): Promise<DecorationDevis | null> {
  const { rows } = await sql`
    SELECT * FROM devis_decoration WHERE token_public = ${token} LIMIT 1
  `
  if (rows.length === 0) return null

  const devis = rows[0] as any

  const { rows: lignes } = await sql`
    SELECT description, quantite, prix_unitaire
    FROM lignes_devis_decoration
    WHERE devis_id = ${devis.id}
    ORDER BY ordre ASC
  `

  const versements = await fetchVersements(devis.id)
  return mapDevis(devis, lignes, versements)
}

export async function generateDecorationDevisPdf(devis: DecorationDevis): Promise<Buffer> {
  const { renderToBuffer } = await import("@react-pdf/renderer")
  const { decorationPdfTemplate } = await import("./pdf-template")
  const pdfElement = decorationPdfTemplate(devis)
  const buffer = await renderToBuffer(pdfElement)
  return buffer as unknown as Buffer
}
