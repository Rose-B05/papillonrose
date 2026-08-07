"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [password2, setPassword2] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (password !== password2) {
      setError("Les mots de passe ne correspondent pas")
      return
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/customer/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erreur")
        setLoading(false)
        return
      }
      setDone(true)
    } catch {
      setError("Erreur de connexion")
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg mb-4">Lien de réinitialisation invalide.</p>
        <Link href="/compte/mot-de-passe-oublie" className="text-sm text-[#c27a72] dark:text-[#d4968e] hover:text-[#a86660] transition-colors">
          Demander un nouveau lien
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
          Mot de passe mis à jour avec succès.
        </div>
        <Link href="/compte" className="text-sm text-[#c27a72] dark:text-[#d4968e] hover:text-[#a86660] transition-colors">
          ← Se connecter
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Nouveau mot de passe</label>
        <div className="relative">
          <input type={showPassword ? "text" : "password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c27a72]/50 focus:border-[#c27a72]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-secondary-text hover:text-secondary-text dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Confirmer le mot de passe</label>
        <div className="relative">
          <input type={showPassword2 ? "text" : "password"} required minLength={6} value={password2} onChange={(e) => setPassword2(e.target.value)} className="w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#c27a72]/50 focus:border-[#c27a72]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
          <button type="button" onClick={() => setShowPassword2(!showPassword2)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-secondary-text hover:text-secondary-text dark:hover:text-gray-300 transition-colors" tabIndex={-1}>
            {showPassword2 ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <button type="submit" disabled={loading} className="w-full py-2.5 bg-[#c27a72] dark:bg-[#c27a72] text-white text-sm font-medium rounded-lg hover:bg-[#a86660] transition-colors disabled:opacity-50">
        {loading ? "Réinitialisation…" : "Réinitialiser le mot de passe"}
      </button>
    </form>
  )
}

export default function ReinitialiserMotDePassePage() {
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-6 pt-20 md:pt-24">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
          <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 text-center mb-1">
            Nouveau mot de passe
          </h1>
          <p className="text-sm text-secondary-text dark:text-white/60 text-center mb-6">
            Choisissez un nouveau mot de passe pour votre compte
          </p>
          <Suspense fallback={<p className="text-sm text-secondary-text text-center">Chargement…</p>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
