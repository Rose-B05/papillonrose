import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { sql } from "@/lib/pg"

export const runtime = "nodejs"

async function getNextNumero(): Promise<string> {
  const { rows } = await sql`
    SELECT numero FROM devis_decoration
    ORDER BY
      CAST(SUBSTRING(numero FROM 3) AS INTEGER) DESC
    LIMIT 1
  `
  if (rows.length === 0) return "E-1"
  const last = rows[0].numero
  const num = parseInt(last.replace("E-", ""), 10)
  return `E-${num + 1}`
}

export async function POST(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      client_nom,
      client_email,
      client_telephone,
      titre_projet,
      date_evenement_debut,
      date_evenement_fin,
      lignes,
      pourcentage_main_oeuvre,
      notes_internes,
      statut,
    } = body

    if (!client_nom?.trim()) {
      return NextResponse.json({ error: "Le nom du client est requis" }, { status: 400 })
    }
    if (!client_email?.trim()) {
      return NextResponse.json({ error: "L'email du client est requis" }, { status: 400 })
    }
    if (!titre_projet?.trim()) {
      return NextResponse.json({ error: "Le titre du projet est requis" }, { status: 400 })
    }
    if (!date_evenement_debut) {
      return NextResponse.json({ error: "La date de début est requise" }, { status: 400 })
    }
    if (!lignes || lignes.length === 0) {
      return NextResponse.json({ error: "Au moins une ligne est requise" }, { status: 400 })
    }

    const numero = await getNextNumero()
    const total_ht = lignes.reduce(
      (sum: number, l: any) => sum + (Number(l.quantite) || 0) * (Number(l.prix_unitaire) || 0),
      0
    )
    const pctMO = Number(pourcentage_main_oeuvre) || 45
    const montant_main_oeuvre = Math.round(total_ht * (pctMO / 100) * 100) / 100
    const montant_accompte = Math.round(total_ht * 0.25 * 100) / 100
    const montant_solde = Math.round(total_ht * 0.75 * 100) / 100

    const soldeDate = new Date(date_evenement_debut)
    soldeDate.setDate(soldeDate.getDate() - 1)
    const date_echeance_solde = soldeDate.toISOString().split("T")[0]

    const isSend = statut === "envoye"
    const now = new Date().toISOString()

    const { rows } = await sql`
      INSERT INTO devis_decoration (
        numero, client_nom, client_email, client_telephone,
        titre_projet, date_evenement_debut, date_evenement_fin,
        statut, total_ht, pourcentage_main_oeuvre, montant_main_oeuvre,
        montant_accompte, date_echeance_accompte,
        montant_solde, date_echeance_solde,
        date_creation, date_envoi, notes_internes
      ) VALUES (
        ${numero},
        ${client_nom.trim()},
        ${client_email.trim()},
        ${client_telephone?.trim() || null},
        ${titre_projet.trim()},
        ${date_evenement_debut},
        ${date_evenement_fin || null},
        ${isSend ? "envoye" : "brouillon"},
        ${total_ht},
        ${pctMO},
        ${montant_main_oeuvre},
        ${montant_accompte},
        ${isSend ? new Date().toISOString().split("T")[0] : null},
        ${montant_solde},
        ${date_echeance_solde},
        NOW(),
        ${isSend ? now : null},
        ${notes_internes?.trim() || null}
      ) RETURNING id, numero
    `

    const devisId = rows[0].id

    for (let i = 0; i < lignes.length; i++) {
      const l = lignes[i]
      await sql`
        INSERT INTO lignes_devis_decoration (devis_id, description, quantite, prix_unitaire, ordre)
        VALUES (
          ${devisId},
          ${(l.description || "").trim()},
          ${Number(l.quantite) || 1},
          ${Number(l.prix_unitaire) || 0},
          ${i}
        )
      `
    }

    // TODO: déclencher l'envoi d'email au client ici quand statut === "envoye"
    // ex: await sendDecorationQuoteEmail(devisId)

    return NextResponse.json({ devis: { id: devisId, numero } }, { status: 201 })
  } catch (err: any) {
    console.error("Erreur création devis décoration:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
