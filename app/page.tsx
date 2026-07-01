import type { Metadata } from "next"
import PapillonRoseSite from "@/components/papillon-rose-site"

export const metadata: Metadata = {
  title: "Papillon Rose — Location mobilier & décoration événements en Île-de-France",
  description:
    "Location de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. 83 références, devis sous 24h, livraison 94/93/95/77/91.",
}

export default function Page() {
  return <PapillonRoseSite />
}
