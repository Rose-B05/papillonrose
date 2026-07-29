import { NextRequest, NextResponse } from "next/server"
import { processQuoteExpiry } from "@/lib/quote-expiry"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const result = await processQuoteExpiry()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      quotesTraites: result.processed,
      relancesEnvoyees: result.remindersSent,
      erreurs: result.errors.length,
      details: result.details.map((d) => ({
        devis: d.quoteNumber,
        client: d.client,
        joursRestants: d.joursRestants,
      })),
    })
  } catch {
    return NextResponse.json(
      { error: "Erreur lors du traitement des relances d'expiration" },
      { status: 500 },
    )
  }
}
