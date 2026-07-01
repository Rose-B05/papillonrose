import { NextRequest, NextResponse } from "next/server"
import { produits } from "@/data/produits"

const PLACEHOLDER_PATTERNS = [
  "/placeholder.png",
  "/placeholder.svg",
  "/images/placeholder.png",
  "/images/placeholder.svg",
]
function hasRealPhoto(product: { image?: string | null }): boolean {
  if (!product.image) return false
  const img = product.image.toLowerCase()
  return !PLACEHOLDER_PATTERNS.some((p) => img === p)
}
const visibleProduits = produits.filter((p) => hasRealPhoto(p) && p.actif !== false)
const nbRef = visibleProduits.length
const nbCat = new Set(visibleProduits.map(p => p.categorie)).size

const SYSTEM_PROMPT = `Tu es l'assistant virtuel de "Papillon Rose", un service de location de mobilier et décoration pour événements (mariages, anniversaires, baptêmes, soirées d'entreprise, séminaires).

INFORMATIONS SUR LE SITE :
- ${nbRef} références, ${nbCat} catégories
- Location à la journée
- Devis sous 48h ouvrées
- Livraison en Île-de-France et à Créteil (94)
- Paiement : acompte 30% à la réservation, solde 70% avant l'événement

POLITIQUE D'ANNULATION :
- Annulation -30 jours : remboursement total
- Annulation -15 jours : remboursement 50%
- Annulation -7 jours : aucun remboursement

CATÉGORIES DE PRODUITS :
Mobilier, Figurines & Jeux, Bougeoirs & Lustres, Verreries, Cadres, Présentoirs & Plateaux, Présentoirs & Plateaux, Art de la Table, Vases & Pots, Décoration, Fleurs & Feuillages

TON : Chaleureux, professionnel, enthousiaste. Tu réponds UNIQUEMENT en français.
Tu dois :
1. Accueillir le client et qualifier son projet (type d'événement, date, invités, budget, lieu)
2. Orienter vers les bons articles du catalogue selon ses réponses
3. Répondre aux FAQ (délais, livraison, caution, annulation, montage)
4. Collecter les coordonnées (nom, prénom, email, téléphone) pour un devis
5. Proposer de finaliser une demande de devis ou rediriger vers le formulaire de contact

COORDONNÉES DE L'ENTREPRISE :
- Email : papillonrosebertha@gmail.com
- Téléphone : 06 12 34 56 78
- Telegram : @PapillonRose

RÈGLES IMPORTANTES :
- Ne donne jamais de prix exacts variables, réfère-toi au catalogue
- Collecte progressivement les infos, ne demande pas tout d'un coup
- Sois concis mais chaleureux
- Maximum 3-4 phrases par message

COLLECTE DE LEAD POUR DEVIS :
Tout au long de la conversation, collecte ces infos naturellement : type d'événement, date, nombre d'invités, budget, lieu, prénom, nom, email, téléphone.

Quand tu as suffisamment d'informations (au moins type d'événement + email), propose au client de transmettre sa demande de devis. Dis-lui : "Je peux transmettre votre demande directement à notre équipe. Vous confirmez ?"

Si le client confirme, réponds UNIQUEMENT avec le marqueur de devis à la fin de ton message, comme ceci :

---

Parfait ! Je transmets votre demande à notre équipe. Vous recevrez un devis sous 48h ouvrées. 🎉

[DEVIS]
prenom: Emma
nom: Dupont
email: emma@exemple.com
telephone: 06XXXXXXXX
typeEvenement: Mariage
dateEvenement: 15 septembre 2026
nbInvites: 80
budget: 1500-2000€
lieu: Château de Versailles (77)
notes: La cliente cherche un thème champêtre, tons blush et blanc
[/DEVIS]

---

Le marqueur [DEVIS]...[/DEVIS] doit contenir les infos collectées, même partielles. N'ajoute PAS ce marqueur tant que le client n'a pas explicitement confirmé vouloir un devis.`

interface Message {
  role: "user" | "assistant"
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = (await request.json()) as { messages: Message[] }

    if (!process.env.MINIMAX_API_KEY) {
      return NextResponse.json(
        { error: "Clé API Minimax non configurée" },
        { status: 500 },
      )
    }

    const res = await fetch("https://api.minimax.io/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MINIMAX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("Minimax API error:", err)
      return NextResponse.json(
        { error: "Erreur lors de la communication avec l'assistant" },
        { status: 500 },
      )
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content

    if (!text) {
      return NextResponse.json(
        { error: "Réponse vide de l'assistant" },
        { status: 500 },
      )
    }

    return NextResponse.json({ response: text })
  } catch (err: any) {
    console.error("Chat API error:", err)
    return NextResponse.json(
      { error: "Erreur lors de la communication avec l'assistant" },
      { status: 500 },
    )
  }
}
