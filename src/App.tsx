import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthGate } from "@/components/AuthGate";
import { Layout } from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import { AuthProvider } from "@/contexts/AuthContext";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import Legacy from "./pages/Legacy";
import NotFound from "./pages/NotFound";
import Profile from "./pages/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Real-time subscriptions in our hooks keep data fresh; default
      // staleness can be aggressive.
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Wraps Routes in AnimatePresence so each navigation animates.
 * useLocation is required for AnimatePresence to detect route changes.
 */
function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/auth" element={<Auth />} />

        {/* Legacy iframe fallback — does not use Layout (full screen) */}
        <Route
          path="/legacy"
          element={
            <AuthGate>
              <Legacy />
            </AuthGate>
          }
        />

        {/* Authenticated app */}
        <Route
          path="/"
          element={
            <AuthGate>
              <Layout>
                <PageTransition>
                  <Feed />
                </PageTransition>
              </Layout>
            </AuthGate>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGate>
              <Layout>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </Layout>
            </AuthGate>
          }
        />
        <Route
          path="/profile/:uid"
          element={
            <AuthGate>
              <Layout>
                <PageTransition>
                  <Profile />
                </PageTransition>
              </Layout>
            </AuthGate>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
