"use client"

import { useState } from "react"
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react"

const PASSWORD_RULES = [
  { label: "12 caractères minimum", test: (p: string) => p.length >= 12 },
  { label: "Une majuscule", test: (p: string) => /[A-Z]/.test(p) },
  { label: "Une minuscule", test: (p: string) => /[a-z]/.test(p) },
  { label: "Un chiffre", test: (p: string) => /[0-9]/.test(p) },
  { label: "Un caractère spécial", test: (p: string) => /[^A-Za-z0-9]/.test(p) },
]

function PasswordField({
  id,
  label,
  value,
  onChange,
  show,
  onToggle,
  placeholder,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[#2E2E2E] dark:text-neutral-100 mb-1">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2 pr-10 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#C9948E]/50 focus:border-[#C9948E] placeholder:text-gray-400"
          style={{ color: "#1a1a1a", WebkitTextFillColor: "#1a1a1a" }}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  )
}

export default function MotDePassePage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Erreur lors du changement de mot de passe")
        setLoading(false)
        return
      }

      setSuccess(data.message || "Mot de passe modifié avec succès")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setLoading(false)

      setTimeout(() => {
        window.location.href = "/admin/login"
      }, 2000)
    } catch {
      setError("Erreur de connexion")
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-black/[0.07] dark:border-white/[0.08] p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#C9948E]/15 flex items-center justify-center">
            <Lock size={18} className="text-[#C9948E]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
              Changer le mot de passe
            </h2>
            <p className="text-xs text-gray-400 dark:text-neutral-500">
              Modifiez votre mot de passe de connexion admin
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordField
            id="currentPassword"
            label="Mot de passe actuel"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />

          <PasswordField
            id="newPassword"
            label="Nouveau mot de passe"
            value={newPassword}
            onChange={setNewPassword}
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />

          <div className="space-y-1.5">
            <p className="text-xs text-gray-400 dark:text-neutral-500 font-medium">Règles de sécurité :</p>
            <ul className="space-y-1">
              {PASSWORD_RULES.map((rule) => (
                <li key={rule.label} className="flex items-center gap-2 text-xs">
                  {rule.test(newPassword) ? (
                    <CheckCircle size={13} className="text-green-500" />
                  ) : (
                    <div className="w-[13px] h-[13px] rounded-full border border-gray-300 dark:border-neutral-600" />
                  )}
                  <span className={rule.test(newPassword) ? "text-green-600 dark:text-green-400" : "text-gray-400 dark:text-neutral-500"}>
                    {rule.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <PasswordField
            id="confirmPassword"
            label="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            onChange={setConfirmPassword}
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-xs text-red-500 flex items-center gap-1.5">
              <AlertCircle size={13} />
              Les mots de passe ne correspondent pas
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          {success && (
            <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg flex items-center gap-2">
              <CheckCircle size={15} />
              {success} — Redirection vers la connexion…
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
            className="w-full py-2.5 bg-[#C9948E] dark:bg-[#C9948E] text-white text-sm font-medium rounded-lg hover:bg-[#B8807A] transition-colors disabled:opacity-50"
          >
            {loading ? "Changement en cours…" : "Changer le mot de passe"}
          </button>
        </form>
      </div>
    </div>
  )
}
