"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Mail, MapPin } from "lucide-react"
import { getCategorySlug } from "@/lib/product-helpers"

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || ""
const img = (path: string) => BASE + path
const LOGO = img("/papillon-rose-logo.png")

const CATEGORIES = [
  "Mobilier",
  "Figurines & Jeux",
  "Bougeoirs & Lustres",
  "Verreries",
  "Cadres",
  "Présentoirs & Plateaux",
  "Urnes & Accessoires",
  "Art de la Table",
  "Vases & Pots",
  "Décoration",
  "Fleurs & Feuillages",
]

const NAV_ITEMS = [
  { label: "Accueil", href: "/" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Panier", href: "/reservation" },
  { label: "Favoris", href: "/favoris" },
  { label: "Contact", href: "/contact" },
]

const EXTRA_LINKS = [
  { label: "À propos", href: "/a-propos" },
  { label: "FAQ", href: "/faq" },
  { label: "Conditions de location", href: "/conditions-location" },
]

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-gradient-footer" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="20%" stopColor="#FA7E1E" />
          <stop offset="45%" stopColor="#D62976" />
          <stop offset="70%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-gradient-footer)" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
    </svg>
  )
}

function FooterNewsletterForm() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const nl = params.get("newsletter")
    if (nl === "confirmed") {
      setStatus("success")
      setMessage("Votre inscription est confirmée ! Merci.")
      window.history.replaceState({}, "", window.location.pathname)
    } else if (nl === "unsubscribed") {
      setStatus("success")
      setMessage("Vous avez bien été désinscrit de la newsletter.")
      window.history.replaceState({}, "", window.location.pathname)
    } else if (nl === "error") {
      setStatus("error")
      setMessage("Une erreur est survenue. Veuillez réessayer.")
      window.history.replaceState({}, "", window.location.pathname)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("loading")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("success")
        setMessage(data.message || "Inscription réussie !")
        setEmail("")
      } else {
        setStatus("error")
        setMessage(data.error || "Erreur lors de l'inscription")
      }
    } catch {
      setStatus("error")
      setMessage("Erreur de connexion")
    }
  }

  if (status === "success" && message) {
    return (
      <div className="bg-white/10 rounded-xl px-4 py-3 text-sm text-[#C9948E]">
        {message}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <input
          type="email"
          required
          placeholder="votre@email.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setStatus("idle")
            setMessage("")
          }}
          className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9948E]/50"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[#C9948E] text-[#1C1A17] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#D4A09A] transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
        >
          {status === "loading" ? "…" : "Je m'inscris"}
        </button>
      </div>
      {status === "error" && message && (
        <p className="text-red-400 text-xs">{message}</p>
      )}
    </form>
  )
}

