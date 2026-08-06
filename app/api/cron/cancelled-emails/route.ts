import { NextRequest, NextResponse } from "next/server"
import { processCancelledEmails } from "@/lib/cancelled-cleanup"

/**
 * GET /api/cron/cancelled-emails
 *
 * Appelé quotidiennement par Vercel Cron.
 * Envoie un email aux clients dont le devis annulé concerne un événement
 * déjà passé et pour lequel aucun règlement n'a été effectué.
 *
 * Protégé par CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const result = await processCancelledEmails()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors du traitement des emails d'annulation", detail: err.message },
      { status: 500 },
    )
  }
}
