import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ShoppingCart, Package, FolderOpen, Tag, Ticket,
  Link2, MessageSquare, Users, CreditCard, Receipt, BarChart2,
  Truck, Package2, Printer, Store, Bell, Settings, LogOut, ExternalLink, Gem
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const groups = [
  {
    items: [
      { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    ],
  },
  {
    label: "Store",
    items: [
      { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
      { to: "/admin/products", icon: Package, label: "Products" },
      { to: "/admin/collections", icon: FolderOpen, label: "Collections" },
      { to: "/admin/categories", icon: Tag, label: "Categories" },
      { to: "/admin/coupons", icon: Ticket, label: "Coupons" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { to: "/admin/create-link", icon: Link2, label: "Create Link" },
      { to: "/admin/auto-dm", icon: MessageSquare, label: "Auto DM" },
    ],
  },
  {
    label: "People",
    items: [
      { to: "/admin/customers", icon: Users, label: "Customers" },
    ],
  },
  {
    label: "Finance",
    items: [
      { to: "/admin/payments", icon: CreditCard, label: "Payments" },
      { to: "/admin/billing", icon: Receipt, label: "Billing" },
      { to: "/admin/reports", icon: BarChart2, label: "Reports" },
    ],
  },
  {
    label: "Shipping",
    items: [
      { to: "/admin/delivery-charges", icon: Truck, label: "Delivery Charges" },
      { to: "/admin/shipping", icon: Package2, label: "Shipping Partners" },
      { to: "/admin/labels", icon: Printer, label: "Label Download" },
    ],
  },
  {
    label: "System",
    items: [
      { to: "/admin/store", icon: Store, label: "Store" },
      { to: "/admin/notifications", icon: Bell, label: "Notifications" },
      { to: "/admin/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-[250px] bg-white border-r border-gray-200 flex flex-col fixed top-0 left-0 h-screen z-40 overflow-y-auto">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-200 flex-shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Gem size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-sm leading-tight tracking-wide">PIPA JEWELLERY</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-widest">Admin</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5">
          {groups.map((group, gi) => (
            <div key={gi}>
              {group.label && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 px-2 mb-1">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-sm"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`
                    }
                  >
                    <item.icon size={16} strokeWidth={1.8} />
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 border-t border-gray-200 pt-3 space-y-0.5 flex-shrink-0">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
          >
            <ExternalLink size={16} strokeWidth={1.8} />
            View Store
          </Link>
          <button
            data-testid="admin-logout"
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all"
          >
            <LogOut size={16} strokeWidth={1.8} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 ml-[250px] flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center sticky top-0 z-30">
          <div />
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">
              Hi, <span className="font-medium text-gray-800">{user?.name}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
