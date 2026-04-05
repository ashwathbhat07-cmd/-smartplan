import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/50 bg-zinc-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-teal-400 flex items-center justify-center">
              <span className="text-white font-bold text-xs">S</span>
            </div>
            <span className="text-sm font-semibold text-zinc-400">
              SmartPlan
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Dashboard
            </Link>
          </div>
          <p className="text-xs text-zinc-600">
            &copy; {new Date().getFullYear()} SmartPlan. Built with Next.js &
            Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}
