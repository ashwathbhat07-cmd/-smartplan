"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Vibe, OnboardingData } from "@/types";

const vibeOptions: { value: Vibe; label: string; emoji: string; desc: string }[] = [
  { value: "adventure", label: "Adventure", emoji: "🏔️", desc: "Thrills & adrenaline" },
  { value: "relaxation", label: "Relaxation", emoji: "🏖️", desc: "Chill & unwind" },
  { value: "cultural", label: "Cultural", emoji: "🏛️", desc: "History & heritage" },
  { value: "romantic", label: "Romantic", emoji: "💕", desc: "Couples getaway" },
  { value: "party", label: "Party", emoji: "🎉", desc: "Nightlife & fun" },
  { value: "nature", label: "Nature", emoji: "🌿", desc: "Mountains & forests" },
  { value: "spiritual", label: "Spiritual", emoji: "🕉️", desc: "Peace & temples" },
  { value: "foodie", label: "Foodie", emoji: "🍜", desc: "Eat everything" },
  { value: "urban", label: "Urban", emoji: "🌃", desc: "City explorer" },
  { value: "offbeat", label: "Offbeat", emoji: "🗺️", desc: "Hidden gems" },
];

const budgetPresets = [
  { label: "₹5K", value: 5000 },
  { label: "₹10K", value: 10000 },
  { label: "₹15K", value: 15000 },
  { label: "₹25K", value: 25000 },
  { label: "₹50K", value: 50000 },
  { label: "₹1L", value: 100000 },
];

