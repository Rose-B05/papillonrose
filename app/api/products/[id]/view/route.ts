import { NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import { getCustomer, CUSTOMER_COOKIE } from "@/lib/customer-auth"
import { saveProductView, hasRecentProductView, setProductViewDedup } from "@/lib/db"
import { produits } from "@/data/produits"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ tracked: false }, { status: 200 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ tracked: false }, { status: 200 })
  }

  if (customer.marketingConsent === false) {
    return NextResponse.json({ tracked: false, reason: "no_consent" }, { status: 200 })
  }

  const { id } = await params
  const productId = Number(id)
  if (isNaN(productId)) {
    return NextResponse.json({ error: "Invalid product id" }, { status: 400 })
  }

  const product = produits.find((p) => p.id === productId)
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 })
  }

  const alreadyViewed = await hasRecentProductView(customer.email, productId, 24)
  if (alreadyViewed) {
    return NextResponse.json({ tracked: false, reason: "recent_view_exists" }, { status: 200 })
  }

  await saveProductView({
    id: uuidv4().slice(0, 8).toUpperCase(),
    customerEmail: customer.email.toLowerCase(),
    productId,
    viewedAt: new Date().toISOString(),
    reminderSent: false,
  })

  await setProductViewDedup(customer.email, productId, 86400)

  return NextResponse.json({ tracked: true })
}
