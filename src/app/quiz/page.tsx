"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import type { Vibe } from "@/types";

const questions = [
  {
    q: "Your ideal morning starts with...",
    options: [
      { text: "Sunrise trek to a mountain peak", vibes: ["adventure", "nature"] },
      { text: "Sleeping in, then a lazy brunch", vibes: ["relaxation", "foodie"] },
      { text: "Exploring ancient temples", vibes: ["cultural", "spiritual"] },
      { text: "Shopping at local markets", vibes: ["urban", "foodie"] },
    ],
  },
  {
    q: "Pick your dream accommodation",
    options: [
      { text: "A tent under the stars", vibes: ["adventure", "offbeat"] },
      { text: "Overwater villa with a view", vibes: ["romantic", "relaxation"] },
      { text: "A heritage haveli in the old town", vibes: ["cultural", "romantic"] },
      { text: "Hostel with a rooftop party", vibes: ["party", "urban"] },
    ],
  },
  {
    q: "Your travel photos are mostly...",
    options: [
      { text: "Mountains, lakes, and sunsets", vibes: ["nature", "adventure"] },
      { text: "Food close-ups and cafe aesthetics", vibes: ["foodie", "urban"] },
      { text: "Ancient architecture and street life", vibes: ["cultural", "offbeat"] },
      { text: "Beach selfies and pool vibes", vibes: ["party", "relaxation"] },
    ],
  },
  {
    q: "The best travel memory is...",
    options: [
      { text: "Getting lost in a village nobody visits", vibes: ["offbeat", "adventure"] },
      { text: "A candlelight dinner with a view", vibes: ["romantic", "foodie"] },
      { text: "Dancing all night at a beach party", vibes: ["party", "relaxation"] },
      { text: "Meditating at a silent retreat", vibes: ["spiritual", "nature"] },
    ],
  },
  {
    q: "Your budget style is...",
    options: [
      { text: "Backpacker — ₹500/day is enough", budget: 5000 },
      { text: "Smart spender — ₹1,500/day sweet spot", budget: 15000 },
      { text: "Comfortable — ₹3,000/day, no compromises", budget: 30000 },
      { text: "Treat yourself — budget is just a number", budget: 80000 },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<typeof destinations[0] | null>(null);

  const handleAnswer = (optIndex: number) => {
    const newAnswers = [...answers, optIndex];
    setAnswers(newAnswers);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      // Calculate result
      const vibeScores: Record<string, number> = {};
      let budget = 15000;

      newAnswers.forEach((ans, qIdx) => {
        const option = questions[qIdx].options[ans];
        if ("vibes" in option) {
          option.vibes.forEach((v) => {
            vibeScores[v] = (vibeScores[v] || 0) + 1;
          });
        }
        if ("budget" in option) {
          budget = option.budget as number;
        }
      });

      // Find top vibes
      const topVibes = Object.entries(vibeScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 2)
        .map(([v]) => v as Vibe);

      // Find matching destination
      const match = destinations
        .filter((d) => d.avg_daily_cost * 3 <= budget * 1.3)
        .sort((a, b) => {
          const aScore = a.vibes.filter((v) => topVibes.includes(v)).length;
          const bScore = b.vibes.filter((v) => topVibes.includes(v)).length;
          return bScore - aScore;
        })[0];

      setResult(match || destinations[0]);
    }
  };

  const handleGoToDest = () => {
    if (!result) return;
    // Calculate sensible duration based on budget
    const lastAnswer = answers[answers.length - 1];
    const budgetOption = questions[questions.length - 1].options[lastAnswer];
    const selectedBudget = "budget" in budgetOption ? (budgetOption.budget as number) : 15000;
    const duration = Math.max(2, Math.min(10, Math.floor(selectedBudget / result.avg_daily_cost)));
    router.push(`/explore/${result.id}?budget=${selectedBudget}&duration=${duration}&vibes=${result.vibes.slice(0, 2).join(",")}&travelers=1&region=${result.region}&diet=none`);
  };

  const handleRetry = () => {
    setCurrent(0);
    setAnswers([]);
    setResult(null);
  };

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {!result ? (
          <div className="animate-slide-in-right" key={current}>
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {questions.map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 rounded-full ${i <= current ? "bg-indigo-500" : "bg-zinc-800"}`} />
              ))}
            </div>

            <h2 className="text-2xl font-bold mb-8">{questions[current].q}</h2>

            <div className="space-y-3">
              {questions[current].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  className="w-full p-5 rounded-xl border border-zinc-700/50 bg-zinc-900/30 hover:bg-indigo-600/5 hover:border-indigo-500/30 transition-all text-left text-sm font-medium text-zinc-300 hover:text-white"
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center animate-scale-in">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Your Perfect Destination</h2>
            <p className="text-zinc-400 mb-6">Based on your personality, you should visit...</p>

            <div className="rounded-2xl overflow-hidden mb-6">
              <img src={result.image_url} alt={result.name} className="w-full h-48 object-cover" />
              <div className="p-5 bg-zinc-900/80 text-left">
                <h3 className="text-2xl font-bold gradient-text mb-1">{result.name}</h3>
                <p className="text-sm text-zinc-400 mb-3">{result.country}</p>
                <p className="text-sm text-zinc-400 mb-3">{result.description}</p>
                <div className="flex gap-2 mb-3">
                  {result.vibes.slice(0, 3).map((v) => (
                    <span key={v} className="px-2 py-0.5 text-xs rounded bg-indigo-500/10 text-indigo-400 capitalize">{v}</span>
                  ))}
                </div>
                <p className="text-teal-400 font-semibold">From {formatBudget(result.avg_daily_cost)}/day</p>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <button onClick={handleGoToDest} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all">
                Plan This Trip →
              </button>
              <button onClick={handleRetry} className="px-6 py-3 border border-zinc-700 hover:border-zinc-500 text-zinc-300 rounded-xl transition-all">
                Retake Quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
