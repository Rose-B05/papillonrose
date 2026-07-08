import { NextRequest, NextResponse } from "next/server"
import { getQuote } from "@/lib/db"
import { getStripe } from "@/lib/stripe"
import { sendBalancePaymentLink } from "@/lib/email"
import { COOKIE_NAME } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE_NAME)
  if (!cookie?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { quoteId } = body as { quoteId: string }

    if (!quoteId) {
      return NextResponse.json({ error: "quoteId requis" }, { status: 400 })
    }

    const quote = getQuote(quoteId)
    if (!quote) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 })
    }

    if (quote.statut !== "acompte_paye") {
      return NextResponse.json(
        { error: "Le lien de paiement du solde n'est disponible que pour les devis avec acompte payé" },
        { status: 400 }
      )
    }

    // Solde restant = totalTtc × 70% (l'acompte était 30%)
    const balanceAmount = Math.round(quote.totalTtc * 0.7 * 100) / 100

    const stripe = getStripe()
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: quote.client.email,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Solde Papillon Rose — Devis ${quote.quoteNumber}`,
              description: `Solde restant (70%) pour le devis n°${quote.quoteNumber}`,
            },
            unit_amount: Math.round(balanceAmount * 100),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "balance",
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin?payment=cancelled`,
    })

    await sendBalancePaymentLink(quote.client.email, quote.quoteNumber, checkoutSession.url!, balanceAmount)

    return NextResponse.json({ success: true, checkoutUrl: checkoutSession.url })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
