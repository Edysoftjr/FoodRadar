"use client"

import type React from "react"
import Image from 'next/image';
import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2 } from "lucide-react"
import { GoogleSignInButton } from "@/components/google-signin-button"
import { useAuth } from "@/components/auth-provider"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { signIn, loading, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [pageLoading, setPageLoading] = useState(true)

  // Redirect if user is already logged in
  useEffect(() => {
    // Short delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      if (user) {
        router.push("/home")
      } else {
        setPageLoading(false)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [user, router])

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!email.trim()) errors.email = "Email is required"
    if (!password) errors.password = "Password is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await signIn(email, password)
      toast({
        title: "Login successful",
        description: "Welcome back to FoodRadar!",
      })
      router.push("/home")
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      })
    }
  }

  if (pageLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container flex min-h-screen flex-col items-center justify-center py-4 md:py-8 gradient-bg px-4">
      <Link href="/" className="mb-6 md:mb-8 flex items-center">
        <Image
              alt="FoodRadar App"
              src="/foodrlogo.png"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
              />
        <span className="text-xl font-bold">FoodRadar</span>
      </Link>

      <Card className="w-full max-w-md rounded-xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>Sign in to your FoodRadar account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                className="rounded-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {formErrors.email && <p className="text-xs text-destructive">{formErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                className="rounded-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {formErrors.password && <p className="text-xs text-destructive">{formErrors.password}</p>}
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <GoogleSignInButton />
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
