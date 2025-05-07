"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { signIn, signOut, useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

type User = {
  id: string
  name: string
  email: string
  image?: string
  role: "USER" | "VENDOR" | "ADMIN"
} | null

type AuthContextType = {
  user: User
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signUp: (email: string, password: string, name: string, role: "USER" | "VENDOR") => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const { data: session, status } = useSession()

  // Update user state when session changes
  useEffect(() => {
    if (status === "loading") {
      setLoading(true)
      return
    }

    if (session?.user) {
      setUser({
        id: session.user.id as string,
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || undefined,
        role: (session.user.role as "USER" | "VENDOR" | "ADMIN") || "USER",
      })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [session, status])

  // Sign in with email and password
  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Signed in successfully",
        description: `Welcome back!`,
      })

      router.push("/home")
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
      await signIn("google", { callbackUrl: "/home" })
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
  const handleSignUp = async (email: string, password: string, name: string, role: "USER" | "VENDOR") => {
    try {
      setLoading(true)

      // Register the user via API
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          name,
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Sign in the user after successful registration
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast({
        title: "Account created successfully",
        description: `Welcome to FoodRadar, ${name}!`,
      })

      router.push(role === "USER" ? "/onboarding" : "/admin")
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
      await signOut({ redirect: false })

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
