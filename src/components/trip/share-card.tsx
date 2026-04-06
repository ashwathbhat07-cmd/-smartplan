"use client";

import { useRef, useState } from "react";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface ShareCardProps {
  destination: Destination;
  duration: number;
  budget: number;
  vibes: string[];
  startDate?: string | null;
}

export function ShareCard({
  destination,
  duration,
  budget,
  vibes,
  startDate,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [showCard, setShowCard] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareText = `🗺️ I'm planning a trip to ${destination.name}!\n\n📍 ${destination.country}\n📅 ${duration} days\n💰 Budget: ${formatBudget(budget)}\n✨ Vibes: ${vibes.join(", ")}\n\nPlanned with SmartPlan — AI-powered travel planning\n${window.location.href}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${destination.name} Trip Plan`,
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      setShowCard(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handleTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Planning a trip to ${destination.name}! 🗺️\n\n${vibes.join(", ")} vibes for ${duration} days\n\nPlanned with SmartPlan ✨`
    )}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, "_blank");
  };

  return (
    <>
      <button
        onClick={handleShare}
        className="px-4 py-2 text-sm text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 rounded-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
        </svg>
        Share Trip
      </button>

      {/* Share Modal */}
      {showCard && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCard(false)}
        >
          <div
            className="max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Visual Card */}
            <div
              ref={cardRef}
              className="relative rounded-2xl overflow-hidden mb-4"
            >
              <img
                src={destination.image_url}
                alt={destination.name}
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <span className="text-xs text-zinc-400">SmartPlan</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {destination.name}
                </h2>
                <p className="text-sm text-zinc-300 mb-3">
                  {destination.country}
                </p>
                <div className="flex gap-3 text-sm">
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white backdrop-blur-sm">
                    📅 {duration} days
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white backdrop-blur-sm">
                    💰 {formatBudget(budget)}
                  </span>
                  {startDate && (
                    <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white backdrop-blur-sm">
                      🗓️ {new Date(startDate).toLocaleDateString("en", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
                <div className="flex gap-1.5 mt-3">
                  {vibes.map((v) => (
                    <span
                      key={v}
                      className="px-2 py-0.5 rounded text-xs bg-indigo-500/30 text-indigo-200 capitalize"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleWhatsApp}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-green-500/30 hover:bg-green-500/5 transition-all"
              >
                <span className="text-2xl">💬</span>
                <span className="text-xs text-zinc-400">WhatsApp</span>
              </button>
              <button
                onClick={handleTwitter}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              >
                <span className="text-2xl">𝕏</span>
                <span className="text-xs text-zinc-400">Twitter</span>
              </button>
              <button
                onClick={handleCopyLink}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all"
              >
                <span className="text-2xl">{copied ? "✅" : "🔗"}</span>
                <span className="text-xs text-zinc-400">
                  {copied ? "Copied!" : "Copy Link"}
                </span>
              </button>
            </div>

            <button
              onClick={() => setShowCard(false)}
              className="w-full mt-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
