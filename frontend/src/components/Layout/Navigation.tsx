import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home, Sparkles, Building, Bell, MessageSquare,
  LogOut, Menu, X, User, TrendingUp, Lightbulb,
  DollarSign, Users, Package, UserPlus
} from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: typeof Home; // Lucide icon type
}

export const Navigation = ({ currentView, setCurrentView }: NavigationProps) => {
  const { profile, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getNavItems = (): NavItem[] => {
    const commonItems: NavItem[] = [
      { id: 'messages', label: 'Messages', icon: MessageSquare },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ];

    switch (profile?.role) {
      case 'entrepreneur':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'ai-chat', label: 'AI Business Advisor', icon: Sparkles },
          { id: 'opportunities', label: 'Find Investors', icon: DollarSign },
          { id: 'supplier-packages', label: 'Starter Packages', icon: Package },
          { id: 'properties', label: 'Find Properties', icon: Building },
          { id: 'find-partners', label: 'Find Partners', icon: UserPlus },
          ...commonItems,
        ];
      case 'investor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'opportunities', label: 'Opportunities', icon: TrendingUp },
          { id: 'portfolio', label: 'My Portfolio', icon: Lightbulb },
          { id: 'find-partners', label: 'Find Partners', icon: UserPlus },
          ...commonItems,
        ];
      case 'realtor':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'properties', label: 'My Properties', icon: Building },
          { id: 'opportunities', label: 'Browse Businesses', icon: Lightbulb },
          { id: 'find-partners', label: 'Find Partners', icon: UserPlus },
          ...commonItems,
        ];
      case 'supplier':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'supplier-packages', label: 'My Packages', icon: Package },
          { id: 'opportunities', label: 'Browse Businesses', icon: Lightbulb },
          { id: 'find-partners', label: 'Find Partners', icon: UserPlus },
          ...commonItems,
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Users },
          { id: 'analytics', label: 'Analytics', icon: TrendingUp },
          { id: 'users', label: 'User Management', icon: User },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="bg-gradient-to-r from-[#0B2C45] to-[#00AEEF] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo & Menu */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">TefTef</div>
                <div className="hidden md:block text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  {profile?.role}
                </div>
              </div>

              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentView(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                        currentView === item.id
                          ? 'bg-white bg-opacity-20 font-semibold'
                          : 'hover:bg-white hover:bg-opacity-10'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile & Logout */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <User size={18} />
                </div>
                <div className="text-sm font-semibold">{profile?.fullName}</div>
              </div>

              <button
                onClick={handleSignOut}
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition"
              >
                <LogOut size={18} />
                <span className="text-sm">Logout</span>
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#0B2C45] text-white border-t border-white border-opacity-20">
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 py-3 border-b border-white border-opacity-20">
              <User size={18} />
              <div>
                <div className="font-semibold">{profile?.fullName}</div>
                <div className="text-xs text-blue-200 capitalize">{profile?.role}</div>
              </div>
            </div>

            <div className="py-2 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                      currentView === item.id
                        ? 'bg-white bg-opacity-20 font-semibold'
                        : 'hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition mt-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
