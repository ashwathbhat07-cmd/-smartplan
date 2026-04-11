import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface GeneratedItinerary {
  title: string;
  summary: string;
  days: GeneratedDay[];
  tips: string[];
  estimatedTotal: number;
}

export interface GeneratedDay {
  dayNumber: number;
  title: string;
  activities: GeneratedActivity[];
}

export interface GeneratedActivity {
  time: string;
  title: string;
  description: string;
  costEstimate: number;
  location: string;
  type: "food" | "sightseeing" | "transport" | "stay" | "activity" | "shopping";
  hiddenGem?: boolean;
}

export async function generateItinerary(params: {
  destination: string;
  country: string;
  budget: number;
  duration: number;
  vibe: string;
  travelers: number;
}): Promise<GeneratedItinerary> {
  const { destination, country, budget, duration, vibe, travelers } = params;

  const prompt = `You are an expert travel planner. Generate a detailed ${duration}-day itinerary for ${destination}, ${country}.

TRAVELER DETAILS:
- Budget: ₹${budget.toLocaleString("en-IN")} total for ${travelers} person(s)
- Daily budget: ~₹${Math.round(budget / duration).toLocaleString("en-IN")}/day
- Vibe: ${vibe}
- Duration: ${duration} days

RULES:
1. Stay WITHIN the budget. Include estimated costs for everything.
2. Include 4-6 activities per day with realistic timings.
3. Include 1 "hidden gem" per day — a spot most tourists miss but locals love. Mark it.
4. Include meals (breakfast, lunch, dinner) with specific restaurant/food suggestions.
5. Include transport between locations.
6. Match the "${vibe}" vibe — if adventure, more outdoor activities; if foodie, more food spots; etc.
7. Be specific — use real place names, real restaurants, real costs in INR.
8. First activity should start after breakfast, last activity should end by 9 PM.

RESPOND IN THIS EXACT JSON FORMAT (no markdown, no code blocks, just raw JSON):
{
  "title": "A short catchy title for the trip",
  "summary": "2-3 sentence trip summary",
  "days": [
    {
      "dayNumber": 1,
      "title": "Short day theme like 'Old City & Street Food'",
      "activities": [
        {
          "time": "8:00 AM",
          "title": "Activity name",
          "description": "1-2 sentence description with tips",
          "costEstimate": 200,
          "location": "Specific location name",
          "type": "food",
          "hiddenGem": false
        }
      ]
    }
  ],
  "tips": ["3-5 practical travel tips specific to ${destination}"],
  "estimatedTotal": 12000
}`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Parse JSON — handle potential markdown wrapping and edge cases
  let cleaned = text.trim();

  // Strip markdown code blocks (various formats)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?\s*```\s*$/, "");
  }

  // Try to extract JSON object if there's extra text before/after
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Remove trailing commas before } or ] (common Gemini mistake)
  cleaned = cleaned.replace(/,\s*([}\]])/g, "$1");

  try {
    const parsed: GeneratedItinerary = JSON.parse(cleaned);
    return parsed;
  } catch {
    throw new Error("Failed to parse AI response. Please try again.");
  }
}
