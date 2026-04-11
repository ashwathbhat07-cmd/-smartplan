/**
 * Authenticated fetch wrapper — attaches the Supabase access token
 * as a Bearer token so API route handlers can verify auth.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token: string | undefined;

  if (typeof window !== "undefined") {
    // Dynamically import to avoid SSR issues with createBrowserClient
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    token = session?.access_token;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}
