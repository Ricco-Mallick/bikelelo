import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Live Supabase client. BikeLelo is a static SPA on GitHub Pages, so it talks to
 * Supabase directly with the publishable (anon) key and relies on RLS for safety.
 * When env vars are absent the app falls back to the bundled catalog snapshot.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey, { auth: { persistSession: true } }) : null

export const isSupabaseConfigured = Boolean(supabase)
