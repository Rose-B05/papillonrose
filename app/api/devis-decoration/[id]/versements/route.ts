import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { sql } from "@/lib/pg"
import { getDecorationDevis, generateDecorationDevisPdf } from "@/lib/devis-decoration/db"
import type { DecorationDevis } from "@/lib/devis-decoration/types"

export const runtime = "nodejs"

const FROM = process.env.SMTP_FROM || "papillonrosebertha@gmail.com"
const TO_ADMIN = process.env.CONTACT_EMAIL || "papillonrosebertha@gmail.com"
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

function getTransport() {
  const nodemailer = require("nodemailer")
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  } as any)
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

function buildVersementEmailHtml(params: {
  numero: string
  typeDocument: "devis" | "facture"
  clientNom: string
  montantVerse: number
  dateVersement: string
  totalVerse: number
  totalHT: number
  soldeRestant: number
  dateEcheanceSolde: string | null
  tokenPublic: string
  isAcompteConversion: boolean
  isFullyPaid: boolean
  methode: string | null
  commentaire: string | null
}) {
  const docLabel = params.typeDocument === "facture" ? "facture" : "devis"
  const docLabelCapital = params.typeDocument === "facture" ? "Facture" : "Devis"
  const conversionNote = params.isAcompteConversion
    ? `<p style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:16px 0;color:#166534;font-weight:500">
        Votre acompte a bien été reçu, votre devis n°${params.numero} est désormais validé et devient votre facture n°${params.numero}.
      </p>`
    : ""

  const soldeSection = params.isFullyPaid
    ? `<p style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px 16px;margin:16px 0;color:#166534;font-weight:500">
        Votre ${docLabel} n°${params.numero} est entièrement soldée, merci !
      </p>`
    : `<div style="background:#fdf8f0;border-radius:12px;padding:16px;margin:16px 0">
        <table style="width:100%;border-collapse:collapse">
          <tr>
            <td style="padding:8px 0;font-weight:600;color:#2E2E2E">Total ${docLabelCapital}</td>
            <td style="padding:8px 0;text-align:right;font-weight:600">${formatEUR(params.totalHT)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#544f4f">Total versé à ce jour</td>
            <td style="padding:8px 0;text-align:right;color:#c27a72;font-weight:600">${formatEUR(params.totalVerse)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-weight:700;color:#2E2E2E;border-top:2px solid #c27a72">Solde restant</td>
            <td style="padding:8px 0;text-align:right;font-weight:700;color:#c27a72;font-size:18px;border-top:2px solid #c27a72">${formatEUR(params.soldeRestant)}</td>
          </tr>
        </table>
        ${params.dateEcheanceSolde ? `<p style="color:#544f4f;font-size:12px;margin:8px 0 0;text-align:center">Date d'échéance du solde : ${formatDateFr(params.dateEcheanceSolde)}</p>` : ""}
      </div>`

  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c27a72">
    <h1 style="color:#c27a72;font-size:24px;margin:0"><img src="${SITE_URL}/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle"></h1>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Location mobilier &amp; décoration événements</p>
  </div>

  <div style="background:#fdf8f0;border-radius:12px;padding:24px;margin:20px 0;text-align:center">
    <h2 style="color:#2E2E2E;font-size:20px;margin:0 0 8px">Bonjour ${params.clientNom},</h2>
    <p style="color:#c27a72;font-size:14px;margin:0">
      ${params.isFullyPaid ? "Merci pour votre paiement" : "Nous avons bien reçu votre versement"}
    </p>
  </div>

  ${conversionNote}

  <div style="background:#f8f5f0;border-radius:12px;padding:16px;margin:20px 0">
    <h3 style="color:#2E2E2E;font-size:14px;margin:0 0 12px">Détail du versement</h3>
    <table style="width:100%;border-collapse:collapse">
      <tr>
        <td style="padding:6px 0;color:#544f4f">Montant reçu</td>
        <td style="padding:6px 0;text-align:right;font-weight:700;color:#c27a72;font-size:18px">${formatEUR(params.montantVerse)}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;color:#544f4f">Date du versement</td>
        <td style="padding:6px 0;text-align:right">${formatDateFr(params.dateVersement)}</td>
      </tr>
      ${params.methode ? `<tr>
        <td style="padding:6px 0;color:#544f4f">Mode de paiement</td>
        <td style="padding:6px 0;text-align:right">${params.methode}</td>
      </tr>` : ""}
      ${params.commentaire ? `<tr>
        <td style="padding:6px 0;color:#544f4f">Note</td>
        <td style="padding:6px 0;text-align:right;font-style:italic">${params.commentaire}</td>
      </tr>` : ""}
    </table>
  </div>

  ${soldeSection}

  <div style="text-align:center;padding:16px;margin:16px 0">
    <a href="${SITE_URL}/devis/${params.tokenPublic}" style="display:inline-block;background:#c27a72;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      Consulter mon ${docLabel} en ligne
    </a>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

function buildFullyPaidEmailHtml(params: {
  numero: string
  clientNom: string
  totalHT: number
  tokenPublic: string
}) {
  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c27a72">
    <h1 style="color:#c27a72;font-size:24px;margin:0"><img src="${SITE_URL}/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle"></h1>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Location mobilier &amp; décoration événements</p>
  </div>

  <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin:20px 0;text-align:center;border:1px solid #bbf7d0">
    <h2 style="color:#166534;font-size:20px;margin:0 0 8px">Paiement intégral reçu</h2>
    <p style="color:#166534;font-size:14px;margin:0">Facture n°${params.numero} entièrement soldée, merci !</p>
  </div>

  <div style="background:#f8f5f0;border-radius:12px;padding:16px;margin:20px 0;text-align:center">
    <p style="color:#544f4f;font-size:12px;margin:0 0 4px">Montant total réglé</p>
    <p style="color:#c27a72;font-size:28px;font-weight:700;margin:0">${formatEUR(params.totalHT)}</p>
  </div>

  <p style="text-align:center;color:#2E2E2E;font-size:14px">
    Bonjour ${params.clientNom},<br/><br/>
    Nous vous confirmons la bonne réception de l'intégralité du paiement pour votre facture n°${params.numero}.
  </p>

  <div style="text-align:center;padding:16px;margin:16px 0">
    <a href="${SITE_URL}/devis/${params.tokenPublic}" style="display:inline-block;background:#c27a72;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
      Consulter ma facture en ligne
    </a>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id: devisId } = await params

  try {
    const body = await request.json()
    const { montant, date_versement, methode, commentaire } = body

    if (!montant || Number(montant) <= 0) {
      return NextResponse.json({ error: "Le montant doit être supérieur à 0" }, { status: 400 })
    }
    if (!date_versement) {
      return NextResponse.json({ error: "La date du versement est requise" }, { status: 400 })
    }

    const devis = await getDecorationDevis(devisId)
    if (!devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }

    const montantNum = Math.round(Number(montant) * 100) / 100
    const totalVerseAvant = devis.montant_total_verse
    const totalVerseApres = totalVerseAvant + montantNum
    const soldeRestant = devis.total_ht - totalVerseApres
    const pctRegle = (totalVerseApres / devis.total_ht) * 100

    // Déterminer le type du versement
    let versementType: string
    if (totalVerseAvant < devis.montant_accompte && totalVerseApres >= devis.montant_accompte) {
      versementType = "acompte"
    } else if (soldeRestant <= 0) {
      versementType = "solde"
    } else {
      versementType = "versement_intermediaire"
    }

    // Déterminer si on doit mettre à jour type_document
    const wasDevis = devis.type_document === "devis"
    const becomesFacture = wasDevis && totalVerseApres >= devis.montant_accompte
    const newTypeDocument = becomesFacture ? "facture" : devis.type_document

    // Déterminer le nouveau statut
    let newStatut = devis.statut
    if (devis.statut === "envoye" && totalVerseApres >= devis.montant_accompte) {
      newStatut = "acompte_verse"
    }
    if (soldeRestant <= 0) {
      newStatut = "solde"
    }

    // Insérer le versement
    await sql`
      INSERT INTO versements_decoration (devis_id, montant, date_versement, methode, type, commentaire)
      VALUES (
        ${devisId},
        ${montantNum},
        ${date_versement},
        ${methode?.trim() || null},
        ${versementType},
        ${commentaire?.trim() || null}
      )
    `

    // Mettre à jour type_document et statut si nécessaire
    if (becomesFacture || newStatut !== devis.statut) {
      const updates: string[] = []
      if (becomesFacture) updates.push("type_document = 'facture'")
      if (newStatut !== devis.statut) updates.push(`statut = '${newStatut}'`)

      await sql.unsafe(`
        UPDATE devis_decoration
        SET ${updates.join(", ")}
        WHERE id = '${devisId}'
      `)
    }

    // Re-fetch le devis mis à jour
    const updatedDevis = await getDecorationDevis(devisId)

    // --- Envoi d'emails ---
    try {
      const transport = getTransport()
      const isFullyPaid = soldeRestant <= 0
      const isAcompteConversion = becomesFacture

      if (isFullyPaid) {
        // Email spécial : facture intégralement soldée
        const subjectClient = `Papillon Rose — Facture n°${devis.numero} intégralement soldée, merci !`
        const htmlClient = buildFullyPaidEmailHtml({
          numero: devis.numero,
          clientNom: devis.client_nom,
          totalHT: devis.total_ht,
          tokenPublic: devis.token_public,
        })

        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: devis.client_email,
          subject: subjectClient,
          html: htmlClient,
        })

        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: TO_ADMIN,
          subject: `[ADMIN] ${subjectClient}`,
          html: htmlClient,
        })
      } else {
        // Email standard de versement
        const typeDocLabel = newTypeDocument === "facture" ? "facture" : "devis"
        const subjectClient = `Papillon Rose — Versement reçu pour votre ${typeDocLabel} n°${devis.numero}`

        const htmlClient = buildVersementEmailHtml({
          numero: devis.numero,
          typeDocument: newTypeDocument as "devis" | "facture",
          clientNom: devis.client_nom,
          montantVerse: montantNum,
          dateVersement: date_versement,
          totalVerse: totalVerseApres,
          totalHT: devis.total_ht,
          soldeRestant,
          dateEcheanceSolde: devis.date_echeance_solde || null,
          tokenPublic: devis.token_public,
          isAcompteConversion,
          isFullyPaid: false,
          methode: methode?.trim() || null,
          commentaire: commentaire?.trim() || null,
        })

        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: devis.client_email,
          subject: subjectClient,
          html: htmlClient,
        })

        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: TO_ADMIN,
          subject: `[ADMIN] ${subjectClient}`,
          html: htmlClient,
        })
      }
    } catch (emailErr) {
      console.error("Erreur envoi email versement:", emailErr)
    }

    return NextResponse.json({
      versement: { montant: montantNum, date_versement, methode, type: versementType, commentaire },
      devis: updatedDevis,
    }, { status: 201 })
  } catch (err: any) {
    console.error("Erreur ajout versement:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id: devisId } = await params

  try {
    const { rows } = await sql`
      SELECT id, devis_id, montant, date_versement, methode, type, commentaire, date_enregistrement
      FROM versements_decoration
      WHERE devis_id = ${devisId}
      ORDER BY date_versement ASC, date_enregistrement ASC
    `
    const versements = rows.map((v: any) => ({
      id: v.id,
      devis_id: v.devis_id,
      montant: Number(v.montant),
      date_versement: v.date_versement,
      methode: v.methode,
      type: v.type,
      commentaire: v.commentaire,
      date_enregistrement: v.date_enregistrement,
    }))

    return NextResponse.json({ versements })
  } catch (err: any) {
    console.error("Erreur lecture versements:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
