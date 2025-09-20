import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://jdouvqndemcidjjkepgm.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impkb3V2cW5kZW1jaWRqamtlcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyNDA0ODEsImV4cCI6MjA3MzgxNjQ4MX0.qEI2HGWh5zBQLI9f8tK99svbVRojbR3VMZwguRZnxJ4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          phone: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          role: 'customer' | 'sales_admin' | 'admin'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          role?: 'customer' | 'sales_admin' | 'admin'
          is_active?: boolean
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          role?: 'customer' | 'sales_admin' | 'admin'
          is_active?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          name: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          image_url?: string | null
          is_active?: boolean
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          brand: string | null
          category_id: string | null
          sku: string | null
          price: number
          unit: string
          min_order_quantity: number
          stock_quantity: number
          is_active: boolean
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          description?: string | null
          brand?: string | null
          category_id?: string | null
          sku?: string | null
          price: number
          unit?: string
          min_order_quantity?: number
          stock_quantity?: number
          is_active?: boolean
          image_url?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          brand?: string | null
          category_id?: string | null
          sku?: string | null
          price?: number
          unit?: string
          min_order_quantity?: number
          stock_quantity?: number
          is_active?: boolean
          image_url?: string | null
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          customer_id: string
          status: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          tax_amount: number
          total_amount: number
          notes: string | null
          approved_by: string | null
          approved_at: string | null
          myob_invoice_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          order_number: string
          customer_id: string
          status?: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal: number
          tax_amount?: number
          total_amount: number
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          myob_invoice_id?: string | null
        }
        Update: {
          status?: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          notes?: string | null
          approved_by?: string | null
          approved_at?: string | null
          myob_invoice_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
          created_at: string
        }
        Insert: {
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total_price: number
        }
        Update: {
          quantity?: number
          unit_price?: number
          total_price?: number
        }
      }
      order_status_history: {
        Row: {
          id: string
          order_id: string
          old_status: string | null
          new_status: string
          changed_by: string
          notes: string | null
          created_at: string
        }
        Insert: {
          order_id: string
          old_status?: string | null
          new_status: string
          changed_by: string
          notes?: string | null
        }
        Update: {
          old_status?: string | null
          new_status?: string
          changed_by?: string
          notes?: string | null
        }
      }
    }
    Functions: {
      generate_order_number: {
        Args: {}
        Returns: string
      }
    }
  }
}

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string, companyName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        company_name: companyName,
      },
    },
  })
  return { data, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}

export const getCurrentProfile = async () => {
  const { user } = await getCurrentUser()
  if (!user) return { profile: null, error: new Error('No user logged in') }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return { profile, error }
}