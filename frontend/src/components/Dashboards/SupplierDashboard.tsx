import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { Package, DollarSign, ShoppingCart, Plus, Edit, Trash2, TrendingUp } from 'lucide-react';

interface SupplierPackage {
  _id: string;
  title: string;
  description: string;
  industry: string;
  items: string[];
  price: number;
  minimum_order: number;
  estimated_capital: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
}

interface Transaction {
  _id: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  payment_method?: string;
  createdAt: string;
  payer?: { full_name: string };
}

export const SupplierDashboard = () => {
  const { user } = useUser();
  const [packages, setPackages] = useState<SupplierPackage[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<SupplierPackage | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    industry: '',
    items: '',
    price: '',
    minimum_order: '1',
    estimated_capital: '',
    status: 'available' as const,
  });

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    try {
      const [packagesRes, transactionsRes] = await Promise.all([
        axios.get(`/api/supplier-packages?supplierId=${user?.id}`),
        axios.get(`/api/transactions?receiverId=${user?.id}&type=package_purchase`)
      ]);
      setPackages(packagesRes.data);
      setTransactions(transactionsRes.data);
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const itemsArray = formData.items.split('\n').filter(item => item.trim());

    const packageData = {
      supplier_id: user.id,
      title: formData.title,
      description: formData.description,
      industry: formData.industry,
      items: itemsArray,
      price: parseFloat(formData.price),
      minimum_order: parseInt(formData.minimum_order),
      estimated_capital: parseFloat(formData.estimated_capital),
      status: formData.status,
    };

    try {
      if (editingPackage) {
        await axios.put(`/api/supplier-packages/${editingPackage._id}`, packageData);
      } else {
        await axios.post('/api/supplier-packages', packageData);
      }
      setShowModal(false);
      setEditingPackage(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving package', error);
    }
  };

  const handleEdit = (pkg: SupplierPackage) => {
    setEditingPackage(pkg);
    setFormData({
      title: pkg.title,
      description: pkg.description,
      industry: pkg.industry,
      items: pkg.items.join('\n'),
      price: pkg.price.toString(),
      minimum_order: pkg.minimum_order.toString(),
      estimated_capital: pkg.estimated_capital.toString(),
      status: pkg.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this package?')) {
      try {
        await axios.delete(`/api/supplier-packages/${id}`);
        loadData();
      } catch (error) {
        console.error('Error deleting package', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      industry: '',
      items: '',
      price: '',
      minimum_order: '1',
      estimated_capital: '',
      status: 'available',
    });
  };

  const totalRevenue = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalOrders = transactions.filter(t => t.status === 'completed').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Dashboard Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Total Packages</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">{packages.length}</p>
          </div>
          <Package className="text-[#00AEEF]" size={40} />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">${totalRevenue.toLocaleString()}</p>
          </div>
          <DollarSign className="text-green-500" size={40} />
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Total Orders</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">{totalOrders}</p>
          </div>
          <ShoppingCart className="text-[#00AEEF]" size={40} />
        </div>
      </div>

      {/* Packages Table */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0B2C45]">Your Starter Packages</h2>
          <button
            onClick={() => {
              resetForm();
              setEditingPackage(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
          >
            <Plus size={18} /> Add Package
          </button>
        </div>

        <div className="grid gap-4">
          {packages.map(pkg => (
            <div key={pkg._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-[#0B2C45]">{pkg.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pkg.status === 'available' ? 'bg-green-100 text-green-800' :
                      pkg.status === 'out_of_stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {pkg.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{pkg.description}</p>
                  <div className="flex gap-6 text-sm mb-3">
                    <div>Price: <span className="font-semibold text-[#0B2C45]">${pkg.price.toLocaleString()}</span></div>
                    <div>Industry: <span className="font-semibold text-[#0B2C45]">{pkg.industry}</span></div>
                    <div>Min Order: <span className="font-semibold text-[#0B2C45]">{pkg.minimum_order}</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(pkg)} className="p-2 text-[#00AEEF] hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(pkg._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          ))}

          {packages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Package size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No packages yet. Start by adding your first starter package!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-[#0B2C45] mb-6">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment Method</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(txn => (
                <tr key={txn._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{txn.payer?.full_name || 'Anonymous'}</td>
                  <td className="py-3 px-4 font-semibold">${txn.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.status === 'completed' ? 'bg-green-100 text-green-800' :
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      txn.status === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{txn.status}</span>
                  </td>
                  <td className="py-3 px-4">{txn.payment_method || 'N/A'}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{new Date(txn.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {transactions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-[#0B2C45]">
                {editingPackage ? 'Edit Package' : 'Add Starter Package'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Complete Boutique Starter Kit"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Describe what this package includes and who it's for"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                  <input
                    type="text"
                    required
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Fashion, Food & Beverage"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                  >
                    <option value="available">Available</option>
                    <option value="out_of_stock">Out of Stock</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Items Included (one per line)</label>
                <textarea
                  required
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  rows={5}
                  placeholder="Display racks&#10;Clothing hangers (50 pcs)&#10;Point of sale system&#10;Inventory management software"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min Order</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.minimum_order}
                    onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Capital ($)</label>
                  <input
                    type="number"
                    required
                    step="0.01"
                    value={formData.estimated_capital}
                    onChange={(e) => setFormData({ ...formData, estimated_capital: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00AEEF] focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition"
                >
                  {editingPackage ? 'Update' : 'Create'} Package
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPackage(null);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
