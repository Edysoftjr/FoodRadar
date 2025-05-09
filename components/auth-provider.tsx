"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { signInWithEmail, signInWithGoogle, signUpWithEmail, signOut, getCurrentUser } from "@/lib/supabase-auth"

type User = {
  id: string
  name: string
  email: string
  image?: string
  role: "user" | "vendor" | "admin"
} | null

type AuthContextType = {
  user: User
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, name: string, role: "user" | "vendor") => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  // Check if user is logged in on mount and route changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        const { user: currentUser, error } = await getCurrentUser()

        if (error) throw error

        if (currentUser) {
          setUser({
            id: currentUser.id,
            name: currentUser.name || currentUser.email?.split("@")[0] || "User",
            email: currentUser.email || "",
            image: currentUser.image,
            role: currentUser.role || "user",
          })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  // Sign in with email and password
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await signInWithEmail(email, password)

      if (error) throw error

      if (data?.user) {
        toast({
          title: "Signed in successfully",
          description: `Welcome back!`,
        })

        router.push("/home")
      }
    } catch (error: any) {
      console.error("Sign in failed:", error)
      toast({
        title: "Sign in failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Sign in with Google
  const handleSignInWithGoogle = async () => {
    try {
      setLoading(true)
      const { data, error } = await signInWithGoogle()

      if (error) throw error

      // The redirect happens automatically, so we don't need to do anything here
    } catch (error: any) {
      console.error("Google sign in failed:", error)
      toast({
        title: "Google sign in failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  // Sign up with email and password
  const handleSignUp = async (email: string, password: string, name: string, role: "user" | "vendor") => {
    try {
      setLoading(true)
      const { data, error } = await signUpWithEmail(email, password, name, role)

      if (error) throw error

      if (data?.user) {
        toast({
          title: "Account created successfully",
          description: `Welcome to FoodRadar, ${name}!`,
        })

        router.push(role === "user" ? "/onboarding" : "/admin")
      }
    } catch (error: any) {
      console.error("Sign up failed:", error)
      toast({
        title: "Sign up failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    try {
      setLoading(true)
      const { error } = await signOut()

      if (error) throw error

      setUser(null)

      toast({
        title: "Signed out successfully",
      })

      router.push("/")
    } catch (error: any) {
      console.error("Sign out failed:", error)
      toast({
        title: "Sign out failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signInWithGoogle: handleSignInWithGoogle,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
