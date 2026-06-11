import {
  onAuthStateChanged,
  signOut as fbSignOut,
  type User,
} from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { APP_ID, auth, db } from "@/lib/firebase";
import type { UserDirectoryEntry } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserDirectoryEntry | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDirectoryEntry | null>(null);
  const [loading, setLoading] = useState(true);

  // Track auth state.
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);

      // Mark online + bump lastSeen when a user is present. The legacy code
      // does the same on its own auth listener, but we own this when our
      // React shell is the entry point.
      if (u) {
        const dirRef = doc(
          db,
          "artifacts",
          APP_ID,
          "public",
          "data",
          "users_directory",
          u.uid,
        );
        setDoc(
          dirRef,
          { isOnline: true, lastSeen: serverTimestamp() },
          { merge: true },
        ).catch(() => {
          /* non-fatal */
        });
      } else {
        setProfile(null);
      }
    });
  }, []);

  // Stream this user's directory entry (display name, photo, follows, etc).
  useEffect(() => {
    if (!user) return;
    const dirRef = doc(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      "users_directory",
      user.uid,
    );
    return onSnapshot(dirRef, (snap) => {
      if (snap.exists()) {
        setProfile({ uid: user.uid, ...snap.data() } as UserDirectoryEntry);
      }
    });
  }, [user]);

  // Mark offline on tab close.
  useEffect(() => {
    if (!user) return;
    const onUnload = () => {
      const dirRef = doc(
        db,
        "artifacts",
        APP_ID,
        "public",
        "data",
        "users_directory",
        user.uid,
      );
      // No await — best effort.
      setDoc(
        dirRef,
        { isOnline: false, lastSeen: serverTimestamp() },
        { merge: true },
      ).catch(() => undefined);
    };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      signOut: async () => {
        if (user) {
          const dirRef = doc(
            db,
            "artifacts",
            APP_ID,
            "public",
            "data",
            "users_directory",
            user.uid,
          );
          await setDoc(
            dirRef,
            { isOnline: false, lastSeen: serverTimestamp() },
            { merge: true },
          ).catch(() => undefined);
        }
        await fbSignOut(auth);
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
