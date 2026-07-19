"use client"

import { useState, useEffect } from "react"
import { Inbox, Mail, MailOpen, Trash2, RefreshCcw, Calendar, User } from "lucide-react"
import type { ContactMessage } from "@/lib/types"

export default function FormulairesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<ContactMessage | null>(null)

  const fetchMessages = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/contact-messages")
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    fetchMessages()
  }, [])

  const markRead = async (id: string) => {
    await fetch("/api/admin/contact-messages", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action: "read" }),
    })
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, read: true } : m)))
    if (selected?.id === id) setSelected((prev) => (prev ? { ...prev, read: true } : null))
  }

  const deleteMessage = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return
    await fetch(`/api/admin/contact-messages?id=${id}`, { method: "DELETE" })
    setMessages((prev) => prev.filter((m) => m.id !== id))
    if (selected?.id === id) setSelected(null)
  }

  const unreadCount = messages.filter((m) => !m.read).length

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#2E2E2E] dark:text-neutral-100">Formulaires</h1>
          <p className="text-sm text-gray-400 dark:text-white/60 mt-1">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
            {unreadCount > 0 && (
              <span className="ml-2 text-[#C9948E] dark:text-[#E8B4AE] font-medium">
                Â· {unreadCount} non lu{unreadCount !== 1 ? "s" : ""}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="p-2 rounded-xl bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <RefreshCcw size={16} className="text-gray-400" />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center">
          <p className="text-gray-400 dark:text-white/60 text-sm">Chargementâ€¦</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="py-24 text-center">
          <div className="w-20 h-20 bg-[#C9948E]/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Inbox size={32} className="text-[#C9948E]/40" />
          </div>
          <p className="text-gray-400 dark:text-white/60 text-base mb-2">
            Aucun message pour l&apos;instant
          </p>
          <p className="text-gray-400 dark:text-white/60 text-xs">
            Les messages envoyÃ©s via le formulaire de contact apparaÃ®tront ici.
          </p>
        </div>
      ) : (
        <div className="flex gap-4 min-h-[500px]">
          {/* Message list */}
          <div className="w-full max-w-md flex-shrink-0 space-y-2 overflow-y-auto max-h-[600px]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setSelected(msg)
                  if (!msg.read) markRead(msg.id)
                }}
                className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                  selected?.id === msg.id
                    ? "bg-[#C9948E]/10 border-[#C9948E]/30"
                    : msg.read
                    ? "bg-white dark:bg-neutral-800 border-transparent hover:bg-gray-50 dark:hover:bg-neutral-700"
                    : "bg-white dark:bg-neutral-800 border-[#C9948E]/20 shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {msg.read ? (
                      <MailOpen size={16} className="text-gray-300 dark:text-neutral-600" />
                    ) : (
                      <Mail size={16} className="text-[#C9948E] dark:text-[#E8B4AE]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-sm font-medium truncate ${msg.read ? "text-gray-500 dark:text-white/70" : "text-[#2E2E2E] dark:text-neutral-100"}`}>
                        {msg.name}
                      </p>
                      {!msg.read && <span className="w-2 h-2 rounded-full bg-[#C9948E] flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-400 dark:text-white/60 truncate mt-0.5">
                      {msg.message}
                    </p>
                    <p className="text-[10px] text-gray-300 dark:text-neutral-600 mt-1">
                      {new Date(msg.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Message detail */}
          {selected ? (
            <div className="flex-1 bg-white dark:bg-neutral-800 rounded-2xl p-6 border border-gray-100 dark:border-neutral-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#2E2E2E] dark:text-neutral-100">
                  {selected.name}
                </h2>
                <button
                  onClick={() => deleteMessage(selected.id)}
                  className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Mail size={14} className="text-gray-400" />
                  <a href={`mailto:${selected.email}`} className="text-[#C9948E] dark:text-[#E8B4AE] hover:underline">
                    {selected.email}
                  </a>
                </div>
                {selected.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar size={14} className="text-gray-400" />
                    <span className="text-gray-500 dark:text-white/70">
                      Ã‰vÃ©nement le {new Date(selected.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <User size={14} className="text-gray-400" />
                  <span className="text-gray-500 dark:text-white/70">
                    ReÃ§u le {new Date(selected.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-neutral-700 pt-4">
                <p className="text-sm text-[#2E2E2E] dark:text-neutral-100 whitespace-pre-wrap leading-relaxed">
                  {selected.message}
                </p>
              </div>

              <div className="mt-6 flex gap-3">
                <a
                  href={`mailto:${selected.email}?subject=${encodeURIComponent(`Re: Votre demande â€” ${selected.name}`)}&body=${encodeURIComponent(`Bonjour ${selected.name},\n\nMerci pour votre message.\n\n`)}`}
                  className="flex-1 bg-[#C9948E] text-white py-2.5 rounded-xl text-sm font-medium hover:bg-[#B8807A] transition-colors text-center"
                >
                  RÃ©pondre par email
                </a>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-neutral-800 rounded-2xl border border-gray-100 dark:border-neutral-700">
              <div className="text-center">
                <Inbox size={40} className="text-gray-200 dark:text-neutral-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400 dark:text-white/60">SÃ©lectionnez un message</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
