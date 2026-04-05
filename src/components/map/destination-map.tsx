"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
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

// Leaflet must be loaded client-side only (no SSR)
function MapInner({
  destinations,
  selectedId,
  onSelectDestination,
  center = [22.5937, 78.9629], // [lat, lng] — India center
  zoom = 4,
  className = "w-full h-[500px]",
}: DestinationMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    const L = require("leaflet");

    // Init map
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Dark tile layer (free, no token)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(mapRef.current);
    }

    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers
    destinations.forEach((dest) => {
      if (!dest.latitude || !dest.longitude) return;

      const isSelected = dest.id === selectedId;
      const color =
        isSelected ? "#818cf8" : dest.region === "domestic" ? "#22c55e" : "#14b8a6";

      const marker = L.circleMarker([dest.latitude, dest.longitude], {
        radius: isSelected ? 10 : 7,
        fillColor: color,
        fillOpacity: 0.9,
        color: isSelected ? "#c7d2fe" : "rgba(255,255,255,0.5)",
        weight: 2,
      }).addTo(map);

      // Popup
      const popupContent = `
        <div style="background:#111827;border-radius:12px;padding:12px;color:#e2e8f0;font-family:system-ui;min-width:200px;">
          <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${dest.name}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${dest.country}</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${dest.vibes
              .slice(0, 3)
              .map(
                (v) =>
                  `<span style="font-size:10px;padding:2px 6px;background:rgba(99,102,241,0.15);color:#818cf8;border-radius:4px;text-transform:capitalize;">${v}</span>`
              )
              .join("")}
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#2dd4bf;font-weight:600;">${formatBudget(dest.avg_daily_cost)}/day</span>
            <span style="font-size:10px;color:#64748b;">${dest.region === "domestic" ? "🇮🇳 India" : "🌍 Intl"}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: "dark-popup",
        closeButton: false,
        maxWidth: 280,
      });

      marker.on("mouseover", function () {
        marker.openPopup();
        marker.setRadius(isSelected ? 13 : 10);
      });
      marker.on("mouseout", function () {
        marker.closePopup();
        marker.setRadius(isSelected ? 10 : 7);
      });
      marker.on("click", function () {
        onSelectDestination?.(dest.id);
      });

      markersRef.current.push(marker);
    });

    return () => {};
  }, [destinations, selectedId, onSelectDestination, center, zoom]);

  // Fly to selected
  useEffect(() => {
    if (!mapRef.current || !selectedId) return;
    const dest = destinations.find((d) => d.id === selectedId);
    if (dest?.latitude && dest?.longitude) {
      mapRef.current.flyTo([dest.latitude, dest.longitude], 8, {
        duration: 1.5,
      });
    }
  }, [selectedId, destinations]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`${className} rounded-2xl overflow-hidden border border-zinc-800/50 relative`}>
      <div ref={containerRef} className="w-full h-full" />
      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-2 rounded-lg bg-zinc-900/90 backdrop-blur-sm border border-zinc-700/50 flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-zinc-400">India</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-teal-500" />
          <span className="text-xs text-zinc-400">International</span>
        </div>
      </div>
      {/* Custom popup styles */}
      <style jsx global>{`
        .dark-popup .leaflet-popup-content-wrapper {
          background: transparent;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          border-radius: 12px;
          padding: 0;
        }
        .dark-popup .leaflet-popup-content {
          margin: 0;
        }
        .dark-popup .leaflet-popup-tip {
          background: #111827;
        }
        .leaflet-control-zoom a {
          background: #111827 !important;
          color: #94a3b8 !important;
          border-color: #1e293b !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1e293b !important;
          color: #e2e8f0 !important;
        }
        .leaflet-control-attribution {
          background: rgba(6, 8, 15, 0.8) !important;
          color: #64748b !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #818cf8 !important;
        }
      `}</style>
    </div>
  );
}

// Dynamic import to prevent SSR (Leaflet needs window)
export const DestinationMap = dynamic(() => Promise.resolve(MapInner), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] rounded-2xl bg-zinc-900/50 border border-zinc-800/50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-3xl mb-2 animate-pulse">🗺️</div>
        <p className="text-zinc-500 text-sm">Loading map...</p>
      </div>
    </div>
  ),
});
