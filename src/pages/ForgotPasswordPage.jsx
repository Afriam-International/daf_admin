import { Link } from "react-router-dom";
import { ArrowLeft, LifeBuoy } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div>
      <Link to="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-accent)]">
        <ArrowLeft className="h-4 w-4" />
        Back to login
      </Link>

      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--color-accent)] text-white">
          <LifeBuoy className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-2xl font-semibold text-[var(--color-brown)]">Contact support</h2>
        <p className="mt-3 text-sm leading-6 text-slate-600">
        Please contact support or a superadmin to reset your access, then change your password after signing in.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex rounded-2xl  px-5 py-3 text-sm font-semibold text-white"
        >
          Return to login
        </Link>
      </div>
    </div>
  );
}
