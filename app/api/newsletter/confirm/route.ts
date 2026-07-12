import { NextRequest, NextResponse } from "next/server"
import { confirmNewsletter } from "@/lib/newsletter"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.redirect(new URL("/?newsletter=error", request.url))
  }

  const result = await confirmNewsletter(token)

  if (result.success) {
    return NextResponse.redirect(new URL("/?newsletter=confirmed", request.url))
  }

  return NextResponse.redirect(new URL("/?newsletter=error", request.url))
}
