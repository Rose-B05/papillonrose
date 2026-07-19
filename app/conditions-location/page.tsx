import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const DP = { fontFamily: "var(--font-playfair), serif" } as const

export const metadata: Metadata = {
  title: "Conditions générales de location | Papillon Rose",
  description:
    "Consultez nos conditions de location : modalités de retrait, restitution, cautions et responsabilités. Papillon Rose, Créteil (94).",
}

export default function ConditionsLocationPage() {
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
          Informations legales
        </p>
        <h1 style={DP} className="text-3xl md:text-4xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-10">
          Conditions de location
        </h1>

        <div className="space-y-10 text-sm text-[#2E2E2E]/80 leading-relaxed">
          <Section num={1} title="Objet">
            <p>
              Les presentes conditions generales de location regissent les
              relations entre <strong>Papillon Rose</strong> (ci-apres
              le &laquo; Prestataire &raquo;) et tout client (ci-apres
              le &laquo; Client &raquo;) louant du mobilier et/ou de la
              decoration fournis par le Prestataire pour des evenements
              prives ou professionnels.
            </p>
          </Section>

          <Section num={2} title="Etendue de la location">
            <p>
              Le materiel loue comprend le mobilier, la decoration et les
              accessoires listes dans le devis valide par le Client. Chaque
              article est identifie par sa reference, sa description et sa
              quantite. Le Prestataire se reserve le droit de remplacer un
              article indisponible par un article equivalent de qualite et de
              style comparables, apres accord du Client.
            </p>
          </Section>

          <Section num={3} title="Risques lies a la location">
            <p className="mb-4">
              Des la prise en charge du materiel (livraison ou retrait), le
              Client en assume la garde et la responsabilite. Les risques
              suivants sont expressement identifies :
            </p>
            <div className="space-y-4 ml-1">
              <RiskCard
                icon="&#9888;&#65039;"
                label="Casse"
                desc="Tout dommage physique aux articles (fissures,bris, deformations, pieces manquantes). Le Client est tenu de signaler toute casse immediatement lors du retour du materiel."
              />
              <RiskCard
                icon="&#128230;"
                label="Perte"
                desc="Tout article non restitue a la date convenue. En cas de perte totale, le Client devra rembourser la valeur a neuf de l article."
              />
              <RiskCard
                icon="&#128274;"
                label="Vol"
                desc="Tout vol survenu pendant la periode de location, que ce soit sur le lieu de l evenement, pendant le transport ou entreposage. Le Client devra fournir une declaration de vol."
              />
              <RiskCard
                icon="&#128167;"
                label="Salissure irreversible"
                desc="Taches permanentes (encre, peinture, cire, vin, etc.) ou degradations dues a un nettoyage inadapte rendant l article inutilisable. Les traces d usure normale ne sont pas concernees."
              />
            </div>
          </Section>

          <Section num={4} title="Consequences financieres">
            <p className="mb-4">
              En cas de casse, perte, vol ou salissure irreversible, les
              penalites suivantes s appliquent selon la gravite du dommage :
            </p>

            <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F8F5F0] dark:bg-neutral-900 text-[10px] uppercase tracking-wider text-gray-400 dark:text-neutral-500">
                    <th className="text-left px-5 py-3 font-semibold">Type de dommage</th>
                    <th className="text-left px-5 py-3 font-semibold">Penalite</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  <TableRow
                    damage="Casse partielle (reparable)"
                    penalty="Frais de reparation + 20% de la valeur de location du jour"
                  />
                  <TableRow
                    damage="Casse totale (irreparable)"
                    penalty="Remplacement a valeur a neuf de l article"
                  />
                  <TableRow
                    damage="Perte d un article"
                    penalty="Remplacement a valeur a neuf de l article"
                  />
                  <TableRow
                    damage="Vol (avec declaration)"
                    penalty="Remplacement a valeur a neuf, sous deduction de la caution si applicable"
                  />
                  <TableRow
                    damage="Salissure irreversible"
                    penalty="Frais de nettoyage specialise ou remplacement si nettoyage impossible"
                  />
                  <TableRow
                    damage="Non-restitution a la date convenue"
                    penalty="Penalite de retard : 10% le 1er jour, puis +30% par jour supplémentaire, plafonnee a 50% du montant total"
                  />
                </tbody>
              </table>
            </div>

            <p>
              La <strong>valeur a neuf</strong> est determinee selon le prix
              d achat catalogue de l article au jour du dommage. Un
              etat des lieux contradictoire est realise a la restitution du
              materiel.
            </p>
          </Section>

          <Section num={5} title="Caution">
            <p className="mb-3">
              Un chèque de caution, d&apos;un montant équivalent au <strong>prix d&apos;achat
              du produit loué</strong>, sera demandé lors de la remise du
              matériel. Il sera restitué après vérification du bon état du
              matériel au retour, déduction faite d&apos;éventuelles pénalités de
              retard ou de dégradation le cas échéant.
            </p>
          </Section>

          <Section num={6} title="Assurance">
            <p>
              Le Client est vivement recommande de souscrire une assurance
              couvrant les risques de casse, perte, vol et degradation du
              materiel loue pendant la duree de la location. Le Prestataire ne
              saurait etre tenu responsable des dommages causes aux articles
              loues.
            </p>
          </Section>

          <Section num={7} title="Annulation et remboursement">
            <div className="space-y-2 mb-4">
              <CancelRow delay="Plus de 30 jours avant l evenement" result="Remboursement total de l acompte" />
              <CancelRow delay="Entre 15 et 30 jours avant l evenement" result="Remboursement de 50% de l acompte" />
              <CancelRow delay="Moins de 15 jours avant l evenement" result="Aucun remboursement" />
            </div>
            <div className="bg-[#C9948E]/8 border border-[#C9948E]/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Attention &mdash; Modification ou annulation tardive
              </p>
              <p className="text-xs text-[#2E2E2E]/70 dark:text-neutral-300 leading-relaxed">
                Aucune annulation ni modification n est possible a moins de
                7 jours avant l evenement. Pass ce delai, aucun
                remboursement ne sera effectue, quelle que soit la raison.
              </p>
            </div>
          </Section>

          <Section num={8} title="Livraison et retrait">
            <p className="mb-3">
              <strong>Retrait sur place (gratuit) :</strong> Le retrait et la
              restitution du materiel se font gratuitement a notre
              adresse a Creteil (94), sur rendez-vous. Un creneau vous
              sera propose apres validation de la commande.
            </p>
            <p className="mb-3">
              <strong>Livraison :</strong> La livraison et la reprise de
              l emballage sont incluses dans les frais. La livraison est
              disponible uniquement dans les departements <strong>94, 93, 95,
              77 et 91</strong> (Ile-de-France). Les frais sont calcules
              selon la distance depuis Creteil (20&euro; forfait de base +
              1,50&euro;/km).
            </p>
            <div className="bg-[#C9948E]/8 border border-[#C9948E]/20 rounded-xl p-4 mb-3">
              <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Livraison offerte a partir de 150&euro; de location
              </p>
              <p className="text-xs text-[#2E2E2E]/70 dark:text-neutral-300 leading-relaxed">
                Pour toute commande dont le montant de location atteint
                150&euro; ou plus, les frais de livraison et reprise
                emballage sont offerts. En dessous de ce seuil, les frais
                calcules s appliquent.
              </p>
            </div>
            <p className="text-xs text-[#2E2E2E]/60 dark:text-neutral-400">
              Hors Ile-de-France : le retrait sur place reste disponible
              gratuitement. Contactez-nous pour toute demande particuliere.
            </p>
          </Section>

          <Section num={9} title="Litiges">
            <p>
              En cas de litige, les parties s engagent a rechercher une
              solution amiable avant toute action judiciaire. A defaut, le
              litige sera porte devant les tribunaux competents du ressort du
              siege social du Prestataire.
            </p>
          </Section>

          <div className="text-xs text-gray-400 dark:text-neutral-500 pt-6 border-t border-black/[0.07] dark:border-white/[0.08]">
            Derniere mise a jour : juillet 2026
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({
  num,
  title,
  children,
}: {
  num: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 style={DP} className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-3">
        <span className="text-[#C9948E] dark:text-[#E8B4AE]">Art. {num}</span> &mdash; {title}
      </h2>
      {children}
    </section>
  )
}

function RiskCard({
  icon,
  label,
  desc,
}: {
  icon: string
  label: string
  desc: string
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-black/[0.07] dark:border-white/[0.08] shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-base">{icon}</span>
        <span className="font-semibold text-[#2E2E2E] dark:text-neutral-100 text-sm">{label}</span>
      </div>
      <p className="text-xs text-[#2E2E2E]/60 dark:text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  )
}

function TableRow({
  damage,
  penalty,
}: {
  damage: string
  penalty: string
}) {
  return (
    <tr>
      <td className="px-5 py-3 text-[#2E2E2E] dark:text-neutral-100 font-medium">{damage}</td>
      <td className="px-5 py-3 text-[#2E2E2E]/60 dark:text-neutral-400">{penalty}</td>
    </tr>
  )
}

function CancelRow({
  delay,
  result,
}: {
  delay: string
  result: string
}) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-neutral-800 rounded-xl px-5 py-3 border border-black/[0.07] dark:border-white/[0.08] text-sm">
      <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{delay}</span>
      <span className="text-[#C9948E] dark:text-[#E8B4AE] font-medium">{result}</span>
    </div>
  )
}
