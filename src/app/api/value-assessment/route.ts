import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { authenticated } = await checkAuth();
    if (!authenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { destination, country, budget, duration, avgDailyCost } =
      await request.json();

    const prompt = `You are an honest travel advisor. An Indian traveler wants to visit ${destination}, ${country} for ${duration} days with a budget of ₹${budget.toLocaleString()}.

The average daily cost there is ₹${avgDailyCost.toLocaleString()}.

Give an honest, specific assessment. Don't sugarcoat — if it's overpriced, say so. If it's great value, explain why.

Respond as JSON (no markdown):
{
  "verdict": "excellent" or "good" or "fair" or "poor",
  "score": 0-100 (value for money score),
  "summary": "2-3 sentence honest summary",
  "pros": ["3-4 specific reasons why this trip is worth it"],
  "cons": ["2-3 specific drawbacks or concerns"],
  "better_alternative": "If the verdict is fair/poor, suggest a specific alternative destination with similar vibes but better value. If excellent/good, say why this is already the best choice.",
  "money_tip": "One specific tip to get more value from this budget at ${destination}"
}`;

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
      const ratio = (avgDailyCost * duration) / budget;
      return NextResponse.json({
        verdict: ratio <= 0.6 ? "excellent" : ratio <= 0.9 ? "good" : ratio <= 1.1 ? "fair" : "poor",
        score: Math.max(20, Math.round(100 - ratio * 60)),
        summary: `Based on the numbers, ${destination} at ₹${budget.toLocaleString()} for ${duration} days ${ratio <= 0.9 ? "offers good value" : "might stretch your budget"}.`,
        pros: ["Rich cultural experience", "Great food scene"],
        cons: ratio > 1 ? ["Over budget — consider shorter trip"] : ["Peak season prices may vary"],
        better_alternative: "Use the Compare feature to find alternatives",
        money_tip: "Book accommodations early for best rates",
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to assess" }, { status: 500 });
  }
}
