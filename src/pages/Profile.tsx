import { motion } from "framer-motion";
import { Github, Globe, Linkedin, Loader2, Twitter, UserPlus, UserMinus } from "lucide-react";
import { useParams } from "react-router-dom";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/contexts/AuthContext";
import { useUserDirectory } from "@/hooks/useUserDirectory";
import { APP_ID, db } from "@/lib/firebase";
import type { Post, UserProfile } from "@/lib/types";

export default function Profile() {
  const { uid: routeUid } = useParams<{ uid: string }>();
  const { user: me, profile: myProfile } = useAuth();

  // If no uid in URL, show the current user's profile.
  const uid = routeUid ?? me?.uid;
  const isMe = !!me && uid === me.uid;

  const directory = useUserDirectory(uid);
  const [privateProfile, setPrivateProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [busy, setBusy] = useState(false);

  // Stream the private profile (only the user themself can usually read this
  // depending on Security Rules; for other users we just won't get a result).
  useEffect(() => {
    if (!uid) return;
    const ref = doc(db, "artifacts", APP_ID, "users", uid, "profile", "main");
    return onSnapshot(
      ref,
      (snap) => {
        if (snap.exists()) setPrivateProfile(snap.data() as UserProfile);
      },
      () => setPrivateProfile(null),
    );
  }, [uid]);

  // Stream this user's posts.
  useEffect(() => {
    if (!uid) return;
    const col = collection(db, "artifacts", APP_ID, "public", "data", "posts");
    const q = query(col, where("uid", "==", uid), orderBy("lastEdited", "desc"));
    return onSnapshot(
      q,
      (snap) =>
        setPosts(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Post, "id">) })),
        ),
      () => setPosts([]),
    );
  }, [uid]);

  if (!uid) {
    return <p className="text-slate-500">Sign in to see your profile.</p>;
  }
  if (!directory) {
    return (
      <div className="grid place-items-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-lumini-blue" />
      </div>
    );
  }

  const iAmFollowing =
    !!me && (myProfile?.following?.includes(uid) ?? false);

  const handleFollow = async () => {
    if (!me) return;
    if (me.uid === uid) return;
    setBusy(true);
    try {
      const myRef = doc(db, "artifacts", APP_ID, "public", "data", "users_directory", me.uid);
      const otherRef = doc(db, "artifacts", APP_ID, "public", "data", "users_directory", uid);
      if (iAmFollowing) {
        await updateDoc(myRef, { following: arrayRemove(uid) });
        await updateDoc(otherRef, { followers: arrayRemove(me.uid) });
        toast.success(`Unfollowed ${directory.name}`);
      } else {
        await updateDoc(myRef, { following: arrayUnion(uid) });
        await updateDoc(otherRef, { followers: arrayUnion(me.uid) });
        toast.success(`Following ${directory.name}`);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update follow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-md dark:border-white/5 dark:bg-slate-900/60"
      >
        {/* Cover */}
        <div className="h-40 bg-gradient-to-br from-lumini-blue via-fuchsia-500 to-lumini-purple" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-4">
            <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white text-xl font-bold text-slate-700 shadow-xl ring-4 ring-white dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-900">
              {directory.photoURL ? (
                <img src={directory.photoURL} alt="" className="h-full w-full object-cover" />
              ) : (
                initials(directory.name)
              )}
            </div>
            <div className="flex-1" />
            {isMe ? (
              <button
                disabled
                className="cursor-not-allowed rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 dark:border-slate-700"
                title="Editing your profile is coming to the new UI — use Classic for now."
              >
                Edit profile
              </button>
            ) : me ? (
              <button
                onClick={handleFollow}
                disabled={busy}
                className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-60 ${
                  iAmFollowing
                    ? "border border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    : "bg-gradient-to-r from-lumini-blue to-lumini-purple text-white shadow-md shadow-lumini-blue/25 hover:shadow-lg hover:shadow-lumini-purple/30"
                }`}
              >
                {iAmFollowing ? (
                  <>
                    <UserMinus className="h-4 w-4" /> Following
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" /> Follow
                  </>
                )}
              </button>
            ) : null}
          </div>

          <div className="mt-4">
            <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-slate-50">
              {directory.name}
            </h1>
            {directory.headline ? (
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {directory.headline}
              </p>
            ) : null}
            {privateProfile?.bio ? (
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
                {privateProfile.bio}
              </p>
            ) : null}

            <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
              <span>
                <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                  {directory.followers?.length ?? 0}
                </strong>{" "}
                followers
              </span>
              <span>
                <strong className="text-slate-900 dark:text-slate-100 tabular-nums">
                  {directory.following?.length ?? 0}
                </strong>{" "}
                following
              </span>
            </div>

            {privateProfile?.links ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {privateProfile.links.github ? (
                  <LinkChip href={privateProfile.links.github} icon={<Github className="h-3.5 w-3.5" />} label="GitHub" />
                ) : null}
                {privateProfile.links.linkedin ? (
                  <LinkChip href={privateProfile.links.linkedin} icon={<Linkedin className="h-3.5 w-3.5" />} label="LinkedIn" />
                ) : null}
                {privateProfile.links.twitter ? (
                  <LinkChip href={privateProfile.links.twitter} icon={<Twitter className="h-3.5 w-3.5" />} label="Twitter" />
                ) : null}
                {privateProfile.links.portfolio ? (
                  <LinkChip href={privateProfile.links.portfolio} icon={<Globe className="h-3.5 w-3.5" />} label="Portfolio" />
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Posts */}
      <div>
        <h2 className="mb-3 font-heading text-lg font-bold text-slate-800 dark:text-slate-200">
          Posts
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white/40 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
            Nothing posted yet.
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((p, i) => (
              <PostCard key={p.id} post={p} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LinkChip({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
    >
      {icon}
      {label}
    </a>
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
