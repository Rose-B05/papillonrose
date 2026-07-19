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
  "/admin/contenu": "Produits",
  "/admin/contenu/produits": "Produits",
  "/admin/contenu/produits/nouveau": "Nouveau produit",
  "/admin/nouveautes": "Nouveautés",
  "/admin/nouveautes/nouveau": "Nouvelle nouveauté",
  "/admin/formulaires": "Formulaires",
  "/admin/utilisateurs": "Utilisateurs",
  "/admin/parametres": "Paramètres",
  "/admin/parametres/mot-de-passe": "Mot de passe",
  "/admin/audit": "Audit",
  "/admin/notifications": "Notifications",
  "/admin/restitutions": "Restitutions",
  "/admin/statistiques": "Statistiques",
}

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const title = PAGE_TITLES[pathname] || "Administration"
  return <AdminShell title={title}>{children}</AdminShell>
}
