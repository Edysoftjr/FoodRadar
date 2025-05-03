import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    const restaurantId = searchParams.get("restaurantId")
    const status = searchParams.get("status")

    let query = supabase.from("orders").select("*")

    if (userId) {
      query = query.eq("user_id", userId)
    }

    if (restaurantId) {
      query = query.eq("restaurant_id", restaurantId)
    }

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ orders: data })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, restaurant_id, total, delivery_location, contact_phone, items } = body

    // Validate required fields
    if (!user_id || !restaurant_id || !total || !delivery_location || !contact_phone || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id,
        restaurant_id,
        status: "pending",
        total,
        delivery_location,
        contact_phone,
        items,
      })
      .select()

    if (error) throw error

    return NextResponse.json({ order: data[0] })
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}
