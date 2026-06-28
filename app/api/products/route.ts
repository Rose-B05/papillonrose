import { NextResponse } from "next/server"
import { produits } from "@/data/produits"

export async function GET() {
  return NextResponse.json(produits)
}
