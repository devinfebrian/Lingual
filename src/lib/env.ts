export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabasePublishableKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
};

export const isSupabaseConfigured =
  Boolean(env.supabaseUrl) && Boolean(env.supabasePublishableKey);

export const isSupabaseAdminConfigured =
  isSupabaseConfigured &&
  Boolean(env.supabaseServiceRoleKey) &&
  env.supabaseServiceRoleKey !== env.supabasePublishableKey;
