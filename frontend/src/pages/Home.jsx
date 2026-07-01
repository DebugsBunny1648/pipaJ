import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ShopTheLook from "@/components/ShopTheLook";

const FALLBACK_BANNERS = [
  {
    id: "fallback-1",
    title: "The Heirloom Edit",
    subtitle: "Handcrafted • Heirloom",
    image: "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&w=1600",
    link: "/shop",
  },
];

const INTERVAL = 5000;

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [cats, setCats] = useState([]);
  const [banners, setBanners] = useState(FALLBACK_BANNERS);
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);
  const paused = useRef(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then((r) => setFeatured(r.data));
    api.get("/products?bestseller=true&limit=8").then((r) => setBestsellers(r.data));
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/banners").then((r) => {
      const active = (r.data || []).filter((b) => b.active);
      if (active.length) setBanners(active);
    });
  }, []);

  const goTo = useCallback((idx) => {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(idx);
      setAnimating(false);
    }, 150);
  }, []);

  const next = useCallback(() => {
    goTo((current + 1) % banners.length);
  }, [current, banners.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + banners.length) % banners.length);
  }, [current, banners.length, goTo]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const tick = () => {
      if (!paused.current) next();
    };
    timerRef.current = setInterval(tick, INTERVAL);
    return () => clearInterval(timerRef.current);
  }, [banners.length, next]);

  const b = banners[current] || banners[0];

  return (
    <div data-testid="home-page">
      {/* Hero Carousel */}
      <section
        className="relative h-[88vh] min-h-[600px] overflow-hidden"
        onMouseEnter={() => { paused.current = true; }}
        onMouseLeave={() => { paused.current = false; }}
      >
        {/* Slides — crossfade stack */}
        {banners.map((slide, i) => (
          <div
            key={slide.id}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[8000ms] ease-linear ${
                i === current ? "scale-110" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 bg-black/35" />
          </div>
        ))}

        {/* Text content */}
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center" style={{ zIndex: 2 }}>
          <div
            key={current}
            className={`text-[#FAF8F5] max-w-xl transition-all duration-500 ${
              animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            }`}
          >
            <p className="uppercase tracking-[0.3em] text-xs mb-5">{b.subtitle || "Handcrafted • Heirloom"}</p>
            <h1 className="font-serif-pipa text-5xl sm:text-7xl leading-[1.05] tracking-tight">
              {b.title || "The Heirloom Edit"}
            </h1>
            <p className="mt-6 max-w-md text-[#E8D8CE] leading-relaxed">
              Pieces designed to be passed down. Discover Pipa's latest collection of artisanal jewellery, made by hand in small batches.
            </p>
            <Link
              to={b.link || "/shop"}
              data-testid="hero-cta"
              className="inline-block mt-10 bg-[#FAF8F5] text-[#1A1A1A] px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-[#B45F45] hover:text-white transition-colors"
            >
              Shop The Edit
            </Link>
          </div>
        </div>

        {/* Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous banner"
              className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Next banner"
              className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/35 backdrop-blur-sm flex items-center justify-center text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Dot indicators + progress bar */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  i === current
                    ? "w-8 h-2 bg-white"
                    : "w-2 h-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {banners.length > 1 && (
          <div className="absolute bottom-8 right-8 z-10 text-white/60 text-xs tracking-widest font-light">
            {String(current + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">Collections</p>
            <h2 className="font-serif-pipa text-4xl sm:text-5xl">Shop by Category</h2>
          </div>
          <Link to="/shop" className="hidden sm:block text-sm pipa-link">View All</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cats.slice(0, 6).map((c, i) => (
            <Link
              key={c.id}
              to={`/shop/${c.slug}`}
              data-testid={`category-tile-${c.slug}`}
              className={`relative block overflow-hidden group ${i % 3 === 0 ? "md:row-span-2 aspect-[3/4] md:aspect-[3/5]" : "aspect-[4/5]"}`}
            >
              <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-serif-pipa text-2xl sm:text-3xl">{c.name}</h3>
                <p className="text-xs tracking-widest uppercase mt-1 opacity-90">Shop now →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      {bestsellers.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">Loved By Many</p>
              <h2 className="font-serif-pipa text-4xl sm:text-5xl">Bestsellers</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {bestsellers.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* Editorial */}
      <section className="bg-[#F3EFE9] my-20 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-4">Our Story</p>
          <h2 className="font-serif-pipa text-4xl sm:text-5xl mb-6 leading-tight">
            "Every piece carries the imprint of the hands that made it."
          </h2>
          <p className="text-[#4A4A4A] max-w-2xl mx-auto leading-relaxed">
            Pipa Jewellery is a celebration of slow craft. We partner with karigars across India to bring you pieces that are timeless, refined, and rooted in tradition.
          </p>
        </div>
      </section>

      <ShopTheLook />

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 pb-20">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-serif-pipa text-4xl sm:text-5xl">Featured Pieces</h2>
            <Link to="/shop" className="hidden sm:block text-sm pipa-link">Shop All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
            {featured.slice(0, 8).map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
