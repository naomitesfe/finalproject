// src/components/Dashboards/InvestorDashboard.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lightbulb, DollarSign, TrendingUp, Plus } from 'lucide-react';

type IdeaStatus = 'draft' | 'active' | 'funded' | 'completed';

interface BusinessIdea {
  _id: string;
  title: string;
  description: string;
  category?: string;
  estimated_capital: number;
  estimated_roi: number;
  location?: string;
  status: IdeaStatus;
  createdAt: string;
  entrepreneurId?: string;
  entrepreneurName?: string;
}

interface Investment {
  _id: string;
  investorId: string;
  entrepreneurId?: string;
  businessIdeaId?: string;
  amount: number;
  status: 'pending' | 'active' | 'completed' | 'defaulted';
  createdAt: string;
  investorName?: string;
  businessIdeaTitle?: string;
}

export const InvestorDashboard = () => {
  const { user } = useAuth();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const API_URL = (import.meta as any).env?.VITE_API_URL || '';

  const [ideas, setIdeas] = useState<BusinessIdea[]>([]);
  const [myInvestments, setMyInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIdea, setSelectedIdea] = useState<BusinessIdea | null>(null);
  const [investAmount, setInvestAmount] = useState<string>('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, filter]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // fetch available business ideas (optionally filter)
      const ideasRes = await fetch(
        `${API_URL}/api/business-ideas${filter === 'all' ? '' : `?status=${encodeURIComponent(filter)}`}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!ideasRes.ok) throw new Error('Failed to load business ideas');
      const ideasData: BusinessIdea[] = await ideasRes.json();

      // fetch investor's investments
      const investmentsRes = await fetch(`${API_URL}/api/investments?investorId=${(user as any)?._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!investmentsRes.ok) throw new Error('Failed to load investments');
      const investmentsData: Investment[] = await investmentsRes.json();

      setIdeas(ideasData || []);
      setMyInvestments(investmentsData || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const openInvestModal = (idea: BusinessIdea) => {
    setSelectedIdea(idea);
    setInvestAmount('');
    setShowInvestModal(true);
  };

  const closeInvestModal = () => {
    setSelectedIdea(null);
    setInvestAmount('');
    setShowInvestModal(false);
  };

  const handleInvest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedIdea) return;
    const amount = parseFloat(investAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError(null);

    try {
      const res = await fetch(`${API_URL}/api/investments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          investorId: (user as any)?._id,
          entrepreneurId: selectedIdea.entrepreneurId,
          businessIdeaId: selectedIdea._id,
          amount,
          status: 'pending',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Investment failed');

      // Optimistically insert into UI
      setMyInvestments(prev => [data, ...prev]);
      closeInvestModal();
    } catch (err: any) {
      console.error('Invest error:', err);
      setError(err?.message || 'Failed to invest, try again');
    }
  };

  const totalInvested = myInvestments
    .filter(i => i.status === 'active' || i.status === 'completed' || i.status === 'pending')
    .reduce((s, i) => s + i.amount, 0);

  const availableIdeas = ideas.filter(i => i.status === 'active' || i.status === 'draft');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading investor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Investor Dashboard</h1>
        <p className="text-gray-600">Discover opportunities and manage your investments</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Available Ideas</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">{availableIdeas.length}</p>
            </div>
            <Lightbulb className="text-[#00AEEF]" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Invested</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">${totalInvested.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Active Investments</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">{myInvestments.filter(i => i.status === 'active').length}</p>
            </div>
            <TrendingUp className="text-[#00AEEF]" size={40} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-600">Filter:</label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border rounded">
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="funded">Funded</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="text-sm text-gray-500">
          Found <strong>{ideas.length}</strong> ideas • Your investments: <strong>{myInvestments.length}</strong>
        </div>
      </div>

      {/* Ideas list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {availableIdeas.map((idea) => (
          <div key={idea._id} className="bg-white rounded-xl shadow-md p-6">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-[#0B2C45]">{idea.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    idea.status === 'active' ? 'bg-green-100 text-green-800' :
                    idea.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                    idea.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {idea.status.toUpperCase()}
                  </span>
                </div>

                <p className="text-gray-600 mb-3">{idea.description}</p>

                <div className="text-sm flex gap-6 text-gray-600">
                  <div>Capital: ${idea.estimated_capital.toLocaleString()}</div>
                  <div>ROI: {idea.estimated_roi}%</div>
                  {idea.location && <div>Location: {idea.location}</div>}
                </div>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => openInvestModal(idea)}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-2 rounded-lg"
                  >
                    <Plus size={14} /> Invest
                  </button>
                  <button
                    onClick={() => window.alert(`Contact entrepreneur: ${idea.entrepreneurName || 'N/A'}`)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Contact
                  </button>
                </div>
              </div>
              <div className="text-right text-xs text-gray-500">
                <div>{idea.entrepreneurName || 'Entrepreneur'}</div>
                <div className="mt-2">{new Date(idea.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* My Investments */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-[#0B2C45] mb-4">My Investments</h2>
        {myInvestments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">You haven't invested yet.</div>
        ) : (
          <div className="space-y-3">
            {myInvestments.map(inv => (
              <div key={inv._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-semibold text-gray-800">${inv.amount.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{inv.businessIdeaTitle || 'Unknown idea'}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    inv.status === 'active' ? 'bg-green-100 text-green-800' :
                    inv.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    inv.status === 'defaulted' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {inv.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{new Date(inv.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invest modal */}
      {showInvestModal && selectedIdea && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeInvestModal}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#0B2C45] mb-2">Invest in: {selectedIdea.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{selectedIdea.description}</p>

            <form onSubmit={handleInvest} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min={1}
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button type="button" onClick={closeInvestModal} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white rounded">Confirm Invest</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvestorDashboard;
