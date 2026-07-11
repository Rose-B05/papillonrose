import bcrypt from "bcryptjs"
import { kv } from "@vercel/kv"

export const CUSTOMER_COOKIE = "customer_session"
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface Customer {
  email: string
  prenom: string
  nom: string
  telephone?: string
  adresse?: string
  passwordHash: string
  marketingConsent?: boolean
  createdAt: string
}

const INDEX_KEY = "customers:index"

async function getEmails(): Promise<string[]> {
  return (await kv.get<string[]>(INDEX_KEY)) || []
}

async function saveEmails(emails: string[]) {
  await kv.set(INDEX_KEY, emails)
}

export async function getCustomer(email: string): Promise<Customer | undefined> {
  const c = await kv.get<Customer>(`customer:${email}`)
  return c ?? undefined
}

export async function createCustomer(email: string, prenom: string, nom: string, password: string, marketingConsent = false): Promise<Customer> {
  const passwordHash = await bcrypt.hash(password, 10)
  const customer: Customer = {
    email: email.toLowerCase().trim(),
    prenom: prenom.trim(),
    nom: nom.trim(),
    passwordHash,
    marketingConsent,
    createdAt: new Date().toISOString(),
  }
  await kv.set(`customer:${customer.email}`, customer)
  const emails = await getEmails()
  if (!emails.includes(customer.email)) {
    emails.push(customer.email)
    await saveEmails(emails)
  }
  return customer
}

export async function verifyCustomer(email: string, password: string): Promise<Customer | null> {
  const customer = await getCustomer(email)
  if (!customer) return null
  const valid = await bcrypt.compare(password, customer.passwordHash)
  if (!valid) return null
  return customer
}

export async function updateCustomerProfile(
  email: string,
  updates: { prenom?: string; nom?: string; telephone?: string; adresse?: string; marketingConsent?: boolean }
): Promise<Customer | undefined> {
  const customer = await getCustomer(email)
  if (!customer) return undefined
  const updated: Customer = {
    ...customer,
    prenom: updates.prenom?.trim() || customer.prenom,
    nom: updates.nom?.trim() || customer.nom,
    telephone: updates.telephone ?? customer.telephone,
    adresse: updates.adresse ?? customer.adresse,
    marketingConsent: updates.marketingConsent ?? customer.marketingConsent,
  }
  await kv.set(`customer:${email}`, updated)
  return updated
}
