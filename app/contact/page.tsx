import type { Metadata } from "next"
import { getRobotsMeta } from "@/lib/site-mode"
import ContactView from "@/components/contact-view"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papillonrose.fr"

export async function generateMetadata(): Promise<Metadata> {
  const robots = await getRobotsMeta()
  return {
    title: "Contact — Papillon Rose",
    description: "Contactez Papillon Rose pour toute demande de devis ou d'information. Location de mobilier et décoration événementielle en Île-de-France.",
    alternates: { canonical: `${SITE_URL}/contact` },
    openGraph: {
      title: "Contact — Papillon Rose",
      description: "Contactez Papillon Rose pour toute demande de devis ou d'information.",
      url: `${SITE_URL}/contact`,
      type: "website",
    },
    robots: { index: robots.index, follow: robots.follow },
  }
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <ContactView />
    </div>
  )
}
