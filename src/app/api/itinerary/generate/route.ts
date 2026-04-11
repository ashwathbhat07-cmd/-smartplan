import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/ai/gemini";
import { checkAuth, checkOrigin } from "@/lib/api-auth";
import { sanitizeInput, sanitizeNumber } from "@/lib/api-sanitize";

export async function POST(request: Request) {
  try {
    const originOk = await checkOrigin();
    if (!originOk) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { authenticated } = await checkAuth();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized — please sign in to generate itineraries" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    const body = await request.json();
    const destination = sanitizeInput(body.destination);
    const country = sanitizeInput(body.country);
    const budget = sanitizeNumber(body.budget, 100, 10000000, 15000);
    const duration = sanitizeNumber(body.duration, 1, 30, 3);
    const vibe = sanitizeInput(body.vibe);
    const travelers = sanitizeNumber(body.travelers, 1, 50, 1);

    if (!destination || !country || !vibe) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const itinerary = await generateItinerary({
      destination,
      country,
      budget,
      duration,
      vibe,
      travelers,
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
