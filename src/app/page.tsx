import Link from "next/link";

const features = [
  {
    icon: "💰",
    title: "Budget-First Engine",
    description:
      "Tell us your budget — we find destinations that fit perfectly. No more browsing places you can't afford.",
    gradient: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/20",
  },
  {
    icon: "🤖",
    title: "AI Itineraries",
    description:
      "Powered by Gemini AI — get day-by-day personalized itineraries tailored to your vibe, pace, and interests.",
    gradient: "from-indigo-500/20 to-purple-500/20",
    border: "border-indigo-500/20",
  },
  {
    icon: "👥",
    title: "Group Planning",
    description:
      "Invite friends, vote on destinations anonymously, chat in real-time, and split expenses fairly.",
    gradient: "from-teal-500/20 to-cyan-500/20",
    border: "border-teal-500/20",
  },
  {
    icon: "🗺️",
    title: "Interactive Maps",
    description:
      "Visualize your entire trip on a beautiful interactive map with pins, routes, and nearby attractions.",
    gradient: "from-orange-500/20 to-amber-500/20",
    border: "border-orange-500/20",
  },
];

const stats = [
  { value: "44+", label: "Curated Destinations" },
  { value: "₹0", label: "Starting Price" },
  { value: "AI", label: "Powered Itineraries" },
  { value: "∞", label: "Group Members" },
];

const steps = [
  {
    step: "01",
    title: "Set Your Budget",
    description: "Enter how much you want to spend. That's it — budget first, always.",
    color: "text-green-400",
  },
  {
    step: "02",
    title: "Pick Your Vibe",
    description: "Adventure? Relaxation? Foodie trip? We match destinations to your energy.",
    color: "text-indigo-400",
  },
  {
    step: "03",
    title: "Get AI Itinerary",
    description: "Gemini AI creates a day-by-day plan — activities, costs, timing, everything.",
    color: "text-teal-400",
  },
  {
    step: "04",
    title: "Invite & Go",
    description: "Share with friends, vote together, split expenses, and just go.",
    color: "text-amber-400",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Background effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-indigo-500/25 bg-indigo-500/10 text-indigo-300 text-sm animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            AI-Powered Travel Planning
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1] tracking-tight mb-6 animate-fade-in-up">
            Plan Your Dream Trip
            <br />
            <span className="gradient-text">Budget First</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Stop browsing destinations you can&apos;t afford. Enter your budget,
            get AI-powered suggestions, build itineraries, and plan group trips
            — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <Link
              href="/login"
              className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/25 text-lg"
            >
              Start Planning — It&apos;s Free
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-xl" />
            </Link>
            <Link
              href="#how-it-works"
              className="px-8 py-4 border border-zinc-700 hover:border-zinc-500 text-zinc-300 hover:text-white font-medium rounded-xl transition-all duration-200 text-lg"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50"
              >
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-zinc-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 rounded-full border-2 border-zinc-700 flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 rounded-md mb-4">
              Features
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="gradient-text">Travel Smart</span>
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Built for real travelers who care about their budget but
              don&apos;t want to compromise on experience.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className={`group relative p-8 rounded-2xl border ${feature.border} bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:-translate-y-1 transition-all duration-300`}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-400 bg-teal-500/10 rounded-md mb-4">
              How It Works
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Four Steps to Your{" "}
              <span className="gradient-text">Perfect Trip</span>
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((item, i) => (
              <div
                key={item.step}
                className="group flex gap-6 p-6 rounded-2xl border border-zinc-800/50 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-zinc-700/50 transition-all duration-300"
              >
                <div
                  className={`text-4xl font-black ${item.color} opacity-30 group-hover:opacity-100 transition-opacity shrink-0`}
                >
                  {item.step}
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
                  <p className="text-zinc-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24">
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-zinc-800/50 bg-gradient-to-br from-indigo-500/10 via-zinc-900/50 to-teal-500/10 p-12 sm:p-16 text-center overflow-hidden">
            {/* Glow effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
            <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-teal-500/10 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ready to Plan{" "}
                <span className="gradient-text">Smarter?</span>
              </h2>
              <p className="text-zinc-400 max-w-lg mx-auto mb-8 text-lg">
                Join thousands of travelers who plan budget-first and
                never overspend. Free forever.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-zinc-100 text-zinc-900 font-semibold rounded-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl text-lg"
              >
                Get Started Free
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
