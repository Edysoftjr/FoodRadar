export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          email: string
          role: "user" | "vendor" | "admin"
          image: string | null
          budget: number | null
          phone: string | null
          address: string | null
          coordinates: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          email: string
          role: "user" | "vendor" | "admin"
          image?: string | null
          budget?: number | null
          phone?: string | null
          address?: string | null
          coordinates?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: "user" | "vendor" | "admin"
          image?: string | null
          budget?: number | null
          phone?: string | null
          address?: string | null
          coordinates?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      restaurants: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          address: string | null
          coordinates: Json
          images: string[] | null
          categories: string[] | null
          price_range: Json
          rating: number | null
          opening_hours: Json | null
          phone: string | null
          website: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          address?: string | null
          coordinates: Json
          images?: string[] | null
          categories?: string[] | null
          price_range?: Json
          rating?: number | null
          opening_hours?: Json | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          address?: string | null
          coordinates?: Json
          images?: string[] | null
          categories?: string[] | null
          price_range?: Json
          rating?: number | null
          opening_hours?: Json | null
          phone?: string | null
          website?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      menu_items: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          price: number
          image: string | null
          categories: string[] | null
          is_available: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          price: number
          image?: string | null
          categories?: string[] | null
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          price?: number
          image?: string | null
          categories?: string[] | null
          is_available?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          restaurant_id: string | null
          status: string
          total_amount: number
          delivery_address: string | null
          delivery_coordinates: Json | null
          customer_phone: string | null
          special_instructions: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount: number
          delivery_address?: string | null
          delivery_coordinates?: Json | null
          customer_phone?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          restaurant_id?: string | null
          status?: string
          total_amount?: number
          delivery_address?: string | null
          delivery_coordinates?: Json | null
          customer_phone?: string | null
          special_instructions?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          menu_item_id: string | null
          quantity: number
          price: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          menu_item_id?: string | null
          quantity: number
          price: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          menu_item_id?: string | null
          quantity?: number
          price?: number
          notes?: string | null
          created_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          user_id: string | null
          restaurant_id: string
          rating: number
          comment: string | null
          images: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          restaurant_id: string
          rating: number
          comment?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          restaurant_id?: string
          rating?: number
          comment?: string | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
