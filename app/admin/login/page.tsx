"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/admin"
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Identifiants incorrects")
        setLoading(false)
        return
      }

      router.push(from)
    } catch {
      setError("Erreur de connexion")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
          <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 text-center mb-1">
            Administration
          </h1>
          <p className="text-sm text-gray-400 dark:text-neutral-500 text-center mb-6">
            Papillon Rose
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#C8A97E] dark:bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center text-gray-400 dark:text-neutral-500">Chargement…</div>}>
      <LoginForm />
    </Suspense>
  )
}
