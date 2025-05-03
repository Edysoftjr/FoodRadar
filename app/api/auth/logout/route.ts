import { NextResponse } from "next/server"
import { signOut } from "@/lib/auth"

export async function POST() {
  try {
    const { error } = await signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
