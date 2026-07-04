import { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { SlidersHorizontal, X, Search, ArrowRight, LayoutGrid, LayoutList } from "lucide-react";
import { api } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

const PRICE_FILTERS = [
  { label: "All Prices", value: "" },
  { label: "Under ₹200",  value: "200" },
  { label: "Under ₹500",  value: "500" },
  { label: "Under ₹1,000", value: "1000" },
  { label: "Under ₹2,000", value: "2000" },
];

const SORT_OPTIONS = [
  { label: "Newest",      value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Name A–Z",    value: "name" },
];

const CAT_LINKS = [
  { label: "All",       slug: "" },
  { label: "Earrings",  slug: "earrings" },
  { label: "Necklaces", slug: "necklaces" },
  { label: "Bracelets", slug: "bracelets" },
  { label: "Anklets",   slug: "anklets" },
  { label: "Bangles",   slug: "bangles" },
  { label: "Rings",     slug: "rings" },
  { label: "Bridal",    slug: "bridal" },
  { label: "Accessories", slug: "accessories" },
];

const SkeletonCard = () => (
  <div className="flex flex-col gap-3">
    <div className="skeleton rounded-2xl aspect-[3/4]" />
    <div className="skeleton h-4 rounded-lg w-3/4" />
    <div className="skeleton h-3 rounded-lg w-1/2" />
  </div>
);

export default function Shop() {
  const { category }  = useParams();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [sort, setSort]         = useState(searchParams.get("sort") || "newest");
  const [search, setSearch]     = useState(searchParams.get("q") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") || "");
  const [cols, setCols]         = useState(4);
  const [showFilters, setShowFilters] = useState(false);

  const fetch = useCallback(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (category) q.set("category", category);
    if (sort)     q.set("sort", sort);
    if (search)   q.set("search", search);
    if (maxPrice) q.set("max_price", maxPrice);
    q.set("limit", "100");
    api.get(`/products?${q.toString()}`).then((r) => {
      setProducts(r.data);
      setLoading(false);
    });
  }, [category, sort, search, maxPrice]);

  useEffect(() => { fetch(); }, [fetch]);

  const title = category
    ? category.charAt(0).toUpperCase() + category.slice(1)
    : "Shop All";

  const clearFilters = () => {
    setSearch(""); setSearchInput(""); setMaxPrice(""); setSort("newest");
  };

  const hasFilters = search || maxPrice || sort !== "newest";

  return (
    <div data-testid="shop-page" className="min-h-screen">
      {/* ── Page header ── */}
      <div className="bg-[#0D0D0D] text-white py-14 sm:py-20 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#B45F45] mb-3 font-semibold">
            {category ? "Category" : "Collection"}
          </p>
          <h1 className="font-serif-pipa text-5xl sm:text-7xl italic leading-none">{title}</h1>
          {!loading && (
            <p className="mt-4 text-white/40 text-sm">{products.length} piece{products.length !== 1 ? "s" : ""}</p>
          )}
        </div>
      </div>

      {/* ── Category pills ── */}
      <div className="border-b border-[#E8E2D9] bg-[#FAF8F5] sticky top-[61px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
            {CAT_LINKS.map(({ label, slug }) => {
              const active = (category || "") === slug;
              return (
                <Link
                  key={slug}
                  to={slug ? `/shop/${slug}` : "/shop"}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-200 ${
                    active
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-white border border-[#E8E2D9] text-[#6B6B6B] hover:border-[#0D0D0D] hover:text-[#0D0D0D]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9A9A9A]" size={14} />
            <input
              data-testid="shop-search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") setSearch(searchInput); }}
              placeholder="Search pieces…"
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E2D9] rounded-xl text-sm outline-none focus:border-[#B45F45] transition-colors"
            />
          </div>

          {/* Price filter */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {PRICE_FILTERS.map((f) => (
              <button
                key={f.value}
                data-testid={f.value ? `shop-max-price` : undefined}
                onClick={() => setMaxPrice(f.value)}
                className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all duration-200 ${
                  maxPrice === f.value
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-white border border-[#E8E2D9] text-[#6B6B6B] hover:border-[#0D0D0D]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            data-testid="shop-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="ml-auto bg-white border border-[#E8E2D9] rounded-xl px-3.5 py-2.5 text-[11px] font-medium outline-none focus:border-[#B45F45] transition-colors cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {/* Grid toggle */}
          <div className="hidden sm:flex bg-white border border-[#E8E2D9] rounded-xl overflow-hidden">
            {[4, 3, 2].map((n) => (
              <button
                key={n}
                onClick={() => setCols(n)}
                className={`px-3 py-2.5 transition-colors ${cols === n ? "bg-[#0D0D0D] text-white" : "text-[#9A9A9A] hover:text-[#1A1A1A]"}`}
              >
                {n === 4 ? <LayoutGrid size={14} /> : n === 3 ? <LayoutList size={14} /> : <LayoutList size={14} />}
              </button>
            ))}
          </div>

          {/* Clear */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[11px] text-[#B45F45] font-medium hover:text-[#9c4d36] transition-colors"
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        {/* ── Product grid ── */}
        {loading ? (
          <div className={`grid gap-x-4 gap-y-10 grid-cols-2 ${cols >= 4 ? "md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-32">
            <p className="font-serif-pipa text-5xl italic text-[#D0C9BF] mb-4">No pieces found</p>
            <p className="text-[#9A9A9A] text-sm mb-8">Try adjusting your filters or explore all products.</p>
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 bg-[#0D0D0D] text-white px-6 py-3 rounded-full text-[11px] font-semibold uppercase tracking-[0.2em] hover:bg-[#B45F45] transition-colors"
            >
              Clear Filters <ArrowRight size={13} />
            </button>
          </div>
        ) : (
          <div className={`grid gap-x-4 gap-y-10 grid-cols-2 ${cols >= 4 ? "md:grid-cols-4" : cols === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
