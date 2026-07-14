"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { produits } from "@/data/produits"

interface Customer {
  email: string
  prenom: string
  nom: string
  telephone: string
  adresse: string
}

interface QuoteSummary {
  id: string
  quoteNumber: string
  statut: string
  totalTtc: number
  createdAt: string
  itemCount: number
}

const STATUT_LABELS: Record<string, string> = {
  recu: "Reçu",
  en_traitement: "En traitement",
  confirme_stock: "Stock confirmé",
  refuse_stock: "Stock refusé",
  envoye: "Devis envoyé",
  acompte_paye: "Acompte payé",
  solde_paye: "Soldé",
}

const STATUT_COLORS: Record<string, string> = {
  recu: "bg-gray-100 dark:bg-neutral-800 text-gray-600",
  en_traitement: "bg-blue-50 text-blue-700",
  confirme_stock: "bg-green-50 text-green-700",
  refuse_stock: "bg-red-50 text-red-700",
  envoye: "bg-purple-50 text-purple-700",
  acompte_paye: "bg-amber-50 text-amber-700",
  solde_paye: "bg-emerald-50 text-emerald-700",
}

// ─── Newsletter Toggle ─────────────────────────────────────────────────────
function NewsletterToggle({ customerEmail }: { customerEmail: string }) {
  const [status, setStatus] = useState<"loading" | "subscribed" | "not_subscribed" | "error">("loading")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: customerEmail }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStatus(data.alreadyConfirmed ? "subscribed" : "not_subscribed")
        } else {
          setStatus("not_subscribed")
        }
      })
      .catch(() => setStatus("not_subscribed"))
  }, [customerEmail])

  async function handleToggle() {
    setLoading(true)
    setMessage("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: customerEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus("subscribed")
        setMessage(data.message || "Inscription confirmée !")
      } else {
        setMessage(data.error || "Erreur")
      }
    } catch {
      setMessage("Erreur de connexion")
    }
    setLoading(false)
  }

  if (status === "loading") {
    return <p className="text-sm text-gray-400 dark:text-neutral-500">Vérification…</p>
  }

  return (
    <div>
      {status === "subscribed" ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-green-600 dark:text-green-400 font-medium">Inscrit à la newsletter</span>
          <a
            href={`/api/newsletter/unsubscribe?email=${encodeURIComponent(customerEmail)}`}
            className="text-xs text-gray-400 dark:text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors underline"
          >
            Se désinscrire
          </a>
        </div>
      ) : (
        <button
          onClick={handleToggle}
          disabled={loading}
          className="px-5 py-2 bg-[#C8A97E] dark:bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50"
        >
          {loading ? "Inscription…" : "S'inscrire à la newsletter"}
        </button>
      )}
      {message && <p className="text-sm text-gray-500 dark:text-neutral-400 mt-2">{message}</p>}
    </div>
  )
}

