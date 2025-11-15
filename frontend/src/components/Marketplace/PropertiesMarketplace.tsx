import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Building, MapPin, Search, Home } from 'lucide-react';
import axios from 'axios';

interface Realtor {
  _id: string;
  full_name: string;
  rating: number;
}

interface Property {
  _id: string;
  title: string;
  description: string;
  city: string;
  state: string;
  price: number;
  square_footage?: number;
  property_type: string;
  listing_type: 'sale' | 'lease';
  realtor?: Realtor;
}

export const PropertiesMarketplace = () => {
  useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterListing, setFilterListing] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/properties'); // Express API endpoint
      setProperties(res.data);
    } catch (err: any) {
      console.error('Error loading properties:', err.message || err);
    }
    setLoading(false);
  };

  // Dynamically get all property types
  const propertyTypes = useMemo(
    () => ['all', ...new Set(properties.map((p) => p.property_type))],
    [properties]
  );

  // Filtered properties
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      const matchesSearch =
        prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || prop.property_type === filterType;
      const matchesListing = filterListing === 'all' || prop.listing_type === filterListing;
      return matchesSearch && matchesType && matchesListing;
    });
  }, [properties, searchTerm, filterType, filterListing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Property Marketplace</h1>
        <p className="text-gray-600">Find the perfect location for your business</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
          >
            {propertyTypes.map((type) => (
              <option key={type} value={type} className="capitalize">
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>

          <select
            value={filterListing}
            onChange={(e) => setFilterListing(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
          >
            <option value="all">All Listings</option>
            <option value="sale">For Sale</option>
            <option value="lease">For Lease</option>
          </select>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.map((property) => (
          <div key={property._id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-[#00AEEF] to-[#0B2C45] flex items-center justify-center">
              <Building size={64} className="text-white opacity-50" />
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-[#0B2C45] mb-1">{property.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={16} />
                    <span>{property.city}, {property.state}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  property.listing_type === 'sale'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  For {property.listing_type === 'sale' ? 'Sale' : 'Lease'}
                </span>
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">{property.description}</p>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Price</p>
                  <p className="text-lg font-bold text-[#0B2C45]">
                    ${(property.price / 1000).toFixed(0)}K
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Type</p>
                  <p className="text-sm font-semibold text-[#0B2C45] capitalize">{property.property_type}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Size</p>
                  <p className="text-sm font-semibold text-[#0B2C45]">
                    {property.square_footage ? `${(property.square_footage / 1000).toFixed(1)}K sq ft` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200">
                <Home size={16} />
                <span>Listed by {property.realtor?.full_name || 'Realtor'}</span>
                {(property.realtor?.rating ?? 0) > 0 && (
                  <>
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold">{(property.realtor?.rating ?? 0).toFixed(1)}</span>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition">
                  View Details
                </button>
                <button className="px-6 py-2 border-2 border-[#00AEEF] text-[#00AEEF] rounded-lg font-semibold hover:bg-blue-50 transition">
                  Contact
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredProperties.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-xl shadow-md">
            <Building size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No properties found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};
