import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { sql } from "@/lib/pg"
import { getDecorationDevis, generateDecorationDevisPdf } from "@/lib/devis-decoration/db"

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
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  } as any)
}

function formatEUR(amount: number) {
  return `${amount.toFixed(2).replace(".", ",")} €`
}

function formatDateFr(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function buildDecorationEmailHtml(
  numero: string, titreProjet: string, clientNom: string, totalHT: number,
  montantAcconpte: number, montantSolde: number, dateEcheanceSolde: string | null,
  tokenPublic: string, lignes: { description: string; quantite: number; prix_unitaire: number }[]
): string {
  const lignesHtml = lignes.map((l) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:500">${l.description}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${l.quantite}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${formatEUR(l.prix_unitaire)}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:600;color:#c27a72">${formatEUR(l.prix_unitaire * l.quantite)}</td>
    </tr>`).join("")

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
    <thead><tr style="background:#2E2E2E;color:white">
      <th style="padding:8px 12px;text-align:left">Description</th>
      <th style="padding:8px 12px;text-align:center">Qté</th>
      <th style="padding:8px 12px;text-align:right">Prix unit.</th>
      <th style="padding:8px 12px;text-align:right">Total</th>
    </tr></thead>
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
    <a href="${SITE_URL}/devis/${tokenPublic}" style="display:inline-block;background:#c27a72;color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">Consulter mon devis en ligne</a>
  </div>
  <div style="text-align:center;padding:20px 0;border-top:1px solid #eee;margin-top:20px">
    <p style="color:#544f4f;font-size:11px;margin:0">Cet email a été envoyé automatiquement.</p>
    <p style="color:#c27a72;font-size:12px;margin:4px 0 0">papillonrosebertha@gmail.com · Île-de-France</p>
  </div>
</div>`
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { id } = await params
  try {
    const devis = await getDecorationDevis(id)
    if (!devis) return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    return NextResponse.json({ devis })
  } catch (err: any) {
    console.error("Erreur lecture devis:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { id } = await params
  try {
    const body = await request.json()
    const { statut } = body
    if (!statut) return NextResponse.json({ error: "statut requis" }, { status: 400 })

    await sql`UPDATE devis_decoration SET statut = ${statut} WHERE id = ${id}`
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erreur PATCH devis:", err?.message || err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }
  const { id } = await params

  const url = new URL(request.url)
  const isResend = url.searchParams.get("action") === "resend"

  if (!isResend) {
    return NextResponse.json({ error: "Action inconnue" }, { status: 400 })
  }

  try {
    const devis = await getDecorationDevis(id)
    if (!devis) return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })

    const pdfBuffer = await generateDecorationDevisPdf(devis)
    const transport = getTransport()
    const typeDocLabel = devis.type_document === "facture" ? "facture" : "devis"
    const subject = `Votre ${typeDocLabel} Papillon Rose n°${devis.numero} — ${devis.titre_projet}`

    const html = buildDecorationEmailHtml(
      devis.numero, devis.titre_projet, devis.client_nom, devis.total_ht,
      devis.montant_accompte, devis.montant_solde, devis.date_echeance_solde || null,
      devis.token_public, devis.lignes
    )

    const mailOptions = {
      from: `"Papillon Rose" <${FROM}>`,
      to: devis.client_email,
      subject,
      html,
      attachments: [{ filename: `${typeDocLabel === "facture" ? "Facture" : "Devis"}-${devis.numero}.pdf`, content: pdfBuffer, contentType: "application/pdf" }],
    }

    await transport.sendMail(mailOptions)
    await transport.sendMail({ ...mailOptions, to: TO_ADMIN, subject: `[ADMIN] ${subject}` })

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erreur resend devis:", err?.message || err)
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 })
  }
}
