import { NextResponse } from "next/server"
import { setupSupabaseTables } from "@/lib/supabase"

// This endpoint is used to set up the necessary Supabase tables
export async function GET() {
  try {
    const { success, error } = await setupSupabaseTables()

    if (!success) {
      return NextResponse.json({ error: "Failed to set up tables" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in setup endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
