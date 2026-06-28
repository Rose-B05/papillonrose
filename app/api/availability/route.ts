import { NextRequest, NextResponse } from "next/server"
import { getBlockedDatesForProduct } from "@/lib/db"

export async function GET(request: NextRequest) {
  const productId = Number(request.nextUrl.searchParams.get("productId"))
  if (!productId) return NextResponse.json({ error: "productId required" }, { status: 400 })
  const blocked = getBlockedDatesForProduct(productId)
  return NextResponse.json({ productId, blockedDates: blocked })
}
