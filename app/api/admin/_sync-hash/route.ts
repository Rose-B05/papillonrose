import { NextResponse } from "next/server"
import { kv } from "@vercel/kv"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const token = (body as any).token
  if (token !== "papillon-rose-sync-2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const envHash = process.env.ADMIN_PASSWORD_HASH || ""
  if (!envHash) {
    return NextResponse.json({ error: "ADMIN_PASSWORD_HASH env var is empty" }, { status: 500 })
  }

  await kv.set("admin_password_hash", envHash)
  const verify = await kv.get<string>("admin_password_hash")

  return NextResponse.json({ success: true, synced: verify === envHash })
}
