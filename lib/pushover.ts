/**
 * lib/pushover.ts
 *
 * Envoi de notifications push via l'API Pushover.
 * Aucun package externe requis — utilise fetch natif.
 *
 * Variables d'environnement requises :
 *   PUSHOVER_USER_KEY  — clé utilisateur Pushover
 *   PUSHOVER_API_TOKEN — token de l'application Pushover
 */

const PUSHOVER_API = "https://api.pushover.net/1/messages.json"

interface PushoverParams {
  title: string
  message: string
  /** Priorité : -2=très basse, -1=basse, 0=normale, 1=haute, 2=urgent */
  priority?: number
  /** URL cliquable dans la notification */
  url?: string
  /** Label du bouton URL */
  url_title?: string
}

/**
 * Envoie une notification push via Pushover.
 * Retrourne true si envoyé, false en cas d'erreur.
 */
export async function sendPush(params: PushoverParams): Promise<boolean> {
  const userKey = process.env.PUSHOVER_USER_KEY
  const apiToken = process.env.PUSHOVER_API_TOKEN

  if (!userKey || !apiToken) {
    console.warn("[pushover] PUSHOVER_USER_KEY ou PUSHOVER_API_TOKEN non configuré — notification ignorée")
    return false
  }

  const body = new URLSearchParams()
  body.set("token", apiToken)
  body.set("user", userKey)
  body.set("title", params.title)
  body.set("message", params.message)
  body.set("priority", String(params.priority ?? 0))

  if (params.url) body.set("url", params.url)
  if (params.url_title) body.set("url_title", params.url_title)

  try {
    const res = await fetch(PUSHOVER_API, {
      method: "POST",
      body,
    })

    const data = await res.json()

    if (res.ok) {
      console.log("[pushover] Notification envoyée :", params.title)
      return true
    } else {
      console.error("[pushover] Erreur API :", data)
      return false
    }
  } catch (err) {
    console.error("[pushover] Erreur réseau :", err)
    return false
  }
}
