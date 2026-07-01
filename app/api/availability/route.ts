import { NextRequest, NextResponse } from "next/server"
import { getBlockedDatesForProduct } from "@/lib/db"
import { getAvailableStock } from "@/lib/stock"

export async function GET(request: NextRequest) {
  const productId = Number(request.nextUrl.searchParams.get("productId"))
  const dateStart = request.nextUrl.searchParams.get("dateStart") || undefined
  const dateEnd = request.nextUrl.searchParams.get("dateEnd") || undefined
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })
  const blocked = getBlockedDatesForProduct(productId)
  const availableStock = getAvailableStock(productId, dateStart || "", dateEnd || "")
  return NextResponse.json({ productId, blockedDates: blocked, availableStock })
}
