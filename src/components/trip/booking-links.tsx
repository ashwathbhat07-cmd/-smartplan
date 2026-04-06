"use client";

import type { Destination } from "@/types";

interface BookingLinksProps {
  destination: Destination;
  startDate?: string | null;
}

export function BookingLinks({ destination, startDate }: BookingLinksProps) {
  if (destination.region !== "domestic") return null;

  const date = startDate ? new Date(startDate) : new Date();
  const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;

  const links = [
    {
      name: "IRCTC",
      emoji: "🚂",
      desc: "Book trains",
      url: `https://www.irctc.co.in/`,
      color: "text-blue-400",
    },
    {
      name: "RedBus",
      emoji: "🚌",
      desc: "Book buses",
      url: `https://www.redbus.in/`,
      color: "text-red-400",
    },
    {
      name: "MakeMyTrip",
      emoji: "✈️",
      desc: "Flights & hotels",
      url: `https://www.makemytrip.com/`,
      color: "text-indigo-400",
    },
    {
      name: "Ola",
      emoji: "🚕",
      desc: "Airport cab",
      url: `https://book.olacabs.com/`,
      color: "text-green-400",
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
      <h3 className="font-semibold mb-3 flex items-center gap-2">🎫 Book Travel</h3>
      <div className="grid grid-cols-2 gap-2">
        {links.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors group"
          >
            <span className="text-lg">{link.emoji}</span>
            <div>
              <div className={`text-sm font-medium group-hover:${link.color} transition-colors`}>{link.name}</div>
              <div className="text-xs text-zinc-600">{link.desc}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
