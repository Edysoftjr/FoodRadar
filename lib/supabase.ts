import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a single supabase client for interacting with your database
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Check if we're in a browser environment or server environment
const isBrowser = typeof window !== "undefined"

// Only create the client if we have the required values or if we're in the browser
// This prevents build-time errors when environment variables aren't available
export const supabase =
  !isBrowser && (!supabaseUrl || !supabaseAnonKey)
    ? null // Return null during build if env vars aren't available
    : createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper functions for common operations
export async function uploadImage(file: File, bucket: string, path: string): Promise<string | null> {
  if (!supabase) {
    console.error("Supabase client not initialized")
    return null
  }

  try {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
    const filePath = `${path}/${fileName}`

    const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)
    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading image:", error)
    return null
  }
}

export async function deleteImage(bucket: string, path: string): Promise<boolean> {
  if (!supabase) {
    console.error("Supabase client not initialized")
    return false
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}
