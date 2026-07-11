"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FileText,
  LayoutDashboard,
  Search,
  BarChart3,
  Megaphone,
  Gauge,
  Shield,
  FileEdit,
  Inbox,
  Users,
  Settings,
  ClipboardCheck,
  Bell,
  Menu,
  X,
  Flower2,
  PackageCheck,
  TrendingUp,
  LogOut,
} from "lucide-react"

const NAV_ITEMS = [
  { label: "Devis", icon: FileText, href: "/admin" },
  { label: "Restitutions", icon: PackageCheck, href: "/admin/restitutions" },
  { label: "Statistiques", icon: TrendingUp, href: "/admin/statistiques" },
  { label: "Dashboard", icon: LayoutDashboard, href: "/admin/dashboard" },
  { label: "SEO", icon: Search, href: "/admin/seo" },
  { label: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  { label: "Google Ads", icon: Megaphone, href: "/admin/ads" },
  { label: "Performance", icon: Gauge, href: "/admin/performance" },
  { label: "Sécurité", icon: Shield, href: "/admin/securite" },
  { label: "Contenu", icon: FileEdit, href: "/admin/contenu" },
  { label: "Formulaires", icon: Inbox, href: "/admin/formulaires" },
  { label: "Utilisateurs", icon: Users, href: "/admin/utilisateurs" },
  { label: "Paramètres", icon: Settings, href: "/admin/parametres" },
  { label: "Audit", icon: ClipboardCheck, href: "/admin/audit" },
  { label: "Notifications", icon: Bell, href: "/admin/notifications" },
] as const

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
    return pathname.startsWith(href)
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.href = "/admin/login"
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(!open)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] shadow-sm"
        aria-label="Menu"
      >
        {open ? (
          <X size={20} className="text-[#2E2E2E] dark:text-neutral-100" />
        ) : (
          <Menu size={20} className="text-[#2E2E2E] dark:text-neutral-100" />
        )}
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64
          bg-white dark:bg-neutral-900
          border-r border-black/[0.07] dark:border-white/[0.08]
          flex flex-col
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Brand */}
        <div className="px-5 py-5 border-b border-black/[0.05] dark:border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-[#C8A97E]/15 flex items-center justify-center">
              <Flower2 size={16} className="text-[#C8A97E]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100" style={{ fontFamily: "var(--font-playfair), serif" }}>
                Papillon Rose
              </p>
              <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-wider">
                Administration
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                      transition-colors duration-150
                      ${
                        active
                          ? "bg-[#C8A97E]/10 text-[#C8A97E] font-medium"
                          : "text-gray-500 dark:text-neutral-400 hover:bg-black/[0.03] dark:hover:bg-white/[0.04] hover:text-[#2E2E2E] dark:hover:text-neutral-100"
                      }
                    `}
                  >
                    <item.icon size={17} strokeWidth={active ? 2 : 1.5} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-black/[0.05] dark:border-white/[0.06] space-y-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-neutral-500 hover:text-[#C8A97E] transition-colors"
          >
            ← Retour au site
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[11px] text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors w-full"
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  )
}
