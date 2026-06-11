import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { APP_ID, db } from "@/lib/firebase";
import { qk } from "@/lib/queryKeys";
import type { Post } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";

const postsCol = () =>
  collection(db, "artifacts", APP_ID, "public", "data", "posts");

/**
 * Subscribes to the posts collection in real time and writes results into the
 * React Query cache. The query itself is just a passive consumer of the cache.
 */
export function usePosts() {
  const qc = useQueryClient();

  useEffect(() => {
    const q = query(postsCol(), orderBy("lastEdited", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const posts: Post[] = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, "id">),
      }));
      qc.setQueryData<Post[]>(qk.posts.list(), posts);
    });
    return unsub;
  }, [qc]);

  return useQuery<Post[]>({
    queryKey: qk.posts.list(),
    queryFn: () => qc.getQueryData<Post[]>(qk.posts.list()) ?? [],
    staleTime: Infinity,
  });
}

/** Toggle the like on a post — optimistic. */
export function useToggleLike() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (post: Post) => {
      if (!user) throw new Error("Sign in to like posts");
      const liked = post.likedBy?.includes(user.uid) ?? false;
      const ref = doc(postsCol(), post.id);
      await updateDoc(ref, {
        likes: increment(liked ? -1 : 1),
        likedBy: liked ? arrayRemove(user.uid) : arrayUnion(user.uid),
      });
    },
    onMutate: async (post: Post) => {
      if (!user) return;
      await qc.cancelQueries({ queryKey: qk.posts.list() });
      const prev = qc.getQueryData<Post[]>(qk.posts.list());
      qc.setQueryData<Post[]>(qk.posts.list(), (old) =>
        (old ?? []).map((p) => {
          if (p.id !== post.id) return p;
          const liked = p.likedBy?.includes(user.uid) ?? false;
          return {
            ...p,
            likes: (p.likes ?? 0) + (liked ? -1 : 1),
            likedBy: liked
              ? (p.likedBy ?? []).filter((u) => u !== user.uid)
              : [...(p.likedBy ?? []), user.uid],
          };
        }),
      );
      return { prev };
    },
    onError: (_e, _p, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.posts.list(), ctx.prev);
    },
  });
}

/** Create a new text post. */
export function useCreatePost() {
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (text: string) => {
      if (!user) throw new Error("Sign in to post");
      const trimmed = text.trim();
      if (!trimmed) throw new Error("Post can't be empty");
      await addDoc(postsCol(), {
        text: trimmed,
        type: "text",
        uid: user.uid,
        name: profile?.name ?? user.displayName ?? "Anonymous",
        photoURL: profile?.photoURL ?? user.photoURL ?? null,
        headline: profile?.headline ?? "",
        attachment: null,
        attachmentType: null,
        taggedUsers: [],
        tags: [],
        likes: 0,
        likedBy: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
        lastEdited: serverTimestamp(),
      });
    },
  });
}
