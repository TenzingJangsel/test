import type { Timestamp } from "firebase/firestore";

/**
 * Format a Firestore Timestamp (or null/undefined) as a compact
 * "time ago" string: "just now", "3m", "5h", "2d", or a date.
 */
export function timeAgo(ts: Timestamp | null | undefined): string {
  if (!ts) return "";
  const date = ts.toDate();
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 30) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}
