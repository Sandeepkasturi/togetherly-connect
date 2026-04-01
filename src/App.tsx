import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import { lazy, Suspense } from "react";
import { useDeviceType } from "@/hooks/useDeviceType";
import MobileGate from "@/arena/components/shared/MobileGate";

const queryClient = new QueryClient();

// Lazy load all pages
const ArenaLanding = lazy(() => import("@/arena/pages/ArenaLanding"));
const ChallengesPage = lazy(() => import("@/arena/pages/ChallengesPage"));
const ChallengePage = lazy(() => import("@/arena/pages/ChallengePage"));
const DashboardPage = lazy(() => import("@/arena/pages/DashboardPage"));
const ExamPage = lazy(() => import("@/arena/pages/ExamPage"));
const LeaderboardPage = lazy(() => import("@/arena/pages/LeaderboardPage"));
const CertificatePage = lazy(() => import("@/arena/pages/CertificatePage"));
const InterviewRoomPage = lazy(() => import("@/arena/pages/InterviewRoomPage"));
const CompanyDashboard = lazy(() => import("@/arena/pages/CompanyDashboard"));
const AdminPanel = lazy(() => import("@/arena/pages/AdminPanel"));
const ArenaProfilePage = lazy(() => import("@/arena/pages/ArenaProfilePage"));
const IDEPage = lazy(() => import("@/arena/pages/IDEPage"));
const LegalPage = lazy(() => import("@/pages/LegalPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const Loading = () => (
  <div className="min-h-screen bg-arena-black flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
  </div>
);

const AppRoutes = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      {/* Public */}
      <Route path="/" element={<Navigate to="/arena" replace />} />
      <Route path="/arena" element={<ArenaLanding />} />
      <Route path="/arena/certificate/:code" element={<CertificatePage />} />
      <Route path="/arena/leaderboard/:challengeId" element={<LeaderboardPage />} />

      {/* Legal */}
      <Route path="/privacy" element={<LegalPage defaultType="privacy" />} />
      <Route path="/terms" element={<LegalPage defaultType="terms" />} />

      {/* Auth required (TODO: wrap with ProtectedRoute when auth is wired) */}
      <Route path="/arena/challenges" element={<ChallengesPage />} />
      <Route path="/arena/challenges/:slug" element={<ChallengePage />} />
      <Route path="/arena/dashboard" element={<DashboardPage />} />
      <Route path="/arena/exam/:bookingId" element={<ExamPage />} />
      <Route path="/arena/ide" element={<IDEPage />} />
      <Route path="/arena/interview/:roomId" element={<InterviewRoomPage />} />
      <Route path="/arena/profile" element={<ArenaProfilePage />} />

      {/* Company portal */}
      <Route path="/arena/company" element={<CompanyDashboard />} />

      {/* Admin */}
      <Route path="/arena/admin" element={<AdminPanel />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
);

const App = () => {
  const { isDesktop, isLoading } = useDeviceType();

  if (isLoading) return <Loading />;
  if (!isDesktop) return <MobileGate />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Analytics />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
