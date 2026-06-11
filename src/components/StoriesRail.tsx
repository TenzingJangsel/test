import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useStories, type StoryGroup } from "@/hooks/useStories";
import { useNavigate } from "react-router-dom";

/**
 * Horizontal rail of story bubbles. Tapping one goes to the legacy
 * viewer for now; tapping the "+" goes to the legacy uploader.
 */
export function StoriesRail() {
  const groups = useStories();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/60">
      <div className="flex gap-4 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Your own bubble — opens uploader */}
        {user ? (
          <button
            onClick={() => navigate("/legacy")}
            className="flex shrink-0 flex-col items-center gap-1.5"
            aria-label="Add story"
          >
            <span className="relative grid h-16 w-16 place-items-center rounded-full bg-slate-100 ring-2 ring-slate-200 transition-transform hover:scale-105 dark:bg-slate-800 dark:ring-slate-700">
              {profile?.photoURL ?? user.photoURL ? (
                <img
                  src={profile?.photoURL ?? user.photoURL ?? ""}
                  alt=""
                  className="h-full w-full rounded-full object-cover"
                />
              ) : null}
              <span className="absolute -bottom-0.5 -right-0.5 grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-lumini-blue to-lumini-purple text-white shadow-md ring-2 ring-white dark:ring-slate-900">
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
            </span>
            <span className="max-w-[4rem] truncate text-[11px] text-slate-600 dark:text-slate-400">
              Your story
            </span>
          </button>
        ) : null}

        {groups.map((g, i) => (
          <StoryBubble key={g.uid} group={g} index={i} onOpen={() => navigate("/legacy")} />
        ))}

        {groups.length === 0 ? (
          <p className="self-center pl-2 text-sm text-slate-400 dark:text-slate-500">
            No active stories yet.
          </p>
        ) : null}
      </div>
    </div>
  );
}

function StoryBubble({
  group,
  index,
  onOpen,
}: {
  group: StoryGroup;
  index: number;
  onOpen: () => void;
}) {
  const first = (group.name ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.button
      onClick={onOpen}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -2 }}
      className="flex shrink-0 flex-col items-center gap-1.5"
    >
      <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-lumini-blue via-fuchsia-500 to-lumini-purple p-[2px]">
        <span className="grid h-full w-full place-items-center overflow-hidden rounded-full bg-white text-sm font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
          {group.photoURL ? (
            <img
              src={group.photoURL}
              alt=""
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            first
          )}
        </span>
      </span>
      <span className="max-w-[4rem] truncate text-[11px] text-slate-600 dark:text-slate-400">
        {group.name}
      </span>
    </motion.button>
  );
}
