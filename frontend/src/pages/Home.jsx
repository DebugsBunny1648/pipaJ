import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";
import ShopTheLook from "@/components/ShopTheLook";

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestsellers, setBestsellers] = useState([]);
  const [cats, setCats] = useState([]);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    api.get("/products?featured=true&limit=8").then((r) => setFeatured(r.data));
    api.get("/products?bestseller=true&limit=8").then((r) => setBestsellers(r.data));
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/banners").then((r) => setBanner((r.data || []).find((b) => b.active)));
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[600px] overflow-hidden">
        <img
          src={banner?.image || "https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600"}
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 flex items-center">
          <div className="text-[#FAF8F5] max-w-xl fade-up">
            <p className="uppercase tracking-[0.3em] text-xs mb-5">{banner?.subtitle || "Handcrafted • Heirloom"}</p>
            <h1 className="font-serif-pipa text-5xl sm:text-7xl leading-[1.05] tracking-tight">
              {banner?.title || "The Heirloom Edit"}
            </h1>
            <p className="mt-6 max-w-md text-[#E8D8CE] leading-relaxed">
              Pieces designed to be passed down. Discover Pipa's latest collection of artisanal jewellery, made by hand in small batches.
            </p>
            <Link
              to="/shop"
              data-testid="hero-cta"
              className="inline-block mt-10 bg-[#FAF8F5] text-[#1A1A1A] px-10 py-4 text-xs uppercase tracking-[0.25em] hover:bg-[#B45F45] hover:text-white transition-colors"
            >
              Shop The Edit
            </Link>
          </div>
        </div>
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
