import { NextRequest, NextResponse } from "next/server"
import { getCustomer, updateCustomerProfile, CUSTOMER_COOKIE } from "@/lib/customer-auth"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  return NextResponse.json({
    customer: {
      email: customer.email,
      prenom: customer.prenom,
      nom: customer.nom,
      telephone: customer.telephone || "",
      adresse: customer.adresse || "",
      marketingConsent: customer.marketingConsent ?? false,
    },
  })
}

export async function PUT(request: NextRequest) {
  const session = request.cookies.get(CUSTOMER_COOKIE)
  if (!session?.value) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const customer = await getCustomer(session.value)
  if (!customer) {
    return NextResponse.json({ error: "Non connecté" }, { status: 401 })
  }

  const body = await request.json()
  const { prenom, nom, telephone, adresse, marketingConsent } = body as {
    prenom?: string
    nom?: string
    telephone?: string
    adresse?: string
    marketingConsent?: boolean
  }

  const updated = await updateCustomerProfile(customer.email, { prenom, nom, telephone, adresse, marketingConsent })
  if (!updated) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    customer: {
      email: updated.email,
      prenom: updated.prenom,
      nom: updated.nom,
      telephone: updated.telephone || "",
      adresse: updated.adresse || "",
      marketingConsent: updated.marketingConsent ?? false,
    },
  })
}
