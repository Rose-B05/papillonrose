import type { LucideIcon } from "lucide-react"

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  phase?: string
}

export default function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  phase = "Phase à venir",
}: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#C8A97E]/10 dark:bg-amber-600/10 flex items-center justify-center mb-5">
        <Icon size={28} className="text-[#C8A97E] dark:text-amber-400" strokeWidth={1.5} />
      </div>

      <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
        {title}
      </h2>

      <p className="text-sm text-gray-500 dark:text-neutral-400 max-w-sm mb-4">
        {description}
      </p>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A97E]/10 dark:bg-amber-600/10 text-[11px] font-medium text-[#C8A97E] dark:text-amber-400 uppercase tracking-wider">
        {phase}
      </span>
    </div>
  )
}
