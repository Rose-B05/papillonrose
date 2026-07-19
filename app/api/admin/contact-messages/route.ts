import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getContactMessages, markContactMessageRead, deleteContactMessage } from "@/lib/db"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const messages = await getContactMessages()
  messages.sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return NextResponse.json({ messages })
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const body = await request.json()
  if (body.id && body.action === "read") {
    await markContactMessageRead(body.id)
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Action invalide" }, { status: 400 })
}

export async function DELETE(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const id = request.nextUrl.searchParams.get("id")
  if (!id) {
    return NextResponse.json({ error: "ID requis" }, { status: 400 })
  }

  await deleteContactMessage(id)
  return NextResponse.json({ success: true })
}
