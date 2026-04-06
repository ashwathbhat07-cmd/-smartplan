"use client";

import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface CostBreakdownProps {
  destination: Destination;
  budget: number;
  duration: number;
}

const categories = [
  { key: "stay", label: "Stay", pct: 35, color: "#6366f1", emoji: "🏨" },
  { key: "food", label: "Food", pct: 25, color: "#14b8a6", emoji: "🍽️" },
  { key: "transport", label: "Transport", pct: 15, color: "#f59e0b", emoji: "🚗" },
  { key: "activities", label: "Activities", pct: 15, color: "#22c55e", emoji: "🎯" },
  { key: "shopping", label: "Shopping & Misc", pct: 10, color: "#ec4899", emoji: "🛍️" },
];

export function CostBreakdown({ destination, budget, duration }: CostBreakdownProps) {
  const estimatedTotal = destination.avg_daily_cost * duration;
  const actualBudget = Math.min(budget, estimatedTotal);

  // Build conic gradient
  let accumulated = 0;
  const gradientParts = categories.map((cat) => {
    const start = accumulated;
    accumulated += cat.pct;
    return `${cat.color} ${start}% ${accumulated}%`;
  });
  const gradient = `conic-gradient(${gradientParts.join(", ")})`;

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        📊 Budget Breakdown
      </h3>

      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <div
            className="w-full h-full rounded-full"
            style={{ background: gradient }}
          />
          {/* Center hole */}
          <div className="absolute inset-3 bg-zinc-950 rounded-full flex items-center justify-center flex-col">
            <div className="text-sm font-bold text-white">
              {formatBudget(actualBudget)}
            </div>
            <div className="text-xs text-zinc-500">{duration} days</div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2">
          {categories.map((cat) => {
            const amount = Math.round((actualBudget * cat.pct) / 100);
            const daily = Math.round(amount / duration);
            return (
              <div key={cat.key} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm flex-shrink-0"
                  style={{ background: cat.color }}
                />
                <div className="flex-1 flex items-center justify-between">
                  <span className="text-xs text-zinc-400">
                    {cat.emoji} {cat.label}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-zinc-300">
                      {formatBudget(amount)}
                    </span>
                    <span className="text-xs text-zinc-600 ml-1">
                      ({formatBudget(daily)}/day)
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Budget */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-800/30 flex items-center justify-between">
        <span className="text-sm text-zinc-400">Daily budget</span>
        <span className="text-sm font-bold text-teal-400">
          {formatBudget(Math.round(actualBudget / duration))}/day
        </span>
      </div>
    </div>
  );
}
