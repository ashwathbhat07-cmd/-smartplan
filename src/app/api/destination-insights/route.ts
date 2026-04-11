import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth, checkOrigin } from "@/lib/api-auth";
import { sanitizeInput } from "@/lib/api-sanitize";

export async function POST(request: Request) {
  try {
    if (!(await checkOrigin())) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { authenticated } = await checkAuth();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const body = await request.json();
    const destination = sanitizeInput(body.destination);
    const country = sanitizeInput(body.country);

    const prompt = `You are a travel expert. Provide insider knowledge about ${destination}, ${country} for Indian tourists.

Respond as JSON (no markdown):
{
  "insider_tips": [
    "5 things nobody tells you about ${destination} — specific, practical, from experience"
  ],
  "scam_alerts": [
    "3-4 common tourist scams in ${destination} with how to avoid them"
  ],
  "food_guide": {
    "must_try": ["5 dishes with name, description, and price range in INR"],
    "avoid": ["2 food traps tourists fall for"],
    "vegetarian_tip": "tip for vegetarian travelers"
  },
  "customs": [
    "4-5 cultural do's and don'ts — specific to ${destination}"
  ],
  "haggling": "Bargaining guide — where to haggle, how much to offer, where NOT to haggle",
  "best_kept_secret": "One place/experience in ${destination} that only locals know about"
}

Be specific. Use real place names, real prices in INR, real scam descriptions. No generic advice.`;

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
      return NextResponse.json(getDefaultInsights(destination));
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to get insights" },
      { status: 500 }
    );
  }
}

function getDefaultInsights(destination: string) {
  return {
    insider_tips: [
      `Research ${destination} thoroughly before visiting`,
      "Download offline maps — you'll need them",
      "Carry cash in small denominations",
      "Learn 5 basic local phrases",
      "Book accommodations in advance during peak season",
    ],
    scam_alerts: [
      "Be wary of unsolicited tour guides at tourist spots",
      "Always agree on taxi fare before getting in",
      "Check restaurant bills carefully for hidden charges",
    ],
    food_guide: {
      must_try: [
        `Local specialty of ${destination} — ask your hotel for recommendations`,
      ],
      avoid: ["Tourist-trap restaurants near major attractions"],
      vegetarian_tip: "Look for dedicated vegetarian restaurants or ask specifically",
    },
    customs: [
      "Dress modestly at religious sites",
      "Ask permission before photographing locals",
      "Learn basic greeting in local language",
      "Respect local customs and traditions",
    ],
    haggling: "Haggling is common in markets. Start at 40-50% of asking price. Be friendly, not aggressive.",
    best_kept_secret: `Ask your hotel staff or local guides for hidden gems in ${destination} — they know spots tourists never find.`,
  };
}
