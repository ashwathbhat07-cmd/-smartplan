"use client";

import { useState } from "react";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";
import { authFetch } from "@/lib/api-fetch";
import { destinations } from "@/lib/data/destinations";
import Link from "next/link";

interface BudgetOptionsProps {
  destination: Destination;
  budget: number;
  duration: number;
  vibes: string[];
}

export function BudgetOptions({
  destination,
  budget,
  duration,
  vibes,
}: BudgetOptionsProps) {
  const estimatedTotal = destination.avg_daily_cost * duration;
  const overBy = estimatedTotal - budget;
  const isOver = overBy > 0;

  const [stretchTips, setStretchTips] = useState<string[] | null>(null);
  const [loadingTips, setLoadingTips] = useState(false);

  if (!isOver) return null;

  // Calculate shorter trip that fits budget
  const fittingDays = Math.floor(budget / destination.avg_daily_cost);

  // Find similar but cheaper destinations
  const similarCheaper = destinations
    .filter((d) => {
      if (d.id === destination.id) return false;
      const hasVibeMatch = d.vibes.some((v) => vibes.includes(v));
      const isCheaper = d.avg_daily_cost * duration <= budget;
      return hasVibeMatch && isCheaper;
    })
    .sort((a, b) => {
      // Sort by vibe overlap count (more matches = better)
      const aMatches = a.vibes.filter((v) => vibes.includes(v)).length;
      const bMatches = b.vibes.filter((v) => vibes.includes(v)).length;
      return bMatches - aMatches;
    })
    .slice(0, 3);

  const handleStretchBudget = async () => {
    setLoadingTips(true);
    try {
      const res = await authFetch("/api/itinerary/stretch-tips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.name,
          country: destination.country,
          budget,
          estimatedTotal,
          overBy,
          duration,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setStretchTips(data.tips);
      }
    } catch {
      setStretchTips([
        "Stay in hostels or budget guesthouses instead of hotels",
        "Eat at local street food stalls and dhabas",
        "Use public transport instead of taxis",
        "Visit free attractions and temples",
        "Travel during off-season for lower prices",
      ]);
    } finally {
      setLoadingTips(false);
    }
  };

  const searchParams = new URLSearchParams({
    budget: budget.toString(),
    duration: duration.toString(),
    vibes: vibes.join(","),
    travelers: "1",
    region: destination.region,
  });

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-xl">
          💡
        </div>
        <div>
          <h3 className="font-semibold text-amber-400">
            Over budget by {formatBudget(overBy)}
          </h3>
          <p className="text-xs text-zinc-500">
            {formatBudget(estimatedTotal)} estimated vs {formatBudget(budget)}{" "}
            budget
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-400 mb-5">
        Don&apos;t give up on {destination.name}! Here are your options:
      </p>

      <div className="space-y-3">
        {/* Option 1: Stretch Budget */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <span className="text-green-400">1.</span> Stretch your budget
            </h4>
            <button
              onClick={handleStretchBudget}
              disabled={loadingTips || stretchTips !== null}
              className="px-3 py-1 text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg hover:bg-green-500/20 transition-all disabled:opacity-50"
            >
              {loadingTips
                ? "Loading..."
                : stretchTips
                  ? "Tips loaded ✓"
                  : "Show me how"}
            </button>
          </div>
          <p className="text-xs text-zinc-500">
            AI-powered tips to make {destination.name} work within{" "}
            {formatBudget(budget)}
          </p>

          {stretchTips && (
            <ul className="mt-3 space-y-1.5">
              {stretchTips.map((tip, i) => (
                <li
                  key={i}
                  className="text-sm text-zinc-400 flex items-start gap-2"
                >
                  <span className="text-green-400 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Option 2: Shorter Trip */}
        {fittingDays >= 2 && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span className="text-indigo-400">2.</span> Go for a shorter
                  trip
                </h4>
                <p className="text-xs text-zinc-500 mt-1">
                  {fittingDays} days fits your {formatBudget(budget)} budget
                  perfectly (
                  {formatBudget(destination.avg_daily_cost * fittingDays)}{" "}
                  estimated)
                </p>
              </div>
              <Link
                href={`/explore/${destination.id}?${new URLSearchParams({
                  budget: budget.toString(),
                  duration: fittingDays.toString(),
                  vibes: vibes.join(","),
                  travelers: "1",
                  region: destination.region,
                }).toString()}`}
                className="px-3 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/20 transition-all flex-shrink-0"
              >
                Plan {fittingDays} days
              </Link>
            </div>
          </div>
        )}

        {/* Option 3: Similar but cheaper */}
        {similarCheaper.length > 0 && (
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <h4 className="font-medium text-sm flex items-center gap-2 mb-3">
              <span className="text-teal-400">3.</span> Similar destinations
              within budget
            </h4>
            <div className="space-y-2">
              {similarCheaper.map((alt) => {
                const altTotal = alt.avg_daily_cost * duration;
                const matchingVibes = alt.vibes.filter((v) =>
                  vibes.includes(v)
                );
                return (
                  <Link
                    key={alt.id}
                    href={`/explore/${alt.id}?${searchParams.toString()}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-zinc-800/50 transition-colors group"
                  >
                    <img
                      src={alt.image_url}
                      alt={alt.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium group-hover:text-teal-400 transition-colors">
                        {alt.name}
                      </div>
                      <div className="text-xs text-zinc-500 flex gap-2">
                        <span className="text-teal-400">
                          {formatBudget(altTotal)}
                        </span>
                        <span>•</span>
                        <span>{matchingVibes.join(", ")}</span>
                      </div>
                    </div>
                    <span className="text-xs text-green-400">
                      Saves {formatBudget(estimatedTotal - altTotal)}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
