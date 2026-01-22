import { createBrowserClient } from '@supabase/ssr'

// Gunakan createBrowserClient agar status login otomatis tersimpan di Cookies
// Ini penting supaya Middleware (Satpam) bisa membacanya.
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)