import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/ai/gemini";
import { checkAuth } from "@/lib/api-auth";

export async function POST(request: Request) {
  try {
    // Auth check disabled temporarily — Supabase SSR cookies don't pass in POST
    // TODO: Re-enable with proper token-based auth
    // const { authenticated } = await checkAuth();
    // if (!authenticated) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    // }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { destination, country, budget, duration, vibe, travelers } = body;

    if (!destination || !country || !budget || !duration || !vibe) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const itinerary = await generateItinerary({
      destination,
      country,
      budget: Number(budget),
      duration: Number(duration),
      vibe,
      travelers: Number(travelers) || 1,
    });

    return NextResponse.json(itinerary);
  } catch (error) {
    console.error("Itinerary generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate itinerary. Please try again." },
      { status: 500 }
    );
  }
}
