"use client"

import Link from "next/link"
import { Eye, Pencil, Send, XCircle, PackageCheck } from "lucide-react"
import DevisStatutBadge from "./DevisStatutBadge"

function formatDate(dateStr: string) {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

interface DevisTableRow {
  id: string
  quoteNumber: string
  client: { nom: string; prenom: string; email: string }
  itemCount: number
  dateDebut: string
  dateFin: string
  totalTtc: number
  statut: string
  creeLe: string
}

interface DevisTableProps {
  devis: DevisTableRow[]
  onStatusChange?: (id: string, statut: string) => void
  onDelete?: (id: string) => void
  onSend?: (id: string) => void
  onMarkReturned?: (id: string) => void
  sendingId?: string | null
  returningId?: string | null
}

export default function DevisTable({ devis, onStatusChange, onDelete, onSend, onMarkReturned, sendingId, returningId }: DevisTableProps) {
  if (devis.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 dark:text-white/60">
        Aucun devis pour le moment
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-black/[0.06] dark:border-white/[0.08]">
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">N°</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">Client</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider hidden sm:table-cell">Dates</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider hidden md:table-cell">Articles</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">Total TTC</th>
            <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">Statut</th>
            <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 dark:text-white/60 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody>
          {devis.map((d) => (
            <tr
              key={d.id}
              className="border-b border-black/[0.04] dark:border-white/[0.05] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4">
                <Link href={`/admin/devis/${d.id}`} className="font-mono text-xs text-[#C9948E] hover:underline">
                  {d.quoteNumber}
                </Link>
              </td>
              <td className="py-3 px-4">
                <p className="font-medium text-[#2E2E2E] dark:text-neutral-100">{d.client.prenom} {d.client.nom}</p>
                <p className="text-xs text-gray-400 dark:text-white/50">{d.client.email}</p>
              </td>
              <td className="py-3 px-4 hidden sm:table-cell">
                <p className="text-xs text-gray-500 dark:text-white/60">
                  {formatDate(d.dateDebut)}
                  {d.dateFin && d.dateFin !== d.dateDebut && ` → ${formatDate(d.dateFin)}`}
                </p>
              </td>
              <td className="py-3 px-4 hidden md:table-cell">
                <p className="text-xs text-gray-500 dark:text-white/60">
                  {d.itemCount} article{d.itemCount > 1 ? "s" : ""}
                </p>
              </td>
              <td className="py-3 px-4 text-right font-semibold text-[#C9948E] dark:text-[#E8B4AE] whitespace-nowrap">
                {d.totalTtc.toFixed(2)} €
              </td>
              <td className="py-3 px-4">
                <DevisStatutBadge statut={d.statut} />
              </td>
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">
                  <Link
                    href={`/admin/devis/${d.id}`}
                    className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-gray-400 hover:text-[#C9948E] transition-colors"
                    title="Voir"
                  >
                    <Eye size={15} />
                  </Link>
                  <Link
                    href={`/admin/devis/${d.id}?edit=1`}
                    className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-gray-400 hover:text-blue-500 transition-colors"
                    title="Modifier"
                  >
                    <Pencil size={15} />
                  </Link>
                  {(d.statut === "pending-quote") && onSend && (
                    <button
                      onClick={() => onSend(d.id)}
                      disabled={sendingId === d.id}
                      className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                      title="Envoyer le devis"
                    >
                      <Send size={15} />
                    </button>
                  )}
                  {(d.statut === "confirmed" || d.statut === "deposit-pending") && onMarkReturned && (
                    <button
                      onClick={() => onMarkReturned(d.id)}
                      disabled={returningId === d.id}
                      className="p-1.5 rounded-lg hover:bg-black/[0.05] dark:hover:bg-white/[0.08] text-gray-400 hover:text-purple-600 transition-colors disabled:opacity-50"
                      title="Marquer comme restitué"
                    >
                      <PackageCheck size={15} />
                    </button>
                  )}
                  {onDelete && d.statut !== "cancelled" && (
                    <button
                      onClick={() => {
                        if (confirm("Annuler cette réservation ?")) onDelete(d.id)
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                      title="Annuler"
                    >
                      <XCircle size={15} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
