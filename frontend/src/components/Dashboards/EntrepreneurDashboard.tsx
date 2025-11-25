import { useState, useEffect } from "react";
import axios from "axios";
import {
  Lightbulb,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

// ---------------------------
// Interfaces
// ---------------------------
interface BusinessIdea {
  _id: string;
  title: string;
  description: string;
  category?: string;
  estimated_capital: number;
  estimated_roi: number;
  location?: string;
  status: "draft" | "active" | "funded" | "completed";
  createdAt: string;
}

interface Investment {
  _id: string;
  amount: number;
  status: "active" | "completed" | "defaulted";
  investment_type: string;
  investor?: { fullName: string };
  createdAt: string;
}

// ---------------------------
// Dashboard Component
// ---------------------------

const EntrepreneurDashboard = () => {
  const { profile, signOut } = useAuth();
  const [businessIdeas, setBusinessIdeas] = useState<BusinessIdea[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIdea, setEditingIdea] = useState<BusinessIdea | null>(null);
 type StatusType = "draft" | "active" | "funded" | "completed";

interface FormData {
  title: string;
  description: string;
  category: string;
  estimated_capital: string;
  estimated_roi: string;
  location: string;
  status: StatusType;
}

const [formData, setFormData] = useState<FormData>({
  title: "",
  description: "",
  category: "",
  estimated_capital: "",
  estimated_roi: "",
  location: "",
  status: "draft",
});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ---------------------------
  // Load Data
  // ---------------------------
  const loadData = async () => {
    if (!profile) return;

    try {
      const token = localStorage.getItem("token");
      const [ideasRes, investmentsRes] = await Promise.all([
        axios.get(`${API_URL}/api/business-ideas`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/api/investments`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBusinessIdeas(ideasRes.data);
      setInvestments(investmentsRes.data);
    } catch (err) {
      console.error("Error loading data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  // ---------------------------
  // Form Handlers
  // ---------------------------
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      estimated_capital: "",
      estimated_roi: "",
      location: "",
      status: "draft",
    });
  };

  const handleEdit = (idea: BusinessIdea) => {
    setEditingIdea(idea);
    setFormData({
      title: idea.title,
      description: idea.description,
      category: idea.category || "",
      estimated_capital: idea.estimated_capital.toString(),
      estimated_roi: idea.estimated_roi.toString(),
      location: idea.location || "",
      status: idea.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this business idea?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/business-ideas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBusinessIdeas((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const payload = {
        ...formData,
        estimated_capital: parseFloat(formData.estimated_capital),
        estimated_roi: parseFloat(formData.estimated_roi),
      };

      if (editingIdea) {
        await axios.put(
          `${API_URL}/api/business-ideas/${editingIdea._id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(`${API_URL}/api/business-ideas`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setEditingIdea(null);
      resetForm();
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const totalFunding = investments
    .filter((i) => i.status === "active" || i.status === "completed")
    .reduce((sum, i) => sum + i.amount, 0);

  // ---------------------------
  // JSX
  // ---------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="flex gap-6 items-center">
        </div>
      </nav>

      {/* Main content */}
      <div className="p-6 max-w-7xl mx-auto">
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
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">${totalFunding.toLocaleString()}</p>
            </div>
            <DollarSign className="text-green-500" size={40} />
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-600 text-sm">Active Investments</p>
              <p className="text-3xl font-bold text-[#0B2C45] mt-1">
                {investments.filter((i) => i.status === "active").length}
              </p>
            </div>
            <TrendingUp className="text-[#00AEEF]" size={40} />
          </div>
        </div>

        {/* Business Ideas Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#0B2C45]">Your Business Ideas</h2>
            <button
              onClick={() => {
                resetForm();
                setEditingIdea(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
            >
              <Plus size={18} />
              Add Business Idea
            </button>
          </div>

          <div className="grid gap-4">
            {businessIdeas.map((idea) => (
              <div
                key={idea._id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-[#0B2C45]">{idea.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          idea.status === "active"
                            ? "bg-green-100 text-green-800"
                            : idea.status === "funded"
                            ? "bg-blue-100 text-blue-800"
                            : idea.status === "completed"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {idea.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{idea.description}</p>
                    <div className="flex gap-6 text-sm">
                      <div>
                        <span className="text-gray-500">Capital: </span>
                        <span className="font-semibold text-[#0B2C45]">
                          ${idea.estimated_capital.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">ROI: </span>
                        <span className="font-semibold text-green-600">{idea.estimated_roi}%</span>
                      </div>
                      {idea.location && (
                        <div>
                          <span className="text-gray-500">Location: </span>
                          <span className="font-semibold text-[#0B2C45]">{idea.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(idea)}
                      className="p-2 text-[#00AEEF] hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(idea._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {businessIdeas.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Lightbulb size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No business ideas yet. Start by adding your first idea!</p>
              </div>
            )}
          </div>
        </div>

        {/* Investments Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-[#0B2C45] mb-6">Your Investments</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Investor
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {investments.map((inv) => (
                  <tr key={inv._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{inv.investor?.fullName || "Anonymous"}</td>
                    <td className="py-3 px-4 font-semibold">${inv.amount.toLocaleString()}</td>
                    <td className="py-3 px-4 capitalize">{inv.investment_type}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          inv.status === "active"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "completed"
                            ? "bg-blue-100 text-blue-800"
                            : inv.status === "defaulted"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {investments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <DollarSign size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No investments received yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-[#0B2C45]">
                {editingIdea ? "Edit Business Idea" : "Add Business Idea"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="funded">Funded</option>
                <option value="completed">Completed</option>
              </select>
              <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-[#00AEEF] text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntrepreneurDashboard;
