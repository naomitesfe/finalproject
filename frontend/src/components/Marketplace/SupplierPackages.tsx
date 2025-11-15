import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { Package, ShoppingCart, Filter, Star } from 'lucide-react';

interface Supplier {
  _id: string;
  full_name: string;
  company_name?: string;
  rating: number;
  total_reviews: number;
}

interface SupplierPackage {
  _id: string;
  title: string;
  description: string;
  industry: string;
  price: number;
  estimated_capital: number;
  minimum_order: number;
  items: string[];
  supplier?: Supplier;
}

export const SupplierPackages = () => {
  const { user } = useAuth();
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [filters, setFilters] = useState({ industry: '', maxPrice: '' });
  const [selectedPackage, setSelectedPackage] = useState<SupplierPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/supplier-packages'); // Express API
      setPackages(res.data);
    } catch (err: any) {
      console.error('Error loading packages:', err.message || err);
    }
    setLoading(false);
  };

  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesIndustry =
        !filters.industry || pkg.industry.toLowerCase().includes(filters.industry.toLowerCase());
      const matchesPrice =
        !filters.maxPrice || pkg.price <= parseFloat(filters.maxPrice);
      return matchesIndustry && matchesPrice;
    });
  }, [packages, filters]);

  const handleInquiry = async (pkg: SupplierPackage) => {
    try {
      await axios.post('/api/notifications', {
        user_id: pkg.supplier?._id,
        title: 'Package Inquiry',
        message: `Someone is interested in your ${pkg.title} package!`,
        type: 'message',
        link: `/packages/${pkg._id}`,
      });
      alert('Your inquiry has been sent to the supplier. They will contact you soon!');
    } catch (err: any) {
      console.error('Error sending inquiry:', err.message || err);
      alert('Failed to send inquiry. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#00AEEF] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading packages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Supplier Starter Packages</h1>
        <p className="text-gray-600">Browse ready-to-go business packages from verified suppliers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="text-[#00AEEF]" size={24} />
          <h2 className="text-lg font-semibold text-[#0B2C45]">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <input
              type="text"
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              placeholder="Search by industry..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price ($)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              placeholder="Enter maximum price..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPackages.map((pkg) => (
          <div
            key={pkg._id}
            className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
            onClick={() => setSelectedPackage(pkg)}
          >
            <div className="h-48 bg-gradient-to-br from-[#00AEEF]/20 to-[#0B2C45]/20 flex items-center justify-center">
              <Package size={80} className="text-[#00AEEF]" />
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-bold text-[#0B2C45] line-clamp-2 flex-1">{pkg.title}</h3>
                <span className="bg-[#00AEEF]/10 text-[#00AEEF] px-2 py-1 rounded text-xs font-medium ml-2">
                  {pkg.industry}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">{pkg.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Package Price:</span>
                  <span className="text-lg font-bold text-[#0B2C45]">${pkg.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Capital Needed:</span>
                  <span className="text-md font-semibold text-green-600">
                    ${pkg.estimated_capital.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Min. Order:</span>
                  <span className="text-sm font-medium text-gray-700">{pkg.minimum_order} unit(s)</span>
                </div>
              </div>

              {pkg.supplier && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#0B2C45] flex items-center justify-center text-white font-bold">
                    {pkg.supplier.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-[#0B2C45]">{pkg.supplier.full_name}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500" fill="currentColor" />
                      <span className="text-xs text-gray-600">
                        {pkg.supplier.rating.toFixed(1)} ({pkg.supplier.total_reviews})
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInquiry(pkg);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-3 rounded-lg hover:shadow-lg transition font-medium"
              >
                <ShoppingCart size={18} />
                Request Quote
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPackages.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <Package size={64} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Packages Found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or check back later for new packages.
          </p>
        </div>
      )}

      {/* Package Modal */}
      {selectedPackage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPackage(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal content same as your existing design */}
          </div>
        </div>
      )}
    </div>
  );
};
