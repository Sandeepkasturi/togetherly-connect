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
import SharePage from "./pages/SharePage";
import ChatPage from "./pages/ChatPage";
import TheaterPage from "./pages/TheaterPage";
import FriendsPage from "./pages/FriendsPage";
import ProfilePage from "./pages/ProfilePage";
import SplashScreen from "@/components/SplashScreen";
import LegalPage from "./pages/LegalPage";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string ?? '';

// ── Route guard — redirect to /auth if not authenticated ─────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SplashScreen isVisible={true} />;
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

    {/* Legal Pages */}
    <Route path="/privacy" element={<LegalPage defaultType="privacy" />} />
    <Route path="/terms" element={<LegalPage defaultType="terms" />} />
    <Route path="/security" element={<LegalPage defaultType="security" />} />

    {/* Protected — all app routes */}
    <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
      <Route path="/app" element={<AppPage />} />
      <Route path="/watch" element={<WatchPage />} />
      <Route path="/theater" element={<TheaterPage />} />
      <Route path="/browser" element={<BrowserPage />} />
      <Route path="/share" element={<SharePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/chat/:friendId" element={<ChatPage />} />
      <Route path="/friends" element={<FriendsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const isAuthReady = !!GOOGLE_CLIENT_ID;

  if (typeof window !== 'undefined' && (window as any).bootStep) {
    (window as any).bootStep('App Components Initializing...');
  }

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthReady ? (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
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
        </GoogleOAuthProvider>
      ) : (
        <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-2xl max-w-md">
            <h2 className="text-xl font-bold mb-2">Configuration Missing</h2>
            <p className="opacity-70 text-sm">VITE_GOOGLE_CLIENT_ID is not set. Please add it to your environment variables to enable authentication.</p>
          </div>
        </div>
      )}
    </QueryClientProvider>
  );
};

export default App;
