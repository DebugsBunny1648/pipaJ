import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, Droplets, ShieldCheck } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ShopTheLook from "@/components/ShopTheLook";

const FALLBACK_BANNERS = [
  {
    id: "fallback-1",
    title: "The Heirloom Edit",
    subtitle: "Handcrafted · Heirloom",
    image: "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&w=1600",
    link: "/shop",
  },
];

const INTERVAL = 5500;

const USP_MARQUEE = [
  "✦ ANTI TARNISH", "✦ WATERPROOF", "✦ GOLD PLATED", "✦ HYPOALLERGENIC",
  "✦ HANDCRAFTED IN INDIA", "✦ FREE SHIPPING", "✦ ANTI TARNISH", "✦ WATERPROOF",
  "✦ GOLD PLATED", "✦ HYPOALLERGENIC", "✦ HANDCRAFTED IN INDIA", "✦ FREE SHIPPING",
];

const TRUST = [
  { icon: Droplets,   label: "Waterproof",    sub: "Safe for daily wear" },
  { icon: Sparkles,   label: "Anti-Tarnish",  sub: "Lasts for years" },
  { icon: ShieldCheck, label: "Hypoallergenic", sub: "Gentle on skin" },
];

export default function Home() {
  const [featured, setFeatured]     = useState([]);
  const [bestsellers, setBest]      = useState([]);
  const [cats, setCats]             = useState([]);
  const [banners, setBanners]       = useState(FALLBACK_BANNERS);
  const [current, setCurrent]       = useState(0);
  const [animating, setAnimating]   = useState(false);
  const paused  = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then((r)  => setFeatured(r.data));
    api.get("/products?bestseller=true&limit=8").then((r) => setBest(r.data));
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/banners").then((r) => {
      const active = (r.data || []).filter((b) => b.active);
      if (active.length) setBanners(active);
    });
  }, []);

  const goTo = useCallback((idx) => {
    setAnimating(true);
    setTimeout(() => { setCurrent(idx); setAnimating(false); }, 160);
  }, []);

  const next = useCallback(() => goTo((current + 1) % banners.length), [current, banners.length, goTo]);
  const prev = useCallback(() => goTo((current - 1 + banners.length) % banners.length), [current, banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    timerRef.current = setInterval(() => { if (!paused.current) next(); }, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [banners.length, next]);

  const b = banners[current] || banners[0];

  return (
    <div data-testid="home-page">

      {/* ═══ HERO CAROUSEL ═══ */}
      <section
        className="relative h-[90vh] min-h-[620px] overflow-hidden"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {/* Slide stack */}
        {banners.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              style={{ transition: "transform 9s linear" }}
              className={`absolute inset-0 w-full h-full object-cover ${
                i === current ? "scale-110" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          </div>
        ))}

        {/* Text */}
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center" style={{ zIndex: 2 }}>
          <div
            key={current}
            className={`text-white max-w-2xl transition-all duration-500 ${
              animating ? "opacity-0 translate-y-5" : "opacity-100 translate-y-0"
            }`}
          >
            <p className="uppercase tracking-[0.4em] text-[10px] sm:text-xs mb-5 text-white/70 font-light">
              {b.subtitle || "Handcrafted · Heirloom"}
            </p>
            <h1 className="font-serif-pipa text-[3.5rem] sm:text-[5.5rem] leading-[0.95] tracking-tight mb-8">
              {b.title || "The Heirloom Edit"}
            </h1>
            <Link
              to={b.link || "/shop"}
              data-testid="hero-cta"
              className="group inline-flex items-center gap-3 bg-white text-[#0D0D0D] hover:bg-[#B45F45] hover:text-white px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.25em] transition-all duration-300 rounded-full"
            >
              Shop The Edit
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full glass-dark border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === current ? "w-8 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* Counter */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 z-10 text-white/40 text-[10px] tracking-[0.3em] font-light">
            {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </div>
        )}
      </section>

      {/* ═══ USP MARQUEE STRIP ═══ */}
      <div className="bg-[#B45F45] text-white py-3 overflow-hidden">
        <div className="animate-marquee">
          {USP_MARQUEE.map((item, i) => (
            <span key={i} className="text-[10px] font-semibold tracking-[0.3em] mx-8">{item}</span>
          ))}
        </div>
      </div>

      {/* ═══ CATEGORIES ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#B45F45] mb-3 font-semibold">Collections</p>
            <h2 className="font-serif-pipa text-4xl sm:text-6xl leading-tight">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] pipa-link font-medium">
            View All <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {cats.slice(0, 6).map((c, i) => (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              data-testid={`category-tile-${c.slug}`}
              className={`relative block overflow-hidden rounded-2xl group ${
                i === 0 ? "md:row-span-2 aspect-[4/5] md:aspect-auto" : "aspect-[4/5]"
              }`}
            >
              <img
                src={c.image}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                style={{ transition: "transform 0.8s cubic-bezier(0.22,1,0.36,1)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute inset-0 bg-[#B45F45]/0 group-hover:bg-[#B45F45]/15 transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <h3 className="font-serif-pipa text-2xl sm:text-3xl text-white leading-tight">{c.name}</h3>
                <p className="text-[10px] tracking-[0.25em] uppercase mt-1.5 text-white/70 group-hover:text-white transition-colors flex items-center gap-1.5">
                  Explore <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ BESTSELLERS ═══ */}
      {bestsellers.length > 0 && (
        <section className="bg-[#F3EFE9] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-[#B45F45] mb-3 font-semibold">Loved By Many</p>
                <h2 className="font-serif-pipa text-4xl sm:text-6xl leading-tight">Bestsellers</h2>
              </div>
              <Link to="/shop?sort=bestseller" className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] pipa-link font-medium">
                See All <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
              {bestsellers.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ TRUST BADGES ═══ */}
      <section className="border-y border-[#E8E2D9]">
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E2D9]">
          {TRUST.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-5 py-6 sm:py-0 sm:px-12 first:sm:pl-0 last:sm:pr-0">
              <div className="w-11 h-11 rounded-2xl bg-[#B45F45]/10 flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-[#B45F45]" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{label}</p>
                <p className="text-xs text-[#9A9A9A] mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ EDITORIAL DARK SECTION ═══ */}
      <section className="bg-[#0D0D0D] py-28 px-4 sm:px-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-[#B45F45] mb-6 font-semibold">Our Philosophy</p>
        <blockquote className="font-serif-pipa text-4xl sm:text-6xl md:text-7xl text-white leading-tight max-w-4xl mx-auto italic">
          "Every piece carries the imprint of the hands that made it."
        </blockquote>
        <p className="mt-8 max-w-xl mx-auto text-white/50 text-sm leading-relaxed">
          Pipa Jewellery is a celebration of slow craft. We work with karigars across India to create pieces that are timeless, refined, and rooted in tradition.
        </p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 mt-10 border border-white/25 text-white hover:bg-white hover:text-[#0D0D0D] px-8 py-3.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300"
        >
          Discover The Collection <ArrowRight size={13} />
        </Link>
      </section>

      {/* ═══ SHOP THE LOOK ═══ */}
      <ShopTheLook />

      {/* ═══ FEATURED PIECES ═══ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#B45F45] mb-3 font-semibold">Curated for You</p>
              <h2 className="font-serif-pipa text-4xl sm:text-6xl leading-tight">Featured Pieces</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] pipa-link font-medium">
              Shop All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ═══ BOTTOM CTA STRIP ═══ */}
      <section className="bg-[#B45F45] py-14 text-center text-white">
        <p className="font-serif-pipa text-3xl sm:text-5xl italic mb-4">New to Pipa?</p>
        <p className="text-white/80 text-sm mb-7">Use <span className="font-semibold bg-white/20 px-2 py-0.5 rounded-md">WELCOME10</span> for 10% off your first order.</p>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 bg-white text-[#B45F45] hover:bg-[#0D0D0D] hover:text-white px-8 py-3.5 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-300"
        >
          Start Shopping <ArrowRight size={13} />
        </Link>
      </section>
    </div>
  );
}
