"use client";

import { useState } from "react";
import type { GeneratedItinerary, GeneratedActivity } from "@/lib/ai/gemini";

const typeIcons: Record<string, string> = {
  food: "🍽️",
  sightseeing: "📸",
  transport: "🚗",
  stay: "🏨",
  activity: "🎯",
  shopping: "🛍️",
};

const typeColors: Record<string, string> = {
  food: "border-amber-500/30 bg-amber-500/5",
  sightseeing: "border-indigo-500/30 bg-indigo-500/5",
  transport: "border-zinc-500/30 bg-zinc-500/5",
  stay: "border-teal-500/30 bg-teal-500/5",
  activity: "border-green-500/30 bg-green-500/5",
  shopping: "border-pink-500/30 bg-pink-500/5",
};

interface ItineraryViewProps {
  itinerary: GeneratedItinerary;
  onUpdateItinerary: (itinerary: GeneratedItinerary) => void;
}

export function ItineraryView({ itinerary, onUpdateItinerary }: ItineraryViewProps) {
  const [activeDay, setActiveDay] = useState(1);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);

  const currentDay = itinerary.days.find((d) => d.dayNumber === activeDay);
  const dailyCost = currentDay
    ? currentDay.activities.reduce((sum, a) => sum + a.costEstimate, 0)
    : 0;

  const handleRemoveActivity = (dayNumber: number, activityIndex: number) => {
    const updated = {
      ...itinerary,
      days: itinerary.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          activities: day.activities.filter((_, i) => i !== activityIndex),
        };
      }),
    };
    onUpdateItinerary(updated);
  };

  const handleMoveActivity = (
    dayNumber: number,
    fromIndex: number,
    direction: "up" | "down"
  ) => {
    const updated = {
      ...itinerary,
      days: itinerary.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        const activities = [...day.activities];
        const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
        if (toIndex < 0 || toIndex >= activities.length) return day;
        [activities[fromIndex], activities[toIndex]] = [
          activities[toIndex],
          activities[fromIndex],
        ];
        return { ...day, activities };
      }),
    };
    onUpdateItinerary(updated);
  };

  const handleEditActivity = (
    dayNumber: number,
    activityIndex: number,
    field: keyof GeneratedActivity,
    value: string | number
  ) => {
    const updated = {
      ...itinerary,
      days: itinerary.days.map((day) => {
        if (day.dayNumber !== dayNumber) return day;
        return {
          ...day,
          activities: day.activities.map((a, i) => {
            if (i !== activityIndex) return a;
            return { ...a, [field]: value };
          }),
        };
      }),
    };
    onUpdateItinerary(updated);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">{itinerary.title}</h2>
        <p className="text-zinc-400 text-sm">{itinerary.summary}</p>
      </div>

      {/* Cost Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-0.5">Total Estimated</div>
          <div className="text-lg font-bold text-teal-400">
            ₹{itinerary.estimatedTotal.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-0.5">Days</div>
          <div className="text-lg font-bold text-indigo-400">
            {itinerary.days.length}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-0.5">Today&apos;s Cost</div>
          <div className="text-lg font-bold text-amber-400">
            ₹{dailyCost.toLocaleString("en-IN")}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <div className="text-xs text-zinc-500 mb-0.5">Activities</div>
          <div className="text-lg font-bold text-green-400">
            {itinerary.days.reduce((sum, d) => sum + d.activities.length, 0)}
          </div>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {itinerary.days.map((day) => {
          const dayCost = day.activities.reduce(
            (sum, a) => sum + a.costEstimate,
            0
          );
          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDay(day.dayNumber)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeDay === day.dayNumber
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 border border-zinc-700/50"
              }`}
            >
              <div>Day {day.dayNumber}</div>
              <div className="text-xs opacity-70">
                ₹{dayCost.toLocaleString("en-IN")}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Content */}
      {currentDay && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{currentDay.title}</h3>
            <span className="text-sm text-zinc-500">
              {currentDay.activities.length} activities
            </span>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            {currentDay.activities.map((activity, index) => {
              const activityKey = `${currentDay.dayNumber}-${index}`;
              const isEditing = editingActivity === activityKey;

              return (
                <div
                  key={index}
                  className={`relative flex gap-4 p-4 rounded-xl border transition-all duration-200 hover:border-zinc-600/50 ${
                    typeColors[activity.type] || typeColors.activity
                  } ${activity.hiddenGem ? "ring-1 ring-amber-500/20" : ""}`}
                >
                  {/* Timeline dot */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div className="text-xl">
                      {typeIcons[activity.type] || "📌"}
                    </div>
                    <div className="text-xs text-zinc-500 font-medium whitespace-nowrap">
                      {activity.time}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {isEditing ? (
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) =>
                              handleEditActivity(
                                currentDay.dayNumber,
                                index,
                                "title",
                                e.target.value
                              )
                            }
                            className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1 text-sm font-semibold focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            {activity.title}
                            {activity.hiddenGem && (
                              <span className="px-1.5 py-0.5 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Hidden Gem
                              </span>
                            )}
                          </h4>
                        )}
                        <p className="text-xs text-zinc-400 mt-1">
                          {activity.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-zinc-500">
                            📍 {activity.location}
                          </span>
                          <span className="text-xs font-medium text-teal-400">
                            ₹{activity.costEstimate.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            handleMoveActivity(
                              currentDay.dayNumber,
                              index,
                              "up"
                            )
                          }
                          disabled={index === 0}
                          className="w-7 h-7 rounded-md bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center text-xs disabled:opacity-30"
                          title="Move up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() =>
                            handleMoveActivity(
                              currentDay.dayNumber,
                              index,
                              "down"
                            )
                          }
                          disabled={
                            index === currentDay.activities.length - 1
                          }
                          className="w-7 h-7 rounded-md bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center text-xs disabled:opacity-30"
                          title="Move down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() =>
                            setEditingActivity(isEditing ? null : activityKey)
                          }
                          className="w-7 h-7 rounded-md bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors flex items-center justify-center text-xs"
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveActivity(currentDay.dayNumber, index)
                          }
                          className="w-7 h-7 rounded-md bg-zinc-800/80 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors flex items-center justify-center text-xs"
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tips */}
      {itinerary.tips && itinerary.tips.length > 0 && (
        <div className="mt-8 p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            💡 Travel Tips
          </h3>
          <ul className="space-y-2">
            {itinerary.tips.map((tip, i) => (
              <li
                key={i}
                className="text-sm text-zinc-400 flex items-start gap-2"
              >
                <span className="text-teal-400 mt-0.5">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
