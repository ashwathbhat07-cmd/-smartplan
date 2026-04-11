"use client";

import { useState, useMemo } from "react";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import type { Destination } from "@/types";
import Link from "next/link";

export default function ComparePage() {
  const [destA, setDestA] = useState<string>("");
  const [destB, setDestB] = useState<string>("");
  const [duration, setDuration] = useState(3);

  const a = useMemo(() => destinations.find((d) => d.id === destA), [destA]);
  const b = useMemo(() => destinations.find((d) => d.id === destB), [destB]);

  const compareRows = useMemo(() => {
    if (!a || !b) return [];
    return [
      {
        label: "Daily Cost",
        a: `${formatBudget(a.avg_daily_cost)}/day`,
        b: `${formatBudget(b.avg_daily_cost)}/day`,
        winner: a.avg_daily_cost < b.avg_daily_cost ? "a" : a.avg_daily_cost > b.avg_daily_cost ? "b" : "tie",
        icon: "💰",
      },
      {
        label: `${duration}-Day Total`,
        a: formatBudget(a.avg_daily_cost * duration),
        b: formatBudget(b.avg_daily_cost * duration),
        winner: a.avg_daily_cost < b.avg_daily_cost ? "a" : a.avg_daily_cost > b.avg_daily_cost ? "b" : "tie",
        icon: "🧮",
      },
      {
        label: "Budget Range",
        a: `${formatBudget(a.budget_min)} - ${formatBudget(a.budget_max)}`,
        b: `${formatBudget(b.budget_min)} - ${formatBudget(b.budget_max)}`,
        winner: "tie",
        icon: "📊",
      },
      {
        label: "Vibes",
        a: a.vibes.join(", "),
        b: b.vibes.join(", "),
        winner: "tie",
        icon: "✨",
      },
      {
        label: "Activities",
        a: `${a.activities.length} things to do`,
        b: `${b.activities.length} things to do`,
        winner: a.activities.length > b.activities.length ? "a" : a.activities.length < b.activities.length ? "b" : "tie",
        icon: "🎯",
      },
      {
        label: "Best Months",
        a: a.best_months.map((m) => new Date(2026, m - 1).toLocaleString("en", { month: "short" })).join(", "),
        b: b.best_months.map((m) => new Date(2026, m - 1).toLocaleString("en", { month: "short" })).join(", "),
        winner: "tie",
        icon: "📅",
      },
      {
        label: "Region",
        a: a.region === "domestic" ? "🇮🇳 India" : "🌍 International",
        b: b.region === "domestic" ? "🇮🇳 India" : "🌍 International",
        winner: "tie",
        icon: "🗺️",
      },
    ];
  }, [a, b, duration]);

  const DestinationSelector = ({
    value,
    onChange,
    exclude,
  }: {
    value: string;
    onChange: (v: string) => void;
    exclude: string;
  }) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
    >
      <option value="">Select destination</option>
      <optgroup label="🇮🇳 India">
        {destinations
          .filter((d) => d.region === "domestic" && d.id !== exclude)
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {formatBudget(d.avg_daily_cost)}/day
            </option>
          ))}
      </optgroup>
      <optgroup label="🌍 International">
        {destinations
          .filter((d) => d.region === "international" && d.id !== exclude)
          .map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} — {formatBudget(d.avg_daily_cost)}/day
            </option>
          ))}
      </optgroup>
    </select>
  );

  const DestHeader = ({ dest }: { dest: Destination }) => (
    <div className="text-center">
      <img
        src={dest.image_url}
        alt={dest.name}
        className="w-full h-32 rounded-xl object-cover mb-3"
      />
      <h3 className="font-bold text-lg">{dest.name}</h3>
      <p className="text-sm text-zinc-500">{dest.country}</p>
      <div className="flex gap-1 justify-center mt-2 flex-wrap">
        {dest.vibes.slice(0, 3).map((v) => (
          <span
            key={v}
            className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 capitalize"
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Compare <span className="gradient-text">Destinations</span>
          </h1>
          <p className="text-zinc-400">
            Can&apos;t decide? Compare side-by-side.
          </p>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] gap-4 items-center mb-8">
          <DestinationSelector value={destA} onChange={setDestA} exclude={destB} />
          <div className="text-zinc-600 font-bold text-lg">VS</div>
          <DestinationSelector value={destB} onChange={setDestB} exclude={destA} />
        </div>

        {/* Duration */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <span className="text-sm text-zinc-500">Compare for</span>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {[2, 3, 5, 7, 10].map((d) => (
              <option key={d} value={d}>{d} days</option>
            ))}
          </select>
        </div>

        {/* Comparison */}
        {a && b ? (
          <div>
            {/* Headers */}
            <div className="grid grid-cols-[1fr,1fr] gap-6 mb-6">
              <DestHeader dest={a} />
              <DestHeader dest={b} />
            </div>

            {/* Comparison Rows */}
            <div className="space-y-2">
              {compareRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50"
                >
                  <div
                    className={`text-sm text-right ${
                      row.winner === "a"
                        ? "text-green-400 font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    {row.a}
                    {row.winner === "a" && " ✓"}
                  </div>
                  <div className="text-center min-w-[100px]">
                    <span className="text-xs text-zinc-500 block">
                      {row.icon} {row.label}
                    </span>
                  </div>
                  <div
                    className={`text-sm ${
                      row.winner === "b"
                        ? "text-green-400 font-semibold"
                        : "text-zinc-400"
                    }`}
                  >
                    {row.winner === "b" && "✓ "}
                    {row.b}
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              <Link
                href={`/explore/${a.id}?budget=${a.avg_daily_cost * duration}&duration=${duration}&vibes=${a.vibes.slice(0, 2).join(",")}&travelers=1&region=${a.region}`}
                className="block text-center py-3 rounded-xl bg-indigo-600/10 text-indigo-400 text-sm font-medium border border-indigo-500/20 hover:bg-indigo-600/20 transition-all"
              >
                Plan {a.name}
              </Link>
              <Link
                href={`/explore/${b.id}?budget=${b.avg_daily_cost * duration}&duration=${duration}&vibes=${b.vibes.slice(0, 2).join(",")}&travelers=1&region=${b.region}`}
                className="block text-center py-3 rounded-xl bg-indigo-600/10 text-indigo-400 text-sm font-medium border border-indigo-500/20 hover:bg-indigo-600/20 transition-all"
              >
                Plan {b.name}
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-zinc-600">
            <div className="text-4xl mb-4">⚖️</div>
            <p>Select two destinations above to compare</p>
          </div>
        )}
      </div>
    </div>
  );
}
