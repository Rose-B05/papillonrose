import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const DP = { fontFamily: "var(--font-playfair), serif" } as const

export const metadata: Metadata = {
  title: "Mentions légales | Papillon Rose",
  description:
    "Mentions légales du site Papillon Rose, location de mobilier et décoration pour événements en Île-de-France.",
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <div className="max-w-3xl mx-auto px-5 md:px-10 pt-24 pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 dark:text-neutral-500 hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} /> Retour à l&apos;accueil
        </Link>

        <p className="text-[#C8A97E] dark:text-amber-400 text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
          Informations légales
        </p>
        <h1 style={DP} className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-10">
          Mentions légales
        </h1>

        <div className="space-y-8 text-sm text-[#2E2E2E]/70 dark:text-neutral-300 leading-relaxed">
          <section>
            <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
              Éditeur du site
            </h2>
            <p>
              Papillon Rose — Location de mobilier et décoration pour événements<br />
              Créteil (94), Île-de-France, France<br />
              Email : papillonrosebertha@gmail.com
            </p>
          </section>

          <section>
            <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
              Hébergeur
            </h2>
            <p>
              Ce site est hébergé par Vercel Inc., 349 S Brevard Ave, Tallahassee, FL 32301, États-Unis.
            </p>
          </section>

          <section>
            <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
              Propriété intellectuelle
            </h2>
            <p>
              L&apos;ensemble du contenu de ce site (textes, images, vidéos, logos, graphismes) est la propriété exclusive de Papillon Rose ou de ses partenaires. Toute reproduction, représentation ou diffusion, totale ou partielle, du contenu de ce site est interdite sans autorisation préalable écrite.
            </p>
          </section>

          <section>
            <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
              Données personnelles
            </h2>
            <p>
              Les informations recueillies via le formulaire de contact ou de demande de devis sont destinées à Papillon Rose pour le traitement de votre demande. Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données en contactant papillonrosebertha@gmail.com.
            </p>
          </section>

          <section>
            <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
              Cookies
            </h2>
            <p>
              Ce site n&apos;utilise pas de cookies de tracking. Seuls des cookies techniques nécessaires au bon fonctionnement du site peuvent être utilisés.
            </p>
          </section>
        </div>

        <p className="text-xs text-gray-400 dark:text-neutral-500 pt-8 mt-8 border-t border-black/[0.07] dark:border-white/[0.08]">
          Dernière mise à jour : janvier 2026
        </p>
      </div>
    </div>
  )
}
