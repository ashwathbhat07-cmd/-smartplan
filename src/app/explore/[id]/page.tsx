"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useState, useMemo } from "react";
import { getDestinationById, formatBudget } from "@/lib/engine/budget-engine";
import { ItineraryView } from "@/components/trip/itinerary-view";
import { ExpenseTracker } from "@/components/trip/expense-tracker";
import { DestinationMap } from "@/components/map/destination-map";
import { BudgetOptions } from "@/components/trip/budget-options";
import { WeatherWidget } from "@/components/trip/weather-widget";
import { PackingList } from "@/components/trip/packing-list";
import { TravelInfo } from "@/components/trip/travel-info";
import { ShareCard } from "@/components/trip/share-card";
import { RoadTrip } from "@/components/trip/road-trip";
import { saveTrip } from "@/lib/supabase/trips";
import type { GeneratedItinerary } from "@/lib/ai/gemini";
import type { Vibe } from "@/types";
import Link from "next/link";

type Tab = "plan" | "tools" | "info";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "plan", label: "Plan", icon: "📋" },
  { id: "tools", label: "Tools", icon: "🛠️" },
  { id: "info", label: "Info", icon: "ℹ️" },
];

export default function DestinationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const dest = useMemo(() => getDestinationById(id), [id]);

  const budget = parseInt(searchParams.get("budget") || "15000");
  const duration = parseInt(searchParams.get("duration") || "3");
  const vibes = (searchParams.get("vibes") || "adventure").split(",");
  const travelers = parseInt(searchParams.get("travelers") || "1");

  const [activeTab, setActiveTab] = useState<Tab>("plan");
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!dest) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="text-xl font-bold mb-2">Destination not found</h1>
          <p className="text-zinc-500 mb-4">
            We couldn&apos;t find that destination. It may have been removed.
          </p>
          <Link
            href="/explore"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
          >
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  const estimatedTotal = dest.avg_daily_cost * duration;

  const handleGenerate = async () => {
    if (loading) return; // prevent double-click
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: dest.name,
          country: dest.country,
          budget,
          duration,
          vibe: vibes.join(", "),
          travelers,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate");
      }

      const data: GeneratedItinerary = await res.json();
      setItinerary(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate itinerary. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTrip = async () => {
    if (!itinerary || saving) return;
    setSaving(true);
    try {
      await saveTrip({
        destinationId: dest.id,
        title: `${dest.name} Trip`,
        budget,
        duration,
        vibe: vibes[0] as Vibe,
        startDate: searchParams.get("startDate") || null,
        travelers,
        itinerary,
      });
      setSaved(true);
    } catch {
      setError("Please sign in to save your trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        {/* Hero Image */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-6">
          <img
            src={dest.image_url}
            alt={dest.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end justify-between">
              <div>
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-900/80 text-zinc-300 backdrop-blur-sm mb-2 inline-block">
                  {dest.region === "domestic" ? "🇮🇳 India" : "🌍 International"}
                </span>
                <h1 className="text-3xl sm:text-4xl font-bold">{dest.name}</h1>
                <p className="text-zinc-400 text-sm mt-1">{dest.country}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-teal-400">
                  {formatBudget(estimatedTotal)}
                </div>
                <div className="text-xs text-zinc-400">
                  est. for {duration} days
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {dest.vibes.map((v) => (
              <span
                key={v}
                className={`px-2.5 py-1 rounded-lg text-xs capitalize ${
                  vibes.includes(v)
                    ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                    : "bg-zinc-800/80 text-zinc-500"
                }`}
              >
                {v}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {itinerary && !saved && (
              <button
                onClick={handleSaveTrip}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {saving ? "Saving..." : "💾 Save Trip"}
              </button>
            )}
            {saved && (
              <span className="px-4 py-2 text-sm text-green-400 bg-green-500/10 rounded-lg border border-green-500/20">
                ✓ Saved
              </span>
            )}
            <ShareCard
              destination={dest}
              duration={duration}
              budget={budget}
              vibes={vibes}
              startDate={searchParams.get("startDate")}
            />
          </div>
        </div>

        {/* Budget Options (if over budget) */}
        <BudgetOptions
          destination={dest}
          budget={budget}
          duration={duration}
          vibes={vibes}
        />

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-zinc-900/50 border border-zinc-800/50 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Plan */}
        {activeTab === "plan" && (
          <div className="space-y-8 animate-fade-in-up">
            {/* About & Quick Facts */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="font-semibold mb-2">About</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {dest.description}
                </p>
              </div>
              <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
                <h3 className="font-semibold mb-3">Quick Facts</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Daily Cost</span>
                    <span className="text-teal-400 font-medium">
                      ₹{dest.avg_daily_cost.toLocaleString("en-IN")}/day
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Budget Range</span>
                    <span className="text-zinc-300">
                      {formatBudget(dest.budget_min)} –{" "}
                      {formatBudget(dest.budget_max)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Best Months</span>
                    <span className="text-zinc-300">
                      {dest.best_months
                        .map((m) =>
                          new Date(2026, m - 1).toLocaleString("en", {
                            month: "short",
                          })
                        )
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Top Activities</span>
                    <span className="text-zinc-300">{dest.activities.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Activities */}
            <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
              <h3 className="font-semibold mb-3">Top Activities</h3>
              <div className="grid sm:grid-cols-2 gap-2">
                {dest.activities.map((a, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-zinc-800/30 transition-colors text-sm text-zinc-400"
                  >
                    <span className="text-teal-400 mt-0.5">•</span>
                    {a}
                  </div>
                ))}
              </div>
            </div>

            {/* Road Trip */}
            <RoadTrip destination={dest} />

            {/* Generate Itinerary */}
            {!itinerary && (
              <div className="text-center py-12 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/30">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold mb-2">
                  Generate AI Itinerary
                </h3>
                <p className="text-zinc-400 text-sm mb-6 max-w-md mx-auto">
                  Let Gemini AI create a personalized {duration}-day itinerary
                  for {dest.name} within your {formatBudget(budget)} budget.
                </p>
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 hover:from-indigo-500 hover:to-teal-400 text-white font-semibold rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          className="opacity-25"
                        />
                        <path
                          d="M4 12a8 8 0 018-8"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                      Generating your perfect trip...
                    </span>
                  ) : (
                    "Generate My Itinerary ✨"
                  )}
                </button>
                {error && (
                  <p className="text-red-400 text-sm mt-4">{error}</p>
                )}
              </div>
            )}

            {/* Itinerary Display */}
            {itinerary && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Your Itinerary</h2>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all disabled:opacity-50"
                  >
                    {loading ? "Regenerating..." : "Regenerate"}
                  </button>
                </div>
                <ItineraryView
                  itinerary={itinerary}
                  onUpdateItinerary={setItinerary}
                />
              </div>
            )}
          </div>
        )}

        {/* Tab: Tools */}
        {activeTab === "tools" && (
          <div className="space-y-6 animate-fade-in-up">
            <ExpenseTracker budget={budget} />
            <PackingList
              destination={dest.name}
              country={dest.country}
              duration={duration}
              vibes={vibes}
            />
            <TravelInfo destination={dest} />
          </div>
        )}

        {/* Tab: Info */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-fade-in-up">
            <WeatherWidget
              lat={dest.latitude}
              lng={dest.longitude}
              destinationName={dest.name}
            />
            <DestinationMap
              destinations={[dest]}
              selectedId={dest.id}
              center={[dest.latitude, dest.longitude]}
              zoom={10}
              className="w-full h-[400px]"
            />
            {/* Quick Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <div className="text-2xl mb-2">💰</div>
                <div className="text-sm font-semibold">
                  {formatBudget(dest.budget_min)} – {formatBudget(dest.budget_max)}
                </div>
                <div className="text-xs text-zinc-500">Budget Range</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <div className="text-2xl mb-2">📍</div>
                <div className="text-sm font-semibold">
                  {dest.latitude.toFixed(2)}°N, {dest.longitude.toFixed(2)}°E
                </div>
                <div className="text-xs text-zinc-500">Coordinates</div>
              </div>
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 text-center">
                <div className="text-2xl mb-2">🌡️</div>
                <div className="text-sm font-semibold">
                  {dest.best_months.length} months
                </div>
                <div className="text-xs text-zinc-500">Best Season</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
