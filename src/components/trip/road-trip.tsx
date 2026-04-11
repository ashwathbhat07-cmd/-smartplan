"use client";

import { useState } from "react";
import type { Destination } from "@/types";
import { authFetch } from "@/lib/api-fetch";

interface PitStop {
  name: string;
  type: string;
  description: string;
  distance_from_start: string;
  time_to_spend: string;
  must_try: string;
}

interface RoadTripData {
  route_summary: string;
  stops: PitStop[];
  driving_tips: string[];
}

const typeConfig: Record<string, { emoji: string; color: string }> = {
  food: { emoji: "🍛", color: "text-amber-400" },
  viewpoint: { emoji: "🏔️", color: "text-teal-400" },
  temple: { emoji: "🛕", color: "text-purple-400" },
  waterfall: { emoji: "💧", color: "text-blue-400" },
  town: { emoji: "🏘️", color: "text-zinc-300" },
  fuel: { emoji: "⛽", color: "text-red-400" },
  photo_spot: { emoji: "📸", color: "text-pink-400" },
};

interface RoadTripProps {
  destination: Destination;
}

export function RoadTrip({ destination }: RoadTripProps) {
  const [fromCity, setFromCity] = useState("");
  const [tripData, setTripData] = useState<RoadTripData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handlePlan = async () => {
    if (!fromCity.trim()) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/road-trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromCity,
          to: destination.name,
          country: destination.country,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setTripData(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (!showForm && !tripData) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-green-500/30 bg-zinc-900/30 hover:bg-green-500/5 transition-all text-center"
      >
        <span className="text-2xl block mb-2">🚗</span>
        <span className="text-sm font-medium text-zinc-400">
          Road Trip Mode
        </span>
        <span className="text-xs text-zinc-600 block mt-1">
          Driving to {destination.name}? Find awesome pit stops along the way
        </span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        🚗 Road Trip to {destination.name}
      </h3>

      {/* From City Input */}
      {!tripData && (
        <div className="space-y-3">
          <div>
            <label className="text-sm text-zinc-400 mb-2 block">
              Where are you driving from?
            </label>
            <input
              type="text"
              placeholder="e.g., Bangalore, Mumbai, Delhi..."
              value={fromCity}
              onChange={(e) => setFromCity(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handlePlan()}
              className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 focus:outline-none focus:border-green-500 transition-colors placeholder:text-zinc-600"
            />
          </div>
          <button
            onClick={handlePlan}
            disabled={!fromCity.trim() || loading}
            className="w-full py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all disabled:opacity-40"
          >
            {loading ? "Finding pit stops..." : `Plan Drive: ${fromCity || "..."} → ${destination.name}`}
          </button>
        </div>
      )}

      {/* Results */}
      {tripData && (
        <div>
          {/* Route Summary */}
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 mb-4">
            <p className="text-sm text-green-400">{tripData.route_summary}</p>
          </div>

          {/* Pit Stops Timeline */}
          <div className="space-y-3 mb-5">
            {/* Start */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-400 flex-shrink-0">
                🏠
              </div>
              <span className="font-medium text-green-400">{fromCity}</span>
              <span className="text-zinc-600 text-xs">Start</span>
            </div>

            {tripData.stops.map((stop, i) => {
              const config = typeConfig[stop.type] || { emoji: "📍", color: "text-zinc-300" };
              return (
                <div
                  key={i}
                  className="flex gap-3 p-3 rounded-xl bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <span className="text-xl">{config.emoji}</span>
                    <div className="w-px h-full bg-zinc-700" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium text-sm ${config.color}`}>
                        {stop.name}
                      </h4>
                      <span className="text-xs text-zinc-500">
                        {stop.distance_from_start}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">
                      {stop.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-500">
                        ⏱️ {stop.time_to_spend}
                      </span>
                      <span className="text-amber-400">
                        ⭐ {stop.must_try}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* End */}
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 flex-shrink-0">
                📍
              </div>
              <span className="font-medium text-indigo-400">
                {destination.name}
              </span>
              <span className="text-zinc-600 text-xs">Destination</span>
            </div>
          </div>

          {/* Driving Tips */}
          {tripData.driving_tips?.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
              <h4 className="text-xs font-medium text-amber-400 mb-2">
                🚗 Driving Tips
              </h4>
              <ul className="space-y-1">
                {tripData.driving_tips.map((tip, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex gap-2">
                    <span className="text-amber-400">•</span> {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Replan */}
          <button
            onClick={() => {
              setTripData(null);
              setFromCity("");
            }}
            className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Plan from a different city
          </button>
        </div>
      )}
    </div>
  );
}
