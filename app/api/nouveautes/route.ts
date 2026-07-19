import { NextResponse } from "next/server"
import { getPublishedNouveautes } from "@/lib/db"

export async function GET() {
  try {
    const items = await getPublishedNouveautes()
    return NextResponse.json({ items })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
