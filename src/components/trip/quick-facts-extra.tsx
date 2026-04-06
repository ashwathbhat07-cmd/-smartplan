"use client";

import { useMemo } from "react";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface QuickFactsExtraProps {
  destination: Destination;
  budget: number;
  duration: number;
}

// Approximate sunrise/sunset by latitude and month
function getSunTimes(lat: number): { sunrise: string; sunset: string } {
  const month = new Date().getMonth();
  // Rough estimates based on latitude
  const isNorthern = lat > 0;
  const isSummer = isNorthern ? (month >= 3 && month <= 8) : (month >= 9 || month <= 2);

  if (Math.abs(lat) < 15) {
    // Tropical — consistent
    return { sunrise: "6:00 AM", sunset: "6:15 PM" };
  } else if (Math.abs(lat) < 30) {
    return isSummer
      ? { sunrise: "5:30 AM", sunset: "7:00 PM" }
      : { sunrise: "6:30 AM", sunset: "5:45 PM" };
  } else {
    return isSummer
      ? { sunrise: "5:00 AM", sunset: "8:00 PM" }
      : { sunrise: "7:00 AM", sunset: "4:30 PM" };
  }
}

// What does your budget buy — purchasing power comparison
function getPurchasingPower(dest: Destination, budget: number, duration: number) {
  const daily = Math.round(budget / duration);
  const avgCost = dest.avg_daily_cost;

  if (daily >= avgCost * 1.5) {
    return {
      level: "luxury",
      emoji: "👑",
      label: "Luxury",
      description: `Your ${formatBudget(daily)}/day budget gets you a comfortable hotel, 3 restaurant meals, multiple activities, and shopping money.`,
    };
  } else if (daily >= avgCost) {
    return {
      level: "comfortable",
      emoji: "😊",
      label: "Comfortable",
      description: `Your ${formatBudget(daily)}/day budget covers a decent hotel, meals at local restaurants, and 1-2 activities per day.`,
    };
  } else if (daily >= avgCost * 0.6) {
    return {
      level: "budget",
      emoji: "🎒",
      label: "Backpacker",
      description: `Your ${formatBudget(daily)}/day budget means hostels/budget stays, street food, free attractions, and public transport.`,
    };
  } else {
    return {
      level: "tight",
      emoji: "😅",
      label: "Very Tight",
      description: `Your ${formatBudget(daily)}/day budget is below average. Consider dorm beds, cooking your own meals, and free activities only.`,
    };
  }
}

const levelColors = {
  luxury: "border-amber-500/20 bg-amber-500/5",
  comfortable: "border-green-500/20 bg-green-500/5",
  budget: "border-indigo-500/20 bg-indigo-500/5",
  tight: "border-red-500/20 bg-red-500/5",
};

export function QuickFactsExtra({ destination, budget, duration }: QuickFactsExtraProps) {
  const sunTimes = useMemo(() => getSunTimes(destination.latitude), [destination.latitude]);
  const purchasing = useMemo(
    () => getPurchasingPower(destination, budget, duration),
    [destination, budget, duration]
  );

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {/* Purchasing Power */}
      <div className={`p-4 rounded-xl border ${levelColors[purchasing.level as keyof typeof levelColors]}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">{purchasing.emoji}</span>
          <h4 className="text-sm font-semibold">
            What {formatBudget(budget)} buys you
          </h4>
        </div>
        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-zinc-800 text-zinc-300 mb-2">
          {purchasing.label} Level
        </span>
        <p className="text-xs text-zinc-400 leading-relaxed">
          {purchasing.description}
        </p>
      </div>

      {/* Sun Times + Airport Distance */}
      <div className="space-y-4">
        {/* Sunrise/Sunset */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            🌅 Daylight Hours
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-amber-500/5">
              <div className="text-lg">🌅</div>
              <div className="text-sm font-semibold text-amber-400">{sunTimes.sunrise}</div>
              <div className="text-xs text-zinc-500">Sunrise</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-indigo-500/5">
              <div className="text-lg">🌇</div>
              <div className="text-sm font-semibold text-indigo-400">{sunTimes.sunset}</div>
              <div className="text-xs text-zinc-500">Sunset</div>
            </div>
          </div>
          <p className="text-xs text-zinc-600 mt-2 text-center">
            Approximate for {new Date().toLocaleString("en", { month: "long" })}
          </p>
        </div>

        {/* Quick Travel Facts */}
        <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-1.5">
            ✈️ Getting There
          </h4>
          <div className="space-y-1.5 text-xs text-zinc-400">
            <p>
              📍 Coordinates: {destination.latitude.toFixed(2)}°N, {destination.longitude.toFixed(2)}°E
            </p>
            <p>
              🌐 Region: {destination.region === "domestic" ? "India" : destination.country}
            </p>
            <p>
              💰 Avg daily cost: {formatBudget(destination.avg_daily_cost)}/person
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
