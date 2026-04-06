"use client";

import { useState } from "react";
import type { Destination } from "@/types";

interface SOSButtonProps {
  destination: Destination;
}

export function SOSButton({ destination }: SOSButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("smartplan-emergency-contact") || "";
  });
  const [editing, setEditing] = useState(false);

  const handleSaveContact = () => {
    localStorage.setItem("smartplan-emergency-contact", emergencyContact);
    setEditing(false);
  };

  const handleSOS = () => {
    if (!emergencyContact) {
      setShowPanel(true);
      setEditing(true);
      return;
    }

    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const mapLink = `https://maps.google.com/?q=${latitude},${longitude}`;
          const message = `SOS! I need help!\n\nMy location: ${mapLink}\n\nI'm traveling in ${destination.name}, ${destination.country}\n\nSent from SmartPlan`;
          window.open(`sms:${emergencyContact}?body=${encodeURIComponent(message)}`, "_self");
        },
        () => {
          const message = `SOS! I need help!\n\nI'm traveling in ${destination.name}, ${destination.country}\n\n(Location unavailable)\n\nSent from SmartPlan`;
          window.open(`sms:${emergencyContact}?body=${encodeURIComponent(message)}`, "_self");
        }
      );
    }
  };

  return (
    <>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="px-3 py-2 text-sm bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg transition-all flex items-center gap-1.5"
        title="Emergency SOS"
      >
        🆘 SOS
      </button>

      {showPanel && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPanel(false)}>
          <div className="max-w-sm w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-red-400 mb-4">🆘 Emergency SOS</h3>

            <div className="mb-4">
              <label className="text-sm text-zinc-400 mb-2 block">Emergency Contact Number</label>
              {editing ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm focus:outline-none focus:border-red-500"
                  />
                  <button onClick={handleSaveContact} className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg">Save</button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50">
                  <span className="text-sm font-mono">{emergencyContact || "Not set"}</span>
                  <button onClick={() => setEditing(true)} className="text-xs text-indigo-400">Edit</button>
                </div>
              )}
            </div>

            <button
              onClick={handleSOS}
              disabled={!emergencyContact}
              className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-lg transition-all disabled:opacity-40"
            >
              📍 Send My Location via SMS
            </button>

            <p className="text-xs text-zinc-600 mt-3 text-center">
              Sends your GPS location + destination info to your emergency contact
            </p>
          </div>
        </div>
      )}
    </>
  );
}
