import bcrypt from "bcryptjs"
import { kv } from "@vercel/kv"

export const CUSTOMER_COOKIE = "customer_session"
export const CUSTOMER_SESSION_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export interface Customer {
  email: string
  prenom: string
  nom: string
  passwordHash: string
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

export async function createCustomer(email: string, prenom: string, nom: string, password: string): Promise<Customer> {
  const passwordHash = await bcrypt.hash(password, 10)
  const customer: Customer = {
    email: email.toLowerCase().trim(),
    prenom: prenom.trim(),
    nom: nom.trim(),
    passwordHash,
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
