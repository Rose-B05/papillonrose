"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, X, Filter, Calendar, SlidersHorizontal, Sparkles, Palette, Sun } from "lucide-react"
import { OCCASIONS, STYLES, AMBIANCES, BUDGET_RANGES, type FilterState } from "@/lib/product-tags"

interface Props {
  filters: FilterState
  onChange: (f: FilterState) => void
  resultCount: number
}

export default function CatalogFilters({ filters, onChange, resultCount }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [sections, setSections] = useState<Record<string, boolean>>({
    occasion: true,
    style: false,
    ambiance: false,
    budget: false,
    date: false,
  })

  const toggle = (key: string) =>
    setSections((s) => ({ ...s, [key]: !s[key] }))

  const activeCount =
    (filters.occasions?.length || 0) +
    (filters.styles?.length || 0) +
    (filters.ambiances?.length || 0) +
    (filters.budgetMin > 0 || filters.budgetMax < Infinity ? 1 : 0) +
    (filters.dateDebut || filters.dateFin ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0)

  const toggleOccasion = (t: string) =>
    onChange({
      ...filters,
      occasions: filters.occasions.includes(t)
        ? filters.occasions.filter((x) => x !== t)
        : [...filters.occasions, t],
    })

  const toggleStyle = (s: string) =>
    onChange({
      ...filters,
      styles: filters.styles.includes(s)
        ? filters.styles.filter((x) => x !== s)
        : [...filters.styles, s],
    })

  const toggleAmbiance = (a: string) =>
    onChange({
      ...filters,
      ambiances: filters.ambiances.includes(a)
        ? filters.ambiances.filter((x) => x !== a)
        : [...filters.ambiances, a],
    })

  const setBudget = (min: number, max: number) =>
    onChange({
      ...filters,
      budgetMin: filters.budgetMin === min && filters.budgetMax === max ? 0 : min,
      budgetMax: filters.budgetMin === min && filters.budgetMax === max ? Infinity : max,
    })

  const activeBudget = BUDGET_RANGES.find(
    (b) => b.min === filters.budgetMin && b.max === filters.budgetMax,
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden flex items-center gap-2 w-full bg-white dark:bg-neutral-800 rounded-2xl px-5 py-3.5 border border-black/[0.07] dark:border-white/[0.08] shadow-sm mb-4 text-sm font-medium text-[#2E2E2E] dark:text-neutral-100"
      >
        <Filter size={14} className="text-[#C8A97E] dark:text-amber-400" />
        Filtres
        {activeCount > 0 && (
          <span className="ml-auto bg-[#C8A97E] dark:bg-amber-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
            {activeCount}
          </span>
        )}
        {mobileOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {/* Filter panel */}
      <div
        className={`${
          mobileOpen ? "block" : "hidden"
        } md:block space-y-3`}
      >
        <div className="bg-white dark:bg-neutral-800 rounded-2xl border border-black/[0.07] dark:border-white/[0.08] shadow-sm overflow-hidden">

          {/* Occasions / Thèmes */}
          <SectionHeader
            label="Occasion / Thème"
            icon={<Sparkles size={12} className="text-[#C8A97E] dark:text-amber-400" />}
            count={filters.occasions.length}
            open={sections.occasion}
            onToggle={() => toggle("occasion")}
          />
          {sections.occasion && (
            <div className="px-5 pb-4 flex flex-wrap gap-1.5">
              {OCCASIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => toggleOccasion(t)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    filters.occasions.includes(t)
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white shadow-sm"
                      : "bg-[#F0EBE3] dark:bg-neutral-800 text-[#2E2E2E]/60 dark:text-neutral-400 hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 hover:text-[#C8A97E] dark:hover:text-amber-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          <Divider />

          {/* Styles */}
          <SectionHeader
            label="Style"
            icon={<Sun size={12} className="text-[#C8A97E] dark:text-amber-400" />}
            count={filters.styles.length}
            open={sections.style}
            onToggle={() => toggle("style")}
          />
          {sections.style && (
            <div className="px-5 pb-4 flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStyle(s)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    filters.styles.includes(s)
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white shadow-sm"
                      : "bg-[#F0EBE3] dark:bg-neutral-800 text-[#2E2E2E]/60 dark:text-neutral-400 hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 hover:text-[#C8A97E] dark:hover:text-amber-400"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <Divider />

          {/* Ambiances / Couleurs */}
          <SectionHeader
            label="Ambiance / Couleur"
            icon={<Palette size={12} className="text-[#C8A97E] dark:text-amber-400" />}
            count={filters.ambiances.length}
            open={sections.ambiance}
            onToggle={() => toggle("ambiance")}
          />
          {sections.ambiance && (
            <div className="px-5 pb-4 flex flex-wrap gap-1.5">
              {AMBIANCES.map((a) => (
                <button
                  key={a}
                  onClick={() => toggleAmbiance(a)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    filters.ambiances.includes(a)
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white shadow-sm"
                      : "bg-[#F0EBE3] dark:bg-neutral-800 text-[#2E2E2E]/60 dark:text-neutral-400 hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 hover:text-[#C8A97E] dark:hover:text-amber-400"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          )}

          <Divider />

          {/* Budget */}
          <SectionHeader
            label="Budget / jour"
            count={activeBudget ? 1 : 0}
            open={sections.budget}
            onToggle={() => toggle("budget")}
          />
          {sections.budget && (
            <div className="px-5 pb-4 flex flex-wrap gap-1.5">
              {BUDGET_RANGES.map((b) => (
                <button
                  key={b.label}
                  onClick={() => setBudget(b.min, b.max)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all ${
                    filters.budgetMin === b.min && filters.budgetMax === b.max
                      ? "bg-[#C8A97E] dark:bg-amber-600 text-white shadow-sm"
                      : "bg-[#F0EBE3] dark:bg-neutral-800 text-[#2E2E2E]/60 dark:text-neutral-400 hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 hover:text-[#C8A97E] dark:hover:text-amber-400"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}

          <Divider />

          {/* Stock */}
          <div className="px-5 py-3 flex items-center gap-2 group">
            <input
              type="checkbox"
              id="stock-filter"
              checked={filters.inStockOnly}
              onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
              className="appearance-none w-4 h-4 rounded border-2 border-gray-300 dark:border-neutral-600 group-hover:border-[#C8A97E] checked:border-[#C8A97E] checked:bg-[#C8A97E] transition-all cursor-pointer flex-shrink-0 relative
                checked:after:content-[''] checked:after:absolute checked:after:left-[3.5px] checked:after:top-[0.5px] checked:after:w-[5px] checked:after:h-[9px] checked:after:border-r-2 checked:after:border-b-2 checked:after:border-white checked:after:rotate-45"
            />
            <label htmlFor="stock-filter" className="text-xs font-semibold text-[#2E2E2E] dark:text-neutral-100 uppercase tracking-wider cursor-pointer select-none flex items-center gap-1.5">
              <SlidersHorizontal size={12} className="text-[#C8A97E] dark:text-amber-400" />
              En stock uniquement
            </label>
          </div>

          <Divider />

          {/* Disponibilité */}
          <SectionHeader
            label="Disponibilité"
            count={filters.dateDebut || filters.dateFin ? 1 : 0}
            open={sections.date}
            onToggle={() => toggle("date")}
          />
          {sections.date && (
            <div className="px-5 pb-4 space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                <input
                  type="date"
                  value={filters.dateDebut}
                  onChange={(e) =>
                    onChange({ ...filters, dateDebut: e.target.value })
                  }
                  className="flex-1 min-w-0 bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#C8A97E]/30"
                />
              </div>
              <span className="block text-[10px] text-gray-400 dark:text-neutral-500 text-center">au</span>
              <div className="flex items-center gap-2">
                <Calendar size={12} className="text-gray-400 dark:text-neutral-500 flex-shrink-0" />
                <input
                  type="date"
                  value={filters.dateFin}
                  min={filters.dateDebut || undefined}
                  onChange={(e) =>
                    onChange({ ...filters, dateFin: e.target.value })
                  }
                  className="flex-1 min-w-0 bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-[#C8A97E]/30"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter tags */}
      {(filters.occasions.length > 0 ||
        filters.styles.length > 0 ||
        filters.ambiances.length > 0 ||
        activeBudget ||
        filters.dateDebut ||
        filters.dateFin ||
        filters.inStockOnly) && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.occasions.map((t) => (
            <Tag key={`oc-${t}`} label={t} onRemove={() => toggleOccasion(t)} />
          ))}
          {filters.styles.map((s) => (
            <Tag key={`st-${s}`} label={s} onRemove={() => toggleStyle(s)} />
          ))}
          {filters.ambiances.map((a) => (
            <Tag key={`am-${a}`} label={a} onRemove={() => toggleAmbiance(a)} />
          ))}
          {activeBudget && (
            <Tag label={`Budget: ${activeBudget.label}`} onRemove={() => setBudget(0, Infinity)} />
          )}
          {(filters.dateDebut || filters.dateFin) && (
            <Tag
              label={`Du ${filters.dateDebut || "..."} au ${filters.dateFin || "..."}`}
              onRemove={() => onChange({ ...filters, dateDebut: "", dateFin: "" })}
            />
          )}
          {filters.inStockOnly && (
            <Tag label="En stock" onRemove={() => onChange({ ...filters, inStockOnly: false })} />
          )}
        </div>
      )}
    </>
  )
}

function SectionHeader({
  label,
  icon,
  count,
  open,
  onToggle,
}: {
  label: string
  icon?: React.ReactNode
  count: number
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-[#2E2E2E] dark:text-neutral-100 uppercase tracking-wider hover:bg-[#F8F5F0] transition-colors"
    >
      <span className="flex items-center gap-2">
        {icon}
        {label}
        {count > 0 && (
          <span className="bg-[#C8A97E] dark:bg-amber-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
            {count}
          </span>
        )}
      </span>
      {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
    </button>
  )
}

function Divider() {
  return <div className="h-px bg-black/[0.05]" />
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-[#C8A97E]/10 dark:bg-amber-600/10 text-[#C8A97E] dark:text-amber-400 text-[11px] font-medium px-2.5 py-1 rounded-full border border-[#C8A97E]/20">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-[#C8A97E]/20 dark:hover:bg-amber-600/20 rounded-full p-0.5 transition-colors"
      >
        <X size={10} />
      </button>
    </span>
  )
}
