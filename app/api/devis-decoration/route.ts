import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { sql } from "@/lib/pg"
import { getDecorationDevis, generateDecorationDevisPdf } from "@/lib/devis-decoration/db"
import nodemailer from "nodemailer"

export const runtime = "nodejs"

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const TO_ADMIN = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as nodemailer.TransportOptions)
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

function formatDateFr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function buildDecorationEmailHtml(
  numero: string,
  titreProjet: string,
  clientNom: string,
  totalHT: number,
  montantAcconpte: number,
  dateEcheanceAcconpte: string | null,
  montantSolde: number,
  dateEcheanceSolde: string | null,
  tokenPublic: string,
  lignes: { description: string; quantite: number; prix_unitaire: number }[]
): string {
  const lignesHtml = lignes
    .map(
      (l) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500">${l.description}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${l.quantite}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatEUR(l.prix_unitaire)}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#c27a72">${formatEUR(l.prix_unitaire * l.quantite)}</td>
      </tr>`
    )
    .join("")

  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c27a72">
    <h1 style="color:#c27a72;font-size:24px;margin:0"><img src="${SITE_URL}/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle"></h1>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Location mobilier &amp; décoration événements</p>
  </div>

  <div style="background:#fdf8f0;border-radius:12px;padding:24px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">Bonjour ${clientNom},</h2>
    <p style="color:#c27a72;font-size:14px;margin:0">Voici votre devis décoration n° ${numero}</p>
  </div>

  <h3 style="color:#2E2E2E;font-size:16px;margin:20px 0 8px">📋 ${titreProjet}</h3>

  <table style="width:100%;border-collapse:collapse;background:#f8f5f0;border-radius:8px;overflow:hidden">
    <thead>
      <tr style="background:#2E2E2E;color:white">
        <th style="padding:8px 12px;text-align:left">Description</th>
        <th style="padding:8px 12px;text-align:center">Qté</th>
        <th style="padding:8px 12px;text-align:right">Prix unit.</th>
        <th style="padding:8px 12px;text-align:right">Total</th>
      </tr>
    </thead>
    <tbody>${lignesHtml}</tbody>
  </table>

  <div style="background:#2E2E2E;border-radius:12px;padding:20px;margin:20px 0;color:white;text-align:center">
    <span style="opacity:0.7;font-size:14px">Total de la prestation</span>
    <p style="font-weight:700;font-size:24px;color:#c27a72;margin:4px 0 0">${formatEUR(totalHT)}</p>
  </div>

  <div style="background:#fdf8f0;border-radius:12px;padding:20px;margin:20px 0">
    <h3 style="color:#2E2E2E;font-size:15px;margin:0 0 12px;text-align:center">💰 Échéancier de paiement</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee">
          <p style="margin:0;font-weight:600;color:#2E2E2E">Acompte à la validation (25%)</p>
          ${dateEcheanceAcconpte ? `<p style="margin:2px 0 0;font-size:12px;color:#544f4f">À régler avant le ${formatDateFr(dateEcheanceAcconpte)}</p>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right;font-weight:700;color:#c27a72;font-size:16px">${formatEUR(montantAcconpte)}</td>
      </tr>
      <tr>
        <td style="padding:10px 0">
          <p style="margin:0;font-weight:600;color:#2E2E2E">Solde à régler (75%)</p>
          ${dateEcheanceSolde ? `<p style="margin:2px 0 0;font-size:12px;color:#544f4f">À régler avant le ${formatDateFr(dateEcheanceSolde)}</p>` : ""}
        </td>
        <td style="padding:10px 0;text-align:right;font-weight:700;color:#c27a72;font-size:16px">${formatEUR(montantSolde)}</td>
      </tr>
    </table>
  </div>

  <div style="text-align:center;padding:16px;margin:16px 0">
    <a href="${SITE_URL}/devis/${tokenPublic}" style="display:inline-block;background:#c27a72;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      Consulter mon devis en ligne
    </a>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

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

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const { rows } = await sql`
      SELECT
        d.id, d.numero, d.token_public, d.type_document,
        d.client_nom, d.client_email, d.client_telephone,
        d.titre_projet, d.date_evenement_debut, d.date_evenement_fin,
        d.statut, d.total_ht, d.date_creation, d.date_envoi,
        d.montant_accompte, d.date_echeance_solde,
        (SELECT COUNT(*) FROM lignes_devis_decoration WHERE devis_id = d.id) AS article_count,
        COALESCE(SUM(v.montant), 0) AS total_verse
      FROM devis_decoration d
      LEFT JOIN versements_decoration v ON v.devis_id = d.id
      GROUP BY d.id
      ORDER BY d.date_evenement_debut ASC NULLS LAST, d.date_creation DESC
    `

    const devis = rows.map((r: any) => ({
      id: r.id,
      numero: r.numero,
      token_public: r.token_public,
      type_document: r.type_document || "devis",
      client_nom: r.client_nom,
      client_email: r.client_email,
      client_telephone: r.client_telephone,
      titre_projet: r.titre_projet,
      date_evenement_debut: r.date_evenement_debut,
      date_evenement_fin: r.date_evenement_fin,
      statut: r.statut,
      total_ht: Number(r.total_ht),
      article_count: Number(r.article_count),
      date_creation: r.date_creation,
      date_envoi: r.date_envoi,
      montant_accompte: Number(r.montant_accompte),
      date_echeance_solde: r.date_echeance_solde,
      total_verse: Number(r.total_verse),
    }))

    return NextResponse.json({ devis })
  } catch (err: any) {
    console.error("Erreur listing devis décoration:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
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
      ) RETURNING id, numero, token_public
    `

    const devisId = rows[0].id
    const tokenPublic = rows[0].token_public

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

    // Envoi d'email au client + copie admin quand statut === "envoye"
    if (isSend) {
      try {
        const devis = await getDecorationDevis(devisId)
        if (devis) {
          const pdfBuffer = await generateDecorationDevisPdf(devis)
          const transport = getTransport()
          const subject = `Votre devis Papillon Rose n°${numero} — ${titre_projet.trim()}`

          const html = buildDecorationEmailHtml(
            numero,
            titre_projet.trim(),
            client_nom.trim(),
            total_ht,
            montant_accompte,
            new Date().toISOString().split("T")[0],
            montant_solde,
            date_echeance_solde,
            tokenPublic,
            devis.lignes
          )

          const mailOptions = {
            from: `"Papillon Rose" <${FROM}>`,
            to: client_email.trim(),
            subject,
            html,
            attachments: [
              {
                filename: `Devis-${numero}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf",
              },
            ],
          }

          // Email au client
          await transport.sendMail(mailOptions)

          // Copie admin
          await transport.sendMail({
            ...mailOptions,
            to: TO_ADMIN,
            subject: `[ADMIN] ${subject}`,
          })
        }
      } catch (emailErr) {
        console.error("Erreur envoi email devis décoration:", emailErr)
        // L'email ne doit pas bloquer la création du devis
      }
    }

    return NextResponse.json({ devis: { id: devisId, numero, token_public: tokenPublic } }, { status: 201 })
  } catch (err: any) {
    console.error("Erreur création devis décoration:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
