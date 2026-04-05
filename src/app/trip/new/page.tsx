"use client";

import { useState } from "react";
import { Onboarding } from "@/components/trip/onboarding";
import { DestinationSearch } from "@/components/trip/destination-search";

export default function NewTripPage() {
  const [mode, setMode] = useState<"choose" | "explore" | "search">("choose");

  if (mode === "explore") return <Onboarding />;
  if (mode === "search")
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <button
            onClick={() => setMode("choose")}
            className="text-sm text-zinc-500 hover:text-zinc-300 mb-8 inline-block"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold mb-2">
            Where are you <span className="gradient-text">going</span>?
          </h1>
          <p className="text-zinc-400 mb-8">
            Search for your destination and we&apos;ll build your itinerary.
          </p>
          <DestinationSearch />
        </div>
      </div>
    );

  return (
    <div className="min-h-screen pt-24 px-6 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-2">
          How do you want to <span className="gradient-text">plan</span>?
        </h1>
        <p className="text-zinc-400 text-center mb-10">
          Choose your planning style
        </p>

        <div className="space-y-4">
          <button
            onClick={() => setMode("explore")}
            className="w-full p-6 rounded-2xl border border-zinc-700/50 bg-zinc-900/30 hover:bg-indigo-600/5 hover:border-indigo-500/30 transition-all duration-300 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-indigo-500/10 flex items-center justify-center text-2xl group-hover:bg-indigo-500/20 transition-colors">
                ✨
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-indigo-400 transition-colors">
                  Help me decide
                </h3>
                <p className="text-sm text-zinc-500">
                  Enter your budget & vibe — we&apos;ll find the perfect
                  destination for you
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setMode("search")}
            className="w-full p-6 rounded-2xl border border-zinc-700/50 bg-zinc-900/30 hover:bg-teal-600/5 hover:border-teal-500/30 transition-all duration-300 text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-500/10 flex items-center justify-center text-2xl group-hover:bg-teal-500/20 transition-colors">
                📍
              </div>
              <div>
                <h3 className="font-semibold text-lg group-hover:text-teal-400 transition-colors">
                  I know where I&apos;m going
                </h3>
                <p className="text-sm text-zinc-500">
                  Search your destination — we&apos;ll build the itinerary and
                  budget plan
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
