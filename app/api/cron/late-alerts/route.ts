import { NextRequest, NextResponse } from "next/server"
import { processLateAlerts } from "@/lib/late-alerts"

/**
 * GET /api/cron/late-alerts
 * Appelé quotidiennement par Vercel Cron (configuré dans vercel.json).
 * Vérifie les réservations en retard et envoie des emails de relance.
 *
 * Protégé par un token CRON_SECRET pour éviter les appels non autorisés.
 */
export async function GET(request: NextRequest) {
  // Vérifier l'authentification du cron
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const result = await processLateAlerts()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      overdueBookings: result.processed,
      alertsSent: result.alerts.length,
      errors: result.errors,
      details: result.alerts.map((a) => ({
        bookingId: a.bookingId,
        product: a.productNom,
        joursRetard: a.joursRetard,
        penalite: `${(a.penalitePercent * 100).toFixed(0)}% → ${a.penaliteCalculee.toFixed(2)} €`,
        destinataires: a.destinataires,
      })),
    })
  } catch (err: any) {
    console.error("Cron late-alerts error:", err)
    return NextResponse.json(
      { error: "Erreur lors du traitement des alertes", details: err.message },
      { status: 500 },
    )
  }
}
