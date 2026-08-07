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
      <div className="w-16 h-16 rounded-2xl bg-[#c27a72]/10 dark:bg-[#c27a72]/10 flex items-center justify-center mb-5">
        <Icon size={28} className="text-[#c27a72] dark:text-[#d4968e]" strokeWidth={1.5} />
      </div>

      <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2" style={{ fontFamily: "var(--font-playfair), serif" }}>
        {title}
      </h2>

      <p className="text-sm text-secondary-text dark:text-white/70 max-w-sm mb-4">
        {description}
      </p>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#c27a72]/10 dark:bg-[#c27a72]/10 text-[11px] font-medium text-[#c27a72] dark:text-[#d4968e] uppercase tracking-wider">
        {phase}
      </span>
    </div>
  )
}
