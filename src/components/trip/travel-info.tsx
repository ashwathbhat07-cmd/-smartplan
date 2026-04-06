"use client";

import { useState } from "react";
import type { Destination } from "@/types";

interface TravelInfoProps {
  destination: Destination;
}

interface TravelInfoData {
  sim: { provider: string; cost: string; data: string; where: string }[];
  internet: string;
  visa: string;
  currency: { name: string; code: string; rate: string };
  emergency: { police: string; ambulance: string; fire: string };
  plug: string;
  tip: string;
}

export function TravelInfo({ destination }: TravelInfoProps) {
  const [info, setInfo] = useState<TravelInfoData | null>(null);
  const [loading, setLoading] = useState(false);

  if (destination.region === "domestic") return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/travel-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: destination.name,
          country: destination.country,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setInfo(data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  if (!info) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-teal-500/30 bg-zinc-900/30 hover:bg-teal-500/5 transition-all text-center"
      >
        <span className="text-2xl block mb-2">📱</span>
        <span className="text-sm font-medium text-zinc-400">
          {loading ? "Loading travel info..." : `Travel Info for ${destination.country}`}
        </span>
        <span className="text-xs text-zinc-600 block mt-1">
          SIM cards, visa, currency, emergency numbers
        </span>
      </button>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        📱 Travel Info — {destination.country}
      </h3>

      <div className="space-y-4">
        {/* SIM Cards */}
        <div>
          <h4 className="text-sm font-medium text-teal-400 mb-2">📶 SIM Cards</h4>
          <div className="space-y-2">
            {info.sim.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-800/30 text-sm">
                <div>
                  <span className="font-medium text-zinc-200">{s.provider}</span>
                  <span className="text-zinc-500 ml-2">{s.data}</span>
                </div>
                <div className="text-right">
                  <span className="text-teal-400 font-medium">{s.cost}</span>
                  <span className="text-zinc-600 text-xs block">{s.where}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-zinc-500 mt-1">📡 {info.internet}</p>
        </div>

        {/* Visa */}
        <div className="p-3 rounded-lg bg-zinc-800/30">
          <h4 className="text-sm font-medium text-indigo-400 mb-1">🛂 Visa</h4>
          <p className="text-sm text-zinc-400">{info.visa}</p>
        </div>

        {/* Currency */}
        <div className="p-3 rounded-lg bg-zinc-800/30">
          <h4 className="text-sm font-medium text-amber-400 mb-1">💱 Currency</h4>
          <p className="text-sm text-zinc-400">
            {info.currency.name} ({info.currency.code}) — {info.currency.rate}
          </p>
        </div>

        {/* Emergency */}
        <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/10">
          <h4 className="text-sm font-medium text-red-400 mb-2">🚨 Emergency Numbers</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="text-zinc-500 text-xs">Police</div>
              <div className="font-bold text-zinc-200">{info.emergency.police}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs">Ambulance</div>
              <div className="font-bold text-zinc-200">{info.emergency.ambulance}</div>
            </div>
            <div>
              <div className="text-zinc-500 text-xs">Fire</div>
              <div className="font-bold text-zinc-200">{info.emergency.fire}</div>
            </div>
          </div>
        </div>

        {/* Power Plug */}
        <div className="p-3 rounded-lg bg-zinc-800/30">
          <h4 className="text-sm font-medium text-zinc-300 mb-1">🔌 Power Plug</h4>
          <p className="text-sm text-zinc-400">{info.plug}</p>
        </div>

        {/* Pro Tip */}
        <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-xs text-amber-400">💡 {info.tip}</p>
        </div>
      </div>
    </div>
  );
}
