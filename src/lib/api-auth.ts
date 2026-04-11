import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export async function checkAuth(): Promise<{ authenticated: boolean; userId?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return { authenticated: true, userId: user.id };
    }
  } catch {
    // Auth check failed
  }
  return { authenticated: false };
}

/**
 * Verify the request origin to prevent CSRF attacks.
 * Returns true if the origin is allowed, false otherwise.
 */
export async function checkOrigin(): Promise<boolean> {
  try {
    const headersList = await headers();
    const origin = headersList.get("origin");
    const referer = headersList.get("referer");

    // Allow if no origin (same-origin requests in some browsers)
    if (!origin && !referer) return true;

    const allowedHosts = [
      "smartplan-khaki.vercel.app",
      "localhost",
      "127.0.0.1",
    ];

    const checkHost = (url: string) => {
      try {
        const parsed = new URL(url);
        return allowedHosts.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`));
      } catch {
        return false;
      }
    };

    if (origin && checkHost(origin)) return true;
    if (referer && checkHost(referer)) return true;

    return false;
  } catch {
    return true; // fail open for development
  }
}
