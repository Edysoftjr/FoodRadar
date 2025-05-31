import { supabase } from "./supabase"
import { v4 as uuidv4 } from "uuid"

// Folder paths
export const STORAGE_PATHS = {
  PROFILES: "profiles",
  RESTAURANTS: {
    ROOT: "restaurants",
    COVERS: "restaurants/covers",
    GALLERY: "restaurants/gallery",
  },
  MEALS: "meals",
  BANNERS: "banners",
  DOCUMENTS: "documents",
}

// Bucket name
export const STORAGE_BUCKET = "foodradar-storage"

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param path The path within the bucket (e.g., "profiles", "restaurants/covers")
 * @param existingUrl Optional existing file URL to replace
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(file: File, path: string, existingUrl?: string): Promise<string | null> {
  try {
    // Delete existing file if provided
    if (existingUrl) {
      await deleteFile(existingUrl)
    }

    // Generate a unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${uuidv4()}.${fileExt}`
    const filePath = `${path}/${fileName}`

    // Upload the file
    const { error: uploadError, data } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    })

    if (uploadError) {
      throw uploadError
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
    return urlData.publicUrl
  } catch (error) {
    console.error("Error uploading file:", error)
    return null
  }
}

/**
 * Delete a file from Supabase storage using its URL
 * @param url The public URL of the file to delete
 * @returns Success status
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    // Extract the path from the URL
    const urlObj = new URL(url)
    const pathMatch = urlObj.pathname.match(new RegExp(`${STORAGE_BUCKET}/object/public/(.+)$`))

    if (!pathMatch || !pathMatch[1]) {
      console.error("Could not extract file path from URL:", url)
      return false
    }

    const filePath = pathMatch[1]

    // Delete the file
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    return false
  }
}

/**
 * Get a signed URL for temporary access to a file
 * @param path The path to the file within the bucket
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns Signed URL
 */
export async function getSignedUrl(path: string, expiresIn = 3600): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error("Error creating signed URL:", error)
    return null
  }
}

/**
 * List all files in a directory
 * @param path The directory path within the bucket
 * @returns Array of file objects
 */
export async function listFiles(path: string) {
  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(path)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error("Error listing files:", error)
    return []
  }
}
