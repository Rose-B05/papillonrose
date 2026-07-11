import { NextRequest, NextResponse } from "next/server"
import { processBrowseReminders } from "@/lib/browse-reminders"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
  }

  try {
    const result = await processBrowseReminders()

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      remindersSent: result.sent,
      skipped: result.skipped,
      errors: result.errors,
    })
  } catch (err: any) {
    console.error("Cron browse-reminders error:", err)
    return NextResponse.json(
      { error: "Erreur lors du traitement des relances", details: err.message },
      { status: 500 }
    )
  }
}
