import { NextRequest, NextResponse } from "next/server"
import { getBookings } from "@/lib/db"
import { sendPush } from "@/lib/pushover"
import { produits } from "@/data/produits"

/**
 * GET /api/cron/return-reminder
 *
 * Appelé quotidiennement par Vercel Cron (configuré dans vercel.json).
 * À 11h00 Paris time (09:00 UTC), vérifie les réservations dont la date
 * de restitution prévue est aujourd'hui et qui n'ont pas encore été rendues.
 * Envoie une notification push via Pushover si le matériel n'est pas restitué.
 *
 * Protégé par un token CRON_SECRET.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    // Date d'aujourd'hui en timezone Paris (YYYY-MM-DD)
    const todayStr = new Date()
      .toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" })
      .slice(0, 10)

    const bookings = await getBookings()
    const results: { bookingId: string; client: string; products: string[]; pushed: boolean }[] = []

    for (const booking of bookings) {
      // Ignorer les réservations annulées ou déjà rendues
      if (
        booking.status === "cancelled" ||
        booking.status === "returned" ||
        booking.status === "pending-quote" ||
        booking.status === "expired"
      ) {
        continue
      }

      // Vérifier si au moins un item a dateEnd == aujourd'hui
      const dueTodayItems = booking.items.filter((item) => item.dateEnd === todayStr)
      if (dueTodayItems.length === 0) continue

      // Vérifier si le client a une signature (= devis signé = location confirmée)
      // Si pas de signature mais status confirmed, on garde quand même
      const productNames = dueTodayItems.map((item) => {
        const product = produits.find((p) => p.id === item.productId)
        const name = product?.nom || `Produit #${item.productId}`
        return item.variantLabel ? `${name} (${item.variantLabel})` : name
      })

      // Envoyer la notification push
      const title = `📦 Restitution aujourd'hui — #${booking.id.slice(0, 8)}`
      const message = [
        `${booking.client.prenom} ${booking.client.nom} doit restituer :`,
        ...productNames.map((n) => `• ${n}`),
        "",
        `📅 Date limite : 12h00`,
        `📞 ${booking.client.telephone}`,
      ].join("\n")

      const pushed = await sendPush({
        title,
        message,
        priority: 1,
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://papillonrose.fr"}/admin/devis/${booking.id}`,
        url_title: "Voir la réservation",
      })

      results.push({
        bookingId: booking.id,
        client: `${booking.client.prenom} ${booking.client.nom}`,
        products: productNames,
        pushed,
      })
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      today: todayStr,
      bookingsChecked: bookings.length,
      dueToday: results.length,
      notificationsSent: results.filter((r) => r.pushed).length,
      details: results,
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Erreur lors de la vérification des restitutions", detail: err.message },
      { status: 500 },
    )
  }
}
