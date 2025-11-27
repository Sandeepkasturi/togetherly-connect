
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import AppPage from "./pages/AppPage";
import JoinPage from "./pages/JoinPage";
import NotFound from "./pages/NotFound";
import Documentation from "./pages/Documentation";
import { UserProvider } from "@/contexts/UserContext";
import { PlaylistProvider } from "@/contexts/PlaylistContext";
import AppLayout from "./layouts/AppLayout";
import WatchPage from "./pages/WatchPage";
import BrowserPage from "./pages/BrowserPage";
import ChatPage from "./pages/ChatPage";
import TheaterPage from "./pages/TheaterPage";
import { Analytics } from "@vercel/analytics/react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <PlaylistProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/documentation" element={<Documentation />} />
              <Route element={<AppLayout />}>
                <Route path="/app" element={<AppPage />} />
                <Route path="/watch" element={<WatchPage />} />
                <Route path="/theater" element={<TheaterPage />} />
                <Route path="/browser" element={<BrowserPage />} />
                <Route path="/chat" element={<ChatPage />} />
              </Route>
              <Route path="/join" element={<JoinPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <Analytics />
        </TooltipProvider>
      </PlaylistProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
