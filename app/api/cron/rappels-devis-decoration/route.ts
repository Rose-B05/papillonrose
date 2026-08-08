import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/pg"
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

function buildRappelEmailHtml(params: {
  numero: string
  clientNom: string
  soldeRestant: number
  totalHT: number
  dateEcheanceSolde: string
  iban: string
  bic: string
  tokenPublic: string
}): string {
  return `
<div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;max-width:600px;margin:auto;padding:20px;background:#fff;color:#2E2E2E">
  <div style="text-align:center;padding:20px 0;border-bottom:2px solid #c27a72">
    <h1 style="color:#c27a72;font-size:24px;margin:0"><img src="${SITE_URL}/papillon-rose-logo.png" alt="Papillon Rose" height="40" style="vertical-align:middle"></h1>
    <p style="color:#544f4f;font-size:12px;margin:4px 0 0">Location mobilier &amp; décoration événements</p>
  </div>

  <div style="background:#fef3c7;border-radius:12px;padding:24px;margin:20px 0;text-align:center;border:1px solid #fde68a">
    <h2 style="color:#92400e;font-size:18px;margin:0 0 8px">Rappel de paiement</h2>
    <p style="color:#92400e;font-size:13px;margin:0">Le solde de votre facture n°${params.numero} reste à régler.</p>
  </div>

  <div style="padding:0 10px">
    <p style="color:#2E2E2E;font-size:14px">
      Bonjour ${params.clientNom},
    </p>
    <p style="color:#544f4f;font-size:14px;line-height:1.6">
      Nous vous rappelons que le solde de votre facture <strong>n°${params.numero}</strong> est toujours en attente de règlement.
    </p>

    <div style="background:#f8f5f0;border-radius:12px;padding:16px;margin:20px 0">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:8px 0;color:#544f4f">Total facture</td>
          <td style="padding:8px 0;text-align:right;font-weight:600">${formatEUR(params.totalHT)}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;font-weight:700;color:#2E2E2E;border-top:2px solid #c27a72">Solde restant dû</td>
          <td style="padding:8px 0;text-align:right;font-weight:700;color:#c27a72;font-size:20px;border-top:2px solid #c27a72">${formatEUR(params.soldeRestant)}</td>
        </tr>
      </table>
    </div>

    <div style="background:#fef3c7;border-radius:12px;padding:16px;margin:20px 0;border:1px solid #fde68a">
      <p style="color:#92400e;font-size:13px;margin:0;text-align:center;font-weight:600">
        ⚠️ Échéance dépassée le ${formatDateFr(params.dateEcheanceSolde)}
      </p>
    </div>

    <div style="background:#f8f5f0;border-radius:12px;padding:16px;margin:20px 0">
      <h3 style="color:#2E2E2E;font-size:14px;margin:0 0 12px;text-align:center">Coordonnées bancaires</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:6px 0;color:#544f4f;font-size:13px">IBAN</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;font-family:monospace;font-size:13px">${params.iban}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#544f4f;font-size:13px">BIC</td>
          <td style="padding:6px 0;text-align:right;font-weight:600;font-family:monospace;font-size:13px">${params.bic}</td>
        </tr>
      </table>
      <p style="color:#544f4f;font-size:11px;text-align:center;margin:8px 0 0">
        Merci d&apos;indiquer votre numéro de facture (${params.numero}) en objet du virement.
      </p>
    </div>

    <div style="text-align:center;padding:16px;margin:16px 0">
      <a href="${SITE_URL}/devis/${params.tokenPublic}" style="display:inline-block;background:#c27a72;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
        Consulter ma facture
      </a>
    </div>

    <p style="color:#544f4f;font-size:13px;line-height:1.6">
      Si vous avez déjà effectué ce règlement, merci de ne pas tenir compte de cet email.
    </p>

    <p style="color:#544f4f;font-size:13px;line-height:1.6">
      Pour toute question, contactez-nous à <a href="mailto:${FROM}">${FROM}</a>.
    </p>
  </div>

  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

interface DevisARappeler {
  id: string
  numero: string
  token_public: string
  client_nom: string
  client_email: string
  total_ht: number
  date_echeance_solde: string
  iban: string
  bic: string
  date_dernier_rappel: string | null
  total_verse: number
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const today = new Date().toISOString().split("T")[0]

    // Récupérer tous les devis non soldés et non annulés
    const { rows: devisList } = await sql`
      SELECT
        d.id, d.numero, d.token_public, d.client_nom, d.client_email,
        d.total_ht, d.date_echeance_solde, d.iban, d.bic,
        d.date_dernier_rappel,
        COALESCE(SUM(v.montant), 0) AS total_verse
      FROM devis_decoration d
      LEFT JOIN versements_decoration v ON v.devis_id = d.id
      WHERE d.statut NOT IN ('solde', 'annule')
      GROUP BY d.id
    `

    const rappels: { numero: string; client: string; email: string; soldeRestant: number }[] = []
    const erreurs: string[] = []

    for (const row of devisList) {
      const totalHT = Number(row.total_ht)
      const totalVerse = Number(row.total_verse)
      const soldeRestant = totalHT - totalVerse

      if (soldeRestant <= 0) continue
      if (!row.date_echeance_solde) continue
      if (today < row.date_echeance_solde) continue

      // Vérifier si un rappel doit être envoyé
      const shouldSend = await shouldSendRappel(row.id, row.date_dernier_rappel)
      if (!shouldSend) continue

      // Envoyer l'email de rappel
      try {
        const transport = getTransport()
        const html = buildRappelEmailHtml({
          numero: row.numero,
          clientNom: row.client_nom,
          soldeRestant,
          totalHT,
          dateEcheanceSolde: row.date_echeance_solde,
          iban: row.iban,
          bic: row.bic,
          tokenPublic: row.token_public,
        })

        const subject = `Papillon Rose — Rappel : solde à régler pour votre devis n°${row.numero}`

        // Email client
        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: row.client_email,
          subject,
          html,
        })

        // Copie admin
        await transport.sendMail({
          from: `"Papillon Rose" <${FROM}>`,
          to: TO_ADMIN,
          subject: `[ADMIN] ${subject}`,
          html,
        })

        // Enregistrer le rappel
        await sql`
          INSERT INTO rappels_devis_decoration (devis_id, type)
          VALUES (${row.id}, 'rappel_solde')
        `

        // Mettre à jour date_dernier_rappel
        await sql`
          UPDATE devis_decoration
          SET date_dernier_rappel = NOW()
          WHERE id = ${row.id}
        `

        rappels.push({
          numero: row.numero,
          client: row.client_nom,
          email: row.client_email,
          soldeRestant,
        })
      } catch (err: any) {
        erreurs.push(`${row.numero}: ${err.message || "Erreur inconnue"}`)
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      devisTraites: devisList.length,
      rappelsEnvoyes: rappels.length,
      erreurs: erreurs.length,
      details: rappels.map((r) => ({
        devis: r.numero,
        client: r.client,
        soldeRestant: `${r.soldeRestant.toFixed(2)} €`,
      })),
      erreursDetails: erreurs,
    })
  } catch (err: any) {
    console.error("Erreur cron rappels devis décoration:", err?.message || err)
    return NextResponse.json(
      { error: "Erreur lors du traitement des rappels" },
      { status: 500 },
    )
  }
}

async function shouldSendRappel(devisId: string, dateDernierRappel: string | null): Promise<boolean> {
  if (!dateDernierRappel) return true

  const lastDate = new Date(dateDernierRappel)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))

  return diffDays >= 15
}
