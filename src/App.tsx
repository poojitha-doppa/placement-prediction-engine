import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

const LoginPage = lazy(() => import('./pages/LoginPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RoadmapPage = lazy(() => import('./pages/RoadmapPage'));
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Inner component that has access to auth context
function AppContent() {
  const { user } = useAuth();
  
  return (
    <Suspense fallback={<RouteFallback />}>
      <MainLayout studentName={user?.name || 'User'}>
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </MainLayout>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <BrowserRouter>
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <AppContent />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
