/**
 * Supabase configuration. Only the project URL and the PUBLISHABLE key belong in the browser
 * (both are public by design; Row Level Security protects the data). Never put a secret or
 * service-role key in a VITE_ variable — Vite ships every VITE_ value to the browser.
 */
const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ?? "";
const publishableKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() ?? "";

export const supabaseConfig = { url, publishableKey };

/** True when cloud saving can be used. Without it, accounts are saved on this device only. */
export const cloudConfigured = Boolean(url && publishableKey);
