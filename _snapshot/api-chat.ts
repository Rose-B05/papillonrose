import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de "Papillon Rose", un service de location de mobilier et dÃ©coration pour Ã©vÃ©nements (mariages, anniversaires, baptÃªmes, soirÃ©es d'entreprise, sÃ©minaires).

INFORMATIONS SUR LE SITE :
- Plus de 200 rÃ©fÃ©rences, 11 catÃ©gories
- Location Ã  la journÃ©e
- Devis sous 48h ouvrÃ©es
- Livraison en ÃŽle-de-France et nationale
- Paiement : acompte 30% Ã  la rÃ©servation, solde 70% avant l'Ã©vÃ©nement

POLITIQUE D'ANNULATION :
- Annulation -30 jours : remboursement total
- Annulation -15 jours : remboursement 50%
- Annulation -7 jours : aucun remboursement

TON : Chaleureux, professionnel, enthousiaste. Tu rÃ©ponds UNIQUEMENT en franÃ§ais.
Tu dois :
1. Accueillir le client et qualifier son projet (type d'Ã©vÃ©nement, date, invitÃ©s, budget, lieu)
2. Orienter vers les bons articles du catalogue selon ses rÃ©ponses
3. RÃ©pondre aux FAQ (dÃ©lais, livraison, caution, annulation, montage)
4. Collecter les coordonnÃ©es (nom, prÃ©nom, email, tÃ©lÃ©phone) pour un devis
5. Proposer de finaliser une demande de devis ou rediriger vers le formulaire de contact

RÃˆGLES IMPORTANTES :
- Si le client demande des produits spÃ©cifiques, oriente-le vers des catÃ©gories comme Mobilier, Figurines & Jeux, Bougeoirs & Lustres, Verreries, Cadres, PrÃ©sentoirs & Plateaux, Art de la Table, Vases & Pots, DÃ©coration, Fleurs & Feuillages
- Ne donne jamais de prix exacts variables, rÃ©fÃ¨re-toi au catalogue
- Collecte progressivement les infos, ne demande pas tout d'un coup
- Sois concis mais chaleureux
- Maximum 3-4 phrases par message`

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ClÃ© API Anthropic non configurÃ©e" },
        { status: 500 },
      )
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: 1024,
    })

    const text = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("")

    return NextResponse.json({ response: text })
  } catch (err: any) {
    console.error("Chat API error:", err)
    return NextResponse.json(
      { error: "Erreur lors de la communication avec l'assistant" },
      { status: 500 },
    )
  }
}

