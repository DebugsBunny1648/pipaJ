import { useNavigate } from "react-router-dom";
import { Store, Image as ImageIcon, Tag, Truck, Settings, ArrowRight } from "lucide-react";

const QUICK_LINKS = [
  { icon: Store, label: "Store Settings", sub: "Name, logo, contact, GST", to: "/admin/settings", color: "bg-blue-50 text-blue-600" },
  { icon: ImageIcon, label: "Banners", sub: "Manage homepage banners", to: "/admin/banners", color: "bg-purple-50 text-purple-600" },
  { icon: Tag, label: "Categories", sub: "Manage product categories", to: "/admin/categories", color: "bg-green-50 text-green-600" },
  { icon: Truck, label: "Delivery Charges", sub: "Set shipping zones and rates", to: "/admin/delivery-charges", color: "bg-orange-50 text-orange-600" },
  { icon: Settings, label: "Shipping Partners", sub: "Configure courier integrations", to: "/admin/shipping", color: "bg-gray-100 text-gray-600" },
];

const AdminStore = () => {
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Store</h1>
      <p className="text-sm text-gray-500">Manage all store configuration from one place.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.to}
            onClick={() => navigate(link.to)}
            className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-4 group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${link.color}`}>
              <link.icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-gray-900 text-sm">{link.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{link.sub}</div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default AdminStore;
