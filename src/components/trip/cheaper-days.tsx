"use client";

import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface CheaperDaysProps {
  destination: Destination;
}

export function CheaperDays({ destination }: CheaperDaysProps) {
  const daily = destination.avg_daily_cost;

  const tips = [
    { label: "Weekday vs Weekend", saving: Math.round(daily * 0.25), tip: "Travel Tue-Thu, flights and hotels are 20-30% cheaper" },
    { label: "Off-season", saving: Math.round(daily * 0.4), tip: `Visit in ${destination.best_months.length > 0 ? "shoulder months" : "off-season"} for 30-40% savings` },
    { label: "Last-minute deals", saving: Math.round(daily * 0.15), tip: "Book flights 3-6 weeks before, hotels 1-2 weeks before" },
    { label: "Early morning flights", saving: Math.round(daily * 0.2), tip: "6 AM flights are typically cheapest" },
  ];

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">📉 Save More</h3>
      <div className="space-y-2">
        {tips.map((tip) => (
          <div key={tip.label} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
            <div>
              <div className="text-sm font-medium text-zinc-300">{tip.label}</div>
              <div className="text-xs text-zinc-500">{tip.tip}</div>
            </div>
            <span className="text-sm text-green-400 font-semibold flex-shrink-0 ml-3">
              Save {formatBudget(tip.saving)}/day
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
