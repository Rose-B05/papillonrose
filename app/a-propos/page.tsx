import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Crown, ShieldCheck, Heart } from "lucide-react"
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
    <div className="min-h-screen bg-[#F8F5F0]">
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <img
          src="/images/PROD086.png"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F8F5F0]/60 to-[#F8F5F0]" />
        <div className="relative z-10 text-center px-6 max-w-2xl">
          <p className="text-[#C8A97E] text-[10px] tracking-[0.5em] uppercase mb-4 font-medium">
            Notre histoire
          </p>
          <h1
            style={DP}
            className="text-4xl md:text-5xl font-semibold text-[#2E2E2E] leading-tight"
          >
            L&apos;élégance au service de vos événements
          </h1>
          <p className="text-[#2E2E2E]/60 text-base mt-5 leading-relaxed">
            Papillon Rose, c&apos;est l&apos;histoire d&apos;une passion pour la décoration
            et le soin apporté à chaque détail de vos moments précieux.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-5 md:px-10 pb-16">
        {/* Notre histoire */}
        <section className="mt-12 mb-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#C8A97E] transition-colors mb-8"
          >
            <ArrowLeft size={14} /> Retour a l&apos;accueil
          </Link>

          <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">
            Notre histoire
          </p>
          <h2
            style={DP}
            className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] mb-6"
          >
            Une passion devenue métier
          </h2>
          <div className="space-y-4 text-sm text-[#2E2E2E]/70 leading-relaxed">
            <p>
              Tout a commencé par un regard posé sur une table de réception, un jour de
              mariage. Ce détail qui transforme un simple buffet en moment de magie : une
              nappe aux couleurs parfaites, un photophore qui capte la lumière, une fleur
              disposée avec soin. C&apos;est cette émotion que Papillon Rose veut reproduire
              pour chaque événement.
            </p>
            <p>
              Née d&apos;une passion pour la décoration d&apos;intérieur et l&apos;organisation
              d&apos;événements, Papillon Rose a pour vocation de rendre accessible à tous des
              pièces de qualité, soigneusement sélectionnées pour leur elegance et leur
              charme. Chaque article du catalogue raconte une histoire et contribue a
              créer l&apos;atmosphere unique que vous recherchez.
            </p>
            <p>
              Aujourd&apos;hui, Papillon Rose accompagne mariages, baptêmes, anniversaires
              et soirées d&apos;entreprise a travers toute l&apos;Île-de-France. Notre
              ambition reste la même : offrir un service attentionné, un stock fiable et
              des creations qui font briller vos plus beaux souvenirs.
            </p>
          </div>
        </section>

        {/* Nos valeurs */}
        <section className="mb-16">
          <p className="text-[#C8A97E] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">
            Nos valeurs
          </p>
          <h2
            style={DP}
            className="text-2xl md:text-3xl font-semibold text-[#2E2E2E] mb-8"
          >
            Ce qui nous anime
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {VALUES.map(({ Icon, title, text }) => (
              <div
                key={title}
                className="bg-white rounded-2xl p-6 border border-black/[0.07] shadow-sm text-center"
              >
                <div className="w-12 h-12 bg-[#C8A97E]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-[#C8A97E]" />
                </div>
                <h3
                  style={DP}
                  className="text-lg font-semibold text-[#2E2E2E] mb-2"
                >
                  {title}
                </h3>
                <p className="text-xs text-[#2E2E2E]/60 leading-relaxed">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Chiffres cles */}
        <section className="mb-16">
          <div className="bg-white rounded-3xl p-8 md:p-10 border border-black/[0.07] shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {STATS.map((s) => (
                <div key={s.val} className="text-center">
                  <p
                    style={DP}
                    className="text-3xl md:text-4xl font-bold text-[#C8A97E] mb-1"
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
          <p className="text-[#2E2E2E]/60 text-base mb-6">
            Prêt(e) à sublimer votre événement ?
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#C8A97E] text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-[#B8926E] transition-colors"
          >
            Parcourir le catalogue <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </div>
  )
}
