"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2 } from "lucide-react"

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

const WELCOME_MSG: ChatMessage = {
  role: "assistant",
  content:
    "Bonjour ! Je suis l'assistant de **Papillon Rose** 🦋\n\nJe suis là pour vous aider à trouver la décoration parfaite pour votre événement. Puis-je connaître le type d'événement que vous préparez ? (Mariage, Anniversaire, Baptême, Soirée d'entreprise…)",
}

const MAX_MESSAGES = 20

export default function Chatbot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput("")

    const userMsg: ChatMessage = { role: "user", content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.slice(-MAX_MESSAGES).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const responseText = data.response

      const devisMatch = responseText.match(/\[DEVIS\]([\s\S]*?)\[\/DEVIS\]/)
      if (devisMatch) {
        const cleanText = responseText.replace(/\[DEVIS\][\s\S]*?\[\/DEVIS\]/, "").trim()
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: cleanText },
        ])
        await submitDevis(devisMatch[1])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Je suis désolée de ne pas pouvoir vous répondre pour le moment 🌸 N'hésitez pas à nous contacter directement par email à **papillonrosebertha@gmail.com** ou via Instagram **@papillonrose.g**, nous vous répondrons avec plaisir !",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const submitDevis = async (raw: string) => {
    const lines = raw.trim().split("\n")
    const fields: Record<string, string> = {}
    for (const line of lines) {
      const idx = line.indexOf(":")
      if (idx !== -1) {
        const key = line.slice(0, idx).trim()
        const val = line.slice(idx + 1).trim()
        if (val) fields[key] = val
      }
    }

    try {
      const r = await fetch("/api/chat-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: fields["nom"] || "",
          prenom: fields["prenom"] || "",
          email: fields["email"] || "",
          telephone: fields["telephone"] || "",
          typeEvenement: fields["typeEvenement"] || "",
          dateEvenement: fields["dateEvenement"] || "",
          nbInvites: fields["nbInvites"] || "",
          budget: fields["budget"] || "",
          lieu: fields["lieu"] || "",
          notes: fields["notes"] || "",
        }),
      })
      if (!r.ok) throw new Error()
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "✅ Votre demande a bien été transmise à **papillonrosebertha@gmail.com** ! Notre équipe vous répondra sous **48h ouvrées**. 🦋",
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Je suis désolée, la transmission n'a pas pu aboutir 🌸 Vous pouvez nous envoyer votre demande directement par email à **papillonrosebertha@gmail.com** ou via Instagram **@papillonrose.g**, nous vous répondrons avec plaisir !",
        },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const remaining = MAX_MESSAGES - messages.length

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        aria-label="Ouvrir le chat"
        className="fixed bottom-24 right-6 z-50 w-14 h-14 bg-[#C8A97E] text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-[#B8926E] transition-all hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-[10.5rem] right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-10rem)] bg-white rounded-2xl shadow-2xl border border-black/[0.07] flex flex-col overflow-hidden animate-[fade-in-up_0.25s_ease-out]">
          {/* Header */}
          <div className="bg-[#2E2E2E] text-white px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#C8A97E] rounded-full flex items-center justify-center text-sm font-bold">
              PR
            </div>
            <div>
              <p className="text-sm font-semibold">Papillon Rose</p>
              <p className="text-[10px] text-white/60">Assistance en ligne</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#F8F5F0]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === "user"
                      ? "bg-[#C8A97E] text-white rounded-br-md"
                      : "bg-white text-[#2E2E2E] shadow-sm rounded-bl-md"
                  }`}
                >
                  <RenderContent text={msg.content} />
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#C8A97E] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#C8A97E] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#C8A97E] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="border-t border-black/[0.07] px-4 py-3 bg-white">
            {remaining <= 3 && remaining > 0 && (
              <p className="text-[10px] text-amber-500 mb-2 text-center">
                Plus que {remaining} message{remaining > 1 ? "s" : ""}
              </p>
            )}
            {remaining <= 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                Session terminée. Contactez-nous par email ou Instagram
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  disabled={loading}
                  className="flex-1 bg-[#F8F5F0] rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#C8A97E]/30 transition-all placeholder:text-gray-400"
                />
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  aria-label="Envoyer"
                  className="w-9 h-9 rounded-full bg-[#C8A97E] text-white flex items-center justify-center hover:bg-[#B8926E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

function RenderContent({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        ),
      )}
    </>
  )
}
