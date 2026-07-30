import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getBooking, saveBooking, unblockDates } from "@/lib/db"
import { sendCancellationConfirmation, sendAdminCancellationNotification } from "@/lib/email"

const CANCELLABLE_STATUSES = ["pending-quote", "quote-sent", "deposit-pending", "confirmed"] as const

function getCalendarDaysUntilEvent(dateEvenement: string): number {
  const now = new Date()
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const eventDate = new Date(dateEvenement)
  const eventUtc = new Date(Date.UTC(eventDate.getUTCFullYear(), eventDate.getUTCMonth(), eventDate.getUTCDate()))
  const diffMs = eventUtc.getTime() - todayUtc.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const booking = await getBooking(id)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }

  const bookingEmail = booking.customerEmail?.toLowerCase() || booking.client?.email?.toLowerCase()
  if (bookingEmail !== customer.email.toLowerCase()) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
  }

  if (!(CANCELLABLE_STATUSES as readonly string[]).includes(booking.status)) {
    return NextResponse.json({ error: "Ce devis ne peut plus être annulé" }, { status: 400 })
  }

  const daysUntilEvent = getCalendarDaysUntilEvent(booking.client.dateEvenement)
  if (daysUntilEvent <= 7) {
    return NextResponse.json(
      { error: "Délai d'annulation dépassé. Contactez-nous directement pour toute annulation. Conformément à nos CGV, l'acompte n'est plus remboursable." },
      { status: 400 },
    )
  }

  const hadDeposit = booking.depositPaidAt != null
  const now = new Date().toISOString()

  booking.status = "cancelled"
  booking.updatedAt = now
  await saveBooking(booking)
  await unblockDates(booking.id)

  const quoteNumber = booking.quoteNumber || booking.id
  const clientName = `${booking.client.prenom} ${booking.client.nom}`

  try {
    await sendCancellationConfirmation(customer.email, quoteNumber, clientName)
  } catch (e) {
    console.error("Erreur envoi email annulation client:", e)
  }

  try {
    await sendAdminCancellationNotification(quoteNumber, clientName, hadDeposit)
  } catch (e) {
    console.error("Erreur envoi email annulation admin:", e)
  }

  const warnings: string[] = []
  if (hadDeposit) {
    warnings.push("Un remboursement manuel de l'acompte doit être effectué par l'administrateur.")
  }

  return NextResponse.json({
    message: "Devis annulé avec succès",
    booking: { id: booking.id, status: booking.status },
    warnings,
  })
}
