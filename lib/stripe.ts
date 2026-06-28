import Stripe from "stripe"

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set")
  return new Stripe(key, { apiVersion: "2025-03-31" as any })
}

export async function createPaymentIntent(amount: number, bookingId: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: "eur",
    metadata: { bookingId },
    automatic_payment_methods: { enabled: true },
  })
}

export async function retrievePaymentIntent(id: string) {
  const stripe = getStripe()
  return stripe.paymentIntents.retrieve(id)
}
