import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Search, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const StoreLayout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const nav = [
    { to: "/shop", label: "Shop All" },
    { to: "/shop/earrings", label: "Earrings" },
    { to: "/shop/necklaces", label: "Necklaces" },
    { to: "/shop/rings", label: "Rings" },
    { to: "/shop/bangles", label: "Bangles" },
    { to: "/shop/bridal", label: "Bridal" },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pipa-bg)" }}>
      {/* Top bar */}
      <div className="bg-[#1A1A1A] text-[#E8D8CE] text-xs tracking-wider py-2 text-center font-light">
        FREE SHIPPING ON ORDERS ABOVE ₹999 • USE CODE WELCOME10 FOR 10% OFF
      </div>

      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#E5E0D8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between gap-6">
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link to="/" data-testid="logo-link" className="font-serif-pipa text-2xl sm:text-3xl tracking-wide">
            Pipa<span className="text-[#B45F45]">.</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `pipa-link uppercase ${isActive ? "text-[#B45F45]" : "text-[#1A1A1A]"} hover:text-[#B45F45]`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              data-testid="search-button"
              onClick={() => navigate("/shop")}
              aria-label="Search"
              className="hover:text-[#B45F45] transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>
            {user ? (
              <button
                data-testid="account-link"
                onClick={() => navigate(user.role === "admin" ? "/admin" : "/account")}
                aria-label="Account"
                className="hover:text-[#B45F45] transition-colors"
              >
                <User size={20} strokeWidth={1.5} />
              </button>
            ) : (
              <Link to="/login" data-testid="login-link" aria-label="Login" className="hover:text-[#B45F45] transition-colors">
                <User size={20} strokeWidth={1.5} />
              </Link>
            )}
            <Link to="/wishlist" data-testid="wishlist-link" aria-label="Wishlist" className="hover:text-[#B45F45] transition-colors">
              <Heart size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/cart" data-testid="cart-link" aria-label="Cart" className="relative hover:text-[#B45F45] transition-colors">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span data-testid="cart-count" className="absolute -top-2 -right-2 bg-[#B45F45] text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#E5E0D8] bg-[#FAF8F5] px-6 py-4 space-y-3">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                className="block text-sm uppercase tracking-wide py-1"
              >
                {n.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-20 border-t border-[#E5E0D8] bg-[#F3EFE9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-14 grid md:grid-cols-4 gap-10">
          <div>
            <div className="font-serif-pipa text-3xl">Pipa<span className="text-[#B45F45]">.</span></div>
            <p className="text-sm text-[#4A4A4A] mt-3 leading-relaxed">
              Handcrafted jewellery, made with love in India. Every piece tells a story.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-3">Shop</h4>
            <ul className="space-y-2 text-sm text-[#4A4A4A]">
              {nav.slice(0, 5).map((n) => (
                <li key={n.to}><Link to={n.to} className="hover:text-[#B45F45]">{n.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-3">Help</h4>
            <ul className="space-y-2 text-sm text-[#4A4A4A]">
              <li>Shipping & Returns</li>
              <li>Care Guide</li>
              <li>Contact Us</li>
              <li>FAQ</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest mb-3">Newsletter</h4>
            <p className="text-sm text-[#4A4A4A] mb-3">Sign up for new collections & 10% off.</p>
            <div className="flex">
              <input
                data-testid="newsletter-input"
                type="email"
                placeholder="email@you.com"
                className="bg-white border border-[#E5E0D8] px-3 py-2 text-sm flex-1 outline-none focus:border-[#B45F45]"
              />
              <button
                data-testid="newsletter-submit"
                onClick={() => alert("Thanks for subscribing!")}
                className="bg-[#1A1A1A] text-white px-4 text-sm tracking-wide hover:bg-[#B45F45]"
              >
                JOIN
              </button>
            </div>
          </div>
        </div>
        <div className="border-t border-[#E5E0D8] py-5 text-center text-xs text-[#4A4A4A] tracking-wider">
          © {new Date().getFullYear()} PIPA JEWELLERY • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
};

export default StoreLayout;
