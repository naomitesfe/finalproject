import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../lib/api";
import { Home, DollarSign, MapPin, Plus, Edit, Trash2 } from "lucide-react";

export interface Property {
  _id: string;
  realtor_id: string;
  title: string;
  description: string;
  property_type: string;
  price: number;
  listing_type: "sale" | "lease";
  address: string;
  city: string;
  state?: string;
  country: string;
  square_footage?: number;
  status: "available" | "pending" | "sold" | "leased";
  created_at: string;
}

export const RealtorDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  interface FormData {
    title: string;
    description: string;
    property_type: string;
    price: string;
    listing_type: "sale" | "lease";
    address: string;
    city: string;
    state: string;
    country: string;
    square_footage: string;
    status: "available" | "pending" | "sold" | "leased";
  }

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    property_type: "office",
    price: "",
    listing_type: "sale",
    address: "",
    city: "",
    state: "",
    country: "USA",
    square_footage: "",
    status: "available",
  });

  useEffect(() => {
    if (user) loadProperties();
  }, [user]);

  const loadProperties = async () => {
    try {
      const res = await api.get(`/properties/realtor/${user!.email}`);
      setProperties(res.data);
    } catch (err) {
      console.error("Error loading properties:", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      realtor_id: user!.email,
      title: formData.title,
      description: formData.description,
      property_type: formData.property_type,
      price: Number(formData.price),
      listing_type: formData.listing_type,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      country: formData.country,
      square_footage: formData.square_footage ? Number(formData.square_footage) : undefined,
      status: formData.status,
    };

    try {
      if (editingProperty) {
        await api.put(`/properties/${editingProperty._id}`, payload);
      } else {
        await api.post("/properties", payload);
      }
      resetForm();
      setShowModal(false);
      setEditingProperty(null);
      loadProperties();
    } catch (err) {
      console.error("Error saving property:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    await api.delete(`/properties/${id}`);
    loadProperties();
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      description: property.description,
      property_type: property.property_type,
      price: property.price.toString(),
      listing_type: property.listing_type,
      address: property.address,
      city: property.city,
      state: property.state || "",
      country: property.country,
      square_footage: property.square_footage?.toString() || "",
      status: property.status,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      property_type: "office",
      price: "",
      listing_type: "sale",
      address: "",
      city: "",
      state: "",
      country: "USA",
      square_footage: "",
      status: "available",
    });
  };

  const availableProperties = properties.filter((p) => p.status === "available");
  const totalValue = properties
    .filter((p) => p.status !== "sold" && p.status !== "leased")
    .reduce((a, b) => a + b.price, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B2C45]">Realtor Dashboard</h1>
        <p className="text-gray-600">Manage your property listings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <DashboardCard title="Total Properties" value={properties.length} icon={<Home size={40} />} />

        <DashboardCard title="Available Listings" value={availableProperties.length} icon={<MapPin size={40} />} />

        <DashboardCard
          title="Total Value"
          value={`$${(totalValue / 1_000_000).toFixed(1)}M`}
          icon={<DollarSign size={40} />}
        />
      </div>

      {/* Listings */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#0B2C45]">Your Listings</h2>
          <button
            className="flex items-center gap-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white px-4 py-2 rounded-lg"
            onClick={() => {
              resetForm();
              setEditingProperty(null);
              setShowModal(true);
            }}
          >
            <Plus size={18} />
            Add Property
          </button>
        </div>

        {/* Render property cards */}
        {properties.map((p) => (
          <PropertyCard key={p._id} property={p} onEdit={handleEdit} onDelete={handleDelete} />
        ))}

        {properties.length === 0 && (
          <div className="text-center text-gray-500 py-12">No properties yet. Add your first!</div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PropertyModal
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => {
            setShowModal(false);
            setEditingProperty(null);
          }}
          editing={!!editingProperty}
        />
      )}
    </div>
  );
};

/*** Helper Components ***/
const DashboardCard = ({ title, value, icon }: any) => (
  <div className="bg-white rounded-xl shadow-md p-6 flex justify-between items-center">
    <div>
      <p className="text-gray-600 text-sm">{title}</p>
      <p className="text-3xl font-bold text-[#0B2C45]">{value}</p>
    </div>
    <div className="text-[#00AEEF]">{icon}</div>
  </div>
);

const PropertyCard = ({ property, onEdit, onDelete }: any) => (
  <div className="border border-gray-200 rounded-lg p-6 mb-4">
    <div className="flex justify-between">
      <div>
        <h3 className="text-xl font-bold text-[#0B2C45]">{property.title}</h3>
        <p className="text-gray-600">{property.description}</p>
      </div>

      <div className="flex gap-2">
        <button onClick={() => onEdit(property)} className="text-blue-500 border p-2 rounded-lg">
          <Edit size={16} />
        </button>
        <button onClick={() => onDelete(property._id)} className="text-red-500 border p-2 rounded-lg">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
);

const PropertyModal = ({ formData, setFormData, onSubmit, onClose, editing }: any) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-full max-w-2xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-[#0B2C45]">{editing ? "Edit Property" : "Add Property"}</h3>
        <button onClick={onClose} className="text-gray-600">Close</button>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3">
        <div>
          <label className="text-sm text-gray-600">Title</label>
          <input
            value={formData.title}
            onChange={(e: any) => setFormData({ ...formData, title: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Property Type</label>
            <input
              value={formData.property_type}
              onChange={(e: any) => setFormData({ ...formData, property_type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Price</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Listing Type</label>
            <select
              value={formData.listing_type}
              onChange={(e: any) => setFormData({ ...formData, listing_type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="sale">Sale</option>
              <option value="lease">Lease</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Status</label>
            <select
              value={formData.status}
              onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="available">Available</option>
              <option value="pending">Pending</option>
              <option value="sold">Sold</option>
              <option value="leased">Leased</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-sm text-gray-600">Address</label>
            <input
              value={formData.address}
              onChange={(e: any) => setFormData({ ...formData, address: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">City</label>
            <input
              value={formData.city}
              onChange={(e: any) => setFormData({ ...formData, city: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">State</label>
            <input
              value={formData.state}
              onChange={(e: any) => setFormData({ ...formData, state: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-gray-600">Country</label>
            <input
              value={formData.country}
              onChange={(e: any) => setFormData({ ...formData, country: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Square Footage</label>
            <input
              type="number"
              value={formData.square_footage}
              onChange={(e: any) => setFormData({ ...formData, square_footage: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-gradient-to-r from-[#00AEEF] to-[#0B2C45] text-white rounded">
            {editing ? "Update Property" : "Create Property"}
          </button>
        </div>
      </form>
    </div>
  </div>
);
