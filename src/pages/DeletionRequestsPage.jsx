import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import { userService } from "../services/userService";
import { formatDateTime } from "../services/formatters";

export default function DeletionRequestsPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await userService.getDeletionRequests({ page: 1, limit: 100 });
        setUsers(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load deletion requests");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Deletion Requests"
        title="Requested account deletions"
        description="These are users who have requested their accounts to be deleted."
      />

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <PageLoader label="Loading deletion requests..." />
      ) : (
      <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{`${user.firstname || ""} ${user.lastname || ""}`.trim()}</p>
                      <p className="text-sm text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-6 py-4"><span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">Requested Deletion</span></td>
                    <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(user.updatedAt || user.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-6 py-10 text-center text-sm text-slate-500">No deletion requests yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      )}
    </div>
  );
}
