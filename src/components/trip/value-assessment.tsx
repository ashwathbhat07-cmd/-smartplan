"use client";

import { useState } from "react";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface AssessmentData {
  verdict: "excellent" | "good" | "fair" | "poor";
  score: number;
  summary: string;
  pros: string[];
  cons: string[];
  better_alternative: string;
  money_tip: string;
}

const verdictConfig = {
  excellent: { label: "Excellent Value", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", emoji: "🤩" },
  good: { label: "Good Value", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", emoji: "👍" },
  fair: { label: "Fair Value", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", emoji: "🤔" },
  poor: { label: "Overpriced", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", emoji: "😬" },
};

interface ValueAssessmentProps {
  destination: Destination;
  budget: number;
  duration: number;
}

export function ValueAssessment({ destination, budget, duration }: ValueAssessmentProps) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAssess = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/value-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.name,
          country: destination.country,
          budget,
          duration,
          avgDailyCost: destination.avg_daily_cost,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAssessment(data);
      }
    } catch {
      // Fallback
      const ratio = (destination.avg_daily_cost * duration) / budget;
      setAssessment({
        verdict: ratio <= 0.6 ? "excellent" : ratio <= 0.9 ? "good" : ratio <= 1.1 ? "fair" : "poor",
        score: Math.max(20, Math.round(100 - ratio * 60)),
        summary: `${destination.name} at ${formatBudget(budget)} for ${duration} days is ${ratio <= 0.9 ? "a solid choice" : "on the expensive side"}.`,
        pros: [`${destination.vibes.length} different vibes to experience`, `${destination.activities.length} activities available`],
        cons: ratio > 1 ? ["Slightly over your budget"] : ["Can't think of any — go for it!"],
        better_alternative: "Check the Compare page to see alternatives",
        money_tip: "Travel during shoulder season for 20-30% savings",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!assessment) {
    return (
      <button
        onClick={handleAssess}
        disabled={loading}
        className="w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-amber-500/30 bg-zinc-900/30 hover:bg-amber-500/5 transition-all text-center"
      >
        <span className="text-2xl block mb-2">💎</span>
        <span className="text-sm font-medium text-zinc-400">
          {loading ? "Analyzing value..." : `Is ${destination.name} worth ${formatBudget(budget)}?`}
        </span>
        <span className="text-xs text-zinc-600 block mt-1">
          AI-powered honest value assessment
        </span>
      </button>
    );
  }

  const config = verdictConfig[assessment.verdict];

  return (
    <div className={`p-5 rounded-2xl ${config.bg} border ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          💎 Value Assessment
        </h3>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${config.bg} border ${config.border}`}>
          <span>{config.emoji}</span>
          <span className={`text-sm font-bold ${config.color}`}>{config.label}</span>
        </div>
      </div>

      <p className="text-sm text-zinc-300 mb-4">{assessment.summary}</p>

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <div>
          <h4 className="text-xs font-semibold text-green-400 mb-2">✓ Pros</h4>
          <ul className="space-y-1.5">
            {assessment.pros.map((pro, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-green-400">+</span> {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-red-400 mb-2">✕ Cons</h4>
          <ul className="space-y-1.5">
            {assessment.cons.map((con, i) => (
              <li key={i} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-red-400">-</span> {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {assessment.better_alternative && (
        <div className="p-3 rounded-lg bg-zinc-900/50 mb-3">
          <p className="text-xs text-zinc-500">
            💡 <strong className="text-zinc-400">Alternative:</strong>{" "}
            {assessment.better_alternative}
          </p>
        </div>
      )}

      {assessment.money_tip && (
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-xs text-amber-400">
            💰 <strong>Money tip:</strong> {assessment.money_tip}
          </p>
        </div>
      )}
    </div>
  );
}
