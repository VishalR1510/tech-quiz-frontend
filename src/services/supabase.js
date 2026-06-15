import { createClient } from '@supabase/supabase-js'

// Using Vite env vars falling back to local mocks for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'public-anon-key'

if (import.meta.env.PROD) {
  if (!import.meta.env.VITE_SUPABASE_URL) console.error("VITE_SUPABASE_URL is missing in production!");
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) console.error("VITE_SUPABASE_ANON_KEY is missing in production!");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
