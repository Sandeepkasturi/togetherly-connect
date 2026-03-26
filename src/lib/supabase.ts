import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
    console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. DB features disabled.');
}

// Use a placeholder URL when env vars are missing to prevent crash
const PLACEHOLDER_URL = 'https://placeholder.supabase.co';
export const supabase: SupabaseClient = createClient(
    supabaseUrl || PLACEHOLDER_URL,
    supabaseAnon || 'placeholder-key'
);

// ── Types mirroring the Supabase schema ─────────────────────────
export interface DBUser {
    id: string;
    google_sub: string;
    email: string;
    display_name: string;
    photo_url: string | null;
    peer_id: string;
    is_online: boolean;
    last_seen: string;
    created_at: string;
    bio?: string;
}

export interface DBFollow {
    id: string;
    follower_id: string;
    following_id: string;
    status: 'pending' | 'accepted';
    created_at: string;
}