export default function ComptePage() {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"login" | "register">("login")

  // Login
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [loginLoading, setLoginLoading] = useState(false)

  // Register
  const [regPrenom, setRegPrenom] = useState("")
  const [regNom, setRegNom] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regPassword2, setRegPassword2] = useState("")
  const [regError, setRegError] = useState("")
  const [regLoading, setRegLoading] = useState(false)
  const [regNewsletter, setRegNewsletter] = useState(false)

  // Profile (logged in)
  const [profile, setProfile] = useState<Customer | null>(null)
  const [profileEditing, setProfileEditing] = useState(false)
  const [profileForm, setProfileForm] = useState({ prenom: "", nom: "", telephone: "", adresse: "" })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")

  // Quotes
  const [quotes, setQuotes] = useState<QuoteSummary[]>([])
  const [quotesLoading, setQuotesLoading] = useState(false)

  // Favorites
  const [favorites, setFavorites] = useState<number[]>([])
  const [favLoading, setFavLoading] = useState(false)

  useEffect(() => {
    fetch("/api/customer/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.customer) {
          setCustomer(data.customer)
          loadProfile(data.customer.email)
          loadQuotes()
          loadFavorites()
        } else {
          setLoading(false)
        }
      })
      .catch(() => setLoading(false))
  }, [])

  async function loadProfile(email: string) {
    try {
      const res = await fetch("/api/customer/profile")
      const data = await res.json()
      if (data.customer) {
        setProfile(data.customer)
        setProfileForm({
          prenom: data.customer.prenom,
          nom: data.customer.nom,
          telephone: data.customer.telephone || "",
          adresse: data.customer.adresse || "",
        })
      }
    } catch {}
    setLoading(false)
  }

  async function loadQuotes() {
    setQuotesLoading(true)
    try {
      const res = await fetch("/api/customer/quotes")
      const data = await res.json()
      setQuotes(data.quotes || [])
    } catch {}
    setQuotesLoading(false)
  }

  async function loadFavorites() {
    setFavLoading(true)
    try {
      const res = await fetch("/api/customer/favorites")
      const data = await res.json()
      setFavorites(data.favorites || [])
    } catch {}
    setFavLoading(false)
  }

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
      setProfile(data.customer)
      setProfileForm({
        prenom: data.customer.prenom,
        nom: data.customer.nom,
        telephone: data.customer.telephone || "",
        adresse: data.customer.adresse || "",
      })
      setFavorites(data.favorites || [])
      loadQuotes()
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
        body: JSON.stringify({ email: regEmail, password: regPassword, prenom: regPrenom, nom: regNom, newsletterConsent: regNewsletter }),
      })
      const data = await res.json()
      if (!res.ok) {
        setRegError(data.error || "Erreur lors de l'inscription")
        setRegLoading(false)
        return
      }
      setCustomer(data.customer)
      setProfile(data.customer)
      setProfileForm({ prenom: data.customer.prenom, nom: data.customer.nom, telephone: "", adresse: "" })
      setFavorites(data.favorites || [])
      setQuotes([])
    } catch {
      setRegError("Erreur de connexion")
      setRegLoading(false)
    }
  }

  async function handleLogout() {
    await fetch("/api/customer/logout", { method: "POST" })
    setCustomer(null)
    setProfile(null)
    setQuotes([])
    setFavorites([])
    setMode("login")
    setLoginEmail("")
    setLoginPassword("")
  }

  async function handleSaveProfile() {
    setProfileSaving(true)
    setProfileMsg("")
    try {
      const res = await fetch("/api/customer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm),
      })
      const data = await res.json()
      if (res.ok && data.customer) {
        setProfile(data.customer)
        setCustomer(data.customer)
        setProfileEditing(false)
        setProfileMsg("Profil mis à jour")
        setTimeout(() => setProfileMsg(""), 3000)
      } else {
        setProfileMsg(data.error || "Erreur")
      }
    } catch {
      setProfileMsg("Erreur de connexion")
    }
    setProfileSaving(false)
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
  }

  function getProductName(id: number) {
    return produits.find((p) => p.id === id)
  }

  // ─── Loading ───
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center">
        <p className="text-gray-400 dark:text-neutral-500">Chargement…</p>
      </div>
    )
  }

  // ─── Not logged in ───
  if (!customer) {
    return (
      <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-6 pt-20 md:pt-24">
        <div className="w-full max-w-sm">
          <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
            <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 text-center mb-1">
              {mode === "login" ? "Connexion" : "Créer un compte"}
            </h1>
            <p className="text-sm text-gray-400 dark:text-neutral-500 text-center mb-6">Papillon Rose</p>

            <div className="flex bg-[#F8F5F0] dark:bg-neutral-900 rounded-lg p-0.5 mb-6">
              <button onClick={() => { setMode("login"); setLoginError(""); setRegError("") }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "login" ? "bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 shadow-sm" : "text-gray-400 dark:text-neutral-500 hover:text-[#2E2E2E] dark:hover:text-neutral-100"}`}>
                Se connecter
              </button>
              <button onClick={() => { setMode("register"); setLoginError(""); setRegError("") }} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === "register" ? "bg-white dark:bg-neutral-800 text-[#2E2E2E] dark:text-neutral-100 shadow-sm" : "text-gray-400 dark:text-neutral-500 hover:text-[#2E2E2E] dark:hover:text-neutral-100"}`}>
                S&apos;inscrire
              </button>
            </div>

            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Email</label>
                  <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Mot de passe</label>
                  <input type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                {loginError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{loginError}</p>}
                <button type="submit" disabled={loginLoading} className="w-full py-2.5 bg-[#C8A97E] dark:bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50">
                  {loginLoading ? "Connexion…" : "Se connecter"}
                </button>
              </form>
            )}

            {mode === "register" && (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Prénom</label>
                    <input type="text" required value={regPrenom} onChange={(e) => setRegPrenom(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Nom</label>
                    <input type="text" required value={regNom} onChange={(e) => setRegNom(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Email</label>
                  <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Mot de passe</label>
                  <input type="password" required minLength={6} value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Confirmer le mot de passe</label>
                  <input type="password" required minLength={6} value={regPassword2} onChange={(e) => setRegPassword2(e.target.value)} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regNewsletter}
                    onChange={(e) => setRegNewsletter(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300 text-[#C8A97E] focus:ring-[#C8A97E]/50"
                  />
                  <span className="text-xs text-gray-500 dark:text-neutral-400 leading-relaxed">
                    Je souhaite recevoir la newsletter Papillon Rose (nouveautés, offres exclusives)
                  </span>
                </label>
                {regError && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{regError}</p>}
                <button type="submit" disabled={regLoading} className="w-full py-2.5 bg-[#C8A97E] dark:bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50">
                  {regLoading ? "Inscription…" : "Créer mon compte"}
                </button>
              </form>
            )}
          </div>
          <p className="text-center text-xs text-gray-400 dark:text-neutral-500 mt-4">
            <Link href="/" className="hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors">← Retour au site</Link>
          </p>
        </div>
      </div>
    )
  }

  // ─── Logged in ───
  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 px-6 md:px-10 pt-20 md:pt-24 pb-6 md:pb-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Mon compte</h1>
            <p className="text-sm text-gray-500 dark:text-neutral-500 mt-1">{customer.prenom} {customer.nom}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-gray-400 dark:text-neutral-500 hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors">Site</Link>
            <button onClick={handleLogout} className="text-sm text-gray-400 dark:text-neutral-500 hover:text-red-500 transition-colors">
              Déconnexion
            </button>
          </div>
        </div>

        {/* ─── Profil ─── */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">Profil</h2>
            {!profileEditing && (
              <button onClick={() => { setProfileEditing(true); setProfileMsg("") }} className="text-sm text-[#C8A97E] dark:text-amber-400 hover:text-[#B8926E] transition-colors">
                Modifier
              </button>
            )}
          </div>

          {profileMsg && (
            <p className={`text-sm mb-4 px-3 py-2 rounded-lg ${profileMsg.includes("Erreur") ? "text-red-600 bg-red-50" : "text-green-700 bg-green-50"}`}>
              {profileMsg}
            </p>
          )}

          {!profileEditing ? (
            <div className="space-y-3">
              <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 dark:text-neutral-500 mb-0.5">Nom complet</p>
                <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{profile?.prenom} {profile?.nom}</p>
              </div>
              <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400 dark:text-neutral-500 mb-0.5">Email</p>
                <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{profile?.email}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mb-0.5">Téléphone</p>
                  <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{profile?.telephone || "—"}</p>
                </div>
                <div className="bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 dark:text-neutral-500 mb-0.5">Adresse</p>
                  <p className="text-sm font-medium text-[#2E2E2E] dark:text-neutral-100">{profile?.adresse || "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Prénom</label>
                  <input type="text" value={profileForm.prenom} onChange={(e) => setProfileForm((f) => ({ ...f, prenom: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Nom</label>
                  <input type="text" value={profileForm.nom} onChange={(e) => setProfileForm((f) => ({ ...f, nom: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Email</label>
                <input type="email" value={profile?.email} disabled className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:border-neutral-700 rounded-lg text-sm text-gray-400 dark:text-neutral-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Téléphone</label>
                <input type="tel" value={profileForm.telephone} onChange={(e) => setProfileForm((f) => ({ ...f, telephone: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">Adresse</label>
                <input type="text" value={profileForm.adresse} onChange={(e) => setProfileForm((f) => ({ ...f, adresse: e.target.value }))} className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C8A97E]/50 focus:border-[#C8A97E]" style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleSaveProfile} disabled={profileSaving} className="px-5 py-2 bg-[#C8A97E] dark:bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-[#b8996e] transition-colors disabled:opacity-50">
                  {profileSaving ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button onClick={() => { setProfileEditing(false); if (profile) setProfileForm({ prenom: profile.prenom, nom: profile.nom, telephone: profile.telephone || "", adresse: profile.adresse || "" }) }} className="px-5 py-2 border border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-neutral-500 text-sm font-medium rounded-lg hover:border-gray-300 transition-colors">
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ─── Devis ─── */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 mb-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Mes devis</h2>
          {quotesLoading ? (
            <p className="text-sm text-gray-400 dark:text-neutral-500">Chargement…</p>
          ) : quotes.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-neutral-500">Aucun devis pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {quotes.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100">{q.quoteNumber}</p>
                    <p className="text-xs text-gray-400 dark:text-neutral-500">{formatDate(q.createdAt)} — {q.itemCount} article{q.itemCount > 1 ? "s" : ""}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${STATUT_COLORS[q.statut] || "bg-gray-100 dark:bg-neutral-800 text-gray-600"}`}>
                      {STATUT_LABELS[q.statut] || q.statut}
                    </span>
                    <p className="text-sm font-semibold text-[#2E2E2E] dark:text-neutral-100 mt-1">{q.totalTtc.toFixed(2)} €</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Favoris ─── */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-4">Mes favoris</h2>
          {favLoading ? (
            <p className="text-sm text-gray-400 dark:text-neutral-500">Chargement…</p>
          ) : favorites.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-neutral-500">Aucun produit en favori.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {favorites.map((id) => {
                const p = getProductName(id)
                if (!p) return null
                return (
                  <Link key={id} href="/" className="group bg-[#F8F5F0] dark:bg-neutral-900 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-square bg-gray-100 dark:bg-neutral-800 overflow-hidden">
                      <img src={p.image} alt={p.nom} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-medium text-[#2E2E2E] dark:text-neutral-100 truncate">{p.nom}</p>
                      <p className="text-xs text-[#C8A97E] dark:text-amber-400 font-semibold mt-0.5">
                        {typeof p.prix === "number" ? `${p.prix} €` : p.prix}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>

        {/* ─── Newsletter ─── */}
        <section className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-6 mt-6">
          <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">Newsletter</h2>
          <p className="text-sm text-gray-400 dark:text-neutral-500 mb-4">
            Recevez nos nouveautés et offres exclusives directement dans votre boîte mail.
          </p>
          <NewsletterToggle customerEmail={customer.email} />
        </section>

        <p className="text-center text-xs text-gray-400 dark:text-neutral-500 mt-6">
          <Link href="/" className="hover:text-[#C8A97E] dark:hover:text-amber-400 transition-colors">← Retour au site</Link>
        </p>
      </div>
    </div>
  )
}
