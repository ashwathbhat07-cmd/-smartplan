"use client";

import { useState } from "react";

interface PackingListData {
  essentials: string[];
  clothing: string[];
  toiletries: string[];
  gear: string[];
  destination_specific: string[];
  tip: string;
}

const categoryConfig = {
  essentials: { emoji: "🎒", label: "Essentials", color: "text-indigo-400" },
  clothing: { emoji: "👕", label: "Clothing", color: "text-teal-400" },
  toiletries: { emoji: "🧴", label: "Toiletries", color: "text-pink-400" },
  gear: { emoji: "⚙️", label: "Gear", color: "text-amber-400" },
  destination_specific: { emoji: "📍", label: "Destination Specific", color: "text-green-400" },
};

interface PackingListProps {
  destination: string;
  country: string;
  duration: number;
  vibes: string[];
}

export function PackingList({ destination, country, duration, vibes }: PackingListProps) {
  const [list, setList] = useState<PackingListData | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/packing-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, country, duration, vibes: vibes.join(", ") }),
      });
      if (res.ok) {
        const data = await res.json();
        setList(data);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (item: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  if (!list) {
    return (
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full p-4 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/30 bg-zinc-900/30 hover:bg-indigo-500/5 transition-all text-center"
      >
        <span className="text-2xl block mb-2">🧳</span>
        <span className="text-sm font-medium text-zinc-400">
          {loading ? "Generating packing list..." : "Generate AI Packing List"}
        </span>
      </button>
    );
  }

  const totalItems = Object.entries(categoryConfig).reduce(
    (sum, [key]) => sum + ((list as unknown as Record<string, string[]>)[key]?.length || 0),
    0
  );
  const packedItems = checkedItems.size;

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          🧳 Packing List
        </h3>
        <span className="text-xs text-zinc-500">
          {packedItems}/{totalItems} packed
        </span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-teal-400 rounded-full transition-all duration-300"
          style={{ width: `${totalItems ? (packedItems / totalItems) * 100 : 0}%` }}
        />
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(categoryConfig).map(([key, config]) => {
          const items = (list as unknown as Record<string, string[]>)[key] || [];
          if (!items.length) return null;

          return (
            <div key={key}>
              <h4 className={`text-sm font-medium ${config.color} mb-2 flex items-center gap-1.5`}>
                {config.emoji} {config.label}
              </h4>
              <div className="space-y-1">
                {items.map((item) => {
                  const isChecked = checkedItems.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggleItem(item)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                        isChecked
                          ? "bg-zinc-800/30 text-zinc-600 line-through"
                          : "hover:bg-zinc-800/30 text-zinc-300"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-all ${
                          isChecked
                            ? "bg-green-500 border-green-500"
                            : "border-zinc-600"
                        }`}
                      >
                        {isChecked && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      {list.tip && (
        <div className="mt-4 p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
          <p className="text-xs text-amber-400">
            💡 <strong>Pro tip:</strong> {list.tip}
          </p>
        </div>
      )}

      {/* Regenerate */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full mt-4 py-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        {loading ? "Regenerating..." : "Regenerate packing list"}
      </button>
    </div>
  );
}
