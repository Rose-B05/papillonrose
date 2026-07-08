import { NextRequest, NextResponse } from "next/server"
import { getQuotes } from "@/lib/db"
import { COOKIE_NAME } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const quotes = getQuotes()
  const sorted = [...quotes].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return NextResponse.json({ quotes: sorted })
}
