"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { destinations } from "@/lib/data/destinations";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

export function DestinationSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [budget, setBudget] = useState(15000);
  const [duration, setDuration] = useState(3);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return destinations
      .filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.vibes.some((v) => v.includes(q))
      )
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (dest: Destination) => {
    const params = new URLSearchParams({
      budget: budget.toString(),
      duration: duration.toString(),
      vibes: dest.vibes.slice(0, 2).join(","),
      travelers: "1",
      region: dest.region,
    });
    router.push(`/explore/${dest.id}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search Goa, Bali, Manali..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 text-lg focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-zinc-600"
          />
        </div>

        {/* Dropdown Results */}
        {isOpen && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700/50 rounded-xl overflow-hidden shadow-2xl shadow-black/40 z-50"
          >
            {results.map((dest) => (
              <button
                key={dest.id}
                onClick={() => handleSelect(dest)}
                className="w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors text-left"
              >
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{dest.name}</div>
                  <div className="text-xs text-zinc-500 flex items-center gap-2">
                    <span>{dest.country}</span>
                    <span>•</span>
                    <span className="text-teal-400">
                      {formatBudget(dest.avg_daily_cost)}/day
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {dest.vibes.slice(0, 2).map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 text-xs rounded bg-zinc-800 text-zinc-400 capitalize"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        )}

        {isOpen && query.trim() && results.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-700/50 rounded-xl p-6 text-center shadow-2xl z-50">
            <p className="text-zinc-500 text-sm">
              No destinations found for &quot;{query}&quot;
            </p>
          </div>
        )}
      </div>

      {/* Quick Settings */}
      <div className="flex items-center gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Budget:</span>
          <select
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            <option value={5000}>₹5K</option>
            <option value={10000}>₹10K</option>
            <option value={15000}>₹15K</option>
            <option value={25000}>₹25K</option>
            <option value={50000}>₹50K</option>
            <option value={100000}>₹1L</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Days:</span>
          <select
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg bg-zinc-800/50 border border-zinc-700/50 text-sm text-zinc-300 focus:outline-none focus:border-indigo-500"
          >
            {[2, 3, 5, 7, 10, 14].map((d) => (
              <option key={d} value={d}>
                {d} days
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
