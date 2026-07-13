import type { Metadata } from "next"
import { getRobotsMeta } from "@/lib/site-mode"
import FavorisClient from "@/components/favoris-client"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function generateMetadata(): Promise<Metadata> {
  const robots = await getRobotsMeta()
  return {
    title: "Favoris — Papillon Rose",
    description: "Retrouvez vos produits favoris pour vos événements.",
    alternates: { canonical: `${SITE_URL}/favoris` },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default function FavorisPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <FavorisClient />
    </div>
  )
}