// ─── Navigation Accordion (shared for desktop & mobile) ──────────────────────
function FooterNavAccordion({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors border-b border-[#C9948E]/30 pb-2"
      >
        Navigation
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${show ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: show ? "500px" : "0px" }}
      >
        <ul className="space-y-3 text-sm pb-2">
          {NAV_ITEMS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                prefetch={false}
                className="text-[#E8C4BE] hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
          {EXTRA_LINKS.map((item) => (
            <li key={item.label}>
              <Link
                href={item.href}
                prefetch={false}
                className="text-[#E8C4BE] hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Categories Accordion ────────────────────────────────────────────────────
function FooterCategoriesAccordion({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors border-b border-[#C9948E]/30 pb-2"
      >
        Catégories
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${show ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: show ? "500px" : "0px" }}
      >
        <ul className="grid grid-cols-1 gap-y-2.5 text-sm pb-2">
          {CATEGORIES.map((cat) => (
            <li key={cat}>
              <Link
                href={`/categorie/${getCategorySlug(cat)}`}
                prefetch={false}
                className="text-[#E8C4BE] hover:text-white transition-colors"
              >
                {cat}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── Contact Accordion ───────────────────────────────────────────────────────
function FooterContactAccordion({
  show,
  onToggle,
}: {
  show: boolean
  onToggle: () => void
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors border-b border-[#C9948E]/30 pb-2"
      >
        Contact
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform duration-200 ${show ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: show ? "500px" : "0px" }}
      >
        <ul className="space-y-3.5 text-sm pb-2">
          <li className="flex items-start gap-2.5">
            <Mail
              size={13}
              className="text-[#C9948E] mt-0.5 flex-shrink-0"
            />
            <a
              href="mailto:papillonrosebertha@gmail.com"
              className="text-[#E8C4BE] hover:text-white transition-colors"
            >
              papillonrosebertha@gmail.com
            </a>
          </li>
          <li className="flex items-start gap-2.5">
            <MapPin
              size={13}
              className="text-[#C9948E] mt-0.5 flex-shrink-0"
            />
            <span className="text-[#E8C4BE]">
              Île-de-France
              <br />
              Créteil (94)
            </span>
          </li>
          <li className="flex items-center gap-2.5">
            <a
              href="https://www.instagram.com/papillonrose.g"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[#E8C4BE] hover:text-white transition-colors"
            >
              <InstagramIcon size={18} />
              @papillonrose.g
            </a>
          </li>
        </ul>
      </div>
    </div>
  )
}

// ─── Main Footer ─────────────────────────────────────────────────────────────
export default function Footer() {
  const [showCategories, setShowCategories] = useState(false)
  const [showNavigation, setShowNavigation] = useState(false)
  const [showContact, setShowContact] = useState(false)

  return (
    <footer className="bg-[#1C1A17] text-white pt-20 pb-8 mt-16 relative overflow-x-clip">
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 lg:px-[70px] relative z-10 mb-14">
        {/* Grid 4 colonnes — desktop */}
        <div className="hidden lg:grid grid-cols-[256px_240px_240px_1fr] gap-x-12 gap-y-10">
          {/* Colonne 1 — Identité */}
          <div>
            <img
              src={LOGO}
              alt="Papillon Rose"
              className="h-10 md:h-12 w-auto brightness-0 invert opacity-90 mb-4"
            />
            <p className="text-[#A89090] text-sm leading-relaxed mb-6">
              Location de mobilier et décoration pour événements, mariages et
              réceptions.
            </p>
          </div>

          {/* Colonne 2 — Menus empilés */}
          <div className="flex flex-col gap-10">
            <FooterNavAccordion
              show={showNavigation}
              onToggle={() => setShowNavigation(!showNavigation)}
            />
            <FooterCategoriesAccordion
              show={showCategories}
              onToggle={() => setShowCategories(!showCategories)}
            />
            <FooterContactAccordion
              show={showContact}
              onToggle={() => setShowContact(!showContact)}
            />
          </div>

          {/* Colonne 3 — Newsletter */}
          <div>
            <p className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium border-b border-[#C9948E]/30 pb-2">
              Newsletter
            </p>
            <p className="text-[#E8C4BE]/70 text-sm mb-4 leading-relaxed">
              Recevez nos nouveautés et offres exclusives.
            </p>
            <FooterNewsletterForm />
          </div>

          {/* Colonne 4 — Illustration femme + cage */}
          <div className="flex justify-end overflow-visible">
            <div className="relative -mt-[240px] z-20 pointer-events-none">
              <img
                src={img("/images/PROD086.png")}
                alt=""
                aria-hidden
                loading="lazy"
                className="w-full max-w-[580px] h-auto max-h-[700px] object-contain drop-shadow-[0_4px_24px_rgba(201,169,110,0.15)]"
              />
            </div>
          </div>
        </div>

        {/* Mobile — colonnes empilées */}
        <div className="lg:hidden flex flex-col gap-10">
          {/* Colonne 1 — Identité */}
          <div>
            <img
              src={LOGO}
              alt="Papillon Rose"
              className="h-10 md:h-12 w-auto brightness-0 invert opacity-90 mb-4"
            />
            <p className="text-[#A89090] text-sm leading-relaxed mb-6">
              Location de mobilier et décoration pour événements, mariages et
              réceptions.
            </p>
          </div>

          {/* Colonne 2 — Menus empilés */}
          <div className="flex flex-col gap-10">
            <FooterNavAccordion
              show={showNavigation}
              onToggle={() => setShowNavigation(!showNavigation)}
            />
            <div>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium flex items-center gap-2 hover:text-white transition-colors border-b border-[#C9948E]/30 pb-2"
              >
                Catégories
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`transition-transform duration-200 ${showCategories ? "rotate-180" : ""}`}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: showCategories ? "500px" : "0px" }}
              >
                <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm pb-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <Link
                        href={`/categorie/${getCategorySlug(cat)}`}
                        prefetch={false}
                        className="text-[#E8C4BE] hover:text-white transition-colors"
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <FooterContactAccordion
              show={showContact}
              onToggle={() => setShowContact(!showContact)}
            />
          </div>

          {/* Colonne 3 — Newsletter */}
          <div>
            <p className="text-[#F5F0E8] text-xs tracking-[0.3em] uppercase mb-5 font-medium border-b border-[#C9948E]/30 pb-2">
              Newsletter
            </p>
            <p className="text-[#E8C4BE]/70 text-sm mb-4 leading-relaxed">
              Recevez nos nouveautés et offres exclusives.
            </p>
            <FooterNewsletterForm />
          </div>

          {/* Scène mobile */}
          <div className="flex justify-center overflow-visible">
            <img
              src={img("/images/PROD086.png")}
              alt=""
              aria-hidden
              loading="lazy"
              className="w-[350px] max-w-[90vw] h-auto object-contain opacity-90 -mt-[100px] relative z-20"
            />
          </div>
        </div>
      </div>

      {/* Barre copyright */}
      <div className="max-w-[1600px] mx-auto px-5 md:px-10 lg:px-[70px] relative z-10 pt-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-[#A89090]/60 text-xs">
            © 2026 Papillon Rose — Location décoration événements · Tous droits
            réservés
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href="/conditions-location"
              className="text-[#A89090]/60 hover:text-[#E8C4BE] transition-colors"
            >
              Conditions de location
            </a>
            <a
              href="/mentions-legales"
              className="text-[#A89090]/60 hover:text-[#E8C4BE] transition-colors"
            >
              Mentions légales
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
