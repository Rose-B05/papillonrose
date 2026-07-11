import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { LayoutDashboard } from "lucide-react"

export default function DashboardPage() {
  return (
    <ModulePlaceholder
      title="Dashboard"
      description="Vue d'ensemble du site en temps réel"
      icon={LayoutDashboard}
      phase="Phase 3"
    />
  )
}
