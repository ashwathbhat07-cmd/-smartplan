import { NextResponse } from "next/server";
import { generateItinerary } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { destination, country, budget, duration, vibe, travelers } = body;

    if (!destination || !budget || !duration || !vibe) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const itinerary = await generateItinerary({
      destination,
      country: country || "India",
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
