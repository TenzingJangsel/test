import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatePost } from "@/hooks/usePosts";

const MAX = 1000;

/**
 * Composer for new text posts. Collapsed by default; expands on focus.
 */
export function CreatePost() {
  const { user, profile } = useAuth();
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const create = useCreatePost();

  if (!user) return null;

  const handleSubmit = async () => {
    try {
      await create.mutateAsync(text);
      setText("");
      setFocused(false);
      toast.success("Posted");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't post");
    }
  };

  const initials = (profile?.name ?? user.displayName ?? "?")
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      layout
      className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/60"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-lumini-blue to-lumini-purple text-sm font-semibold text-white">
          {profile?.photoURL ?? user.photoURL ? (
            <img
              src={profile?.photoURL ?? user.photoURL ?? ""}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        <div className="flex-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX))}
            onFocus={() => setFocused(true)}
            placeholder="What's on your mind?"
            rows={focused ? 3 : 1}
            className="w-full resize-none border-0 bg-transparent text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-slate-100 dark:placeholder:text-slate-500"
            style={{ minHeight: focused ? "5rem" : "2.5rem" }}
          />

          <AnimatePresence>
            {focused ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-center justify-between"
              >
                <span className="text-xs text-slate-400 tabular-nums">
                  {text.length} / {MAX}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setText("");
                      setFocused(false);
                    }}
                    className="rounded-full px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={create.isPending || !text.trim()}
                    className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-lumini-blue to-lumini-purple px-4 py-1.5 text-sm font-semibold text-white shadow-md shadow-lumini-blue/25 transition-all hover:shadow-lg hover:shadow-lumini-purple/30 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {create.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Post
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
