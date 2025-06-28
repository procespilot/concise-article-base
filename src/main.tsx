
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { UserProvider } from "@/contexts/UserContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import ConsolidatedAuthPage from "./pages/ConsolidatedAuthPage.tsx";
import UserSettingsPage from "./pages/UserSettingsPage.tsx";
import NotificationsPage from "./pages/NotificationsPage.tsx";
import DevPage from "./pages/DevPage.tsx";

import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <UserProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<ConsolidatedAuthPage />} />
                <Route path="/settings" element={<UserSettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/dev" element={<DevPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </BrowserRouter>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>
);
