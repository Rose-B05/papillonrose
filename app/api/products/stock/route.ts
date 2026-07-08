import { NextResponse } from "next/server"
import { getStock } from "@/lib/stock"
import { produits } from "@/data/produits"

export async function GET() {
  const stockMap: Record<number, number> = {}
  for (const p of produits) {
    stockMap[p.id] = await getStock(p.id)
  }
  return NextResponse.json({ stock: stockMap })
}
