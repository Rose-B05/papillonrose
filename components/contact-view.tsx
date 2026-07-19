"use client"

import { useState } from "react"
import { Phone, Mail, MapPin, Send } from "lucide-react"

const DP = { fontFamily: "var(--font-playfair), serif" } as const

function InstagramIcon({ size = 17 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-gradient-contact" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FEDA75" />
          <stop offset="20%" stopColor="#FA7E1E" />
          <stop offset="45%" stopColor="#D62976" />
          <stop offset="70%" stopColor="#962FBF" />
          <stop offset="100%" stopColor="#4F5BD4" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-gradient-contact)" />
      <circle cx="12" cy="12" r="5" fill="none" stroke="white" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="white" />
    </svg>
  )
}

const CONTACT_ITEMS = [
  {
    Icon: Phone,
    label: "Téléphone",
    val: "Temporairement indisponible",
    note: "Contactez-nous par email ou Instagram",
  },
  {
    Icon: Mail,
    label: "Email",
    val: "papillonrosebertha@gmail.com",
    link: "mailto:papillonrosebertha@gmail.com",
  },
  {
    Icon: MapPin,
    label: "Zone",
    val: "Île-de-France\nCréteil (94)",
  },
  {
    Icon: Send,
    label: "Telegram",
    val: "@PapillonRose",
    link: "https://t.me/PapillonRose",
  },
  {
    Icon: InstagramIcon,
    label: "Instagram",
    val: "papillonrose.g",
    link: "https://www.instagram.com/papillonrose.g",
  },
]

export default function ContactView() {
  const [form, setForm] = useState({ name: "", email: "", date: "", message: "" })
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError("")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Erreur d'envoi")
      }
      setSent(true)
      setForm({ name: "", email: "", date: "", message: "" })
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-5 md:px-10 pt-24 pb-12">
      <div className="text-center mb-14">
        <p className="text-[#C9948E] dark:text-[#E8B4AE] text-[10px] tracking-[0.5em] uppercase font-medium mb-3">
          Parlons de votre projet
        </p>
        <h1
          style={DP}
          className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#2E2E2E] dark:text-neutral-100"
        >
          Contactez-nous
        </h1>
      </div>

      <div className="grid sm:grid-cols-2 gap-8 sm:gap-12">
        {/* Left — Contact info + hours */}
        <div>
          <div className="space-y-7">
            {CONTACT_ITEMS.map(({ Icon, label, val, link, note }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-11 h-11 bg-[#C9948E]/12 dark:bg-[#C9948E]/12 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Icon size={17} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 dark:text-neutral-500 uppercase tracking-widest mb-0.5">
                    {label}
                  </p>
                  {link ? (
                    <a
                      href={link}
                      target={link.startsWith("http") ? "_blank" : undefined}
                      rel={link.startsWith("http") ? "noopener noreferrer" : undefined}
                      className="font-medium text-sm text-[#2E2E2E] dark:text-neutral-100 hover:text-[#C9948E] dark:hover:text-[#E8B4AE] transition-colors"
                    >
                      {val}
                    </a>
                  ) : (
                    <p className="font-medium text-sm whitespace-pre-line text-[#2E2E2E] dark:text-neutral-100">
                      {val}
                    </p>
                  )}
                  {note && (
                    <p className="text-xs text-gray-400 dark:text-neutral-500 mt-0.5">{note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 p-4 sm:p-6 bg-[#2E2E2E] dark:bg-neutral-800 rounded-3xl text-white">
            <p style={DP} className="text-lg font-semibold mb-3">
              Horaires
            </p>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex justify-between">
                <span>Lundi – Vendredi</span>
                <span className="text-white/90">9h – 18h</span>
              </div>
              <div className="flex justify-between">
                <span>Samedi</span>
                <span className="text-white/90">10h – 16h</span>
              </div>
              <div className="flex justify-between">
                <span>Dimanche</span>
                <span className="text-white/35">Fermé</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {sent && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-sm text-green-700 dark:text-green-300">
              Votre message a bien été envoyé ! Nous vous répondrons dans les plus brefs délais.
            </div>
          )}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1.5">
              Nom complet
            </label>
            <input
              type="text"
              placeholder="Marie Dupont"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
              style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E" } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              placeholder="marie@exemple.fr"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
              style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E" } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1.5">
              Date de l&apos;événement
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors shadow-sm"
              style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E" } as React.CSSProperties}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-gray-400 dark:text-neutral-500 mb-1.5">
              Votre message
            </label>
            <textarea
              rows={5}
              placeholder="Décrivez votre projet, nombre d'invités, lieu…"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              className="w-full bg-white dark:bg-neutral-800 border border-black/[0.08] dark:border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-[#2E2E2E] dark:text-neutral-100 outline-none focus:border-[#C9948E]/60 transition-colors resize-none shadow-sm"
              style={{ color: "#2E2E2E", WebkitTextFillColor: "#2E2E2E" } as React.CSSProperties}
            />
          </div>
          <button
            type="submit"
            disabled={sending}
            className="w-full bg-[#C9948E] dark:bg-[#C9948E] text-white py-4 rounded-2xl text-sm font-semibold hover:bg-[#B8807A] dark:hover:bg-[#B8807A] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "Envoi en cours…" : "Envoyer ma demande"}
          </button>
        </form>
      </div>
    </div>
  )
}
