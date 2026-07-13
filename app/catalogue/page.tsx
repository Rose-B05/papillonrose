import type { Metadata } from "next"
import { getRobotsMeta } from "@/lib/site-mode"
import CatalogueClient from "@/components/catalogue-client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function generateMetadata(): Promise<Metadata> {
  const robots = await getRobotsMeta()
  return {
    title: "Catalogue — Location mobilier & décoration événements",
    description: "Découvrez notre catalogue de mobilier et décoration pour mariages, réceptions et événements en Île-de-France. Plus de 80 références disponibles.",
    alternates: { canonical: `${SITE_URL}/catalogue` },
    openGraph: {
      title: "Catalogue — Papillon Rose",
      description: "Découvrez notre catalogue de mobilier et décoration pour événements en Île-de-France.",
      url: `${SITE_URL}/catalogue`,
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default function CataloguePage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <CatalogueClient />
    </div>
  )
}
