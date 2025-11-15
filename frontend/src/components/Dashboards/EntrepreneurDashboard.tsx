import { useState, useEffect } from 'react';
import { Lightbulb, DollarSign, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';

interface BusinessIdea {
  _id: string;
  title: string;
  description: string;
  category?: string;
  estimated_capital: number;
  estimated_roi: number;
  location?: string;
  status: 'draft' | 'active' | 'funded' | 'completed';
  createdAt: string;
}

interface Investment {
  _id: string;
  amount: number;
  status: 'active' | 'completed' | 'defaulted';
  investment_type: string;
  investor?: { full_name: string };
  createdAt: string;
}

const EntrepreneurDashboard = () => {
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<BusinessIdea | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    estimated_capital: '',
    estimated_roi: '',
    location: '',
    status: 'draft' as 'draft' | 'active' | 'completed' | 'funded',
  });

  // ----------------------------
  // Load Mock Data
  // ----------------------------
  const loadData = () => {
    const mockBusinessIdeas: BusinessIdea[] = [
      {
        _id: '1',
        title: 'Coffee Shop Startup',
        description: 'A cozy coffee shop in downtown.',
        category: 'Food & Beverage',
        estimated_capital: 5000,
        estimated_roi: 20,
        status: 'draft',
        createdAt: new Date().toISOString(),
        location: 'New York',
      },
      {
        _id: '2',
        title: 'E-commerce Store',
        description: 'Selling eco-friendly products online.',
        category: 'Retail',
        estimated_capital: 3000,
        estimated_roi: 25,
        status: 'active',
        createdAt: new Date().toISOString(),
        location: 'Los Angeles',
      },
    ];

    const mockInvestments: Investment[] = [
      {
        _id: '1',
        amount: 2000,
        status: 'active',
        investment_type: 'Equity',
        createdAt: new Date().toISOString(),
        investor: { full_name: 'John Doe' },
      },
      {
        _id: '2',
        amount: 1000,
        status: 'completed',
        investment_type: 'Loan',
        createdAt: new Date().toISOString(),
        investor: { full_name: 'Jane Smith' },
      },
    ];

    setBusinessIdeas(mockBusinessIdeas);
    setInvestments(mockInvestments);
  };

  useEffect(() => {
    loadData();
  }, []);

  // ----------------------------
  // Form handling
  // ----------------------------
  const handleEdit = (idea: BusinessIdea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category || '',
      estimated_capital: idea.estimated_capital.toString(),
      estimated_roi: idea.estimated_roi.toString(),
      location: idea.location || '',
      status: idea.status,
    });
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this idea?')) return;
    setBusinessIdeas(prev => prev.filter(i => i._id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newIdea: BusinessIdea = {
      _id: editingIdea ? editingIdea._id : Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      estimated_capital: parseFloat(formData.estimated_capital),
      estimated_roi: parseFloat(formData.estimated_roi),
      status: formData.status,
      createdAt: new Date().toISOString(),
      location: formData.location,
    };

    if (editingIdea) {
      setBusinessIdeas(prev =>
        prev.map(i => (i._id === editingIdea._id ? newIdea : i))
      );
    } else {
      setBusinessIdeas(prev => [...prev, newIdea]);
    }

    setShowModal(false);
    setEditingIdea(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      estimated_capital: '',
      estimated_roi: '',
      location: '',
      status: 'draft',
    });
  };

  const totalFunding = investments
    .filter(i => i.status === 'active' || i.status === 'completed')
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45] mb-2">Entrepreneur Dashboard</h1>
        <p className="text-gray-600">Manage your business ideas and track funding</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Business Ideas</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">{businessIdeas.length}</p>
          </div>
          <Lightbulb className="text-[#00AEEF]" size={40} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Total Funding</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">
              ${totalFunding.toLocaleString()}
            </p>
          </div>
          <DollarSign className="text-green-500" size={40} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-600 text-sm">Active Investments</p>
            <p className="text-3xl font-bold text-[#0B2C45] mt-1">
              {investments.filter(i => i.status === 'active').length}
            </p>
          </div>
          <TrendingUp className="text-[#00AEEF]" size={40} />
        </div>
      </div>

      {/* Business Ideas List */}
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#0B2C45]">Your Business Ideas</h2>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#00AEEF] text-white px-4 py-2 rounded-lg"
        >
          <Plus size={16} /> Add Idea
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {businessIdeas.map(idea => (
          <div key={idea._id} className="bg-white rounded-xl shadow-md p-4">
            <h3 className="text-lg font-semibold text-[#0B2C45]">{idea.title}</h3>
            <p className="text-gray-600 mb-2">{idea.description}</p>
            <p className="text-sm text-gray-500 mb-2">
              Category: {idea.category || 'N/A'} | Location: {idea.location || 'N/A'}
            </p>
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => handleEdit(idea)}
                className="flex items-center gap-1 text-blue-600"
              >
                <Edit size={14} /> Edit
              </button>
              <button
                onClick={() => handleDelete(idea._id)}
                className="flex items-center gap-1 text-red-600"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold text-[#0B2C45] mb-4">
              {editingIdea ? 'Edit Idea' : 'Add Idea'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="text"
                placeholder="Location"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Estimated Capital"
                value={formData.estimated_capital}
                onChange={e => setFormData({ ...formData, estimated_capital: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Estimated ROI"
                value={formData.estimated_roi}
                onChange={e => setFormData({ ...formData, estimated_roi: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00AEEF] text-white rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrepreneurDashboard;
