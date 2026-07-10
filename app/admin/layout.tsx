"use client"

import { usePathname } from "next/navigation"
import AdminShell from "@/components/admin/AdminShell"

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Devis",
  "/admin/dashboard": "Dashboard",
  "/admin/seo": "SEO",
  "/admin/analytics": "Analytics",
  "/admin/ads": "Google Ads",
  "/admin/performance": "Performance",
  "/admin/securite": "Sécurité",
  "/admin/contenu": "Contenu",
  "/admin/formulaires": "Formulaires",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/parametres": "Paramètres",
  "/admin/audit": "Audit",
  "/admin/notifications": "Notifications",
  "/admin/restitutions": "Restitutions",
  "/admin/statistiques": "Statistiques",
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  const title = PAGE_TITLES[pathname] || "Administration"

  return <AdminShell title={title}>{children}</AdminShell>
}
