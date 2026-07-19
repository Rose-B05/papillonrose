"use client"

import { CheckCircle, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"
import type { PageSeoInfo } from "@/lib/seo-center"

export default function PageControl({ pages }: { pages: PageSeoInfo[] }) {
  const [expanded, setExpanded] = useState(true)
  const SITE_URL = "https://www.papillonrose.fr"

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-neutral-700">
            <span className="text-sm font-bold text-gray-600 dark:text-neutral-300">{pages.length}</span>
          </div>
          <h3 className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">
            Contrôle par page
          </h3>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-neutral-700">
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Page</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Title</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Description</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Robots</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">H1</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Status</th>
                  <th className="text-left py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Indexable</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-500 dark:text-neutral-400">Lien</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => (
                  <tr key={page.path} className="border-b border-gray-100 dark:border-neutral-700/50 hover:bg-[#F8F5F0] dark:hover:bg-neutral-900/50">
                    <td className="py-2.5 px-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[#2E2E2E] dark:text-neutral-100 font-medium">{page.label}</span>
                        {page.critical && (
                          <span className="text-[10px] bg-[#C9948E]/10 text-[#C9948E] px-1.5 py-0.5 rounded font-medium">
                            Critique
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{page.path}</p>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs ${page.title ? "text-gray-600 dark:text-neutral-300" : "text-red-500"}`}>
                        {page.title ? (page.title.length > 30 ? page.title.slice(0, 30) + "..." : page.title) : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs ${page.description ? "text-gray-600 dark:text-neutral-300" : "text-red-500"}`}>
                        {page.description ? (page.description.length > 30 ? page.description.slice(0, 30) + "..." : page.description) : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs ${page.robots.includes("noindex") ? "text-amber-600 dark:text-[#E8B4AE]" : "text-green-600 dark:text-green-400"}`}>
                        {page.robots}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs ${page.h1 ? "text-gray-600 dark:text-neutral-300" : "text-red-500"}`}>
                        {page.h1 ? (page.h1.length > 20 ? page.h1.slice(0, 20) + "..." : page.h1) : "—"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`inline-flex items-center gap-1 text-xs ${page.statusCode === 200 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                        {page.statusCode === 200 ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                        {page.statusCode}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-xs ${page.indexable ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-[#E8B4AE]"}`}>
                        {page.indexable ? "Oui" : "Non"}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <a
                        href={`${SITE_URL}${page.path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-[#C9948E] transition-colors"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
