import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ShoppingCart, Users, Tag, Ticket, ImageIcon, LogOut, ExternalLink, Camera } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const items = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { to: "/admin/products", icon: Package, label: "Products" },
    { to: "/admin/orders", icon: ShoppingCart, label: "Orders" },
    { to: "/admin/users", icon: Users, label: "Users" },
    { to: "/admin/categories", icon: Tag, label: "Categories" },
    { to: "/admin/coupons", icon: Ticket, label: "Coupons" },
    { to: "/admin/banners", icon: ImageIcon, label: "Banners" },
    { to: "/admin/lookbook", icon: Camera, label: "Lookbook" },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: "var(--pipa-admin-bg)" }}>
      <aside className="w-60 bg-[#F3EFE9] border-r border-[#E5E0D8] flex flex-col">
        <Link to="/" className="font-serif-pipa text-2xl px-6 py-5 border-b border-[#E5E0D8]">
          Pipa<span className="text-[#B45F45]">.</span> <span className="text-xs uppercase tracking-widest text-[#4A4A4A]">admin</span>
        </Link>
        <nav className="flex-1 p-3 space-y-1">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              data-testid={`admin-nav-${it.label.toLowerCase()}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-sm rounded transition-colors ${
                  isActive ? "bg-[#B45F45] text-white" : "text-[#1A1A1A] hover:bg-white"
                }`
              }
            >
              <it.icon size={18} strokeWidth={1.5} />
              {it.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-[#E5E0D8] space-y-1">
          <Link to="/" className="flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-white">
            <ExternalLink size={18} strokeWidth={1.5} /> View Store
          </Link>
          <button
            data-testid="admin-logout"
            onClick={() => { logout(); navigate("/login"); }}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded hover:bg-white"
          >
            <LogOut size={18} strokeWidth={1.5} /> Logout
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-[#E5E0D8] px-6 py-4 flex justify-between items-center sticky top-0 z-30">
          <h1 className="font-serif-pipa text-2xl">Admin Panel</h1>
          <div className="text-sm text-[#4A4A4A]">Hi, {user?.name}</div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
