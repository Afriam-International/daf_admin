import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-[var(--color-bg)] px-4">
      <div className="max-w-md rounded-[32px] border border-white/80 bg-white p-8 text-center shadow-[0_30px_100px_rgba(74,44,31,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-accent)]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--color-brown)]">
          Page not found
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you requested does not exist in the DAF admin dashboard.
        </p>
        <Link
          to="/admin"
          className="mt-6 inline-flex rounded-2xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white"
        >
          Return to overview
        </Link>
      </div>
    </div>
  );
}
