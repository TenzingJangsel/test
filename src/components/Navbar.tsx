import { motion } from "framer-motion";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Bell, LogOut, MessageSquare, Search, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

/**
 * Top navigation bar. Glass background, animated wordmark on the left,
 * pill nav in the middle, avatar / actions on the right.
 */
export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl dark:border-white/5 dark:bg-slate-950/70"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 lg:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-lumini-blue to-lumini-purple text-white shadow-lg shadow-lumini-blue/25 transition-shadow group-hover:shadow-lumini-purple/40">
            <Lumen />
          </span>
          <span className="font-heading text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Lumini
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-slate-200/70 bg-white/60 p-1 shadow-sm dark:border-white/5 dark:bg-slate-900/60">
            <NavPill to="/" label="Feed" />
            <NavPill to={user ? `/profile/${user.uid}` : "/profile"} label="Profile" />
            <NavPill to="/legacy" label="Classic" />
          </div>
        </div>

        <div className="flex items-center gap-1">
          <IconButton label="Search">
            <Search className="h-4.5 w-4.5" />
          </IconButton>
          <IconButton label="Messages" onClick={() => navigate("/legacy")}>
            <MessageSquare className="h-4.5 w-4.5" />
          </IconButton>
          <IconButton label="Notifications" onClick={() => navigate("/legacy")}>
            <Bell className="h-4.5 w-4.5" />
          </IconButton>

          {user ? (
            <button
              onClick={() => navigate(`/profile/${user.uid}`)}
              className="ml-2 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-lumini-blue to-lumini-purple text-sm font-semibold text-white ring-2 ring-white/50 transition-transform hover:scale-105 dark:ring-slate-800"
              title={profile?.name ?? user.displayName ?? "Profile"}
            >
              {profile?.photoURL ?? user.photoURL ? (
                <img
                  src={profile?.photoURL ?? user.photoURL ?? ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4.5 w-4.5" />
              )}
            </button>
          ) : null}

          <IconButton label="Sign out" onClick={handleSignOut}>
            <LogOut className="h-4.5 w-4.5" />
          </IconButton>
        </div>
      </div>
    </motion.nav>
  );
}

function NavPill({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        cn(
          "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          isActive
            ? "text-white"
            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="nav-pill"
              className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-lumini-blue to-lumini-purple shadow-md shadow-lumini-blue/30"
              transition={{ type: "spring", stiffness: 380, damping: 30 }}
            />
          )}
          {label}
        </>
      )}
    </NavLink>
  );
}

function IconButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
    >
      {children}
    </button>
  );
}

function Lumen() {
  // Minimal abstract mark — a luminous spark. SVG so it stays crisp.
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
      <path
        d="M10 2c1.5 3 3 4.5 6 6-3 1.5-4.5 3-6 6-1.5-3-3-4.5-6-6 3-1.5 4.5-3 6-6Z"
        fill="currentColor"
      />
    </svg>
  );
}
