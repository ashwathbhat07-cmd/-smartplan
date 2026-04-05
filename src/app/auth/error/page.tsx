import Link from "next/link";

export default function AuthError() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="text-5xl">😕</div>
        <h1 className="text-2xl font-bold text-white">Authentication Error</h1>
        <p className="text-zinc-400">Something went wrong during sign in.</p>
        <Link
          href="/"
          className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
