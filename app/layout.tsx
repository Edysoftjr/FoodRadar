import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionProviderWrapper } from "@/components/session-provider"
import { AuthProvider } from "@/components/auth-provider"
import { LocationProvider } from "@/components/location-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FoodRadar - Find Food Within Your Budget",
  description: "Discover restaurants and meals that fit your budget and preferences",
  generator: "foodradar inc",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <AuthProvider>
            <LocationProvider>
              <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
                <div className="max-w-screen-2xl mx-auto">{children}</div>
                <Toaster />
              </ThemeProvider>
            </LocationProvider>
          </AuthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
