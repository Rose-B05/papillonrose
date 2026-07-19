import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/auth"
import { getActivityLog } from "@/lib/db"
import { getDevis } from "@/lib/devis/db"
import { getAdminProducts } from "@/lib/db"
import { produits } from "@/data/produits"
import { mergeAdminProduct } from "@/lib/product-helpers"

export async function GET(request: NextRequest) {
  const session = request.cookies.get(COOKIE_NAME)
  if (!session?.value) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Devis stats
  const devis = await getDevis()
  const devisEnAttente = devis.filter((d) => d.statut === "en_attente").length

  // Revenue this month (accepted devis)
  const devisThisMonth = devis.filter((d) => {
    if (d.statut !== "accepte") return false
    const date = new Date(d.accepteLe || d.creeLe)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })
  const revenueThisMonth = devisThisMonth.reduce((sum, d) => sum + d.totalTtc, 0)

  // Revenue last month for comparison
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
  const devisLastMonth = devis.filter((d) => {
    if (d.statut !== "accepte") return false
    const date = new Date(d.accepteLe || d.creeLe)
    return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear
  })
  const revenueLastMonth = devisLastMonth.reduce((sum, d) => sum + d.totalTtc, 0)

  // Products out of stock
  const adminProducts = await getAdminProducts()
  const mergedProducts = produits.map((sp) => {
    const adminOverride = adminProducts.find((p) => p.id === sp.id)
    return adminOverride && adminOverride.status === "publie"
      ? mergeAdminProduct(sp, adminOverride)
      : sp
  })
  const outOfStock = mergedProducts.filter((p) => p.actif !== false && p.stock <= 0).length

  // Activity log (last 10)
  const activity = await getActivityLog(10)

  return NextResponse.json({
    devisEnAttente,
    outOfStock,
    revenueThisMonth,
    revenueLastMonth,
    totalDevis: devis.length,
    totalProducts: mergedProducts.filter((p) => p.actif !== false).length,
    activity,
  })
}
