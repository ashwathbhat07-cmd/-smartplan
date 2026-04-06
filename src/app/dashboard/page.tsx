import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { destinations } from "@/lib/data/destinations";
import { formatBudget } from "@/lib/engine/budget-engine";
import Link from "next/link";

const statusConfig = {
  planning: { label: "Planning", color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  confirmed: { label: "Confirmed", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
  completed: { label: "Completed", color: "text-zinc-400", bg: "bg-zinc-500/10", border: "border-zinc-500/20" },
};

export default async function Dashboard() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "Traveler";

  // Fetch saved trips — with error handling
  let trips: Array<{
    id: string;
    title: string;
    budget: number;
    duration_days: number;
    destination_id: string | null;
    status: string;
    vibe: string;
    created_at: string;
  }> = [];

  try {
    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error && data) {
      trips = data;
    }
  } catch {
    // Supabase error — show dashboard anyway with empty trips
  }

  // Get trending destinations based on current month
  const currentMonth = new Date().getMonth() + 1;
  const trending = destinations
    .filter((d) => d.best_months.includes(currentMonth))
    .slice(0, 4);

  // Stats
  const totalTrips = trips.length;
  const planningTrips = trips.filter((t) => t.status === "planning").length;
  const completedTrips = trips.filter((t) => t.status === "completed").length;
  const uniqueDestinations = new Set(trips.map((t) => t.destination_id).filter(Boolean)).size;

  return (
    <div className="min-h-screen pt-24 px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        {/* Welcome Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back,{" "}
              <span className="gradient-text">{firstName}</span>
            </h1>
            <p className="text-zinc-400 text-sm">
              Ready to plan your next adventure?
            </p>
          </div>
          <Link
            href="/trip/new"
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
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
            New Trip
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-2xl font-bold text-indigo-400">{totalTrips}</div>
            <div className="text-xs text-zinc-500">Total Trips</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-2xl font-bold text-amber-400">{planningTrips}</div>
            <div className="text-xs text-zinc-500">In Planning</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-2xl font-bold text-green-400">{completedTrips}</div>
            <div className="text-xs text-zinc-500">Completed</div>
          </div>
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50">
            <div className="text-2xl font-bold text-teal-400">{uniqueDestinations}</div>
            <div className="text-xs text-zinc-500">Destinations</div>
          </div>
        </div>

        {/* My Trips */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold mb-4">My Trips</h2>

          {trips.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trips.map((trip) => {
                const dest = destinations.find((d) => d.id === trip.destination_id);
                const config = statusConfig[trip.status as keyof typeof statusConfig] || statusConfig.planning;

                return (
                  <Link
                    key={trip.id}
                    href={dest ? `/explore/${dest.id}?budget=${trip.budget}&duration=${trip.duration_days}&vibes=${trip.vibe}&travelers=1&region=${dest.region}` : "/trip/new"}
                    className="group p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300"
                  >
                    {/* Image */}
                    {dest ? (
                      <img
                        src={dest.image_url}
                        alt={dest.name}
                        className="w-full h-32 rounded-lg object-cover mb-4 group-hover:scale-[1.02] transition-transform"
                      />
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-gradient-to-br from-zinc-800 to-zinc-900 mb-4 flex items-center justify-center">
                        <span className="text-zinc-600 text-2xl">🗺️</span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold group-hover:text-indigo-400 transition-colors truncate">
                        {trip.title}
                      </h3>
                      <span className={`px-2 py-0.5 text-xs rounded-md ${config.bg} ${config.color} border ${config.border} flex-shrink-0 ml-2`}>
                        {config.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                      <span>{formatBudget(trip.budget)}</span>
                      <span>•</span>
                      <span>{trip.duration_days} days</span>
                      {trip.vibe && (
                        <>
                          <span>•</span>
                          <span className="capitalize">{trip.vibe}</span>
                        </>
                      )}
                    </div>

                    <div className="text-xs text-zinc-600 mt-2">
                      Created {new Date(trip.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </Link>
                );
              })}

              {/* New Trip Card */}
              <Link
                href="/trip/new"
                className="group p-6 rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500/50 bg-zinc-900/30 hover:bg-indigo-500/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[220px]"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors text-xl">
                  +
                </div>
                <span className="font-medium text-zinc-400 group-hover:text-white transition-colors">
                  Plan Another Trip
                </span>
              </Link>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/20">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-xl font-bold mb-2">No trips yet</h3>
              <p className="text-zinc-500 mb-6 max-w-md mx-auto">
                Your travel adventures start here. Create your first trip and
                let AI plan the perfect itinerary.
              </p>
              <Link
                href="/trip/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/25"
              >
                Plan My First Trip ✨
              </Link>
            </div>
          )}
        </div>

        {/* Trending This Month */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              Trending in{" "}
              {new Date().toLocaleString("en", { month: "long" })}
            </h2>
            <Link
              href="/trip/new"
              className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Explore all →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trending.map((dest) => (
              <Link
                key={dest.id}
                href={`/explore/${dest.id}?budget=${dest.avg_daily_cost * 3}&duration=3&vibes=${dest.vibes[0]}&travelers=1&region=${dest.region}`}
                className="group p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300"
              >
                <img
                  src={dest.image_url}
                  alt={dest.name}
                  className="w-full h-32 rounded-lg object-cover mb-3 group-hover:scale-[1.02] transition-transform"
                />
                <h3 className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
                  {dest.name}
                </h3>
                <p className="text-sm text-zinc-500 mb-1 capitalize">
                  {dest.vibes.slice(0, 2).join(" & ")}
                </p>
                <p className="text-sm font-medium text-teal-400">
                  From {formatBudget(dest.avg_daily_cost)}/day
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Link
            href="/compare"
            className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all group"
          >
            <div className="text-2xl mb-2">⚖️</div>
            <h3 className="font-semibold mb-1 group-hover:text-indigo-400 transition-colors">
              Compare
            </h3>
            <p className="text-xs text-zinc-500">
              Can&apos;t decide? Compare destinations side-by-side
            </p>
          </Link>
          <Link
            href="/surprise"
            className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all group"
          >
            <div className="text-2xl mb-2">🎲</div>
            <h3 className="font-semibold mb-1 group-hover:text-teal-400 transition-colors">
              Surprise Me
            </h3>
            <p className="text-xs text-zinc-500">
              Let SmartPlan pick the perfect destination for you
            </p>
          </Link>
          <div className="p-5 rounded-xl border border-zinc-800/50 bg-zinc-900/30">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold mb-1">Group Trips</h3>
            <p className="text-xs text-zinc-500 mb-2">
              Plan together, vote on destinations, split costs
            </p>
            <span className="inline-block px-2.5 py-0.5 text-xs font-medium text-amber-400 bg-amber-500/10 rounded-full border border-amber-500/20">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
