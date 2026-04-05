"use client";

import type { MatchResult } from "@/lib/engine/budget-engine";
import { formatBudget } from "@/lib/engine/budget-engine";
import Link from "next/link";

const budgetFitColors = {
  perfect: { bg: "bg-green-500/10", text: "text-green-400", label: "Perfect Fit" },
  comfortable: { bg: "bg-teal-500/10", text: "text-teal-400", label: "Under Budget" },
  tight: { bg: "bg-amber-500/10", text: "text-amber-400", label: "Tight Fit" },
  over: { bg: "bg-red-500/10", text: "text-red-400", label: "Over Budget" },
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
};

const scoreGradient = (score: number) => {
  if (score >= 80) return "from-green-500 to-teal-500";
  if (score >= 60) return "from-amber-500 to-orange-500";
  return "from-red-500 to-pink-500";
};

export function DestinationCard({ result }: { result: MatchResult }) {
  const { destination: dest, score, breakdown, estimatedTotal, budgetFit } = result;
  const fit = budgetFitColors[budgetFit];

  return (
    <div className="group relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl overflow-hidden hover:border-zinc-700/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={dest.image_url}
          alt={dest.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

        {/* Match Score Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50">
          <div
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${scoreGradient(score)}`}
          />
          <span className={`text-sm font-bold ${scoreColor(score)}`}>
            {score}%
          </span>
        </div>

        {/* Region Badge */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-zinc-900/80 backdrop-blur-sm text-xs font-medium text-zinc-300 border border-zinc-700/50">
          {dest.region === "domestic" ? "🇮🇳 India" : "🌍 International"}
        </div>

        {/* Budget Fit */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold ${fit.bg} ${fit.text}`}
          >
            {fit.label}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold group-hover:text-indigo-400 transition-colors">
              {dest.name}
            </h3>
            <p className="text-sm text-zinc-500">{dest.country}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-teal-400">
              {formatBudget(estimatedTotal)}
            </p>
            <p className="text-xs text-zinc-500">estimated total</p>
          </div>
        </div>

        <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
          {dest.description}
        </p>

        {/* Vibes */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dest.vibes.map((vibe) => (
            <span
              key={vibe}
              className="px-2 py-0.5 text-xs rounded-md bg-zinc-800/80 text-zinc-400 capitalize"
            >
              {vibe}
            </span>
          ))}
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Budget", value: breakdown.budgetScore, emoji: "💰" },
            { label: "Vibe", value: breakdown.vibeScore, emoji: "✨" },
            { label: "Season", value: breakdown.seasonScore, emoji: "📅" },
          ].map((item) => (
            <div
              key={item.label}
              className="text-center p-2 rounded-lg bg-zinc-800/30"
            >
              <div className="text-xs text-zinc-500 mb-0.5">
                {item.emoji} {item.label}
              </div>
              <div className={`text-sm font-bold ${scoreColor(item.value)}`}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <Link
          href={`/explore/${dest.id}`}
          className="block w-full text-center py-2.5 rounded-xl bg-indigo-600/10 text-indigo-400 text-sm font-medium border border-indigo-500/20 hover:bg-indigo-600/20 hover:border-indigo-500/40 transition-all duration-200"
        >
          View Details & Plan Trip
        </Link>
      </div>
    </div>
  );
}
