import { NextResponse } from "next/server"
import { supabase } from "./supabase"

/**
 * Helper function to check if Supabase is initialized before making API calls
 * @returns NextResponse with error or null if Supabase is initialized
 */
export function checkSupabaseInitialized() {
  if (!supabase) {
    console.error("Supabase client not initialized. Check your environment variables.")
    return NextResponse.json({ error: "Database connection not available. Please try again later." }, { status: 503 })
  }
  return null
}
