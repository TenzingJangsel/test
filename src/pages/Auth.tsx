import { motion, AnimatePresence } from "framer-motion";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { APP_ID, auth, db, googleProvider } from "@/lib/firebase";

type Mode = "signin" | "signup";

/**
 * Sign in / sign up screen. Replaces the auth overlay in lumini.html.
 * Uses Firebase Auth via the npm package (no CDN). On success, writes a
 * users_directory entry and redirects to wherever the user was headed.
 */
export default function Auth() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-6 w-6 animate-spin text-lumini-blue" />
      </div>
    );
  }
  if (user) {
    const from = (location.state as { from?: string } | null)?.from ?? "/";
    return <Navigate to={from} replace />;
  }

  const upsertDirectory = async (uid: string, displayName: string, photoURL: string | null) => {
    const ref = doc(db, "artifacts", APP_ID, "public", "data", "users_directory", uid);
    await setDoc(
      ref,
      {
        name: displayName,
        photoURL,
        headline: "",
        followers: [],
        following: [],
        isOnline: true,
        lastSeen: serverTimestamp(),
        isBanned: false,
        isAdmin: false,
      },
      { merge: true },
    );
  };

  const handleEmail = async () => {
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        if (!name.trim()) {
          toast.error("Pick a display name");
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: name.trim() });
        await upsertDirectory(cred.user.uid, name.trim(), cred.user.photoURL);
        toast.success(`Welcome to Lumini, ${name.trim()}`);
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        await upsertDirectory(
          cred.user.uid,
          cred.user.displayName ?? "Lumini user",
          cred.user.photoURL,
        );
        toast.success("Welcome back");
      }
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await upsertDirectory(
        cred.user.uid,
        cred.user.displayName ?? "Lumini user",
        cred.user.photoURL,
      );
      toast.success(`Welcome, ${cred.user.displayName ?? ""}`);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (e) {
      toast.error(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-slate-50 px-4 dark:bg-slate-950">
      {/* Ambient gradient */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-1/4 h-[28rem] w-[28rem] rounded-full bg-lumini-blue/25 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-[32rem] w-[32rem] rounded-full bg-lumini-purple/25 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-8 shadow-2xl shadow-lumini-blue/10 backdrop-blur-xl dark:border-white/5 dark:bg-slate-900/70"
      >
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-lumini-blue to-lumini-purple text-white shadow-lg shadow-lumini-blue/30">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="font-heading text-3xl font-extrabold text-slate-900 dark:text-slate-50">
            {mode === "signin" ? "Welcome back" : "Join Lumini"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {mode === "signin"
              ? "Sign in to your account to continue."
              : "Create an account to start sharing."}
          </p>
        </div>

        {/* Mode switcher */}
        <div className="mb-5 flex rounded-full border border-slate-200/70 bg-slate-100/60 p-1 dark:border-white/5 dark:bg-slate-800/60">
          <ModeTab active={mode === "signin"} onClick={() => setMode("signin")}>
            Sign in
          </ModeTab>
          <ModeTab active={mode === "signup"} onClick={() => setMode("signup")}>
            Sign up
          </ModeTab>
        </div>

        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {mode === "signup" ? (
              <motion.div
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Field
                  label="Display name"
                  value={name}
                  onChange={setName}
                  placeholder="Your name"
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <Field
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
          />
          <Field
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
          />

          <button
            onClick={handleEmail}
            disabled={busy}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-lumini-blue to-lumini-purple py-2.5 font-semibold text-white shadow-lg shadow-lumini-blue/25 transition-all hover:shadow-xl hover:shadow-lumini-purple/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {mode === "signin" ? "Sign in" : "Create account"}
          </button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <button
            onClick={handleGoogle}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ModeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="relative flex-1 rounded-full px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors dark:text-slate-300"
    >
      {active ? (
        <motion.span
          layoutId="auth-mode-pill"
          className="absolute inset-0 -z-10 rounded-full bg-white shadow dark:bg-slate-700"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      ) : null}
      <span className={active ? "text-slate-900 dark:text-slate-50" : ""}>{children}</span>
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-lumini-blue focus:outline-none focus:ring-2 focus:ring-lumini-blue/20 dark:border-white/10 dark:bg-slate-800 dark:text-slate-100"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58Z"
      />
    </svg>
  );
}

function friendlyError(e: unknown): string {
  if (typeof e === "object" && e && "code" in e) {
    const code = String((e as { code: string }).code);
    const map: Record<string, string> = {
      "auth/invalid-credential": "Wrong email or password",
      "auth/invalid-email": "That email doesn't look right",
      "auth/user-not-found": "No account with that email",
      "auth/wrong-password": "Wrong password",
      "auth/email-already-in-use": "An account already uses that email",
      "auth/weak-password": "Password must be at least 6 characters",
      "auth/popup-closed-by-user": "Google sign-in cancelled",
    };
    if (map[code]) return map[code];
  }
  return e instanceof Error ? e.message : "Something went wrong";
}
