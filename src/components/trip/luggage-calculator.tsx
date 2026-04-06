"use client";

import { useState } from "react";

const itemWeights: Record<string, number> = {
  "T-shirt/top": 0.2, "Pants/jeans": 0.5, "Shorts": 0.25, "Dress": 0.3,
  "Jacket": 0.8, "Underwear": 0.05, "Socks (pair)": 0.05, "Shoes": 0.8,
  "Sandals": 0.3, "Toiletry bag": 0.5, "Sunscreen": 0.15, "Towel": 0.4,
  "Book": 0.3, "Laptop": 1.5, "Camera": 0.5, "Charger + cables": 0.3,
  "Power bank": 0.25, "Water bottle": 0.15, "Umbrella": 0.3, "First aid kit": 0.3,
};

export function LuggageCalculator() {
  const [items, setItems] = useState<Record<string, number>>({});
  const [showCalc, setShowCalc] = useState(false);

  const totalWeight = Object.entries(items).reduce(
    (sum, [item, count]) => sum + (itemWeights[item] || 0.2) * count, 0
  );

  const toggleItem = (item: string) => {
    setItems((prev) => {
      const next = { ...prev };
      if (next[item]) delete next[item];
      else next[item] = 1;
      return next;
    });
  };

  const updateCount = (item: string, delta: number) => {
    setItems((prev) => {
      const next = { ...prev };
      const newCount = (next[item] || 0) + delta;
      if (newCount <= 0) delete next[item];
      else next[item] = newCount;
      return next;
    });
  };

  if (!showCalc) {
    return (
      <button onClick={() => setShowCalc(true)} className="w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/30 bg-zinc-900/30 hover:bg-indigo-500/5 transition-all text-center">
        <span className="text-2xl block mb-2">⚖️</span>
        <span className="text-sm font-medium text-zinc-400">Luggage Weight Calculator</span>
      </button>
    );
  }

  const carryOnLimit = 7;
  const checkInLimit = 15;
  const isOverCarryOn = totalWeight > carryOnLimit;

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">⚖️ Luggage Calculator</h3>

      {/* Weight meter */}
      <div className="mb-4 p-4 rounded-xl bg-zinc-800/30 text-center">
        <div className="text-3xl font-bold mb-1" style={{ color: isOverCarryOn ? "#ef4444" : "#22c55e" }}>
          {totalWeight.toFixed(1)} kg
        </div>
        <div className="text-xs text-zinc-500">
          {isOverCarryOn
            ? `⚠️ Over carry-on limit (${carryOnLimit}kg). Check-in bag needed.`
            : `✓ Within carry-on limit (${carryOnLimit}kg)`}
        </div>
        <div className="h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isOverCarryOn ? "bg-red-500" : "bg-green-500"}`}
            style={{ width: `${Math.min(100, (totalWeight / checkInLimit) * 100)}%` }}
          />
        </div>
      </div>

      {/* Items */}
      <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto">
        {Object.keys(itemWeights).map((item) => {
          const count = items[item] || 0;
          const isAdded = count > 0;
          return (
            <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-all ${isAdded ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-zinc-800/20 hover:bg-zinc-800/40"}`}>
              <button onClick={() => toggleItem(item)} className={`flex-1 text-left ${isAdded ? "text-indigo-400" : "text-zinc-500"}`}>
                {item}
              </button>
              {isAdded && (
                <div className="flex items-center gap-1">
                  <button onClick={() => updateCount(item, -1)} className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center">-</button>
                  <span className="w-4 text-center text-indigo-400 font-bold">{count}</span>
                  <button onClick={() => updateCount(item, 1)} className="w-5 h-5 rounded bg-zinc-800 text-zinc-400 flex items-center justify-center">+</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
