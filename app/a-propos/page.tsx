import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Crown, ShieldCheck, Heart } from "lucide-react"
import { getActiveProductsCount } from "@/data/produits"

export const metadata: Metadata = {
  title: "� propos � Notre histoire | Papillon Rose",
  description:
    "D�couvrez l'histoire et les valeurs de Papillon Rose, sp�cialiste de la location de mobilier et d�coration �v�nementielle en �le-de-France.",
}

const DP = { fontFamily: "var(--font-playfair), serif" } as const

const VALUES = [
  {
    Icon: Crown,
    title: "�l�gance",
    text: "Chaque pi�ce est s�lectionn�e pour sa beaut� et sa qualit�. Nous ne proposons que des articles qui sublimeront votre �v�nement.",
  },
  {
    Icon: ShieldCheck,
    title: "Fiabilit�",
    text: "Stock mis � jour en temps r�el, devis sous 24h, ponctualit� garantie. Vous pouvez compter sur nous.",
  },
  {
    Icon: Heart,
    title: "Proximit�",
    text: "Un service personnalis�, � l'�coute de votre vision et de votre budget. Chaque projet est unique.",
  },
]

const STATS = [
  { val: `${getActiveProductsCount()}`, label: "r�f�rences" },
  { val: "11", label: "cat�gories" },
  { val: "IDF", label: "�le-de-France" },
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
            <li className="text-[#2E2E2E] dark:text-neutral-100 font-medium">� propos</li>
          </ol>
        </nav>

        {/* Notre histoire */}
        <section className="mt-8 mb-16 -mx-5 md:-mx-10 px-5 md:px-10">
          <div className="max-w-6xl mx-auto grid md:grid-cols-[1fr_500px] gap-8 md:gap-12 items-start">
            <div>
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
                  Tout a commenc� lors de la pr�paration de mon propre mariage.
                  Passionn�e par la d�coration, j&apos;ai imagin� et r�alis� un univers qui me
                  ressemblait, en accordant une attention particuli�re � chaque d�tail afin de
                  cr�er une ambiance chaleureuse et harmonieuse.
                </p>
                <p>
                  Les nombreux compliments re�us ce jour-l� m&apos;ont donn� envie d&apos;aller
                  plus loin. J&apos;ai alors commenc� � d�corer les �v�nements de mes proches,
                  puis ceux de particuliers. Au fil des ann�es, cette passion s&apos;est
                  transform�e en une v�ritable activit�.
                </p>
                <p>
                  Depuis 2016, j&apos;ai eu le plaisir de concevoir et de d�corer plus de 30
                  �v�nements priv�s : mariages, anniversaires, bapt�mes, baby showers et autres
                  moments de vie. Chaque projet m&apos;a permis de d�velopper une conviction
                  forte : une d�coration r�ussie ne consiste pas seulement � embellir un lieu,
                  mais � cr�er une ambiance qui refl�te l&apos;histoire, les envies et les
                  �motions de chaque client.
                </p>
                <p>
                  Tr�s rapidement, une m�me question revenait apr�s chaque prestation :{" "}
                  <em className="text-[#C9948E] dark:text-[#E8B4AE] not-italic font-medium">
                    &laquo;&nbsp;Est-ce que vous louez aussi votre d�coration ?&nbsp;&raquo;
                  </em>
                </p>
                <p>
                  Pendant longtemps, je n&apos;ai pas donn� suite � cette id�e. La gestion
                  d&apos;un parc de location me semblait repr�senter une charge de travail
                  importante et je pr�f�rais me concentrer sur la d�coration
                  d&apos;�v�nements.
                </p>
                <p>
                  Puis, en juillet 2026, en d�cidant de cr�er le site internet de Papillon
                  Rose, cette id�e s&apos;est impos�e comme une �vidence. J&apos;ai r�alis�
                  qu&apos;il �tait possible d&apos;allier ma passion pour la d�coration � une
                  offre de location, permettant � chacun de cr�er un �v�nement �l�gant,
                  personnalis� et responsable, quel que soit son budget.
                </p>
                <p>
                  C&apos;est ainsi qu&apos;est n�e la nouvelle identit� de Papillon Rose : un
                  concept d�di� � la location de d�coration �v�nementielle, inspir� par
                  l&apos;exp�rience, la cr�ativit� et l&apos;envie de rendre chaque
                  c�l�bration unique.
                </p>
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <Image
                src="/images/femme-papillon-rose.png"
                alt="Femme en robe élégante, illustration Papillon Rose"
                width={1254}
                height={1254}
                className="w-full max-w-[340px] md:max-w-full h-auto rounded-2xl object-contain"
                priority
              />
            </div>
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
            Pr�t(e) � sublimer votre �v�nement ?
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
