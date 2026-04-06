"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import type { Destination } from "@/types";

export default function SurprisePage() {
  const router = useRouter();
  const [budget, setBudget] = useState(15000);
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState<Destination | null>(null);
  const [displayDest, setDisplayDest] = useState<Destination | null>(null);

  const getMatchingDestinations = useCallback(() => {
    return destinations.filter((d) => d.avg_daily_cost * 3 <= budget * 1.3);
  }, [budget]);

  const handleSurprise = () => {
    const matching = getMatchingDestinations();
    if (matching.length === 0) {
      // Fallback — show cheapest destinations
      const sorted = [...destinations].sort((a, b) => a.avg_daily_cost - b.avg_daily_cost);
      setRevealed(sorted[0]);
      return;
    }

    setSpinning(true);
    setRevealed(null);

    // Slot machine effect — rapidly cycle through destinations
    let count = 0;
    const totalSpins = 20;
    const interval = setInterval(() => {
      const randomDest = matching[Math.floor(Math.random() * matching.length)];
      setDisplayDest(randomDest);
      count++;

      if (count >= totalSpins) {
        clearInterval(interval);
        const winner = matching[Math.floor(Math.random() * matching.length)];
        setDisplayDest(winner);
        setRevealed(winner);
        setSpinning(false);
      }
    }, 100 + count * 15); // Gradually slows down
  };

  const handleGoToDest = () => {
    if (!revealed) return;
    const params = new URLSearchParams({
      budget: budget.toString(),
      duration: "3",
      vibes: revealed.vibes.slice(0, 2).join(","),
      travelers: "1",
      region: revealed.region,
    });
    router.push(`/explore/${revealed.id}?${params.toString()}`);
  };

  const matchCount = getMatchingDestinations().length;

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-lg text-center">
        <h1 className="text-3xl font-bold mb-2">
          <span className="gradient-text">Surprise Me!</span>
        </h1>
        <p className="text-zinc-400 mb-8">
          Set your budget. We&apos;ll pick a random destination. No overthinking.
        </p>

        {/* Budget Selector */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-zinc-500">Your budget</span>
            <span className="font-bold text-indigo-400">
              {formatBudget(budget)}
            </span>
          </div>
          <input
            type="range"
            min={3000}
            max={200000}
            step={1000}
            value={budget}
            onChange={(e) => {
              setBudget(parseInt(e.target.value));
              setRevealed(null);
            }}
            className="w-full h-2 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-indigo-500"
          />
          <div className="flex justify-between text-xs text-zinc-600 mt-1">
            <span>₹3,000</span>
            <span>{matchCount} destinations match</span>
            <span>₹2,00,000</span>
          </div>
        </div>

        {/* Destination Display */}
        <div
          className={`relative rounded-2xl overflow-hidden mb-6 transition-all duration-300 ${
            spinning ? "animate-pulse" : ""
          }`}
        >
          {displayDest ? (
            <div className="relative">
              <img
                src={displayDest.image_url}
                alt={spinning ? "???" : displayDest.name}
                className={`w-full h-64 object-cover transition-all duration-200 ${
                  spinning ? "blur-sm scale-105" : ""
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                {spinning ? (
                  <div className="text-2xl font-bold text-white animate-bounce">
                    🎰 Finding your destination...
                  </div>
                ) : (
                  <>
                    <div className="text-3xl font-bold text-white mb-1">
                      {displayDest.name}
                    </div>
                    <div className="text-sm text-zinc-300">
                      {displayDest.country}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {displayDest.vibes.slice(0, 3).map((v) => (
                        <span
                          key={v}
                          className="px-2 py-0.5 text-xs rounded bg-white/10 text-white capitalize backdrop-blur-sm"
                        >
                          {v}
                        </span>
                      ))}
                    </div>
                    <div className="text-teal-400 font-semibold mt-2">
                      {formatBudget(displayDest.avg_daily_cost)}/day
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="h-64 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl flex items-center justify-center">
              <div>
                <div className="text-5xl mb-3">🎲</div>
                <p className="text-zinc-500 text-sm">
                  Hit the button to reveal your destination
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleSurprise}
            disabled={spinning}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {spinning
              ? "🎰 Spinning..."
              : revealed
                ? "🔄 Try Again"
                : "🎲 Surprise Me!"}
          </button>

          {revealed && !spinning && (
            <button
              onClick={handleGoToDest}
              className="px-8 py-3 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
            >
              Let&apos;s Go! →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
