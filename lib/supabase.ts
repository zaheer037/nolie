import { createClient } from "@supabase/supabase-js"

// Make sure we're using the correct environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Add some validation to ensure the environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Please check your .env.local file.")
}

// Create a single instance of the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "supabase-js-web",
    },
  },
})

// Types for our database
export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface AnalysisReport {
  id: string
  user_id: string
  file_name: string
  file_type: string
  file_size: number
  analysis_results: any
  plagiarism_score: number
  forgery_detected: boolean
  privacy_issues_count: number
  risk_level: "LOW" | "MEDIUM" | "HIGH"
  report_html?: string
  created_at: string
  updated_at: string
}
