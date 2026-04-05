"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState, Suspense } from "react";
import { findDestinations, formatBudget } from "@/lib/engine/budget-engine";
import { DestinationCard } from "@/components/trip/destination-card";
import type { OnboardingData, Vibe } from "@/types";
import Link from "next/link";

function ExploreContent() {
  const searchParams = useSearchParams();
  const [sortBy, setSortBy] = useState<"score" | "price-low" | "price-high">("score");

  const preferences: OnboardingData = useMemo(
    () => ({
      budget: parseInt(searchParams.get("budget") || "15000"),
      duration: parseInt(searchParams.get("duration") || "3"),
      vibe: (searchParams.get("vibe") || "adventure") as Vibe,
      startDate: searchParams.get("startDate") || null,
      travelers: parseInt(searchParams.get("travelers") || "1"),
      region: (searchParams.get("region") || "both") as OnboardingData["region"],
    }),
    [searchParams]
  );

  const results = useMemo(() => {
    const base = findDestinations(preferences);
    if (sortBy === "price-low")
      return [...base].sort((a, b) => a.estimatedTotal - b.estimatedTotal);
    if (sortBy === "price-high")
      return [...base].sort((a, b) => b.estimatedTotal - a.estimatedTotal);
    return base; // already sorted by score
  }, [preferences, sortBy]);

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              Your <span className="gradient-text">Matches</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              {results.length} destinations match your{" "}
              <span className="text-indigo-400">{formatBudget(preferences.budget)}</span>{" "}
              budget for{" "}
              <span className="text-teal-400">{preferences.duration} days</span>{" "}
              of{" "}
              <span className="text-amber-400 capitalize">{preferences.vibe}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/trip/new"
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all"
            >
              Change Preferences
            </Link>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 text-sm bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 focus:outline-none focus:border-indigo-500"
            >
              <option value="score">Best Match</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1">Budget</div>
            <div className="text-lg font-bold text-indigo-400">
              {formatBudget(preferences.budget)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1">Duration</div>
            <div className="text-lg font-bold text-teal-400">
              {preferences.duration} days
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1">Vibe</div>
            <div className="text-lg font-bold text-amber-400 capitalize">
              {preferences.vibe}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-xs text-zinc-500 mb-1">Matches</div>
            <div className="text-lg font-bold text-green-400">
              {results.length}
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((result) => (
              <DestinationCard key={result.destination.id} result={result} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">😔</div>
            <h2 className="text-xl font-bold mb-2">No matches found</h2>
            <p className="text-zinc-400 mb-6">
              Try increasing your budget or changing your vibe.
            </p>
            <Link
              href="/trip/new"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all"
            >
              Try Different Preferences
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-zinc-500">Finding your perfect destinations...</div>
        </div>
      }
    >
      <ExploreContent />
    </Suspense>
  );
}
