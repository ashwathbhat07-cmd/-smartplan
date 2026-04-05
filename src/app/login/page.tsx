import { LoginButton } from "@/components/auth/login-button";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-teal-500/6 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-teal-400 items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to SmartPlan</h1>
          <p className="text-zinc-400">
            Sign in to start planning your perfect trip
          </p>
        </div>

        {/* Login Card */}
        <div className="p-8 rounded-2xl border border-zinc-800/50 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-6">
            <LoginButton />
            <div className="flex items-center gap-3 w-full">
              <div className="h-px flex-1 bg-zinc-800" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">
                Secure login
              </span>
              <div className="h-px flex-1 bg-zinc-800" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-zinc-500">
                We only access your name and email.
              </p>
              <p className="text-sm text-zinc-500">
                No credit card required. Free forever.
              </p>
            </div>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex items-center justify-center gap-6 text-xs text-zinc-600">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            SSL Encrypted
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Supabase Auth
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Free Forever
          </span>
        </div>
      </div>
    </div>
  );
}