export function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    budget: 15000,
    duration: 3,
    vibes: ["adventure"],
    startDate: null,
    travelers: 1,
    region: "both",
  });

  const totalSteps = 4;

  const toggleVibe = (vibe: Vibe) => {
    setData((prev) => {
      const has = prev.vibes.includes(vibe);
      if (has) {
        // Don't allow empty — keep at least one
        if (prev.vibes.length === 1) return prev;
        return { ...prev, vibes: prev.vibes.filter((v) => v !== vibe) };
      }
      // Max 3 vibes
      if (prev.vibes.length >= 3) return prev;
      return { ...prev, vibes: [...prev.vibes, vibe] };
    });
  };

  const handleSubmit = () => {
    const params = new URLSearchParams({
      budget: data.budget.toString(),
      duration: data.duration.toString(),
      vibes: data.vibes.join(","),
      travelers: data.travelers.toString(),
      region: data.region,
      ...(data.startDate && { startDate: data.startDate }),
    });
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pt-20 px-6 flex items-center justify-center">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-teal-400 transition-all duration-500"
                style={{ width: step > i ? "100%" : "0%" }}
              />
            </div>
          ))}
          <span className="text-xs text-zinc-500 font-medium ml-1">
            {step}/{totalSteps}
          </span>
        </div>

        {/* Step 1: Budget */}
        {step === 1 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">
              What&apos;s your <span className="gradient-text">budget</span>?
            </h2>
            <p className="text-zinc-400 mb-8">
              Total budget per person for the entire trip.
            </p>

            {/* Preset buttons */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {budgetPresets.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => setData({ ...data, budget: preset.value })}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                    data.budget === preset.value
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Custom amount</span>
                <span className="font-bold text-indigo-400">
                  ₹{data.budget.toLocaleString("en-IN")}
                </span>
              </div>
              <input
                type="range"
                min={2000}
                max={200000}
                step={1000}
                value={data.budget}
                onChange={(e) =>
                  setData({ ...data, budget: parseInt(e.target.value) })
                }
                className="w-full h-2 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-zinc-600">
                <span>₹2,000</span>
                <span>₹2,00,000</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vibe (multi-select, max 3) */}
        {step === 2 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">
              Pick your <span className="gradient-text">vibes</span>
            </h2>
            <p className="text-zinc-400 mb-8">
              Choose up to 3 vibes that match your trip.
              <span className="text-indigo-400 ml-1">
                ({data.vibes.length}/3 selected)
              </span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              {vibeOptions.map((opt) => {
                const isSelected = data.vibes.includes(opt.value);
                const isMaxed = data.vibes.length >= 3 && !isSelected;
                return (
                  <button
                    key={opt.value}
                    onClick={() => toggleVibe(opt.value)}
                    disabled={isMaxed}
                    className={`p-4 rounded-xl text-left transition-all duration-200 border relative ${
                      isSelected
                        ? "bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                        : isMaxed
                          ? "bg-zinc-800/20 border-zinc-800/30 opacity-40 cursor-not-allowed"
                          : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs">
                        ✓
                      </div>
                    )}
                    <div className="text-2xl mb-1">{opt.emoji}</div>
                    <div className="font-semibold text-sm">{opt.label}</div>
                    <div className="text-xs text-zinc-500">{opt.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Duration & Travelers */}
        {step === 3 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">
              How <span className="gradient-text">long</span> and with{" "}
              <span className="gradient-text">whom</span>?
            </h2>
            <p className="text-zinc-400 mb-8">
              We&apos;ll find trips that fit your timeline.
            </p>

            {/* Duration */}
            <div className="mb-8">
              <label className="text-sm text-zinc-400 mb-3 block">
                Duration
              </label>
              <div className="grid grid-cols-4 gap-3">
                {[2, 3, 5, 7].map((d) => (
                  <button
                    key={d}
                    onClick={() => setData({ ...data, duration: d })}
                    className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      data.duration === d
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                        : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50"
                    }`}
                  >
                    {d} days
                  </button>
                ))}
              </div>
              <input
                type="range"
                min={1}
                max={14}
                value={data.duration}
                onChange={(e) =>
                  setData({ ...data, duration: parseInt(e.target.value) })
                }
                className="w-full h-2 mt-4 rounded-full appearance-none bg-zinc-800 cursor-pointer accent-indigo-500"
              />
              <div className="text-center text-sm text-indigo-400 font-medium mt-1">
                {data.duration} {data.duration === 1 ? "day" : "days"}
              </div>
            </div>

            {/* Travelers */}
            <div className="mb-8">
              <label className="text-sm text-zinc-400 mb-3 block">
                Travelers
              </label>
              <div className="flex items-center gap-4 justify-center">
                <button
                  onClick={() =>
                    setData({ ...data, travelers: Math.max(1, data.travelers - 1) })
                  }
                  className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors flex items-center justify-center text-lg"
                >
                  -
                </button>
                <span className="text-3xl font-bold w-12 text-center">
                  {data.travelers}
                </span>
                <button
                  onClick={() =>
                    setData({ ...data, travelers: Math.min(20, data.travelers + 1) })
                  }
                  className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors flex items-center justify-center text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm text-zinc-400 mb-3 block">
                Travel date (optional)
              </label>
              <input
                type="date"
                value={data.startDate || ""}
                onChange={(e) =>
                  setData({ ...data, startDate: e.target.value || null })
                }
                className="w-full px-4 py-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 text-zinc-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Step 4: Region */}
        {step === 4 && (
          <div className="animate-fade-in-up">
            <h2 className="text-2xl font-bold mb-2">
              Where do you want to <span className="gradient-text">go</span>?
            </h2>
            <p className="text-zinc-400 mb-8">
              Domestic, international, or show me everything?
            </p>

            <div className="space-y-3">
              {[
                {
                  value: "domestic" as const,
                  label: "India",
                  emoji: "🇮🇳",
                  desc: "30 curated Indian destinations",
                },
                {
                  value: "international" as const,
                  label: "International",
                  emoji: "🌍",
                  desc: "15 handpicked global destinations",
                },
                {
                  value: "both" as const,
                  label: "Show Me Everything",
                  emoji: "✨",
                  desc: "All 45 destinations, ranked by match",
                },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setData({ ...data, region: opt.value })}
                  className={`w-full p-5 rounded-xl text-left transition-all duration-200 border flex items-center gap-4 ${
                    data.region === opt.value
                      ? "bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600"
                  }`}
                >
                  <span className="text-3xl">{opt.emoji}</span>
                  <div>
                    <div className="font-semibold">{opt.label}</div>
                    <div className="text-xs text-zinc-500">{opt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-10">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            className={`px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              step === 1
                ? "invisible"
                : "text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500"
            }`}
          >
            Back
          </button>
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
            >
              Find My Destinations ✨
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
