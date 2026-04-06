"use client";

import { useState, useEffect } from "react";
import type { Destination } from "@/types";

interface DocItem {
  id: string;
  text: string;
  required: boolean;
  category: "identity" | "booking" | "health" | "finance" | "misc";
}

const categoryIcons = {
  identity: "🪪",
  booking: "📋",
  health: "💊",
  finance: "💳",
  misc: "📎",
};

function getDocuments(dest: Destination): DocItem[] {
  const isIntl = dest.region === "international";
  const docs: DocItem[] = [];

  // Identity
  if (isIntl) {
    docs.push({ id: "passport", text: "Passport (valid 6+ months)", required: true, category: "identity" });
    docs.push({ id: "visa", text: `Visa for ${dest.country}`, required: true, category: "identity" });
    docs.push({ id: "passport-copy", text: "Passport photocopy (keep separate)", required: true, category: "identity" });
  }
  docs.push({ id: "aadhar", text: "Aadhar Card / Government ID", required: true, category: "identity" });
  docs.push({ id: "photos", text: "Passport-size photos (2 copies)", required: isIntl, category: "identity" });

  // Bookings
  docs.push({ id: "flight", text: "Flight/train tickets (printout)", required: true, category: "booking" });
  docs.push({ id: "hotel", text: "Hotel/stay booking confirmation", required: true, category: "booking" });
  if (isIntl) {
    docs.push({ id: "return-ticket", text: "Return ticket (immigration may ask)", required: true, category: "booking" });
    docs.push({ id: "itinerary", text: "Printed itinerary with addresses", required: false, category: "booking" });
  }

  // Health
  if (isIntl) {
    docs.push({ id: "insurance", text: "Travel insurance document", required: true, category: "health" });
    docs.push({ id: "vaccination", text: "Vaccination certificate (if required)", required: false, category: "health" });
  }
  docs.push({ id: "prescriptions", text: "Prescription for medicines (if carrying)", required: false, category: "health" });

  // Finance
  if (isIntl) {
    docs.push({ id: "forex", text: "Forex card / foreign currency", required: true, category: "finance" });
    docs.push({ id: "intl-card", text: "International debit/credit card", required: true, category: "finance" });
  }
  docs.push({ id: "cash", text: "Cash in small denominations", required: true, category: "finance" });
  docs.push({ id: "upi", text: "UPI apps working (PhonePe/GPay)", required: !isIntl, category: "finance" });

  // Misc
  docs.push({ id: "emergency", text: "Emergency contact numbers printed", required: false, category: "misc" });
  if (isIntl) {
    docs.push({ id: "embassy", text: `Indian Embassy contact in ${dest.country}`, required: false, category: "misc" });
  }

  return docs;
}

interface DocumentChecklistProps {
  destination: Destination;
}

export function DocumentChecklist({ destination }: DocumentChecklistProps) {
  const docs = getDocuments(destination);
  const storageKey = `smartplan-docs-${destination.id}`;

  const [checked, setChecked] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify([...checked]));
  }, [checked, storageKey]);

  const toggleDoc = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const requiredDocs = docs.filter((d) => d.required);
  const requiredDone = requiredDocs.filter((d) => checked.has(d.id)).length;
  const allDone = docs.filter((d) => checked.has(d.id)).length;
  const isReady = requiredDone === requiredDocs.length;

  // Group by category
  const grouped = docs.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, DocItem[]>
  );

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          📄 Travel Documents
        </h3>
        <span className="text-xs text-zinc-500">
          {allDone}/{docs.length} ready
        </span>
      </div>

      {/* Progress */}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isReady
              ? "bg-gradient-to-r from-green-500 to-teal-400"
              : "bg-gradient-to-r from-indigo-500 to-indigo-400"
          }`}
          style={{ width: `${docs.length ? (allDone / docs.length) * 100 : 0}%` }}
        />
      </div>
      <div className="text-xs mb-5">
        {isReady ? (
          <span className="text-green-400 font-medium">✓ All required documents ready!</span>
        ) : (
          <span className="text-amber-400">{requiredDocs.length - requiredDone} required documents pending</span>
        )}
      </div>

      {/* Documents by Category */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              {categoryIcons[category as keyof typeof categoryIcons]} {category}
            </h4>
            <div className="space-y-1">
              {items.map((doc) => {
                const isChecked = checked.has(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-sm transition-all ${
                      isChecked
                        ? "bg-zinc-800/20 text-zinc-600 line-through"
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
                      {isChecked && <span className="text-white text-xs">✓</span>}
                    </div>
                    <span className="flex-1">{doc.text}</span>
                    {doc.required && !isChecked && (
                      <span className="text-xs text-red-400/60 flex-shrink-0">Required</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
