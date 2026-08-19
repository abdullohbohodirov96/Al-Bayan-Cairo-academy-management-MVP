import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// If env vars are missing (e.g. running the static demo without a Supabase
// project attached), we stay in demo mode instead of crashing the app.
export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled ? createClient(url, key) : null;
