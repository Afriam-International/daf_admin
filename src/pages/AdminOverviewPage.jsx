import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenText, Images, ShieldCheck, Trash2, Users, Wallet } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import StatCard from "../components/StatCard";
import { analyticsService } from "../services/analyticsService";
import { blogService } from "../services/blogService";
import { userService } from "../services/userService";
import { galleryService } from "../services/galleryService";
import { feedService } from "../services/feedService";
import { useAuth } from "../hooks/useAuth";
import {
  formatCompactNumber,
  formatCurrency,
  formatDateTime,
} from "../services/formatters";

const superadminStats = {
  totalUsers: 0,
  activeUsers: 0,
  adminUsers: 0,
  totalRaised: 0,
  activeCampaigns: 0,
  userTrend: 0,
  revenueTrend: 0,
  recentActivity: [],
  recentCampaigns: [],
};

export default function AdminOverviewPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [news, setNews] = useState([]);
  const [superStats, setSuperStats] = useState(superadminStats);
  const [adminStats, setAdminStats] = useState({
    userCount: 0,
    deletionCount: 0,
    galleryCount: 0,
    feedCount: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        if (user?.role === "superadmin") {
          const [statsResponse, newsResponse] = await Promise.all([
            analyticsService.getDashboardStats(),
            blogService.getPosts({ page: 1, perPage: 4 }),
          ]);

          setSuperStats({ ...superadminStats, ...statsResponse.data.data });
          setNews(newsResponse.data || []);
        } else {
          const [usersResponse, deletionsResponse, galleryResponse, feedResponse, newsResponse] =
            await Promise.all([
              userService.getAllUsers({ page: 1, limit: 1, role: "user" }),
              userService.getDeletionRequests({ page: 1, limit: 1 }),
              galleryService.getImages(),
              feedService.getFeeds(),
              blogService.getPosts({ page: 1, perPage: 4 }),
            ]);

          setAdminStats({
            userCount: usersResponse.data.pagination?.total || 0,
            deletionCount: deletionsResponse.data.pagination?.total || 0,
            galleryCount: (galleryResponse.data.data || []).length,
            feedCount: (feedResponse.data.data || []).length,
          });
          setNews(newsResponse.data || []);
        }
      } catch {
        setError("Unable to load dashboard data right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user?.role]);

  const isSuperadmin = user?.role === "superadmin";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Dashboard"
        description={
          isSuperadmin
            ? "A quick look at platform growth, fundraising, activity, and DAF news."
            : "A quick look at the sections you manage every day across users, feed, gallery, and requests."
        }
      />

      {error ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          {error}
        </div>
      ) : null}

      {loading ? (
        <PageLoader label="Loading dashboard overview..." />
      ) : isSuperadmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total users" value={formatCompactNumber(superStats.totalUsers)} icon={Users} trend={superStats.userTrend} helper="All registered accounts" accent="teal" />
            <StatCard title="Active users" value={formatCompactNumber(superStats.activeUsers)} icon={Users} trend={superStats.userTrend} helper="Users with active status" accent="accent" />
            <StatCard title="Admin team" value={formatCompactNumber(superStats.adminUsers)} icon={ShieldCheck} helper="Admins and superadmins" accent="brown" />
            <StatCard title="Total raised" value={formatCurrency(superStats.totalRaised)} icon={Wallet} trend={superStats.revenueTrend} helper={`${superStats.activeCampaigns || 0} active campaigns`} accent="sand" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-brown)]">Recent activity</h2>
                <p className="mt-1 text-sm text-slate-500">Latest account activity from the backend.</p>
              </div>

              <div className="mt-6 space-y-3">
                {superStats.recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                    <p className="text-sm font-medium text-slate-900">{item.description}</p>
                    <p className="text-xs text-slate-500">{formatDateTime(item.timestamp)}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <div>
                <h2 className="text-xl font-semibold text-[var(--color-brown)]">Givebutter campaigns</h2>
                <p className="mt-1 text-sm text-slate-500">Selected causes of interest currently tracked.</p>
              </div>

              <div className="mt-6 space-y-3">
                {superStats.recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-slate-900">{campaign.title}</h3>
                      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium capitalize text-slate-600">
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>Raised {formatCurrency(campaign.raised)}</span>
                      <span>{campaign.donors} donors</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Users" value={formatCompactNumber(adminStats.userCount)} icon={Users} helper="Accounts you can manage" accent="teal" />
            <StatCard title="Deletion requests" value={formatCompactNumber(adminStats.deletionCount)} icon={Trash2} helper="Accounts awaiting review" accent="accent" />
            <StatCard title="Gallery images" value={formatCompactNumber(adminStats.galleryCount)} icon={Images} helper="Images available" accent="brown" />
            <StatCard title="Social feed posts" value={formatCompactNumber(adminStats.feedCount)} icon={BookOpenText} helper="Posts ready for the mobile app" accent="sand" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-brown)]">Quick access</h2>
                  <p className="mt-1 text-sm text-slate-500">Jump back into the parts of the dashboard you manage.</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {[
                  { label: "Manage Users", to: "/admin/users", helper: "View member records and demographics." },
                  { label: "Review Deletion Requests", to: "/admin/deletion-requests", helper: "Handle pending account deletion requests." },
                  { label: "Update Gallery", to: "/admin/gallery", helper: "Add or remove mobile app gallery images." },
                  { label: "Manage Social Feed", to: "/admin/social-feed", helper: "Create and update curated social posts." },
                  { label: "Browse DAF News", to: "/admin/blog", helper: "Review news content shown in the admin dashboard." },
                ].map((item) => (
                  <Link key={item.to} to={item.to} className="rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-4 transition hover:border-[var(--color-teal)]/30 hover:bg-white">
                    <p className="font-semibold text-slate-900">{item.label}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.helper}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-[var(--color-brown)]">DAF News</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest posts from Diaspora News Guide.</p>
                </div>
                <Link to="/admin/blog" className="inline-flex rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">
                  View all
                </Link>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                {news.map((post) => (
                  <article key={post.id} className="overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50">
                    {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                      <img src={post._embedded["wp:featuredmedia"][0].source_url} alt={post.title?.rendered || "news"} className="h-40 w-full object-cover" />
                    ) : null}
                    <div className="space-y-3 p-4">
                      <h3 className="line-clamp-3 text-sm font-semibold text-slate-900" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }} />
                      <a href={post.link} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl bg-[var(--color-teal)] px-4 py-2 text-sm font-semibold text-white">
                        Read post
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
