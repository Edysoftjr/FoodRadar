"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  )
}
