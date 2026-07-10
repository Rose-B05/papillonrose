import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { BarChart3 } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <ModulePlaceholder
      title="Analytics"
      description="Trafic, sessions et comportement visiteurs"
      icon={BarChart3}
      phase="Phase 4"
    />
  )
}
