import { NextResponse } from "next/server"
import { getAdminProducts } from "@/lib/db"

export const runtime = "nodejs"

export async function GET() {
  try {
    const adminProducts = await getAdminProducts()
    const maskedIds = adminProducts
      .filter((p) => p.status === "masque")
      .map((p) => p.id)
    return NextResponse.json({ maskedIds })
  } catch {
    return NextResponse.json({ maskedIds: [] })
  }
}
