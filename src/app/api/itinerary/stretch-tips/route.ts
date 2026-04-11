import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth, checkOrigin } from "@/lib/api-auth";
import { sanitizeInput, sanitizeNumber } from "@/lib/api-sanitize";

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
    const budget = sanitizeNumber(body.budget, 100, 10000000, 15000);
    const estimatedTotal = sanitizeNumber(body.estimatedTotal, 100, 10000000, 20000);
    const overBy = sanitizeNumber(body.overBy, 0, 10000000, 5000);
    const duration = sanitizeNumber(body.duration, 1, 30, 3);

    const prompt = `You are a budget travel expert for ${destination}, ${country}.

A traveler has a budget of ₹${budget.toLocaleString()} for ${duration} days, but the estimated cost is ₹${estimatedTotal.toLocaleString()} (₹${overBy.toLocaleString()} over budget).

Give exactly 5 specific, actionable money-saving tips for ${destination}. Each tip must:
1. Be specific to ${destination} (mention real places, areas, options)
2. Include the approximate amount saved in INR
3. Be practical and realistic

Respond as a JSON array of 5 strings. No markdown, just raw JSON array.
Example: ["Stay in Anjuna hostels instead of Baga hotels — save ₹1,500/night", ...]`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let cleaned = text;
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    try {
      const tips = JSON.parse(cleaned);
      return NextResponse.json({ tips });
    } catch {
      return NextResponse.json({
        tips: [
          `Stay in budget hostels or guesthouses in ${destination} — save ₹1,000-2,000/night`,
          `Eat at local street food stalls instead of restaurants — save ₹500-800/day`,
          `Use public transport or shared rides instead of private taxis`,
          `Visit free attractions, temples, and nature spots`,
          `Travel during shoulder season for 20-30% lower prices`,
        ],
      });
    }
  } catch {
    return NextResponse.json(
      { error: "Failed to generate tips" },
      { status: 500 }
    );
  }
}
