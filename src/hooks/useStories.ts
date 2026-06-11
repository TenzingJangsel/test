import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { APP_ID, db } from "@/lib/firebase";
import type { Story } from "@/lib/types";

/**
 * Subscribe to all non-expired stories, grouped by author.
 * Returns: [{ uid, name, photoURL, stories: Story[] }]
 */
export interface StoryGroup {
  uid: string;
  name: string;
  photoURL?: string | null;
  stories: Story[];
}

export function useStories() {
  const [groups, setGroups] = useState<StoryGroup[]>([]);

  useEffect(() => {
    const col = collection(db, "artifacts", APP_ID, "public", "data", "stories");
    const q = query(
      col,
      where("expiresAt", ">", Timestamp.now()),
      orderBy("expiresAt", "desc"),
    );

    return onSnapshot(
      q,
      (snap) => {
        const all: Story[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<Story, "id">),
        }));
        const map = new Map<string, StoryGroup>();
        for (const s of all) {
          const existing = map.get(s.uid);
          if (existing) {
            existing.stories.push(s);
          } else {
            map.set(s.uid, {
              uid: s.uid,
              name: s.name,
              photoURL: s.photoURL,
              stories: [s],
            });
          }
        }
        setGroups(Array.from(map.values()));
      },
      // Some Firestore composite-index errors throw async; swallow rather
      // than crash. The UI just shows an empty stories rail.
      () => setGroups([]),
    );
  }, []);

  return groups;
}
