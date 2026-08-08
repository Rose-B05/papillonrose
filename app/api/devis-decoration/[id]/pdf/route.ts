import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getDecorationDevis, generateDecorationDevisPdf } from "@/lib/devis-decoration/db"

export const runtime = "nodejs"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = _request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const { id } = await params
  const devis = await getDecorationDevis(id)
  if (!devis) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
  }

  try {
    const pdfBuffer = await generateDecorationDevisPdf(devis)
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${devis.numero || "devis-" + devis.id}.pdf"`,
      },
    })
  } catch (err) {
    console.error("PDF generation error:", err)
    return NextResponse.json({ error: "Erreur lors de la génération du PDF" }, { status: 500 })
  }
}
