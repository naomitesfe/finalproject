import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import EntrepreneurDashboard from './components/Dashboards/EntrepreneurDashboard';
import { InvestorDashboard } from './components/Dashboards/InvestorDashboard';
import { RealtorDashboard } from './components/Dashboards/RealtorDashboard';
import { SupplierDashboard } from './components/Dashboards/SupplierDashboard';
import { AdminDashboard } from './components/Dashboards/AdminDashboard';

import { AIBusinessChat } from './components/AIChat/AIBusinessChat';
import { OpportunitiesMarketplace } from './components/Marketplace/OpportunitiesMarketplace';
import { PropertiesMarketplace } from './components/Marketplace/PropertiesMarketplace';
import { FindPartners } from './components/Marketplace/FindPartners';
import { SupplierPackages } from './components/Marketplace/SupplierPackages';

import { Messages } from './components/Communication/Messages';
import { Notifications } from './components/Communication/Notifications';

import { Navigation } from './components/Layout/Navigation';

const AppContent = () => {
  const { profile, loading } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  if (loading) return <div>Loading...</div>;

  const renderDashboard = () => {
    switch (profile?.role) {
      case 'entrepreneur':
        return <EntrepreneurDashboard />;
      case 'investor':
        return <InvestorDashboard />;
      case 'realtor':
        return <RealtorDashboard />;
      case 'supplier':
        return <SupplierDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>User role not recognized</div>;
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'ai-chat':
        return <AIBusinessChat />;
      case 'opportunities':
        return <OpportunitiesMarketplace />;
      case 'properties':
        return <PropertiesMarketplace />;
      case 'find-partners':
        return <FindPartners />;
      case 'supplier-packages':
        return <SupplierPackages />;
      case 'messages':
        return <Messages />;
      case 'notifications':
        return <Notifications />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation currentView={currentView} setCurrentView={setCurrentView} />
      <main className="min-h-[calc(100vh-4rem)] p-4">{renderView()}</main>
    </div>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
