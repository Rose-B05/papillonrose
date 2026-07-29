import { NextRequest, NextResponse } from "next/server"
import { getBooking } from "@/lib/db"
import { generateDevisPdf } from "@/lib/devis/db"
import { COOKIE_NAME } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = _request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const booking = await getBooking(id)
  if (!booking) {
    return NextResponse.json({ error: "Réservation introuvable" }, { status: 404 })
  }

  try {
    const pdfBuffer = await generateDevisPdf(booking)
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${booking.quoteNumber || `BK-${booking.id}`}.pdf"`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 })
  }
}
