import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // const { authenticated } = await checkAuth();
    // if (!authenticated) {
      // return NextResponse.json({ error: "Unauthorized" // }, { status: 401 });

    const { destination, country } = await request.json();

    const prompt = `Provide practical travel info for Indian tourists visiting ${destination}, ${country}.

Respond as JSON (no markdown):
{
  "sim": [
    { "provider": "Local SIM provider name", "cost": "cost in INR", "data": "data amount", "where": "where to buy" }
  ],
  "internet": "General internet/WiFi availability info",
  "visa": "Visa requirements for Indian passport holders (1-2 sentences)",
  "currency": { "name": "Local currency name", "code": "USD/THB/etc", "rate": "approx rate vs INR" },
  "emergency": { "police": "number", "ambulance": "number", "fire": "number" },
  "plug": "Power plug type and voltage info",
  "tip": "One practical travel tip for Indian tourists in ${country}"
}

Give 2-3 SIM options. Use real provider names and approximate current prices.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      const data = JSON.parse(cleaned);
      return NextResponse.json(data);
    } catch {
      return NextResponse.json(getDefaultInfo(destination, country));
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to get travel info" },
      { status: 500 }
    );
  }
}

function getDefaultInfo(destination: string, country: string) {
  return {
    sim: [
      { provider: "Local prepaid SIM", cost: "~₹500-1000", data: "5-10GB", where: "Airport arrivals" },
      { provider: "International eSIM", cost: "~₹800-1500", data: "5GB", where: "Airalo/Holafly app" },
    ],
    internet: `WiFi available in most hotels and cafes in ${destination}. Download offline maps before going.`,
    visa: `Check visa requirements for ${country} on the Indian MEA website. Some countries offer visa-on-arrival for Indian passports.`,
    currency: { name: "Local currency", code: "---", rate: "Check xe.com for current rates" },
    emergency: { police: "Check locally", ambulance: "Check locally", fire: "Check locally" },
    plug: "Check plug type for " + country + ". Carry a universal adapter.",
    tip: `Download offline Google Maps for ${destination} before your trip — you'll need it.`,
  };
}
