import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { ClipboardCheck } from "lucide-react"

export default function AuditPage() {
  return (
    <ModulePlaceholder
      title="Audit"
      description="Score global SEO, performance, accessibilité, sécurité"
      icon={ClipboardCheck}
      phase="Phase 2"
    />
  )
}
