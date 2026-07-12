import { NextRequest, NextResponse } from "next/server"
import { unsubscribeFromNewsletter } from "@/lib/newsletter"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return NextResponse.redirect(new URL("/?newsletter=error", request.url))
  }

  const result = await unsubscribeFromNewsletter(email)

  if (result.success) {
    return NextResponse.redirect(new URL("/?newsletter=unsubscribed", request.url))
  }

  return NextResponse.redirect(new URL("/?newsletter=error", request.url))
}
