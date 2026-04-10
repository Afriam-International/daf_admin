import { useEffect, useState } from "react";
import { Download, Gift, Wallet } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import StatCard from "../components/StatCard";
import { analyticsService } from "../services/analyticsService";
import apiClient from "../services/apiClient";
import { formatCurrency, formatDateTime } from "../services/formatters";

export default function DonationsPage() {
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeCampaigns: 0,
    totalRaised: 0,
    totalDonors: 0,
  });
  const [campaigns, setCampaigns] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [statsResponse, campaignsResponse, transactionsResponse] = await Promise.all([
          analyticsService.getDonationStats(),
          apiClient.get("/donations"),
          apiClient.get("/donations/transactions"),
        ]);

        setStats(statsResponse.data.data || {});
        setCampaigns(campaignsResponse.data.data || []);
        setTransactions(transactionsResponse.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load Givebutter campaigns");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const exportDonors = () => {
    const csv = [
      ["Supporter", "Campaign", "Amount", "Currency", "Status", "Created At"].join(","),
      ...transactions.map((transaction) =>
        [
          transaction.supporterName || "",
          transaction.campaignTitle || "",
          transaction.amount || "",
          transaction.currency || "",
          transaction.status || "",
          transaction.createdAt || "",
        ]
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "daf-donors.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Donations"
        title="Givebutter campaigns"
        description="Campaigns and donation activity are sourced directly from Givebutter."
        actions={
          <button type="button" onClick={exportDonors} className="inline-flex items-center gap-2 rounded-2xl bg-[var(--color-brown)] px-4 py-3 text-sm font-semibold text-white">
            <Download className="h-4 w-4" />
            Export Donors
          </button>
        }
      />

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <PageLoader label="Loading donations and donor activity..." />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard title="Campaigns" value={stats.totalDonations} icon={Gift} helper="Tracked causes" accent="accent" />
            <StatCard title="Active campaigns" value={stats.activeCampaigns} icon={Wallet} helper="Live in Givebutter" accent="brown" />
            <StatCard title="Total raised" value={formatCurrency(stats.totalRaised)} icon={Gift} helper="Across selected causes" accent="accent" />
            <StatCard title="Total donors" value={stats.totalDonors || 0} icon={Wallet} helper="Givebutter donor count" accent="sand" />
          </div>

          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-semibold text-[var(--color-brown)]">Campaigns</h2>
            </div>
            <div className="grid gap-4 p-6 lg:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((campaign) => (
                <article key={campaign.id} className="overflow-hidden rounded-[26px] border border-slate-100 bg-slate-50">
                  {campaign.coverImage ? <img src={campaign.coverImage} alt={campaign.title} className="h-48 w-full object-cover" /> : null}
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium capitalize text-slate-600">{campaign.status}</span>
                    </div>
                    <p className="line-clamp-3 text-sm text-slate-600">{campaign.description}</p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-slate-500">Raised</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatCurrency(campaign.raised)}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <p className="text-slate-500">Goal</p>
                        <p className="mt-1 font-semibold text-slate-900">{formatCurrency(campaign.goal)}</p>
                      </div>
                    </div>
                    {campaign.url ? <a href={campaign.url} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white">Open in Givebutter</a> : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[30px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-semibold text-[var(--color-brown)]">Recent transactions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.2em] text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Supporter</th>
                    <th className="px-6 py-4">Campaign</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-t border-slate-100">
                      <td className="px-6 py-4 text-sm text-slate-900">{transaction.supporterName}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{transaction.campaignTitle}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{formatCurrency(transaction.amount)}</td>
                      <td className="px-6 py-4 text-sm capitalize text-slate-600">{transaction.status}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{formatDateTime(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
