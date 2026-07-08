"use client"

import { useState, useEffect, useRef, useCallback } from "react"

const STORAGE_KEY = "a11y-settings"

interface A11ySettings {
  fontSize: number // 100 = default, 110 = +10%, etc.
  highContrast: boolean
  reduceAnimations: boolean
  dyslexiaFont: boolean
  darkMode: boolean | null // null = follow system preference
}

const DEFAULTS: A11ySettings = { fontSize: 100, highContrast: false, reduceAnimations: false, dyslexiaFont: false, darkMode: null }

function loadSettings(): A11ySettings {
  if (typeof window === "undefined") return DEFAULTS
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
    return saved ? { ...DEFAULTS, ...saved } : DEFAULTS
  } catch {
    return DEFAULTS
  }
}

function saveSettings(s: A11ySettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export default function AccessibilityPanel() {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<A11ySettings>(DEFAULTS)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstFocusRef = useRef<HTMLButtonElement>(null)

  // Load from localStorage + apply on mount
  useEffect(() => {
    const s = loadSettings()
    setSettings(s)
    applySettings(s)
  }, [])

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    if (mq.matches) {
      setSettings((prev) => {
        const updated = { ...prev, reduceAnimations: true }
        saveSettings(updated)
        applySettings(updated)
        return updated
      })
    }
  }, [])

  const applySettings = (s: A11ySettings) => {
    const root = document.documentElement
    root.style.fontSize = `${s.fontSize}%`
    root.classList.toggle("a11y-high-contrast", s.highContrast)
    root.classList.toggle("a11y-reduce-animations", s.reduceAnimations)
    root.classList.toggle("a11y-dyslexia-font", s.dyslexiaFont)
    // Dark mode: null = follow system, true = force dark, false = force light
    root.classList.remove("dark", "light")
    if (s.darkMode === true) {
      root.classList.add("dark")
    } else if (s.darkMode === false) {
      root.classList.add("light")
    }
    // null = no class added → CSS @media prefers-color-scheme handles it via :root:not(.light)
  }

  const update = (patch: Partial<A11ySettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch }
      saveSettings(updated)
      applySettings(updated)
      return updated
    })
  }

  // Focus trap
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false)
      buttonRef.current?.focus()
      return
    }
    if (e.key !== "Tab" || !panelRef.current) return
    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus() }
    }
  }, [])

  // Focus first element when panel opens
  useEffect(() => {
    if (open) firstFocusRef.current?.focus()
  }, [open])

  return (
    <>
      {/* Floating button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="Options d'accessibilité"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-white dark:bg-[#2A2420] border border-[#C8A97E]/40 text-[#C8A97E] rounded-full shadow-lg flex items-center justify-center hover:bg-[#C8A97E]/10 hover:border-[#C8A97E] transition-all"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v5" />
          <path d="M7.5 9.5l9 0" />
          <path d="M9.5 12l-2 8" />
          <path d="M14.5 12l2 8" />
          <path d="M8 21h8" />
        </svg>
      </button>

      {/* Panel */}
      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-label="Options d'accessibilité"
          onKeyDown={handleKeyDown}
          className="fixed bottom-20 left-6 z-50 w-72 bg-white dark:bg-[#2A2420] rounded-2xl shadow-2xl border border-black/[0.07] dark:border-white/[0.08] p-5 animate-[fade-in-up_0.2s_ease-out]"
        >
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-[#2E2E2E] dark:text-[#F0EBE3]">Accessibilité</p>
            <button
              ref={firstFocusRef}
              onClick={() => { setOpen(false); buttonRef.current?.focus() }}
              aria-label="Fermer le panneau d'accessibilité"
              className="w-7 h-7 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-[#2E2E2E] dark:hover:text-[#F0EBE3] transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Mode sombre */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Mode sombre</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const next = settings.darkMode === true ? null : true
                    update({ darkMode: next })
                  }}
                  aria-label={settings.darkMode === true ? "Désactiver le mode sombre" : "Activer le mode sombre"}
                  className={`flex-1 h-9 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    settings.darkMode === true
                      ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                      : "border-black/[0.08] dark:border-white/[0.12] text-[#2E2E2E] dark:text-[#F0EBE3] hover:bg-[#F0EBE3] dark:hover:bg-white/10"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                  Sombre
                </button>
                <button
                  onClick={() => {
                    const next = settings.darkMode === false ? null : false
                    update({ darkMode: next })
                  }}
                  aria-label={settings.darkMode === false ? "Revenir au thème système" : "Forcer le mode clair"}
                  className={`flex-1 h-9 rounded-lg border text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    settings.darkMode === false
                      ? "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                      : settings.darkMode === true
                        ? "border-black/[0.08] dark:border-white/[0.12] text-[#2E2E2E] dark:text-[#F0EBE3] hover:bg-[#F0EBE3] dark:hover:bg-white/10"
                        : "border-[#C8A97E] bg-[#C8A97E]/10 text-[#C8A97E]"
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                  Clair
                </button>
              </div>
              <p className="text-[10px] text-gray-400 mt-1">
                {settings.darkMode === null ? "Thème système" : settings.darkMode ? "Mode sombre forcé" : "Mode clair forcé"}
              </p>
            </div>

            {/* Taille du texte */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Taille du texte</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update({ fontSize: Math.max(80, settings.fontSize - 10) })}
                  disabled={settings.fontSize <= 80}
                  aria-label="Réduire la taille du texte"
                  className="w-9 h-9 rounded-lg border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center text-[#2E2E2E] dark:text-[#F0EBE3] hover:bg-[#F0EBE3] dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <span className="text-sm font-medium text-[#2E2E2E] dark:text-[#F0EBE3] w-12 text-center">{settings.fontSize}%</span>
                <button
                  onClick={() => update({ fontSize: Math.min(150, settings.fontSize + 10) })}
                  disabled={settings.fontSize >= 150}
                  aria-label="Augmenter la taille du texte"
                  className="w-9 h-9 rounded-lg border border-black/[0.08] dark:border-white/[0.12] flex items-center justify-center text-[#2E2E2E] dark:text-[#F0EBE3] hover:bg-[#F0EBE3] dark:hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
              </div>
            </div>

            {/* Contraste élevé */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#2E2E2E] dark:text-[#F0EBE3]">Contraste élevé</span>
              <button
                role="switch"
                aria-checked={settings.highContrast}
                onClick={() => update({ highContrast: !settings.highContrast })}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings.highContrast ? "bg-[#C8A97E]" : "bg-gray-200 dark:bg-white/20"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.highContrast ? "translate-x-5" : ""}`} />
              </button>
            </label>

            {/* Réduction des animations */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#2E2E2E] dark:text-[#F0EBE3]">Réduire les animations</span>
              <button
                role="switch"
                aria-checked={settings.reduceAnimations}
                onClick={() => update({ reduceAnimations: !settings.reduceAnimations })}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings.reduceAnimations ? "bg-[#C8A97E]" : "bg-gray-200 dark:bg-white/20"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.reduceAnimations ? "translate-x-5" : ""}`} />
              </button>
            </label>

            {/* Police dyslexie */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-sm text-[#2E2E2E] dark:text-[#F0EBE3]">Police adaptée dyslexie</span>
              <button
                role="switch"
                aria-checked={settings.dyslexiaFont}
                onClick={() => update({ dyslexiaFont: !settings.dyslexiaFont })}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings.dyslexiaFont ? "bg-[#C8A97E]" : "bg-gray-200 dark:bg-white/20"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings.dyslexiaFont ? "translate-x-5" : ""}`} />
              </button>
            </label>
          </div>
        </div>
      )}
    </>
  )
}
