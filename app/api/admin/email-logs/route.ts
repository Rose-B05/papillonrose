import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getEmailLogs } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const logs = await getEmailLogs()
  logs.sort((a, b) => b.sentAt.localeCompare(a.sentAt))

  return NextResponse.json({ logs })
}
