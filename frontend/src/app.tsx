import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import EntrepreneurDashboard from "./components/Dashboards/EntrepreneurDashboard";
import { InvestorDashboard } from "./components/Dashboards/InvestorDashboard";
import { RealtorDashboard } from "./components/Dashboards/RealtorDashboard";
import { SupplierDashboard } from "./components/Dashboards/SupplierDashboard";
import { AdminDashboard } from "./components/Dashboards/AdminDashboard";

import { LoginPage } from "./components/Auth/LoginPage";
import { SignupPage } from "./components/Auth/SignupPage";


// ---------------------------
// Protected Route Component
// ---------------------------
const ProtectedRoute = ({ children, role }: { children: JSX.Element; role?: string }) => {
  const { profile, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;

  if (role && profile.role !== role) return <Navigate to="/unauthorized" replace />;

  return children;
};

// ---------------------------
// Dashboard Redirect Logic
// ---------------------------
const DashboardRedirect = () => {
  const { profile } = useAuth();

  if (!profile) return <Navigate to="/login" replace />;

  switch (profile.role) {
    case "entrepreneur":
      return <Navigate to="/entrepreneur/dashboard" replace />;
    case "investor":
      return <Navigate to="/investor/dashboard" replace />;
    case "realtor":
      return <Navigate to="/realtor/dashboard" replace />;
    case "supplier":
      return <Navigate to="/supplier/dashboard" replace />;
    case "admin":
      return <Navigate to="/admin/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// ---------------------------
// App Content
// ---------------------------
const AppContent = () => (
  <Routes>
    {/* Auth Pages */}
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />

    {/* Redirect root to correct dashboard */}
    <Route path="/" element={<DashboardRedirect />} />

    {/* Role-Based Dashboards */}
    <Route
      path="/entrepreneur/dashboard"
      element={
        <ProtectedRoute role="entrepreneur">
          <EntrepreneurDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/investor/dashboard"
      element={
        <ProtectedRoute role="investor">
          <InvestorDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/realtor/dashboard"
      element={
        <ProtectedRoute role="realtor">
          <RealtorDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/supplier/dashboard"
      element={
        <ProtectedRoute role="supplier">
          <SupplierDashboard />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      }
    />

    {/* Unauthorized Page */}
    <Route path="/unauthorized" element={<div className="p-4">Unauthorized Access</div>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

// ---------------------------
// Main App Wrapper
// ---------------------------
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
