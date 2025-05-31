"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function AuthError() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [errorMessage, setErrorMessage] = useState<string>("")

  useEffect(() => {
    const error = searchParams.get("error")

    if (error === "OAuthAccountNotLinked") {
      setErrorMessage(
        "You already have an account with this email address. Please sign in with the method you used originally.",
      )
    } else if (error === "AccessDenied") {
      setErrorMessage("Access denied. You do not have permission to access this resource.")
    } else if (error === "Verification") {
      setErrorMessage("The verification link is invalid or has expired.")
    } else if (error === "Configuration") {
      setErrorMessage("There is a problem with the server configuration.")
    } else {
      setErrorMessage("An authentication error occurred. Please try again.")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive mb-2">
            <AlertCircle className="h-5 w-5" />
            <CardTitle>Authentication Error</CardTitle>
          </div>
          <CardDescription>There was a problem with your authentication request.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{errorMessage}</p>

          {searchParams.get("error") === "OAuthAccountNotLinked" && (
            <div className="bg-muted p-3 rounded-md text-xs">
              <p className="font-medium mb-1">What happened?</p>
              <p>
                You tried to sign in with Google, but we found an existing account with your email that was created
                using a different sign-in method.
              </p>
              <p className="mt-2">
                For security reasons, please use the same sign-in method you used when you first created your account.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            Go to Home
          </Button>
          <Button onClick={() => router.push("/login")}>Back to Login</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
