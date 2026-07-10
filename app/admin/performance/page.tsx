import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Gauge } from "lucide-react"

export default function PerformancePage() {
  return (
    <ModulePlaceholder
      title="Performance"
      description="Core Web Vitals et vitesse du site"
      icon={Gauge}
      phase="Phase 2"
    />
  )
}
