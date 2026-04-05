import { NextResponse } from "next/server";

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const apiKey = process.env.OPENWEATHER_API_KEY;

  // If no API key, return mock seasonal data
  if (!apiKey) {
    return NextResponse.json({ forecast: generateMockForecast() });
  }

  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&units=metric&appid=${apiKey}`
    );

    if (!res.ok) {
      return NextResponse.json({ forecast: generateMockForecast() });
    }

    const data = await res.json();

    // Group by day (API returns 3-hour intervals)
    const dailyMap = new Map<string, WeatherDay>();

    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];
      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          temp: Math.round(item.main.temp),
          tempMin: Math.round(item.main.temp_min),
          tempMax: Math.round(item.main.temp_max),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed * 3.6), // m/s to km/h
        });
      } else {
        const existing = dailyMap.get(date)!;
        existing.tempMin = Math.min(existing.tempMin, Math.round(item.main.temp_min));
        existing.tempMax = Math.max(existing.tempMax, Math.round(item.main.temp_max));
      }
    }

    const forecast = Array.from(dailyMap.values()).slice(0, 7);
    return NextResponse.json({ forecast });
  } catch {
    return NextResponse.json({ forecast: generateMockForecast() });
  }
}

function generateMockForecast(): WeatherDay[] {
  const days: WeatherDay[] = [];
  const conditions = [
    { desc: "clear sky", icon: "01d" },
    { desc: "few clouds", icon: "02d" },
    { desc: "scattered clouds", icon: "03d" },
    { desc: "light rain", icon: "10d" },
    { desc: "clear sky", icon: "01d" },
  ];

  for (let i = 0; i < 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const c = conditions[i % conditions.length];
    days.push({
      date: date.toISOString().split("T")[0],
      temp: 25 + Math.floor(Math.random() * 10),
      tempMin: 20 + Math.floor(Math.random() * 5),
      tempMax: 30 + Math.floor(Math.random() * 8),
      description: c.desc,
      icon: c.icon,
      humidity: 50 + Math.floor(Math.random() * 30),
      windSpeed: 5 + Math.floor(Math.random() * 15),
    });
  }
  return days;
}
