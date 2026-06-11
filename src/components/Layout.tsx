import type { ReactNode } from "react";
import { Navbar } from "@/components/Navbar";

/**
 * Page shell: ambient gradient background, glass navbar, content container.
 * The signature touch is the soft luminous gradient mesh in the background
 * — fixed, low-opacity, so it reads as ambient atmosphere rather than noise.
 */
export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      <AmbientBackground />
      <Navbar />
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-24 lg:px-6">
        {children}
      </main>
    </div>
  );
}

function AmbientBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-lumini-blue/20 blur-3xl dark:bg-lumini-blue/10" />
      <div className="absolute -right-40 top-32 h-[32rem] w-[32rem] rounded-full bg-lumini-purple/20 blur-3xl dark:bg-lumini-purple/10" />
      <div className="absolute bottom-0 left-1/3 h-[24rem] w-[24rem] rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/5" />
    </div>
  );
}
