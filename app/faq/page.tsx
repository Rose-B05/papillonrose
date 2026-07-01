import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { FAQ_DATA } from "@/lib/faq"
import { FaqAccordion } from "@/components/faq-accordion"

export const metadata: Metadata = {
  title: "FAQ — Questions fréquentes sur la location | Papillon Rose",
  description:
    "Toutes vos questions sur la location de décoration : processus de réservation, retrait, restitution, livraison et tarifs. Papillon Rose Créteil.",
}

const DP = { fontFamily: "var(--font-playfair), serif" } as const

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0]">
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-24 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C8A97E] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour a l&apos;accueil
        </Link>

        <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
          Aide &amp; informations
        </p>
        <h1
          style={DP}
          className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] mb-4"
        >
          Questions fréquentes
        </h1>
        <p className="text-sm text-[#2E2E2E]/60 mb-10 leading-relaxed">
          Retrouvez les réponses aux questions les plus souvent posées sur
          notre service de location de décoration événementielle.
        </p>

        <div className="space-y-10">
          {FAQ_DATA.map((section) => (
            <div key={section.theme}>
              <h2
                style={DP}
                className="text-lg font-semibold text-[#2E2E2E] mb-4"
              >
                {section.theme}
              </h2>
              <FaqAccordion items={section.items} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white rounded-2xl p-8 border border-black/[0.07] shadow-sm">
          <p className="text-sm text-[#2E2E2E]/70 mb-4">
            Vous n&apos;avez pas trouvé votre réponse ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#C8A97E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#B8926E] transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
