import { NextRequest, NextResponse } from "next/server"
import { saveContactMessage, type ContactMessage } from "@/lib/db"

export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, date, message } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Le nom est requis" }, { status: 400 })
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 })
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Le message est requis" }, { status: 400 })
    }

    const contactMsg: ContactMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      email: email.trim(),
      date: date || "",
      message: message.trim(),
      read: false,
      createdAt: new Date().toISOString(),
    }

    await saveContactMessage(contactMsg)

    return NextResponse.json({ success: true, id: contactMsg.id })
  } catch (error) {
    console.error("Erreur /api/contact:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
