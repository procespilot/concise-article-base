import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { UserProvider } from '@/contexts/UserContext';
import ConsolidatedAuthPage from '@/pages/ConsolidatedAuthPage';
import Index from '@/pages';
import NotFound from '@/pages/NotFound';
import UserSettingsPage from '@/pages/UserSettingsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import { Toaster } from "@/components/ui/toaster"

function App() {
  return (
    <Router>
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <ThemeProvider defaultTheme="light" storageKey="clearbase-ui-theme">
            <UserProvider>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<ConsolidatedAuthPage />} />
                  <Route path="/settings" element={<UserSettingsPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </UserProvider>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
