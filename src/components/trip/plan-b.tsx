"use client";

import { useMemo } from "react";
import type { Destination } from "@/types";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import Link from "next/link";

interface PlanBProps {
  destination: Destination;
  budget: number;
  duration: number;
}

export function PlanB({ destination, budget, duration }: PlanBProps) {
  const alternatives = useMemo(() => {
    return destinations
      .filter((d) => {
        if (d.id === destination.id) return false;
        const hasVibeMatch = d.vibes.some((v) => destination.vibes.includes(v));
        const fits = d.avg_daily_cost * duration <= budget * 1.2;
        return hasVibeMatch && fits;
      })
      .sort((a, b) => {
        const aMatch = a.vibes.filter((v) => destination.vibes.includes(v)).length;
        const bMatch = b.vibes.filter((v) => destination.vibes.includes(v)).length;
        return bMatch - aMatch;
      })
      .slice(0, 3);
  }, [destination, budget, duration]);

  if (alternatives.length === 0) return null;

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-1 flex items-center gap-2">🔄 Plan B Destinations</h3>
      <p className="text-xs text-zinc-500 mb-4">If {destination.name} doesn&apos;t work out, try these:</p>
      <div className="space-y-2">
        {alternatives.map((alt) => (
          <a
            key={alt.id}
            href={`/explore/${alt.id}?budget=${budget}&duration=${duration}&vibes=${alt.vibes.slice(0, 2).join(",")}&travelers=1&region=${alt.region}&diet=none`}
            className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors group"
          >
            <img src={alt.image_url} alt={alt.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium group-hover:text-teal-400 transition-colors">{alt.name}</div>
              <div className="text-xs text-zinc-500">{alt.vibes.filter((v) => destination.vibes.includes(v)).join(", ")} vibes</div>
            </div>
            <span className="text-sm text-teal-400 font-medium flex-shrink-0">{formatBudget(alt.avg_daily_cost * duration)}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
