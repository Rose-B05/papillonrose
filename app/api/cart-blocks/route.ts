import { NextRequest, NextResponse } from "next/server"
import { addCartBlock, removeCartBlock, removeCartBlockBySession } from "@/lib/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    const { productId, dates, qty, sessionId } = await request.json()

    if (!productId || !Array.isArray(dates) || dates.length === 0 || !qty || !sessionId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    if (qty < 1 || qty > 100) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
    }

    await addCartBlock(productId, dates, qty, sessionId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erreur cart-blocks POST:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { productId, dates, sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId manquant" }, { status: 400 })
    }

    if (productId && Array.isArray(dates)) {
      await removeCartBlock(productId, dates, sessionId)
    } else {
      await removeCartBlockBySession(sessionId)
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error("Erreur cart-blocks DELETE:", err)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
