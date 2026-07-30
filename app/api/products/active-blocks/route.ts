import { NextResponse } from "next/server"
import { getActiveBlockedProductIds } from "@/lib/db"

export async function GET() {
  try {
    const blockedIds = await getActiveBlockedProductIds()
    return NextResponse.json({ blockedIds: Array.from(blockedIds) })
  } catch {
    return NextResponse.json({ blockedIds: [] })
  }
}
