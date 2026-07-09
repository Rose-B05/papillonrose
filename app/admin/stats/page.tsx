"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

interface ProductStat {
  productId: number
  nom: string
  categorie: string
  stock: number
  nbLocations: number
  revenuTotal: number
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<ProductStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const topProducts = stats.filter((s) => s.nbLocations > 0)
  const totalLocations = stats.reduce((sum, s) => sum + s.nbLocations, 0)
  const totalRevenu = stats.reduce((sum, s) => sum + s.revenuTotal, 0)

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Statistiques de location
            </h1>
            <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">
              Produits les plus loués et revenus générés
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm text-[#C8A97E] dark:text-amber-400 hover:underline"
            >
              Devis
            </Link>
            <Link
              href="/admin/returns"
              className="text-sm text-[#C8A97E] dark:text-amber-400 hover:underline"
            >
              Restitutions
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-400 dark:text-neutral-500 hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors"
            >
              Site
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400 dark:text-neutral-500">Chargement…</div>
        ) : (
          <>
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Total locations
                </p>
                <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100">{totalLocations}</p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Revenu total
                </p>
                <p className="text-2xl font-bold text-[#C8A97E] dark:text-amber-400">
                  {totalRevenu.toFixed(2)} €
                </p>
              </div>
              <div className="bg-white dark:bg-neutral-800 rounded-2xl p-5 shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
                <p className="text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1">
                  Produits actifs
                </p>
                <p className="text-2xl font-bold text-[#2E2E2E] dark:text-neutral-100">{stats.length}</p>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-black/[0.07] dark:border-white/[0.08]">
                    <th className="text-left px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                      #
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                      Produit
                    </th>
                    <th className="text-left px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium hidden sm:table-cell">
                      Catégorie
                    </th>
                    <th className="text-right px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                      Stock
                    </th>
                    <th className="text-right px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                      Locations
                    </th>
                    <th className="text-right px-5 py-3 text-xs text-gray-400 dark:text-neutral-500 uppercase tracking-wider font-medium">
                      Revenu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center py-10 text-gray-400 dark:text-neutral-500"
                      >
                        Aucune location enregistrée
                      </td>
                    </tr>
                  ) : (
                    topProducts.map((s, i) => (
                      <tr
                        key={s.productId}
                        className="border-b border-black/[0.03] hover:bg-[#F8F5F0] transition-colors"
                      >
                        <td className="px-5 py-3 text-gray-400 dark:text-neutral-500">{i + 1}</td>
                        <td className="px-5 py-3 font-medium text-[#2E2E2E] dark:text-neutral-100">
                          {s.nom}
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-neutral-500 hidden sm:table-cell">
                          {s.categorie}
                        </td>
                        <td className="px-5 py-3 text-right text-gray-500 dark:text-neutral-500">
                          {s.stock}
                        </td>
                        <td className="px-5 py-3 text-right font-semibold text-[#C8A97E] dark:text-amber-400">
                          {s.nbLocations}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-[#2E2E2E] dark:text-neutral-100">
                          {s.revenuTotal.toFixed(2)} €
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
