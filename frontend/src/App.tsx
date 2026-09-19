import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { AuthProvider, useAuth } from "@/store/AuthContext";
import AppLayout from "@/components/layout/AppLayout";
import LoadingScreen from "@/components/ui/LoadingScreen";

// Lazy-loaded pages for better performance
const LoginPage      = lazy(() => import("@/pages/LoginPage"));
const DashboardPage  = lazy(() => import("@/pages/DashboardPage"));
const DiagnosisPage  = lazy(() => import("@/pages/DiagnosisPage"));
const ResultPage     = lazy(() => import("@/pages/ResultPage"));
const HistoryPage    = lazy(() => import("@/pages/HistoryPage"));
const AssistantPage  = lazy(() => import("@/pages/AssistantPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 min
      refetchOnWindowFocus: false,
    },
  },
});

// Route guard: redirect to login if not authenticated
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen message="Checking authentication…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

// Route guard: redirect authenticated users away from login
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen message="Loading…" />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" />}>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        {/* Protected — wrapped in AppLayout (bottom nav + header) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard"            element={<DashboardPage />} />
          <Route path="/diagnosis"            element={<DiagnosisPage />} />
          <Route path="/diagnosis/:id/result" element={<ResultPage />} />
          <Route path="/history"              element={<HistoryPage />} />
          <Route path="/assistant"            element={<AssistantPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
