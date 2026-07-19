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
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-24 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-neutral-500 hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour a l&apos;accueil
        </Link>

        <p className="text-[#C9948E] dark:text-[#E8B4AE] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
          Aide &amp; informations
        </p>
        <h1
          style={DP}
          className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4"
        >
          Questions fréquentes
        </h1>
        <p className="text-sm text-[#2E2E2E]/60 dark:text-neutral-400 mb-10 leading-relaxed">
          Retrouvez les réponses aux questions les plus souvent posées sur
          notre service de location de décoration événementielle.
        </p>

        <div className="space-y-10">
          {FAQ_DATA.map((section) => (
            <div key={section.theme}>
              <h2
                style={DP}
                className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4"
              >
                {section.theme}
              </h2>
              <FaqAccordion items={section.items} />
            </div>
          ))}
        </div>

        <div className="mt-12 text-center bg-white dark:bg-neutral-800 rounded-2xl p-8 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
          <p className="text-sm text-[#2E2E2E]/70 dark:text-neutral-300 mb-4">
            Vous n&apos;avez pas trouvé votre réponse ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#C9948E] dark:bg-[#C9948E] text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors"
          >
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  )
}
