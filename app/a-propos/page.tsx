import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Crown, ShieldCheck, Heart } from "lucide-react"
import { getActiveProductsCount } from "@/data/produits"

export const metadata: Metadata = {
  title: "À propos — Notre histoire | Papillon Rose",
  description:
    "Découvrez l'histoire et les valeurs de Papillon Rose, spécialiste de la location de mobilier et décoration événementielle en Île-de-France.",
}

const DP = { fontFamily: "var(--font-playfair), serif" } as const

const VALUES = [
  {
    Icon: Crown,
    title: "Élégance",
    text: "Chaque pièce est sélectionnée pour sa beauté et sa qualité. Nous ne proposons que des articles qui sublimeront votre événement.",
  },
  {
    Icon: ShieldCheck,
    title: "Fiabilité",
    text: "Stock mis à jour en temps réel, devis sous 24h, ponctualité garantie. Vous pouvez compter sur nous.",
  },
  {
    Icon: Heart,
    title: "Proximité",
    text: "Un service personnalisé, à l'écoute de votre vision et de votre budget. Chaque projet est unique.",
  },
]

const STATS = [
  { val: `${getActiveProductsCount()}`, label: "références" },
  { val: "11", label: "catégories" },
  { val: "IDF", label: "Île-de-France" },
  { val: "24h", label: "Devis sous" },
]

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900">
      <div className="max-w-4xl mx-auto px-5 md:px-10 pt-24 pb-16">
        {/* Breadcrumb */}
        <nav className="pt-6 pb-2">
          <ol className="flex items-center gap-2 text-xs text-gray-400 dark:text-white/60">
            <li><Link href="/" className="hover:text-[#C9948E] transition-colors">Accueil</Link></li>
            <li>/</li>
            <li className="text-[#2E2E2E] dark:text-neutral-100 font-medium">À propos</li>
          </ol>
        </nav>

        {/* Notre histoire */}
        <section className="mt-8 mb-16">
          <p className="text-[#C9948E] dark:text-[#E8B4AE] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">
            Notre histoire
          </p>
          <h2
            style={DP}
            className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-6"
          >
            L&apos;histoire de Papillon Rose
          </h2>
          <div className="space-y-4 text-sm text-[#2E2E2E]/70 dark:text-neutral-300 leading-relaxed">
            <p>
              Papillon Rose est avant tout une histoire de passion.
            </p>
            <p>
              Tout a commencé lors de la préparation de mon propre mariage.
              Passionnée par la décoration, j&apos;ai imaginé et réalisé un univers qui me
              ressemblait, en accordant une attention particulière à chaque détail afin de
              créer une ambiance chaleureuse et harmonieuse.
            </p>
            <p>
              Les nombreux compliments reçus ce jour-là m&apos;ont donné envie d&apos;aller
              plus loin. J&apos;ai alors commencé à décorer les événements de mes proches,
              puis ceux de particuliers. Au fil des années, cette passion s&apos;est
              transformée en une véritable activité.
            </p>
            <p>
              Depuis 2016, j&apos;ai eu le plaisir de concevoir et de décorer plus de 30
              événements privés : mariages, anniversaires, baptêmes, baby showers et autres
              moments de vie. Chaque projet m&apos;a permis de développer une conviction
              forte : une décoration réussie ne consiste pas seulement à embellir un lieu,
              mais à créer une ambiance qui reflète l&apos;histoire, les envies et les
              émotions de chaque client.
            </p>
            <p>
              Très rapidement, une même question revenait après chaque prestation :{" "}
              <em className="text-[#C9948E] dark:text-[#E8B4AE] not-italic font-medium">
                &laquo;&nbsp;Est-ce que vous louez aussi votre décoration ?&nbsp;&raquo;
              </em>
            </p>
            <p>
              Pendant longtemps, je n&apos;ai pas donné suite à cette idée. La gestion
              d&apos;un parc de location me semblait représenter une charge de travail
              importante et je préférais me concentrer sur la décoration
              d&apos;événements.
            </p>
            <p>
              Puis, en juillet 2026, en décidant de créer le site internet de Papillon
              Rose, cette idée s&apos;est imposée comme une évidence. J&apos;ai réalisé
              qu&apos;il était possible d&apos;allier ma passion pour la décoration à une
              offre de location, permettant à chacun de créer un événement élégant,
              personnalisé et responsable, quel que soit son budget.
            </p>
            <p>
              C&apos;est ainsi qu&apos;est née la nouvelle identité de Papillon Rose : un
              concept dédié à la location de décoration événementielle, inspiré par
              l&apos;expérience, la créativité et l&apos;envie de rendre chaque
              célébration unique.
            </p>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="mb-16">
          <p className="text-[#C9948E] dark:text-[#E8B4AE] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">
            Nos valeurs
          </p>
          <h2
            style={DP}
            className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-8"
          >
            Ce qui nous anime
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-black/[0.07] dark:border-white/[0.08] shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-[#C9948E]/10 dark:bg-[#C9948E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                </div>
                <h3
                  style={DP}
                  className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2"
                >
                  {title}
                </h3>
                <p className="text-xs text-[#2E2E2E]/60 dark:text-white/70 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres cles */}
        <section className="mb-16">
          <div className="bg-white dark:bg-neutral-800 rounded-3xl p-8 md:p-10 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((s) => (
                <div key={s.val} className="text-center">
                  <p
                    style={DP}
                    className="text-3xl md:text-4xl font-bold text-[#C9948E] dark:text-[#E8B4AE] mb-1"
                  >
                    {s.val}
                  </p>
                  <p className="text-[10px] md:text-xs text-[#2E2E2E]/45 uppercase tracking-wider">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <p className="text-[#2E2E2E]/60 dark:text-white/70 text-base mb-6">
            Prêt(e) à sublimer votre événement ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#C9948E] dark:bg-[#C9948E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors"
          >
            Parcourir le catalogue <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
