import { motion } from "framer-motion";
import { CreatePost } from "@/components/CreatePost";
import { PostCard } from "@/components/PostCard";
import { StoriesRail } from "@/components/StoriesRail";
import { usePosts } from "@/hooks/usePosts";
import { Loader2 } from "lucide-react";

/**
 * Home feed: stories rail, composer, real-time list of posts.
 * Each card animates in with a small stagger.
 */
export default function Feed() {
  const { data: posts, isLoading } = usePosts();

  return (
    <div className="grid gap-5 md:grid-cols-[1fr_18rem]">
      {/* Main column */}
      <div className="space-y-5">
        <StoriesRail />
        <CreatePost />

        {isLoading || !posts ? (
          <div className="grid place-items-center py-12">
            <Loader2 className="h-5 w-5 animate-spin text-lumini-blue" />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div layout className="space-y-4">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden md:block">
        <div className="sticky top-24 space-y-4">
          <SidebarCard title="Welcome to Lumini">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              You're using the new React experience. Some screens still load
              the classic UI — open them via "Classic" in the navbar.
            </p>
          </SidebarCard>

          <SidebarCard title="Tips">
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>• Click a profile to see their projects.</li>
              <li>• Like a post to support the author.</li>
              <li>• Posts update live as people add them.</li>
            </ul>
          </SidebarCard>
        </div>
      </aside>
    </div>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/60">
      <h3 className="mb-2 font-heading text-sm font-bold uppercase tracking-wide text-slate-700 dark:text-slate-300">
        {title}
      </h3>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-dashed border-slate-300 bg-white/40 p-10 text-center dark:border-slate-700 dark:bg-slate-900/40"
    >
      <p className="font-heading text-lg font-bold text-slate-700 dark:text-slate-200">
        No posts yet
      </p>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Be the first — write something in the composer above.
      </p>
    </motion.div>
  );
}
