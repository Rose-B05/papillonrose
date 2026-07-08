import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getQuote, saveQuote } from "@/lib/db"
import { sendQuoteBalancePaid } from "@/lib/email"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Signature manquante" }, { status: 400 })
  }

  const key = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!key || !webhookSecret) {
    console.error("STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not set")
    return NextResponse.json({ error: "Configuration Stripe manquante" }, { status: 500 })
  }

  const stripe = new Stripe(key, { apiVersion: "2025-03-31" as any })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message)
    return NextResponse.json({ error: "Signature invalide" }, { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const metadata = session.metadata

    if (metadata?.type === "balance" && metadata?.quoteId) {
      const quote = getQuote(metadata.quoteId)
      if (quote && quote.statut === "acompte_paye") {
        quote.statut = "solde_paye"
        saveQuote(quote)

        try {
          await sendQuoteBalancePaid(quote.client.email, quote.quoteNumber, quote.totalTtc)
        } catch (err) {
          console.error("Balance paid email failed:", err)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
