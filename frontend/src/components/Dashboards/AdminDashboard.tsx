import { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Building, Lightbulb, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface User {
  _id: string;
  full_name: string;
  role: 'entrepreneur' | 'investor' | 'realtor' | string;
  location?: string;
  rating: number;
  total_reviews: number;
  createdAt: string;
}

interface BusinessIdea {
  _id: string;
  status: 'active' | 'inactive' | string;
  createdAt: string;
}

interface Investment {
  _id: string;
  amount: number;
  status: 'active' | 'completed' | 'defaulted' | string;
  roi_percentage: number;
  investment_type: string;
  createdAt: string;
}

interface Property {
  _id: string;
  status: 'available' | 'sold' | string;
  createdAt: string;
}

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = (import.meta as any).env?.VITE_API_URL || '';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, ideasRes, investmentsRes, propertiesRes] = await Promise.all([
        fetch(`${API_URL}/api/users`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()),
        fetch(`${API_URL}/api/business-ideas`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()),
        fetch(`${API_URL}/api/investments`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()),
        fetch(`${API_URL}/api/properties`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }).then(res => res.json()),
      ]);

      setUsers(usersRes || []);
      setBusinessIdeas(ideasRes || []);
      setInvestments(investmentsRes || []);
      setProperties(propertiesRes || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalInvestments = investments.reduce((sum, inv) => sum + inv.amount, 0);
  const activeInvestments = investments.filter(inv => inv.status === 'active');
  const entrepreneurs = users.filter(u => u.role === 'entrepreneur');
  const investors = users.filter(u => u.role === 'investor');
  const realtors = users.filter(u => u.role === 'realtor');

  const avgROI = activeInvestments.length > 0
    ? activeInvestments.reduce((sum, inv) => sum + inv.roi_percentage, 0) / activeInvestments.length
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Platform analytics and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-[#00AEEF] to-[#0B2C45] rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-4xl font-bold mt-1">{users.length}</p>
              <div className="mt-3 text-sm">
                <div>Entrepreneurs: {entrepreneurs.length}</div>
                <div>Investors: {investors.length}</div>
                <div>Realtors: {realtors.length}</div>
              </div>
            </div>
            <Users size={48} className="opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Funding</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">${(totalInvestments / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-green-600 mt-2">{investments.length} transactions</p>
            </div>
            <DollarSign className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average ROI</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">{avgROI.toFixed(1)}%</p>
              <p className="text-sm text-gray-500 mt-2">{activeInvestments.length} active investments</p>
            </div>
            <TrendingUp className="text-[#00AEEF]" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Business Ideas</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">{businessIdeas.length}</p>
              <p className="text-sm text-gray-500 mt-2">{businessIdeas.filter(b => b.status === 'active').length} active</p>
            </div>
            <Lightbulb className="text-yellow-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Properties Listed</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">{properties.length}</p>
              <p className="text-sm text-gray-500 mt-2">{properties.filter(p => p.status === 'available').length} available</p>
            </div>
            <Building className="text-[#00AEEF]" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Investment Rate</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">
                {businessIdeas.length > 0
                  ? ((activeInvestments.length / businessIdeas.length) * 100).toFixed(0)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Funding success rate</p>
            </div>
            <Target className="text-green-500" size={40} />
          </div>
        </div>
      </div>

      {/* Recent Users and Investments */}
      {/* ...keep the rest of your JSX as-is, just replace `id` with `_id` and `created_at` with `createdAt` */}
    </div>
  );
};
