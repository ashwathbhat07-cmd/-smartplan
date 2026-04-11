import { createClient } from "@/lib/supabase/client";
import type { GeneratedItinerary } from "@/lib/ai/gemini";
import type { Vibe } from "@/types";

async function ensureProfile(supabase: ReturnType<typeof createClient>, user: { id: string; email?: string; user_metadata?: Record<string, string> }) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: user.id,
      email: user.email || "",
      full_name: user.user_metadata?.full_name || null,
      avatar_url: user.user_metadata?.avatar_url || null,
    });
  }
}

export async function saveTrip(params: {
  destinationId: string;
  title: string;
  budget: number;
  duration: number;
  vibe: Vibe;
  startDate: string | null;
  travelers: number;
  itinerary: GeneratedItinerary;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // 1. Create trip
  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      destination_id: params.destinationId,
      title: params.title,
      budget: params.budget,
      duration_days: params.duration,
      vibe: params.vibe,
      start_date: params.startDate,
      travelers: params.travelers,
      status: "planning",
    })
    .select()
    .single();

  if (tripError) throw tripError;

  // 2. Create itinerary days and activities
  try {
    // Insert all days in a single batch
    const dayInserts = params.itinerary.days.map((day) => ({
      trip_id: trip.id,
      day_number: day.dayNumber,
      title: day.title,
    }));

    const { data: dayRows, error: dayError } = await supabase
      .from("itinerary_days")
      .insert(dayInserts)
      .select();

    if (dayError) throw dayError;
    if (!dayRows) throw new Error("Failed to create itinerary days");

    // Insert all activities in a single batch
    const allActivities = params.itinerary.days.flatMap((day) => {
      const dayRow = dayRows.find((r) => r.day_number === day.dayNumber);
      if (!dayRow) return [];
      return day.activities.map((activity, index) => ({
        day_id: dayRow.id,
        sort_order: index,
        time: activity.time,
        title: activity.title,
        description: activity.description,
        cost_estimate: activity.costEstimate,
        location: activity.location,
      }));
    });

    if (allActivities.length > 0) {
      const { error: actError } = await supabase
        .from("itinerary_activities")
        .insert(allActivities);

      if (actError) throw actError;
    }
  } catch (err) {
    // Cleanup: delete the trip if itinerary creation fails
    await supabase.from("trips").delete().eq("id", trip.id);
    throw err;
  }

  return trip;
}

export async function getUserTrips() {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("trips")
    .select("*, destinations(*)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTripWithItinerary(tripId: string) {
  const supabase = createClient();

  const { data: trip, error: tripError } = await supabase
    .from("trips")
    .select("*, destinations(*)")
    .eq("id", tripId)
    .single();

  if (tripError) throw tripError;

  const { data: days, error: daysError } = await supabase
    .from("itinerary_days")
    .select("*, itinerary_activities(*)")
    .eq("trip_id", tripId)
    .order("day_number");

  if (daysError) throw daysError;

  return { trip, days };
}
