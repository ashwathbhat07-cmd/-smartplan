import { createClient } from "@/lib/supabase/server";

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
