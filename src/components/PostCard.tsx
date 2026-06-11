import { motion } from "framer-motion";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToggleLike } from "@/hooks/usePosts";
import { timeAgo } from "@/lib/timeAgo";
import type { Post } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  post: Post;
  index: number;
}

/**
 * Animated, hoverable post card. Likes animate optimistically; the
 * heart fills + scales when toggled.
 */
export function PostCard({ post, index }: Props) {
  const { user } = useAuth();
  const liked = !!user && (post.likedBy?.includes(user.uid) ?? false);
  const toggle = useToggleLike();

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay: Math.min(index * 0.04, 0.4),
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-md transition-shadow hover:shadow-lg hover:shadow-lumini-blue/5 dark:border-white/5 dark:bg-slate-900/60"
    >
      {/* Header: avatar + name + time */}
      <header className="flex items-center gap-3">
        <Link
          to={`/profile/${post.uid}`}
          className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-lumini-blue to-lumini-purple text-sm font-semibold text-white ring-2 ring-white/50 dark:ring-slate-800"
        >
          {post.photoURL ? (
            <img src={post.photoURL} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(post.name)
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <Link
            to={`/profile/${post.uid}`}
            className="block truncate font-heading text-sm font-bold text-slate-900 hover:underline dark:text-slate-100"
          >
            {post.name}
          </Link>
          {post.headline ? (
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {post.headline}
            </p>
          ) : null}
        </div>
        <time className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
          {timeAgo(post.lastEdited ?? post.createdAt)}
        </time>
      </header>

      {/* Body */}
      <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800 dark:text-slate-200">
        {post.text}
      </p>

      {post.attachment ? (
        post.attachmentType?.startsWith("video") ? (
          <video
            src={post.attachment}
            controls
            className="mt-4 max-h-[28rem] w-full rounded-xl bg-black"
          />
        ) : (
          <img
            src={post.attachment}
            alt=""
            loading="lazy"
            className="mt-4 max-h-[28rem] w-full rounded-xl object-cover"
          />
        )
      ) : null}

      {post.tags && post.tags.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-full bg-gradient-to-r from-lumini-blue/10 to-lumini-purple/10 px-2.5 py-0.5 text-xs font-medium text-lumini-blue dark:text-blue-300"
            >
              #{t}
            </span>
          ))}
        </div>
      ) : null}

      {/* Actions */}
      <footer className="mt-4 flex items-center gap-1 border-t border-slate-100 pt-3 dark:border-white/5">
        <ActionButton
          onClick={() => toggle.mutate(post)}
          active={liked}
          activeClass="text-rose-500"
          label={liked ? "Liked" : "Like"}
        >
          <motion.span
            animate={liked ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={cn("h-4.5 w-4.5", liked && "fill-rose-500")}
              strokeWidth={liked ? 0 : 2}
            />
          </motion.span>
          <span className="tabular-nums">{post.likes ?? 0}</span>
        </ActionButton>

        <ActionButton label="Comment">
          <MessageCircle className="h-4.5 w-4.5" />
          <span className="tabular-nums">{post.commentCount ?? 0}</span>
        </ActionButton>

        <ActionButton label="Share">
          <Share2 className="h-4.5 w-4.5" />
        </ActionButton>
      </footer>
    </motion.article>
  );
}

function ActionButton({
  children,
  onClick,
  active,
  activeClass,
  label,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  activeClass?: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800",
        active && activeClass,
      )}
    >
      {children}
    </button>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}
