import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lightbulb, DollarSign, MapPin, TrendingUp, Search } from 'lucide-react';
import axios from 'axios';

interface Opportunity {
  _id: string;
  title: string;
  description: string;
  category?: string;
  location?: string;
  estimated_capital: number;
  estimated_roi: number;
  entrepreneur?: {
    _id: string;
    full_name: string;
    rating: number;
  };
  ai_generated?: boolean;
}

export const OpportunitiesMarketplace = () => {
  const { user, profile } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/opportunities'); // Your Express API endpoint
      setOpportunities(res.data);
    } catch (err) {
      console.error('Error loading opportunities:', err);
    }
    setLoading(false);
  };

  const categories = ['all', ...new Set(opportunities.map(o => o.category).filter(Boolean))];

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch =
      opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || opp.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading opportunities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">
          {profile?.role === 'entrepreneur' ? 'Find Investors' : 'Business Opportunities'}
        </h1>
        <p className="text-gray-600">
          {profile?.role === 'entrepreneur'
            ? 'Connect with investors interested in your industry'
            : 'Discover promising business ventures'}
        </p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search opportunities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === 'all' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Opportunities Grid */}
      <div className="grid gap-6">
        {filteredOpportunities.map((opportunity) => (
          <div key={opportunity._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="text-[#00AEEF]" size={24} />
                  <h3 className="text-xl font-bold text-[#0B2C45]">{opportunity.title}</h3>
                  {opportunity.category && (
                    <span className="px-3 py-1 bg-blue-50 text-[#00AEEF] rounded-full text-xs font-medium">
                      {opportunity.category}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-4">{opportunity.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign size={18} className="text-blue-600" />
                  <p className="text-xs text-blue-600 font-medium">Capital Required</p>
                </div>
                <p className="text-xl font-bold text-[#0B2C45]">
                  ${opportunity.estimated_capital.toLocaleString()}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-green-600" />
                  <p className="text-xs text-green-600 font-medium">Expected ROI</p>
                </div>
                <p className="text-xl font-bold text-green-700">{opportunity.estimated_roi}%</p>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={18} className="text-gray-600" />
                  <p className="text-xs text-gray-600 font-medium">Location</p>
                </div>
                <p className="text-sm font-semibold text-[#0B2C45]">{opportunity.location || 'Flexible'}</p>
              </div>

              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb size={18} className="text-cyan-600" />
                  <p className="text-xs text-cyan-600 font-medium">Entrepreneur</p>
                </div>
                <p className="text-sm font-semibold text-[#0B2C45]">
                  {opportunity.entrepreneur?.full_name || 'Anonymous'}
                </p>
                {opportunity.entrepreneur?.rating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-yellow-500 text-xs">⭐</span>
                    <span className="text-xs font-semibold">{opportunity.entrepreneur.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {opportunity.ai_generated && (
              <div className="flex items-center gap-2 text-sm text-[#00AEEF] mb-4">
                <Lightbulb size={16} />
                <span>AI-Generated Business Idea</span>
              </div>
            )}

            <div className="flex gap-3">
              <button className="flex-1 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition">
                View Details
              </button>
              <button className="px-6 py-3 border-2 border-[#00AEEF] text-[#00AEEF] rounded-lg font-semibold hover:bg-blue-50 transition">
                Contact
              </button>
            </div>
          </div>
        ))}

        {filteredOpportunities.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <Lightbulb size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No opportunities found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
