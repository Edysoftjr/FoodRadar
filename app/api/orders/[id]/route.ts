import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Check if Supabase client is initialized
    if (!supabase) {
      throw new Error("Supabase client not initialized. Check your environment variables.")
    }

    const { data, error } = await supabase.from("orders").select("*, users(name, email)").eq("id", id).single()

    if (error) throw error

    return NextResponse.json({ order: data })
  } catch (error) {
    console.error(`Error fetching order ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    // Check if Supabase client is initialized
    if (!supabase) {
      throw new Error("Supabase client not initialized. Check your environment variables.")
    }

    // Validate status
    const validStatuses = ["pending", "accepted", "preparing", "ready", "delivered", "cancelled"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select()

    if (error) throw error

    return NextResponse.json({ order: data[0] })
  } catch (error) {
    console.error(`Error updating order ${params.id}:`, error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
