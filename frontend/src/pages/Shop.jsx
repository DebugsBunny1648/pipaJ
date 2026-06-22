import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const Shop = () => {
  const { category } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (sort) q.set("sort", sort);
    if (search) q.set("search", search);
    if (maxPrice) q.set("max_price", maxPrice);
    api.get(`/products?${q.toString()}`).then((r) => { setProducts(r.data); setLoading(false); });
  }, [category, sort, search, maxPrice]);

  const title = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Shop All";

  return (
    <div data-testid="shop-page" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">Collection</p>
        <h1 className="font-serif-pipa text-5xl sm:text-6xl">{title}</h1>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between border-b border-[#E5E0D8] pb-5 mb-8">
        <input
          data-testid="shop-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="bg-white border border-[#E5E0D8] px-3 py-2 text-sm outline-none focus:border-[#B45F45] w-full sm:w-64"
        />
        <div className="flex gap-3 items-center">
          <select
            data-testid="shop-max-price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="bg-white border border-[#E5E0D8] px-3 py-2 text-sm outline-none"
          >
            <option value="">All Prices</option>
            <option value="1000">Under ₹1,000</option>
            <option value="2000">Under ₹2,000</option>
            <option value="5000">Under ₹5,000</option>
          </select>
          <select
            data-testid="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white border border-[#E5E0D8] px-3 py-2 text-sm outline-none"
          >
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-[#4A4A4A]">Loading…</div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-[#4A4A4A] font-serif-pipa text-2xl">No products found</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
          {products.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Shop;
