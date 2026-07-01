import type { Metadata } from "next"
import PapillonRoseSite from "@/components/papillon-rose-site"
import { getActiveProductsCount } from "@/data/produits"

const nbRef = getActiveProductsCount()

export const metadata: Metadata = {
  title: "Papillon Rose — Location mobilier & décoration événements en Île-de-France",
  description:
    `Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. ${nbRef} références, devis sous 24h, livraison 94/93/95/77/91.`,
}

export default function Page() {
  return <PapillonRoseSite />
}
