import ModulePlaceholder from "@/components/admin/ModulePlaceholder"
import { Search } from "lucide-react"

export default function SeoPage() {
  return (
    <ModulePlaceholder
      title="SEO"
      description="Suivi des balises, indexation et score SEO"
      icon={Search}
      phase="Phase 2"
    />
  )
}
