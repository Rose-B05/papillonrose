"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff, ArrowLeft, Mail, KeyRound, Lock, CheckCircle, AlertTriangle } from "lucide-react"

type View = "login" | "forgot-email" | "forgot-otp" | "forgot-reset" | "forgot-done"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get("from") || "/admin"

  const [view, setView] = useState<View>("login")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""])
  const [resetToken, setResetToken] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
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

  async function handleSendOtp() {
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erreur lors de l'envoi")
        setLoading(false)
        return
      }

      setOtpSent(true)
      setView("forgot-otp")
    } catch {
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    setError("")
    setLoading(true)
    const code = otpCode.join("")

    if (code.length !== 6) {
      setError("Veuillez entrer les 6 chiffres du code")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, email }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Code incorrect")
        setLoading(false)
        return
      }

      const data = await res.json()
      setResetToken(data.resetToken)
      setView("forgot-reset")
    } catch {
      setError("Erreur de vérification")
    } finally {
      setLoading(false)
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword, confirmPassword }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Erreur lors de la réinitialisation")
        setLoading(false)
        return
      }

      setView("forgot-done")
    } catch {
      setError("Erreur de connexion")
    } finally {
      setLoading(false)
    }
  }

  function handleOtpInput(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const newCode = [...otpCode]
    newCode[index] = value.slice(-1)
    setOtpCode(newCode)
    if (value && index < 5) {
      const next = document.querySelector(`input[name="otp-${index + 1}"]`) as HTMLInputElement
      next?.focus()
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prev = document.querySelector(`input[name="otp-${index - 1}"]`) as HTMLInputElement
      prev?.focus()
    }
  }

  function resetAll() {
    setView("login")
    setEmail("")
    setPassword("")
    setOtpCode(["", "", "", "", "", ""])
    setResetToken("")
    setNewPassword("")
    setConfirmPassword("")
    setOtpSent(false)
    setError("")
  }

  return (
    <div className="min-h-screen bg-[#F8F5F0] dark:bg-neutral-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
          {/* ── LOGIN ─────────────────────────────────── */}
          {view === "login" && (
            <>
              <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 text-center mb-1">
                Administration
              </h1>
              <p className="text-sm text-gray-400 dark:text-neutral-500 text-center mb-6">
                Papillon Rose
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
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
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
                    style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
                      style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50"
                >
                  {loading ? "Connexion…" : "Se connecter"}
                </button>
              </form>

              <div className="mt-4 text-center">
                <button
                  onClick={() => { setView("forgot-email"); setError(""); }}
                  className="text-sm text-[#C9948E] hover:underline"
                >
                  Mot de passe oublié ?
                </button>
              </div>
            </>
          )}

          {/* ── FORGOT: EMAIL ────────────────────────── */}
          {view === "forgot-email" && (
            <>
              <button onClick={resetAll} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors">
                <ArrowLeft size={14} />
                Retour
              </button>

              <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Mot de passe oublié
              </h1>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mb-6">
                Un code de vérification sera envoyé à votre email.
              </p>

              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="papillonrosebertha@gmail.com"
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
                    style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !email.trim()}
                  className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Envoi…"
                  ) : (
                    <>
                      <Mail size={16} />
                      Envoyer le code
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {/* ── FORGOT: OTP CODE ─────────────────────── */}
          {view === "forgot-otp" && (
            <>
              <button onClick={() => { setView("forgot-email"); setError(""); setOtpCode(["", "", "", "", "", ""]); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors">
                <ArrowLeft size={14} />
                Retour
              </button>

              <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Vérification
              </h1>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mb-6">
                Entrez le code à 6 chiffres envoyé à <strong>{email}</strong>
              </p>

              <div className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, i) => (
                    <input
                      key={i}
                      name={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-semibold bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E]"
                      style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  onClick={handleVerifyOtp}
                  disabled={loading || otpCode.join("").length !== 6}
                  className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Vérification…"
                  ) : (
                    <>
                      <KeyRound size={16} />
                      Vérifier le code
                    </>
                  )}
                </button>

                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full text-sm text-[#C9948E] hover:underline"
                >
                  Renvoyer le code
                </button>
              </div>
            </>
          )}

          {/* ── FORGOT: NEW PASSWORD ─────────────────── */}
          {view === "forgot-reset" && (
            <>
              <button onClick={() => { setView("forgot-otp"); setError(""); }} className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mb-4 transition-colors">
                <ArrowLeft size={14} />
                Retour
              </button>

              <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-1">
                Nouveau mot de passe
              </h1>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mb-6">
                Choisissez un mot de passe sécurisé.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label htmlFor="new-pwd" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      id="new-pwd"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
                      style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      tabIndex={-1}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Min. 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm-pwd" className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
                    style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2">
                    <AlertTriangle size={14} className="flex-shrink-0" />
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    "Sauvegarde…"
                  ) : (
                    <>
                      <Lock size={16} />
                      Réinitialiser le mot de passe
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {/* ── FORGOT: DONE ─────────────────────────── */}
          {view === "forgot-done" && (
            <div className="text-center py-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-xl font-semibold text-[#2E2E2E] dark:text-neutral-100 mb-2">
                Mot de passe réinitialisé
              </h1>
              <p className="text-sm text-gray-400 dark:text-neutral-500 mb-6">
                Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
              </p>
              <button
                onClick={resetAll}
                className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors"
              >
                Se connecter
              </button>
            </div>
          )}
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
