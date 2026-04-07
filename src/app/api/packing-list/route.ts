import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // const { authenticated } = await checkAuth();
    // if (!authenticated) {
      // return NextResponse.json({ error: "Unauthorized" // }, { status: 401 });

    const { destination, country, duration, vibes, weather } =
      await request.json();

    const prompt = `Generate a smart packing list for a ${duration}-day trip to ${destination}, ${country}.

Trip vibes: ${vibes}
${weather ? `Current weather: ${weather}` : ""}

Create a categorized packing list. Be specific to ${destination} — include items unique to this destination.

Respond as JSON (no markdown):
{
  "essentials": ["passport", "phone charger", ...],
  "clothing": ["light t-shirts", ...],
  "toiletries": ["sunscreen SPF 50", ...],
  "gear": ["hiking shoes", ...],
  "destination_specific": ["temple-appropriate clothing", ...],
  "tip": "One pro packing tip specific to ${destination}"
}`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      const list = JSON.parse(cleaned);
      return NextResponse.json(list);
    } catch {
      return NextResponse.json(getDefaultList(destination));
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate packing list" },
      { status: 500 }
    );
  }
}

function getDefaultList(destination: string) {
  return {
    essentials: [
      "ID/Passport",
      "Phone + charger",
      "Cash + cards",
      "Travel insurance docs",
      "Tickets/bookings printout",
    ],
    clothing: [
      "3-4 t-shirts",
      "2 pants/shorts",
      "Underwear & socks",
      "Light jacket",
      "Comfortable walking shoes",
    ],
    toiletries: [
      "Sunscreen",
      "Toothbrush & paste",
      "Face wash",
      "Moisturizer",
      "Personal medications",
    ],
    gear: [
      "Backpack/daypack",
      "Water bottle",
      "Sunglasses",
      "Power bank",
      "Earphones",
    ],
    destination_specific: [
      `Appropriate clothing for ${destination}`,
      "Local currency",
      "Travel adapter if needed",
    ],
    tip: `Research local customs and dress codes for ${destination} before packing.`,
  };
}
