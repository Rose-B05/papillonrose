"use client"

import { useState } from "react"
import Link from "next/link"

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/customer/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erreur")
        setLoading(false)
        return
      }
      setSent(true)
    } catch {
      setError("Erreur de connexion")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-6 pt-20 md:pt-24">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
          <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 text-center mb-1">
            Mot de passe oublié
          </h1>
          <p className="text-sm text-secondary-text dark:text-white/60 text-center mb-6">
            Recevez un lien de réinitialisation par email
          </p>

          {sent ? (
            <div className="text-center">
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
                Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.
              </div>
              <Link
                href="/compte"
                className="text-sm text-[#c27a72] dark:text-[#d4968e] hover:text-[#a86660] transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c27a72]/50 focus:border-[#c27a72]"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>
              {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#c27a72] dark:bg-[#c27a72] text-white text-sm font-medium rounded-lg hover:bg-[#a86660] transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi…" : "Envoyer le lien"}
              </button>
              <p className="text-center">
                <Link
                  href="/compte"
                  className="text-xs text-secondary-text hover:text-[#c27a72] dark:hover:text-[#d4968e] transition-colors"
                >
                  ← Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
