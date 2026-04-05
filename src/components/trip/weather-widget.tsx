"use client";

import { useEffect, useState } from "react";

interface WeatherDay {
  date: string;
  temp: number;
  tempMin: number;
  tempMax: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const weatherEmoji: Record<string, string> = {
  "01d": "☀️", "01n": "🌙",
  "02d": "⛅", "02n": "☁️",
  "03d": "☁️", "03n": "☁️",
  "04d": "☁️", "04n": "☁️",
  "09d": "🌧️", "09n": "🌧️",
  "10d": "🌦️", "10n": "🌧️",
  "11d": "⛈️", "11n": "⛈️",
  "13d": "❄️", "13n": "❄️",
  "50d": "🌫️", "50n": "🌫️",
};

interface WeatherWidgetProps {
  lat: number;
  lng: number;
  destinationName: string;
}

export function WeatherWidget({ lat, lng, destinationName }: WeatherWidgetProps) {
  const [forecast, setForecast] = useState<WeatherDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch(`/api/weather?lat=${lat}&lng=${lng}`);
        if (res.ok) {
          const data = await res.json();
          setForecast(data.forecast);
        }
      } catch {
        // Silently fail — weather is not critical
      } finally {
        setLoading(false);
      }
    }
    fetchWeather();
  }, [lat, lng]);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 animate-pulse">
        <div className="h-4 bg-zinc-800 rounded w-32 mb-4" />
        <div className="flex gap-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 h-24 bg-zinc-800 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!forecast.length) return null;

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        🌤️ Weather in {destinationName}
      </h3>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {forecast.map((day) => {
          const date = new Date(day.date);
          const dayName = date.toLocaleDateString("en", { weekday: "short" });
          const dateStr = date.toLocaleDateString("en", { month: "short", day: "numeric" });
          const emoji = weatherEmoji[day.icon] || "🌤️";

          return (
            <div
              key={day.date}
              className="flex-shrink-0 min-w-[90px] p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/30 text-center"
            >
              <div className="text-xs text-zinc-500 font-medium">{dayName}</div>
              <div className="text-xs text-zinc-600 mb-2">{dateStr}</div>
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="text-sm font-bold">{day.tempMax}°</div>
              <div className="text-xs text-zinc-500">{day.tempMin}°</div>
              <div className="text-xs text-zinc-600 mt-1 capitalize truncate">
                {day.description}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-4 mt-3 text-xs text-zinc-500">
        <span>💧 Humidity: {forecast[0]?.humidity}%</span>
        <span>💨 Wind: {forecast[0]?.windSpeed} km/h</span>
      </div>
    </div>
  );
}
