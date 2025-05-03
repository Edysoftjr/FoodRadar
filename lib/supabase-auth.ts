import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    })

    return { data, error }
  } catch (error) {
    console.error("Error signing in:", error)
    return { data: null, error }
  }
}

// Sign in with Google
export async function signInWithGoogle() {
  try {
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    return { data, error }
  } catch (error) {
    console.error("Error signing in with Google:", error)
    return { data: null, error }
  }
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, name: string, role: string) {
  try {
    // First, create the user account
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (authError) throw authError

    // If user was created successfully, add additional profile data
    if (authData.user) {
      const { error: profileError } = await supabaseClient.from("profiles").insert({
        id: authData.user.id,
        name,
        email,
        role,
        created_at: new Date().toISOString(),
      })

      if (profileError) throw profileError
    }

    return { data: authData, error: null }
  } catch (error) {
    console.error("Error signing up:", error)
    return { data: null, error }
  }
}

// Sign out
export async function signOut() {
  try {
    const { error } = await supabaseClient.auth.signOut()
    return { error }
  } catch (error) {
    console.error("Error signing out:", error)
    return { error }
  }
}

// Get current user
export async function getCurrentUser() {
  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabaseClient.auth.getSession()

    if (sessionError) throw sessionError

    if (!session) {
      return { user: null, error: null }
    }

    const { data: userData, error: userError } = await supabaseClient.auth.getUser()

    if (userError) throw userError

    // Get additional profile data
    if (userData.user) {
      const { data: profileData, error: profileError } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Combine auth data with profile data
      const user = {
        ...userData.user,
        ...profileData,
        name: profileData?.name || userData.user.user_metadata?.name || userData.user.email?.split("@")[0] || "User",
        role: profileData?.role || userData.user.user_metadata?.role || "user",
      }

      return { user, error: null }
    }

    return { user: null, error: null }
  } catch (error) {
    console.error("Error getting current user:", error)
    return { user: null, error }
  }
}
