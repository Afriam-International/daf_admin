import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <img
        src="/assets/daf_1.jpg"
        alt="DAF background"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[rgba(15,23,42,0.58)]" />

      <div className="relative grid min-h-screen place-items-center px-4">
        <section className="w-full max-w-md rounded-[28px] border border-white/15 bg-[rgba(255,255,255,0.94)] p-8 shadow-2xl backdrop-blur">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <img
              src="/assets/app_logo.jpg"
              alt="DAF logo"
              className="h-16 w-16 rounded-2xl object-cover shadow-md"
            />
            <div>
              <h1 className="text-2xl font-semibold text-[var(--color-brown)]">DAF App Admin</h1>
              <p className="mt-1 text-sm text-slate-500">Sign in to continue</p>
            </div>
          </div>
          <Outlet />
        </section>
      </div>
    </div>
  );
}
