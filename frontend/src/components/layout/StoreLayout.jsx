import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Search, User, Menu, X, Instagram, Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const MARQUEE_ITEMS = [
  "FREE SHIPPING ABOVE ₹999",
  "✦",
  "ANTI-TARNISH & WATERPROOF",
  "✦",
  "USE CODE WELCOME10 — 10% OFF",
  "✦",
  "HANDCRAFTED IN INDIA",
  "✦",
  "NEW ARRIVALS EVERY WEEK",
  "✦",
  "GOLD PLATED JEWELLERY",
  "✦",
];

const NAV = [
  { to: "/shop",           label: "All" },
  { to: "/shop/earrings",  label: "Earrings" },
  { to: "/shop/necklaces", label: "Necklaces" },
  { to: "/shop/bracelets", label: "Bracelets" },
  { to: "/shop/anklets",   label: "Anklets" },
  { to: "/shop/bangles",   label: "Bangles" },
  { to: "/shop/bridal",    label: "Bridal" },
];

const FOOTER_SHOP = [
  { to: "/shop/earrings",  label: "Earrings" },
  { to: "/shop/necklaces", label: "Necklaces" },
  { to: "/shop/bracelets", label: "Bracelets" },
  { to: "/shop/anklets",   label: "Anklets" },
  { to: "/shop/bangles",   label: "Bangles" },
  { to: "/shop/bridal",    label: "Bridal Picks" },
];

export default function StoreLayout() {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--pipa-bg)" }}>

      {/* ── Marquee top bar ── */}
      <div className="bg-[#0D0D0D] text-[#E8D8CE] py-2.5 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="text-[10px] tracking-[0.25em] font-light mx-6">{item}</span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header
        className={`sticky top-0 z-40 transition-all duration-500 ${
          scrolled
            ? "glass border-b border-white/20 shadow-sm py-3"
            : "bg-[#FAF8F5]/98 border-b border-[#E8E2D9] py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">

          {/* Mobile hamburger */}
          <button
            data-testid="mobile-menu-toggle"
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/5 transition-colors"
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={20} strokeWidth={1.8} />
          </button>

          {/* Logo */}
          <Link
            to="/"
            data-testid="logo-link"
            className="font-serif-pipa text-[1.75rem] sm:text-[2rem] tracking-tight leading-none"
          >
            Pipa<span className="text-[#B45F45] animate-dot-pulse inline-block">.</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? "bg-[#B45F45] text-white"
                      : "text-[#1A1A1A] hover:bg-black/6"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              data-testid="search-button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
            >
              <Search size={18} strokeWidth={1.8} />
            </button>

            {user ? (
              <button
                data-testid="account-link"
                onClick={() => navigate(user.role === "admin" ? "/admin" : "/account")}
                aria-label="Account"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
              >
                <User size={18} strokeWidth={1.8} />
              </button>
            ) : (
              <Link
                to="/login"
                data-testid="login-link"
                aria-label="Login"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
              >
                <User size={18} strokeWidth={1.8} />
              </Link>
            )}

            <Link
              to="/wishlist"
              data-testid="wishlist-link"
              aria-label="Wishlist"
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
            >
              <Heart size={18} strokeWidth={1.8} />
            </Link>

            <Link
              to="/cart"
              data-testid="cart-link"
              aria-label="Cart"
              className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-black/6 transition-colors"
            >
              <ShoppingBag size={18} strokeWidth={1.8} />
              {cartCount > 0 && (
                <span
                  data-testid="cart-count"
                  className="absolute -top-0.5 -right-0.5 bg-[#B45F45] text-white text-[9px] font-semibold rounded-full w-4 h-4 flex items-center justify-center leading-none"
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
          onClick={() => setSearchOpen(false)}
        >
          <form
            className="w-full max-w-xl scale-in"
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSearch}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search earrings, bracelets, anklets…"
                className="w-full pl-12 pr-14 py-4 text-sm outline-none bg-transparent"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-white/60 text-xs text-center mt-3 tracking-wider">Press Enter to search · Esc to close</p>
          </form>
        </div>
      )}

      {/* ── Mobile full-screen menu ── */}
      <div
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          menuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-[#0D0D0D]" onClick={() => setMenuOpen(false)} />
        <div
          className={`absolute inset-y-0 left-0 w-full max-w-sm bg-[#0D0D0D] flex flex-col transition-transform duration-500 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <span className="font-serif-pipa text-2xl text-white">
              Pipa<span className="text-[#B45F45]">.</span>
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto">
            {NAV.map((n, i) => (
              <NavLink
                key={n.to}
                to={n.to}
                onClick={() => setMenuOpen(false)}
                style={{ animationDelay: `${i * 60}ms` }}
                className={({ isActive }) =>
                  `fade-up block py-3.5 px-4 rounded-xl text-lg font-serif-pipa transition-all ${
                    isActive
                      ? "bg-[#B45F45]/20 text-[#E8D8CE]"
                      : "text-white/80 hover:bg-white/8 hover:text-white"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="px-6 pb-8 border-t border-white/10 pt-6 space-y-3">
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 text-white/70 text-sm hover:text-white transition-colors"
                >
                  <User size={16} /> My Account
                </Link>
                <button
                  onClick={() => { logout(); setMenuOpen(false); }}
                  className="flex items-center gap-3 text-white/40 text-sm hover:text-white transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center bg-[#B45F45] text-white py-3 rounded-xl text-sm font-medium tracking-wide"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Page content ── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#0D0D0D] text-white/70 mt-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-16 pb-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="font-serif-pipa text-3xl text-white mb-4">
              Pipa<span className="text-[#B45F45]">.</span>
            </div>
            <p className="text-sm leading-relaxed text-white/50 mb-6">
              Handcrafted jewellery made with love in India. Every piece tells a story worth wearing.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#B45F45] hover:text-[#B45F45] transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center hover:border-[#B45F45] hover:text-[#B45F45] transition-colors"
              >
                <Sparkles size={16} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-5">Shop</h4>
            <ul className="space-y-3">
              {FOOTER_SHOP.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="text-sm text-white/60 hover:text-white transition-colors">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-5">Help</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="hover:text-white transition-colors cursor-pointer">Shipping & Returns</li>
              <li className="hover:text-white transition-colors cursor-pointer">Jewellery Care Guide</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition-colors cursor-pointer">FAQ</li>
              <li className="hover:text-white transition-colors cursor-pointer">Size Guide</li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-white/30 mb-5">Stay in the loop</h4>
            <p className="text-sm text-white/50 mb-4 leading-relaxed">
              New drops, styling tips & exclusive offers — straight to your inbox.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}>
              <input
                data-testid="newsletter-input"
                type="email"
                placeholder="your@email.com"
                className="w-full bg-white/8 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-[#B45F45] transition-colors mb-2"
              />
              <button
                data-testid="newsletter-submit"
                type="submit"
                className="w-full bg-[#B45F45] hover:bg-[#9c4d36] text-white py-2.5 rounded-xl text-xs font-semibold tracking-[0.15em] uppercase transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-5 px-5 sm:px-8">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-white/30 tracking-wider">
              © {new Date().getFullYear()} PIPA JEWELLERY · ALL RIGHTS RESERVED
            </p>
            <p className="text-[11px] text-white/20 tracking-wider">
              HANDCRAFTED IN INDIA ✦ MADE WITH LOVE
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
