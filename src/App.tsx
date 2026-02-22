import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Analytics } from "@vercel/analytics/react";

import { UserProvider } from "@/contexts/UserContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

import AuthPage from "./pages/AuthPage";
import AppPage from "./pages/AppPage";
import JoinPage from "./pages/JoinPage";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import AppLayout from "./layouts/AppLayout";
import WatchPage from "./pages/WatchPage";
import BrowserPage from "./pages/BrowserPage";
import ChatPage from "./pages/ChatPage";
import TheaterPage from "./pages/TheaterPage";
import FriendsPage from "./pages/FriendsPage";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string ?? '';

// ── Route guard — redirect to /auth if not authenticated ─────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[#0A84FF] animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// ── Inner app (needs AuthContext in scope) ───────────────────
const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Navigate to="/auth" replace />} />
    <Route path="/auth" element={<AuthPage />} />
    <Route path="/documentation" element={<Documentation />} />
    <Route path="/join" element={<JoinPage />} />

    {/* Protected — all app routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/app" element={<AppPage />} />
      <Route path="/watch" element={<WatchPage />} />
      <Route path="/theater" element={<TheaterPage />} />
      <Route path="/browser" element={<BrowserPage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/friends" element={<FriendsPage />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <PlaylistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
              <Analytics />
            </TooltipProvider>
          </PlaylistProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
