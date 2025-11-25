import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

import { Navigation } from "./components/Layout/Navigation";
import EntrepreneurDashboard from "./components/Dashboards/EntrepreneurDashboard";
import { InvestorDashboard } from "./components/Dashboards/InvestorDashboard";
import { RealtorDashboard } from "./components/Dashboards/RealtorDashboard";
import { SupplierDashboard } from "./components/Dashboards/SupplierDashboard";
import { AdminDashboard } from "./components/Dashboards/AdminDashboard";
import { AIBusinessChat } from "./components/AIChat/AIBusinessChat";
import { OpportunitiesMarketplace } from "./components/Marketplace/OpportunitiesMarketplace";
import { PropertiesMarketplace } from "./components/Marketplace/PropertiesMarketplace";
import { FindPartners } from "./components/Marketplace/FindPartners";
import { SupplierPackages } from "./components/Marketplace/SupplierPackages";
import { Messages } from "./components/Communication/Messages";
import { Notifications } from "./components/Communication/Notifications";

import { LoginPage } from "./components/Auth/LoginPage";
import { SignupPage } from "./components/Auth/SignupPage";

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [currentView, setCurrentView] = useState("dashboard");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0B2C45] to-[#00AEEF] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-white mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-white mb-2">TefTef</h2>
          <p className="text-blue-100">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return isLogin ? (
      <LoginPage onToggle={() => setIsLogin(false)} />
    ) : (
      <SignupPage onToggle={() => setIsLogin(true)} />
    );
  }

  // ---------------------------
  // Render role-based dashboard
  // ---------------------------
  const renderDashboard = () => {
    switch (profile?.role) {
      case "entrepreneur":
        return <EntrepreneurDashboard />;
      case "investor":
        return <InvestorDashboard />;
      case "realtor":
        return <RealtorDashboard />;
      case "supplier":
        return <SupplierDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <div>Invalid role</div>;
    }
  };

  // ---------------------------
  // Render main view based on nav
  // ---------------------------
  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return renderDashboard();
      case "ai-chat":
        return <AIBusinessChat />;
      case "opportunities":
        return <OpportunitiesMarketplace />;
      case "properties":
        return <PropertiesMarketplace />;
      case "find-partners":
        return <FindPartners />;
      case "supplier-packages":
        return <SupplierPackages />;
      case "portfolio":
        return <InvestorDashboard />;
      case "messages":
        return <Messages />;
      case "notifications":
        return <Notifications />;
      case "analytics":
      case "users":
        return <AdminDashboard />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation controlling currentView */}
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />

      <main className="min-h-[calc(100vh-4rem)] p-6">
        {renderView()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
