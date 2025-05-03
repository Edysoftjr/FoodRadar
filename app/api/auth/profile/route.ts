import { type NextRequest, NextResponse } from "next/server"
import { getUserProfile, updateUserProfile } from "@/lib/supabase"
import { supabaseClient } from "@/lib/supabase-auth"

// Get user profile
export async function GET(request: NextRequest) {
  try {
    // Get the user from the session
    const { data: sessionData } = await supabaseClient.auth.getSession()

    if (!sessionData.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get the user profile
    const { data, error } = await getUserProfile(userId)

    if (error) {
      return NextResponse.json({ error: "Failed to get profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("Error in profile endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get the user from the session
    const { data: sessionData } = await supabaseClient.auth.getSession()

    if (!sessionData.session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = sessionData.session.user.id

    // Get the profile data from the request
    const profileData = await request.json()

    // Update the user profile
    const { data, error } = await updateUserProfile(userId, profileData)

    if (error) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ profile: data })
  } catch (error) {
    console.error("Error in profile endpoint:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
