import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import PageHeader from "../components/PageHeader";
import PageLoader from "../components/PageLoader";
import { blogService } from "../services/blogService";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await blogService.getPosts({ page: 1, perPage: 24 });
        setPosts(response.data || []);
      } catch {
        setError("Unable to load DAF news right now.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredPosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return posts;

    return posts.filter((post) => {
      const title = post.title?.rendered?.toLowerCase() || "";
      const excerpt = post.excerpt?.rendered?.toLowerCase() || "";
      return title.includes(query) || excerpt.includes(query);
    });
  }, [posts, deferredSearch]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="DAF News"
        title="Blog"
        description="All blog posts from Diaspora News Guide under the DAF news section."
      />

      <section className="rounded-[30px] border border-white/70 bg-white/90 p-6 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">Search Blog Posts</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title or excerpt"
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </label>
      </section>

      {error ? <div className="rounded-[28px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">{error}</div> : null}

      {loading ? (
        <PageLoader label="Loading blog posts..." />
      ) : filteredPosts.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredPosts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_24px_60px_rgba(74,44,31,0.08)]">
              {post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ? (
                <img src={post._embedded["wp:featuredmedia"][0].source_url} alt={post.title?.rendered || "news"} className="h-48 w-full object-cover" />
              ) : null}
              <div className="space-y-4 p-5">
                <h2 className="line-clamp-3 text-lg font-semibold text-slate-900" dangerouslySetInnerHTML={{ __html: post.title?.rendered || "" }} />
                <div className="line-clamp-4 text-sm text-slate-600" dangerouslySetInnerHTML={{ __html: post.excerpt?.rendered || "" }} />
                <a href={post.link} target="_blank" rel="noreferrer" className="inline-flex rounded-2xl bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-white">Read post</a>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-[30px] border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center shadow-[0_24px_60px_rgba(74,44,31,0.04)]">
          <h2 className="text-xl font-semibold text-[var(--color-brown)]">No blogs found</h2>
          <p className="mt-2 text-sm text-slate-500">Try a different search term or check back later for new DAF news.</p>
        </div>
      )}
    </div>
  );
}
