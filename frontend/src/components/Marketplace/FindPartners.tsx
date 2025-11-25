import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, MapPin, Briefcase, MessageCircle, Star, Filter } from 'lucide-react';
import axios from 'axios';

interface PartnerProfile {
  _id: string;
  full_name: string;
  role: string;
  industry?: string;
  location?: string;
  company_name?: string;
  bio?: string;
  rating: number;
  total_reviews: number;
  specialization?: string;
}

export const FindPartners = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<PartnerProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<PartnerProfile[]>([]);
  const [filters, setFilters] = useState({
    role: 'all',
    industry: '',
    location: '',
  });

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, profiles]);

  // Load profiles from your API
  const loadProfiles = async () => {
    try {
      const res = await axios.get('/api/users'); // replace with your API endpoint
      const allProfiles: PartnerProfile[] = res.data;

      // Filter out current user
      const filtered = allProfiles.filter(p => p._id !== user?.email);
      setProfiles(filtered);
    } catch (err) {
      console.error('Error loading profiles:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...profiles];

    if (filters.role !== 'all') {
      filtered = filtered.filter(p => p.role === filters.role);
    }

    if (filters.industry) {
      filtered = filtered.filter(p =>
        p.industry?.toLowerCase().includes(filters.industry.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(p =>
        p.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
  };

  const startChat = async (partnerId: string) => {
    // You can integrate your messages API here
    try {
      await axios.post('/api/notifications', {
        user_id: partnerId,
        title: 'New Connection Request',
        message: `Someone wants to connect with you!`,
        type: 'message',
      });
      alert('Chat feature coming soon! Partner notified.');
    } catch (err) {
      console.error('Error sending notification:', err);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'entrepreneur': return 'bg-blue-100 text-blue-800';
      case 'investor': return 'bg-green-100 text-green-800';
      case 'supplier': return 'bg-purple-100 text-purple-800';
      case 'realtor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Find Partners</h1>
        <p className="text-gray-600">Connect with entrepreneurs, investors, suppliers, and realtors</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="text-[#00AEEF]" size={24} />
          <h2 className="text-lg font-semibold text-[#0B2C45]">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
            <select
              value={filters.role}
              onChange={e => setFilters({ ...filters, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            >
              <option value="all">All Roles</option>
              <option value="entrepreneur">Entrepreneurs</option>
              <option value="investor">Investors</option>
              <option value="supplier">Suppliers</option>
              <option value="realtor">Realtors</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <input
              type="text"
              value={filters.industry}
              onChange={e => setFilters({ ...filters, industry: e.target.value })}
              placeholder="Search by industry..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={filters.location}
              onChange={e => setFilters({ ...filters, location: e.target.value })}
              placeholder="Search by location..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfiles.map(profile => (
          <div key={profile._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
            <div className="h-24 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45]"></div>
            <div className="p-6 -mt-12">
              <div className="flex justify-center mb-4">
                <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 flex items-center justify-center text-3xl font-bold text-[#0B2C45] shadow-lg">
                  {profile.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-[#0B2C45] mb-1">{profile.full_name}</h3>
                {profile.company_name && <p className="text-sm text-gray-600 mb-2">{profile.company_name}</p>}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(profile.role)}`}>
                  {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                </span>
              </div>
              {profile.bio && <p className="text-sm text-gray-600 text-center mb-4 line-clamp-3">{profile.bio}</p>}

              <div className="space-y-2 mb-4">
                {profile.industry && <div className="flex items-center gap-2 text-sm text-gray-600"><Briefcase size={16} className="text-[#00AEEF]" />{profile.industry}</div>}
                {profile.location && <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin size={16} className="text-[#00AEEF]" />{profile.location}</div>}
                <div className="flex items-center gap-2 text-sm text-gray-600"><Star size={16} className="text-yellow-500" fill="currentColor" />{profile.rating.toFixed(1)} ({profile.total_reviews} reviews)</div>
              </div>

              {profile.specialization && <div className="mb-4"><p className="text-xs text-gray-500 mb-1">Specialization:</p><p className="text-sm font-medium text-[#0B2C45]">{profile.specialization}</p></div>}

              <button
                onClick={() => startChat(profile._id)}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-3 rounded-lg hover:shadow-lg transition font-medium"
              >
                <MessageCircle size={18} />
                Connect & Chat
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Users size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Partners Found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new partners.</p>
        </div>
      )}
    </div>
  );
};
