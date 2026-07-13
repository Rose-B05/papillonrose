import type { Metadata } from "next"
import { getRobotsMeta } from "@/lib/site-mode"
import { Mail, MapPin, Clock } from "lucide-react"

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
      <section className="max-w-4xl mx-auto px-5 md:px-10 pt-12 pb-20">
        <p className="text-[#C8A97E] dark:text-amber-400 text-xs tracking-[0.4em] uppercase font-medium mb-2">
          Parlons de votre projet
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
          Contact
        </h1>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          {/* Info */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Nos coordonnées</h2>
              <div className="space-y-4 text-sm text-gray-600 dark:text-neutral-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C8A97E] dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">Adresse</p>
                    <p>Île-de-France</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C8A97E] dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">Email</p>
                    <a href="mailto:contact@papillonrose.fr" className="hover:text-[#C8A97E] transition-colors">contact@papillonrose.fr</a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-[#C8A97E] dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">Disponibilité</p>
                    <p>Lun-Sam : 9h-19h</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">Zone de livraison</h2>
              <p className="text-sm text-gray-600 dark:text-neutral-300">
                Nous livrons dans les départements <strong className="text-[#2E2E2E] dark:text-neutral-100">94, 93, 95, 77 et 91</strong> en Île-de-France.
                Livraison et reprise de l&apos;emballage incluses.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Envoyez-nous un message</h2>
            <form className="space-y-4" action="mailto:contact@papillonrose.fr" method="post" encType="text/plain">
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Nom</label>
                <input
                  type="text"
                  name="nom"
                  required
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-[#F8F5F0] dark:bg-neutral-900 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-[#F8F5F0] dark:bg-neutral-900 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:border-[#C8A97E]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Sujet</label>
                <input
                  type="text"
                  name="sujet"
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-[#F8F5F0] dark:bg-neutral-900 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:border-[#C8A97E]"
                  placeholder="Demande de devis, information..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-neutral-400 mb-1">Message</label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  className="w-full border border-gray-200 dark:border-neutral-700 rounded-lg px-3 py-2 text-sm bg-[#F8F5F0] dark:bg-neutral-900 text-[#2E2E2E] dark:text-neutral-100 focus:outline-none focus:border-[#C8A97E] resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#C9A96E] text-[#1C1A17] py-3 rounded-full text-sm font-semibold hover:bg-[#d4b87a] transition-colors"
              >
                Envoyer
              </button>
            </form>
            <p className="text-xs text-gray-400 dark:text-neutral-500 mt-3 text-center">
              Nous répondons sous 24h maximum.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
