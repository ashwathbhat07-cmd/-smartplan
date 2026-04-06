"use client";

import type { Destination } from "@/types";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface BestTimeCalendarProps {
  destination: Destination;
}

export function BestTimeCalendar({ destination }: BestTimeCalendarProps) {
  const currentMonth = new Date().getMonth() + 1;
  const bestMonths = new Set(destination.best_months);

  // Adjacent months (shoulder season)
  const shoulderMonths = new Set<number>();
  destination.best_months.forEach((m) => {
    const prev = m === 1 ? 12 : m - 1;
    const next = m === 12 ? 1 : m + 1;
    if (!bestMonths.has(prev)) shoulderMonths.add(prev);
    if (!bestMonths.has(next)) shoulderMonths.add(next);
  });

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        📅 Best Time to Visit
      </h3>

      {/* Calendar Bar */}
      <div className="grid grid-cols-12 gap-1 mb-4">
        {months.map((month, i) => {
          const monthNum = i + 1;
          const isBest = bestMonths.has(monthNum);
          const isShoulder = shoulderMonths.has(monthNum);
          const isCurrent = monthNum === currentMonth;

          let bgColor = "bg-red-500/15";
          let textColor = "text-red-400/60";
          let label = "Avoid";

          if (isBest) {
            bgColor = "bg-green-500/20";
            textColor = "text-green-400";
            label = "Best";
          } else if (isShoulder) {
            bgColor = "bg-amber-500/15";
            textColor = "text-amber-400/80";
            label = "OK";
          }

          return (
            <div
              key={month}
              className={`relative rounded-lg p-1.5 text-center transition-all ${bgColor} ${
                isCurrent ? "ring-2 ring-indigo-500 ring-offset-1 ring-offset-zinc-950" : ""
              }`}
            >
              <div className={`text-xs font-semibold ${textColor}`}>
                {month}
              </div>
              <div className={`text-[9px] ${textColor} opacity-70 mt-0.5`}>
                {label}
              </div>
              {isCurrent && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-500" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-center text-xs text-zinc-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500/20" />
          <span>Best season</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-amber-500/15" />
          <span>Shoulder</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-red-500/15" />
          <span>Off-season</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full ring-2 ring-indigo-500" />
          <span>Now</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-800/30 text-center">
        {bestMonths.has(currentMonth) ? (
          <p className="text-sm text-green-400 font-medium">
            ✓ Great time to visit {destination.name}! You&apos;re in peak season.
          </p>
        ) : shoulderMonths.has(currentMonth) ? (
          <p className="text-sm text-amber-400 font-medium">
            ⚡ Decent time — shoulder season. Fewer crowds, slightly off-peak weather.
          </p>
        ) : (
          <p className="text-sm text-red-400/80 font-medium">
            ⚠ Off-season right now. Consider visiting in{" "}
            {destination.best_months
              .slice(0, 3)
              .map((m) => months[m - 1])
              .join(", ")}
            .
          </p>
        )}
      </div>
    </div>
  );
}
