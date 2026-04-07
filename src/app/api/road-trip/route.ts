import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { checkAuth } from "@/lib/api-auth";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    // const { authenticated } = await checkAuth();
    // if (!authenticated) {
      // return NextResponse.json({ error: "Unauthorized" // }, { status: 401 });

    const { from, to, country } = await request.json();

    const prompt = `You are a road trip expert in ${country || "India"}. Plan pit stops for a drive from ${from} to ${to}.

List 5-8 interesting stops along the route. For each stop include:
- Real place names (restaurants, viewpoints, temples, waterfalls, dhabas)
- Approximate distance from the starting point
- What makes it worth stopping
- Estimated time to spend there

Respond as JSON (no markdown):
{
  "route_summary": "Brief route description with total distance and time",
  "stops": [
    {
      "name": "Stop name",
      "type": "food | viewpoint | temple | waterfall | town | fuel | photo_spot",
      "description": "Why stop here (1-2 sentences)",
      "distance_from_start": "120 km",
      "time_to_spend": "30 mins",
      "must_try": "Specific thing to try (dish, view, activity)"
    }
  ],
  "driving_tips": ["2-3 driving tips for this route"]
}`;

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
      return NextResponse.json({
        route_summary: `Drive from ${from} to ${to}`,
        stops: [],
        driving_tips: ["Check road conditions before starting", "Carry extra water and snacks"],
      });
    }
  } catch {
    return NextResponse.json({ error: "Failed to plan road trip" }, { status: 500 });
  }
}
