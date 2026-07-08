"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Customer {
  email: string
  prenom: string
  nom: string
}

export default function ComptePage() {
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"login" | "register">("login")

  // Login form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Register form
  const [regPrenom, setRegPrenom] = useState("")
  const [regNom, setRegNom] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPassword2, setRegPassword2] = useState("")
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((data) => {
        setCustomer(data.customer)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const res = await fetch("/api/customer/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setLoginError(data.error || "Identifiants incorrects")
        setLoginLoading(false)
        return
      }
      setCustomer(data.customer)
    } catch {
      setLoginError("Erreur de connexion")
      setLoginLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setRegError("")

    if (regPassword !== regPassword2) {
      setRegError("Les mots de passe ne correspondent pas")
      return
    }
    if (regPassword.length < 6) {
      setRegError("Le mot de passe doit contenir au moins 6 caractères")
      return
    }

    setRegLoading(true)
    try {
      const res = await fetch("/api/customer/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: regEmail,
          password: regPassword,
          prenom: regPrenom,
          nom: regNom,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegError(data.error || "Erreur lors de l'inscription")
        setRegLoading(false)
        return
      }
      setCustomer(data.customer)
    } catch {
      setRegError("Erreur de connexion")
      setRegLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" })
    setCustomer(null)
    setMode("login")
    setLoginEmail("")
    setLoginPassword("")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center">
        <p className="text-gray-400">Chargement…</p>
      </div>
    )
  }

  // ─── Logged in ───
  if (customer) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-2xl shadow-sm border border-black/[0.07] p-8">
            <h1 className="text-xl font-semibold text-[#2E2E2E] text-center mb-1">
              Mon compte
            </h1>
            <p className="text-sm text-gray-400 text-center mb-6">
              Papillon Rose
            </p>

            <div className="space-y-3 mb-6">
              <div className="bg-[#F8F5F0] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Nom</p>
                <p className="text-sm font-medium text-[#2E2E2E]">{customer.prenom} {customer.nom}</p>
              </div>
              <div className="bg-[#F8F5F0] rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-sm font-medium text-[#2E2E2E]">{customer.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link
                href="/reservation"
                className="block w-full py-2.5 bg-[#C8A97E] text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors text-center"
              >
                Voir mon panier
              </Link>
              <button
                onClick={handleLogout}
                className="w-full py-2.5 border border-gray-200 text-gray-500 text-sm font-medium rounded-lg hover:border-red-300 hover:text-red-500 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-4">
            <Link href="/" className="hover:text-[#C8A97E] transition-colors">
              ← Retour au site
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // ─── Not logged in ───
  return (
    <div className="min-h-screen bg-[#F8F5F0] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-sm border border-black/[0.07] p-8">
          <h1 className="text-xl font-semibold text-[#2E2E2E] text-center mb-1">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </h1>
          <p className="text-sm text-gray-400 text-center mb-6">
            Papillon Rose
          </p>

          {/* Mode toggle */}
          <div className="flex bg-[#F8F5F0] rounded-lg p-0.5 mb-6">
            <button
              onClick={() => { setMode("login"); setLoginError(""); setRegError("") }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "login"
                  ? "bg-white text-[#2E2E2E] shadow-sm"
                  : "text-gray-400 hover:text-[#2E2E2E]"
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => { setMode("register"); setLoginError(""); setRegError("") }}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                mode === "register"
                  ? "bg-white text-[#2E2E2E] shadow-sm"
                  : "text-gray-400 hover:text-[#2E2E2E]"
              }`}
            >
              S&apos;inscrire
            </button>
          </div>

          {/* Login form */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>
              <div>
                <label htmlFor="login-password" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                  Mot de passe
                </label>
                <input
                  id="login-password"
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>

              {loginError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-2.5 bg-[#C8A97E] text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50"
              >
                {loginLoading ? "Connexion…" : "Se connecter"}
              </button>
            </form>
          )}

          {/* Register form */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="reg-prenom" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                    Prénom
                  </label>
                  <input
                    id="reg-prenom"
                    type="text"
                    required
                    value={regPrenom}
                    onChange={(e) => setRegPrenom(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                    style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                  />
                </div>
                <div>
                  <label htmlFor="reg-nom" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                    Nom
                  </label>
                  <input
                    id="reg-nom"
                    type="text"
                    required
                    value={regNom}
                    onChange={(e) => setRegNom(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                    style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="reg-email" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                  Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>
              <div>
                <label htmlFor="reg-password" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                  Mot de passe
                </label>
                <input
                  id="reg-password"
                  type="password"
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>
              <div>
                <label htmlFor="reg-password2" className="block text-sm font-medium text-[#2E2E2E] mb-1">
                  Confirmer le mot de passe
                </label>
                <input
                  id="reg-password2"
                  type="password"
                  required
                  minLength={6}
                  value={regPassword2}
                  onChange={(e) => setRegPassword2(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E] placeholder:text-gray-400"
                  style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                />
              </div>

              {regError && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{regError}</p>
              )}

              <button
                type="submit"
                disabled={regLoading}
                className="w-full py-2.5 bg-[#C8A97E] text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50"
              >
                {regLoading ? "Inscription…" : "Créer mon compte"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          <Link href="/" className="hover:text-[#C8A97E] transition-colors">
            ← Retour au site
          </Link>
        </p>
      </div>
    </div>
  )
}
