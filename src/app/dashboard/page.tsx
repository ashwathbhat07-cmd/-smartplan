import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "Traveler";

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back,{" "}
            <span className="gradient-text">{firstName}</span>
          </h1>
          <p className="text-zinc-400">
            Ready to plan your next adventure?
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Link
            href="/trip/new"
            className="group p-6 rounded-2xl border border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-900/30 hover:bg-indigo-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[180px]"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
              <svg
                className="w-6 h-6 text-indigo-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <span className="font-medium text-zinc-300 group-hover:text-white transition-colors">
              Plan New Trip
            </span>
            <span className="text-sm text-zinc-500">
              Start with your budget
            </span>
          </Link>

          <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">My Trips</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-4">
              No trips yet. Create your first one!
            </p>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" />
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-amber-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold">Group Trips</h3>
            </div>
            <p className="text-sm text-zinc-500 mb-4">
              Invite friends and plan together.
            </p>
            <span className="inline-block px-3 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Explore Section */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-6">
            Trending Destinations
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Goa", budget: "₹8,000", vibe: "Party & Beach" },
              { name: "Manali", budget: "₹6,000", vibe: "Adventure" },
              { name: "Jaipur", budget: "₹5,000", vibe: "Cultural" },
              { name: "Bali", budget: "₹25,000", vibe: "Relaxation" },
            ].map((dest) => (
              <div
                key={dest.name}
                className="group p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300 cursor-pointer"
              >
                <div className="w-full h-32 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 mb-4 flex items-center justify-center">
                  <span className="text-zinc-600 text-sm">Photo</span>
                </div>
                <h3 className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-2">{dest.vibe}</p>
                <p className="text-sm font-medium text-teal-400">
                  From {dest.budget}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
