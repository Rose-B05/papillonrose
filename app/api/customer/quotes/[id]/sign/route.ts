import { NextRequest, NextResponse } from "next/server"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { getBooking, saveBooking } from "@/lib/db"
import { sendQuoteSignedConfirmation, sendAdminQuoteSignedNotification } from "@/lib/email"

const SIGNABLE_STATUSES = ["quote-sent"] as const

export async function POST(
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

  if (!(SIGNABLE_STATUSES as readonly string[]).includes(booking.status)) {
    return NextResponse.json({ error: "Ce devis ne peut plus être signé" }, { status: 400 })
  }

  let body: { signature?: string; signerName?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Données invalides" }, { status: 400 })
  }

  const signatureData = body.signature
  const signerName = body.signerName || `${customer.prenom} ${customer.nom}`

  if (!signatureData || typeof signatureData !== "string") {
    return NextResponse.json({ error: "Signature requise" }, { status: 400 })
  }

  const ipAddress = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || undefined

  const now = new Date().toISOString()

  booking.status = "signed"
  booking.signature = {
    data: signatureData,
    signedAt: now,
    signerName,
    ipAddress,
  }
  booking.updatedAt = now
  await saveBooking(booking)

  const quoteNumber = booking.quoteNumber || booking.id
  const clientName = `${booking.client.prenom} ${booking.client.nom}`

  try {
    await sendQuoteSignedConfirmation(customer.email, quoteNumber, clientName)
  } catch (e) {
    console.error("Erreur envoi email signature client:", e)
  }

  try {
    await sendAdminQuoteSignedNotification(quoteNumber, clientName, booking.depositAmount)
  } catch (e) {
    console.error("Erreur envoi email signature admin:", e)
  }

  return NextResponse.json({
    message: "Devis signé avec succès",
    booking: { id: booking.id, status: booking.status, signature: booking.signature },
  })
}
