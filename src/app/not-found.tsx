import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-20 text-white">
      <div className="max-w-lg text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">404</p>
        <h1 className="mt-4 text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-slate-300">
          The page you are looking for may have moved or no longer exists.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-xl bg-cyan-500 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-400"
        >
          Return home
        </Link>
      </div>
    </main>
  );
}
