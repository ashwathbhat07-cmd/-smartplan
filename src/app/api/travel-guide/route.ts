import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // const { authenticated } = await checkAuth();
    // if (!authenticated) {
      // return NextResponse.json({ error: "Unauthorized" // }, { status: 401 });

    const { destination, country, month } = await request.json();
    const monthName = new Date(2026, (month || new Date().getMonth()) - 1).toLocaleString("en", { month: "long" });

    const prompt = `You are a comprehensive travel guide for ${destination}, ${country}. Provide practical info for Indian tourists visiting in ${monthName}.

Respond as JSON (no markdown):
{
  "health": {
    "vaccines": ["Required/recommended vaccines"],
    "water_safety": "safe" or "boil" or "bottled_only",
    "food_safety": "safe" or "be_careful" or "strict_caution",
    "pharmacy_tip": "Where to find pharmacies and what to carry"
  },
  "transport": {
    "from_airport": "How to get from airport to city center with costs in INR",
    "within_city": ["3-4 transport options ranked cheapest to most expensive"],
    "apps": ["Ride-hailing apps that work here (Ola/Uber/Grab/etc)"]
  },
  "phrases": [
    {"local": "Local phrase", "english": "English meaning", "pronunciation": "How to say it"}
  ],
  "festivals": ["Events/festivals happening in ${monthName} in ${destination}, or 'None this month' if none"],
  "connectivity": {
    "wifi": "WiFi availability description",
    "charging": "Power plug type + voltage",
    "signal": "Mobile signal quality in remote areas"
  },
  "photography": {
    "golden_hour": "Best time for photos morning and evening",
    "top_spots": ["3 most photogenic locations with tips"]
  },
  "souvenirs": [
    {"item": "Souvenir name", "price": "Price in INR", "where": "Where to buy"}
  ]
}

Give 5-8 phrases. Give 3-4 souvenirs. Be specific with real place names and INR prices.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      return NextResponse.json(JSON.parse(cleaned));
    } catch {
      return NextResponse.json(getDefaultGuide(destination));
    }
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

function getDefaultGuide(dest: string) {
  return {
    health: { vaccines: ["Check with your doctor"], water_safety: "bottled_only", food_safety: "be_careful", pharmacy_tip: "Carry basic medicines from India" },
    transport: { from_airport: "Check local taxi/bus options", within_city: ["Local bus", "Auto/rickshaw", "Taxi app"], apps: ["Uber", "Local apps"] },
    phrases: [
      { local: "Hello", english: "Hello", pronunciation: "Hello" },
      { local: "Thank you", english: "Thank you", pronunciation: "Thank you" },
    ],
    festivals: [`Check local events calendar for ${dest}`],
    connectivity: { wifi: "Available in hotels and cafes", charging: "Check plug type", signal: "Varies in remote areas" },
    photography: { golden_hour: "6:00-6:30 AM and 5:30-6:00 PM", top_spots: ["Check local guides for photo spots"] },
    souvenirs: [{ item: "Local handicraft", price: "Varies", where: "Local market" }],
  };
}
