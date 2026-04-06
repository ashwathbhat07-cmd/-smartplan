"use client";

import { useState } from "react";
import type { Destination } from "@/types";

interface GuideData {
  health: { vaccines: string[]; water_safety: string; food_safety: string; pharmacy_tip: string };
  transport: { from_airport: string; within_city: string[]; apps: string[] };
  phrases: { local: string; english: string; pronunciation: string }[];
  festivals: string[];
  connectivity: { wifi: string; charging: string; signal: string };
  photography: { golden_hour: string; top_spots: string[] };
  souvenirs: { item: string; price: string; where: string }[];
}

type GuideTab = "health" | "transport" | "phrases" | "festivals" | "photo" | "souvenirs";

const guideTabs: { id: GuideTab; label: string; icon: string }[] = [
  { id: "health", label: "Health", icon: "💊" },
  { id: "transport", label: "Transport", icon: "🚗" },
  { id: "phrases", label: "Phrases", icon: "🗣️" },
  { id: "festivals", label: "Events", icon: "🎉" },
  { id: "photo", label: "Photo", icon: "📸" },
  { id: "souvenirs", label: "Souvenirs", icon: "🎁" },
];

const safetyColors = { safe: "text-green-400", boil: "text-amber-400", bottled_only: "text-red-400", be_careful: "text-amber-400", strict_caution: "text-red-400" };

export function TravelGuide({ destination }: { destination: Destination }) {
  const [guide, setGuide] = useState<GuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<GuideTab>("health");

  const handleLoad = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/travel-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination: destination.name, country: destination.country, month: new Date().getMonth() + 1 }),
      });
      if (res.ok) setGuide(await res.json());
    } catch {} finally { setLoading(false); }
  };

  if (!guide) {
    return (
      <button onClick={handleLoad} disabled={loading} className="w-full p-5 rounded-xl border border-dashed border-zinc-700 hover:border-cyan-500/30 bg-zinc-900/30 hover:bg-cyan-500/5 transition-all text-center">
        <span className="text-2xl block mb-2">📖</span>
        <span className="text-sm font-medium text-zinc-400">{loading ? "Loading travel guide..." : `Complete Travel Guide — ${destination.name}`}</span>
        <span className="text-xs text-zinc-600 block mt-1">Health, transport, phrases, festivals, photo spots, souvenirs</span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4">📖 Travel Guide — {destination.name}</h3>

      <div className="flex gap-1 mb-5 p-1 bg-zinc-800/50 rounded-lg overflow-x-auto">
        {guideTabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex-shrink-0 px-3 py-2 rounded-md text-xs font-medium transition-all ${tab === t.id ? "bg-cyan-600 text-white shadow" : "text-zinc-400 hover:text-zinc-200"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "health" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-zinc-800/30">
              <div className="text-xs text-zinc-500 mb-1">💧 Water</div>
              <div className={`text-sm font-semibold capitalize ${safetyColors[guide.health.water_safety as keyof typeof safetyColors] || "text-zinc-300"}`}>{guide.health.water_safety.replace("_", " ")}</div>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/30">
              <div className="text-xs text-zinc-500 mb-1">🍽️ Food</div>
              <div className={`text-sm font-semibold capitalize ${safetyColors[guide.health.food_safety as keyof typeof safetyColors] || "text-zinc-300"}`}>{guide.health.food_safety.replace("_", " ")}</div>
            </div>
          </div>
          <div><h4 className="text-xs font-semibold text-zinc-400 mb-2">💉 Vaccines</h4>
            {guide.health.vaccines.map((v, i) => <div key={i} className="text-sm text-zinc-300 p-2 rounded bg-zinc-800/20 mb-1">• {v}</div>)}
          </div>
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-xs text-amber-400">💊 {guide.health.pharmacy_tip}</p></div>
        </div>
      )}

      {tab === "transport" && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-zinc-800/30"><h4 className="text-xs text-zinc-500 mb-1">✈️ From Airport</h4><p className="text-sm text-zinc-300">{guide.transport.from_airport}</p></div>
          <div><h4 className="text-xs font-semibold text-zinc-400 mb-2">🚌 Within City</h4>
            {guide.transport.within_city.map((t, i) => <div key={i} className="text-sm text-zinc-300 p-2 rounded bg-zinc-800/20 mb-1">{i + 1}. {t}</div>)}
          </div>
          <div className="flex gap-2 flex-wrap">{guide.transport.apps.map((a, i) => <span key={i} className="px-3 py-1 text-xs rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{a}</span>)}</div>
        </div>
      )}

      {tab === "phrases" && (
        <div className="space-y-2">
          {guide.phrases.map((p, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-800/30">
              <div className="flex-1"><div className="text-sm font-semibold text-zinc-200">{p.local}</div><div className="text-xs text-zinc-500">{p.pronunciation}</div></div>
              <div className="text-sm text-teal-400">{p.english}</div>
            </div>
          ))}
        </div>
      )}

      {tab === "festivals" && (
        <div className="space-y-2">
          {guide.festivals.map((f, i) => <div key={i} className="p-3 rounded-lg bg-zinc-800/30 text-sm text-zinc-300 flex gap-2"><span className="text-amber-400">🎊</span>{f}</div>)}
        </div>
      )}

      {tab === "photo" && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"><p className="text-sm text-amber-400">🌅 Golden Hour: {guide.photography.golden_hour}</p></div>
          <div><h4 className="text-xs font-semibold text-zinc-400 mb-2">📸 Top Photo Spots</h4>
            {guide.photography.top_spots.map((s, i) => <div key={i} className="text-sm text-zinc-300 p-2 rounded bg-zinc-800/20 mb-1">{i + 1}. {s}</div>)}
          </div>
        </div>
      )}

      {tab === "souvenirs" && (
        <div className="space-y-2">
          {guide.souvenirs.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30">
              <div><div className="text-sm font-medium text-zinc-200">{s.item}</div><div className="text-xs text-zinc-500">{s.where}</div></div>
              <span className="text-sm text-teal-400 font-medium">{s.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
