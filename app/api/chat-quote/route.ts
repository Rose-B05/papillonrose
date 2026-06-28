import { NextRequest, NextResponse } from "next/server"
import { sendChatbotLead } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    if (!data.email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 })
    }

    await sendChatbotLead({
      nom: data.nom || "",
      prenom: data.prenom || "",
      email: data.email,
      telephone: data.telephone || "",
      typeEvenement: data.typeEvenement || "",
      dateEvenement: data.dateEvenement || "",
      nbInvites: data.nbInvites || "",
      budget: data.budget || "",
      lieu: data.lieu || "",
      notes: data.notes || "",
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Chat quote error:", err)
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de la demande" },
      { status: 500 },
    )
  }
}
