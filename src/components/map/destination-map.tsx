"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Destination } from "@/types";
import { formatBudget } from "@/lib/engine/budget-engine";

interface DestinationMapProps {
  destinations: Destination[];
  selectedId?: string;
  onSelectDestination?: (id: string) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function DestinationMap({
  destinations,
  selectedId,
  onSelectDestination,
  center = [78.9629, 22.5937], // India center
  zoom = 3.5,
  className = "w-full h-[500px]",
}: DestinationMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => setMapLoaded(true));

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.current?.remove();
    };
  }, []);

  // Add markers when map is loaded or destinations change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    destinations.forEach((dest) => {
      if (!dest.latitude || !dest.longitude) return;

      // Custom marker element
      const el = document.createElement("div");
      el.className = "map-marker";
      const isSelected = dest.id === selectedId;
      el.style.cssText = `
        width: ${isSelected ? "20px" : "14px"};
        height: ${isSelected ? "20px" : "14px"};
        border-radius: 50%;
        background: ${isSelected ? "#818cf8" : dest.region === "domestic" ? "#22c55e" : "#14b8a6"};
        border: 2px solid ${isSelected ? "#c7d2fe" : "rgba(255,255,255,0.5)"};
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 0 ${isSelected ? "12px" : "6px"} ${isSelected ? "rgba(129,140,248,0.5)" : "rgba(0,0,0,0.3)"};
      `;

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.4)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
      });

      // Popup
      const popup = new mapboxgl.Popup({
        offset: 20,
        closeButton: false,
        maxWidth: "260px",
      }).setHTML(`
        <div style="background:#111827;border-radius:12px;padding:12px;color:#e2e8f0;font-family:system-ui;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${dest.name}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${dest.country}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${dest.vibes.slice(0, 3).map((v) => `<span style="font-size:10px;padding:2px 6px;background:rgba(99,102,241,0.15);color:#818cf8;border-radius:4px;text-transform:capitalize;">${v}</span>`).join("")}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#2dd4bf;font-weight:600;">${formatBudget(dest.avg_daily_cost)}/day</span>
            <span style="font-size:10px;color:#64748b;">${dest.region === "domestic" ? "🇮🇳 India" : "🌍 Intl"}</span>
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([dest.longitude, dest.latitude])
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener("click", () => {
        onSelectDestination?.(dest.id);
      });

      markersRef.current.push(marker);
    });
  }, [destinations, selectedId, mapLoaded, onSelectDestination]);

  // Fly to selected destination
  useEffect(() => {
    if (!map.current || !selectedId || !mapLoaded) return;
    const dest = destinations.find((d) => d.id === selectedId);
    if (dest?.latitude && dest?.longitude) {
      map.current.flyTo({
        center: [dest.longitude, dest.latitude],
        zoom: 8,
        duration: 1500,
      });
    }
  }, [selectedId, destinations, mapLoaded]);

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token) {
    return (
      <div className={`${className} rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-3xl mb-2">🗺️</div>
          <p className="text-zinc-500 text-sm">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-2xl overflow-hidden border border-zinc-800/50 relative`}>
      <div ref={mapContainer} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 px-3 py-2 rounded-lg bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-zinc-400">India</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-xs text-zinc-400">International</span>
        </div>
      </div>
    </div>
  );
}
