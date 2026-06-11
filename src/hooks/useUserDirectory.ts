import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { APP_ID, db } from "@/lib/firebase";
import type { UserDirectoryEntry } from "@/lib/types";

/**
 * Subscribe to a single user's directory entry.
 * Returns null while loading or if the user doesn't exist.
 */
export function useUserDirectory(uid: string | undefined) {
  const [entry, setEntry] = useState<UserDirectoryEntry | null>(null);

  useEffect(() => {
    if (!uid) {
      setEntry(null);
      return;
    }
    const ref = doc(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      "users_directory",
      uid,
    );
    return onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setEntry({ uid, ...snap.data() } as UserDirectoryEntry);
      } else {
        setEntry(null);
      }
    });
  }, [uid]);

  return entry;
}
