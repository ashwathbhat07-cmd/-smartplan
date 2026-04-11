"use client";

import { useState } from "react";
import type { Destination } from "@/types";
import { authFetch } from "@/lib/api-fetch";

interface InsightsData {
  insider_tips: string[];
  scam_alerts: string[];
  food_guide: {
    must_try: string[];
    avoid: string[];
    vegetarian_tip: string;
  };
  customs: string[];
  haggling: string;
  best_kept_secret: string;
}

type InsightTab = "tips" | "safety" | "food" | "culture";

const insightTabs: { id: InsightTab; label: string; icon: string }[] = [
  { id: "tips", label: "Insider Tips", icon: "💡" },
  { id: "safety", label: "Safety", icon: "🛡️" },
  { id: "food", label: "Food Guide", icon: "🍜" },
  { id: "culture", label: "Culture", icon: "🙏" },
];

interface DestinationInsightsProps {
  destination: Destination;
}

export function DestinationInsights({ destination }: DestinationInsightsProps) {
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<InsightTab>("tips");

  const handleLoad = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await authFetch("/api/destination-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.name,
          country: destination.country,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInsights(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  if (!insights) {
    return (
      <button
        onClick={handleLoad}
        disabled={loading}
        className="w-full p-5 rounded-xl border border-dashed border-zinc-700 hover:border-purple-500/30 bg-zinc-900/30 hover:bg-purple-500/5 transition-all text-center"
      >
        <span className="text-2xl block mb-2">🧠</span>
        <span className="text-sm font-medium text-zinc-400">
          {loading ? "Loading local insights..." : `Local Insights for ${destination.name}`}
        </span>
        <span className="text-xs text-zinc-600 block mt-1">
          Insider tips, scam alerts, food guide, cultural do&apos;s & don&apos;ts
        </span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        🧠 Local Insights — {destination.name}
      </h3>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 bg-zinc-800/50 rounded-lg">
        {insightTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-md text-xs font-medium transition-all ${
              activeTab === tab.id
                ? "bg-purple-600 text-white shadow"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tips */}
      {activeTab === "tips" && (
        <div className="space-y-3">
          {insights.insider_tips.map((tip, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-800/30">
              <span className="text-amber-400 font-bold text-sm mt-0.5">{i + 1}.</span>
              <p className="text-sm text-zinc-300">{tip}</p>
            </div>
          ))}
          {insights.best_kept_secret && (
            <div className="p-4 rounded-lg bg-purple-500/5 border border-purple-500/15">
              <h4 className="text-xs font-semibold text-purple-400 mb-1">🤫 Best Kept Secret</h4>
              <p className="text-sm text-zinc-300">{insights.best_kept_secret}</p>
            </div>
          )}
        </div>
      )}

      {/* Safety */}
      {activeTab === "safety" && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-red-400">⚠️ Common Scams</h4>
          {insights.scam_alerts.map((scam, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
              <span className="text-red-400 mt-0.5">🚨</span>
              <p className="text-sm text-zinc-300">{scam}</p>
            </div>
          ))}
          {insights.haggling && (
            <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/10 mt-3">
              <h4 className="text-xs font-semibold text-amber-400 mb-1">💰 Haggling Guide</h4>
              <p className="text-sm text-zinc-300">{insights.haggling}</p>
            </div>
          )}
        </div>
      )}

      {/* Food */}
      {activeTab === "food" && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-green-400">🍽️ Must Try</h4>
          {insights.food_guide.must_try.map((dish, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-800/30">
              <span className="text-green-400 mt-0.5">✓</span>
              <p className="text-sm text-zinc-300">{dish}</p>
            </div>
          ))}
          {insights.food_guide.avoid.length > 0 && (
            <>
              <h4 className="text-sm font-medium text-red-400 mt-4">❌ Avoid</h4>
              {insights.food_guide.avoid.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/10">
                  <span className="text-red-400 mt-0.5">✕</span>
                  <p className="text-sm text-zinc-300">{item}</p>
                </div>
              ))}
            </>
          )}
          {insights.food_guide.vegetarian_tip && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/10 mt-3">
              <p className="text-xs text-green-400">🥬 Veg tip: {insights.food_guide.vegetarian_tip}</p>
            </div>
          )}
        </div>
      )}

      {/* Culture */}
      {activeTab === "culture" && (
        <div className="space-y-3">
          {insights.customs.map((custom, i) => (
            <div key={i} className="flex gap-3 p-3 rounded-lg bg-zinc-800/30">
              <span className="text-indigo-400 mt-0.5">🙏</span>
              <p className="text-sm text-zinc-300">{custom}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
