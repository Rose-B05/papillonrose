import { NextResponse } from "next/server"
import { sendPush } from "@/lib/pushover"

/**
 * GET /api/cron/test-push
 *
 * Endpoint de test — envoie une notification Pushover de vérification.
 * À supprimer après validation.
 */
export async function GET() {
  const sent = await sendPush({
    title: "🔔 Test Papillon Rose",
    message: "Si tu reçois ceci, les notifications Pushover fonctionnent ! 🦋",
    priority: 0,
  })

  return NextResponse.json({
    success: sent,
    message: sent
      ? "Notification envoyée — vérifie ton téléphone"
      : "Échec — vérifie PUSHOVER_USER_KEY et PUSHOVER_API_TOKEN sur Vercel",
  })
}
