export function getSupabaseEnv(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  const missingVariables = [
    !url ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !anonKey ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing Supabase environment variable${missingVariables.length > 1 ? "s" : ""}: ${missingVariables.join(", ")}. Add them to .env.local.`,
    );
  }

  return { url, anonKey };
}
