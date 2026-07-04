import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Heart, Truck, Shield, Sparkles, Minus, Plus, ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import ProductReviews from "@/components/ProductReviews";

const Skeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid md:grid-cols-2 gap-12 animate-pulse">
    <div className="space-y-4">
      <div className="skeleton rounded-2xl aspect-square" />
      <div className="flex gap-3">
        {[0,1,2].map(i => <div key={i} className="skeleton w-20 h-20 rounded-xl" />)}
      </div>
    </div>
    <div className="space-y-4 pt-4">
      <div className="skeleton h-4 w-24 rounded" />
      <div className="skeleton h-12 w-3/4 rounded" />
      <div className="skeleton h-8 w-1/3 rounded" />
      <div className="skeleton h-24 w-full rounded" />
    </div>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct]     = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty]             = useState(1);
  const [adding, setAdding]       = useState(false);
  const { addToCart, toggleWishlist, inWishlist } = useCart();
  const wishlisted = product ? inWishlist(product.id) : false;

  useEffect(() => {
    setProduct(null);
    api.get(`/products/${id}`).then((r) => {
      setProduct(r.data);
      setActiveImg(0);
      setQty(1);
    });
  }, [id]);

  if (!product) return <Skeleton />;

  const images   = product.images?.length ? product.images : ["/placeholder.jpg"];
  const discount = product.compare_price && product.compare_price > product.price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;
  const isOOS = (product.stock ?? 1) <= 0;

  const handleAdd = async () => {
    if (isOOS) return;
    setAdding(true);
    await addToCart(product.id, qty);
    setTimeout(() => setAdding(false), 1200);
  };

  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div data-testid="product-detail">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-0">
        <div className="flex items-center gap-2 text-[11px] text-[#9A9A9A] uppercase tracking-[0.15em]">
          <Link to="/" className="hover:text-[#1A1A1A] transition-colors">Home</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-[#1A1A1A] transition-colors">Shop</Link>
          {product.category && (
            <>
              <span>/</span>
              <Link to={`/shop/${product.category}`} className="hover:text-[#1A1A1A] transition-colors capitalize">{product.category}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-[#1A1A1A] truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-16">

          {/* ── Image gallery ── */}
          <div className="flex flex-col gap-4">
            {/* Main image */}
            <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-square group">
              <img
                src={images[activeImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount >= 5 && (
                  <span className="bg-[#B45F45] text-white text-[10px] font-bold px-3 py-1 rounded-full">{discount}% OFF</span>
                )}
                {isOOS && (
                  <span className="bg-black/80 text-white text-[10px] font-semibold px-3 py-1 rounded-full">Sold Out</span>
                )}
              </div>

              {/* Arrow nav if multiple images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button
                    onClick={nextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                  >
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {images.map((im, i) => (
                  <button
                    key={i}
                    data-testid={`thumb-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-20 h-20 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      activeImg === i ? "border-[#B45F45] opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={im} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product info ── */}
          <div className="flex flex-col md:pt-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-[#B45F45] mb-3 font-semibold capitalize">
              {product.category}
            </p>

            <h1 className="font-serif-pipa text-3xl sm:text-5xl leading-tight mb-5">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-semibold text-[#1A1A1A]">{inr(product.price)}</span>
              {product.compare_price && product.compare_price > product.price && (
                <span className="text-lg text-[#9A9A9A] line-through">{inr(product.compare_price)}</span>
              )}
              {discount >= 5 && (
                <span className="text-sm font-semibold text-[#B45F45]">Save {discount}%</span>
              )}
            </div>
            <p className="text-[11px] text-[#9A9A9A] mb-6 tracking-wide">Inclusive of all taxes</p>

            {/* Description */}
            <div
              className="text-sm text-[#4A4A4A] leading-relaxed mb-6 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Meta */}
            <div className="bg-[#F8F5F1] rounded-2xl p-4 mb-6 space-y-2">
              {product.material && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#9A9A9A]">Material</span>
                  <span className="font-medium">{product.material}</span>
                </div>
              )}
              {product.sku && (
                <div className="flex justify-between text-sm">
                  <span className="text-[#9A9A9A]">SKU</span>
                  <span className="font-medium text-[#9A9A9A]">{product.sku}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-[#9A9A9A]">Availability</span>
                <span className={`font-semibold ${isOOS ? "text-red-500" : product.stock <= 5 ? "text-orange-500" : "text-green-600"}`}>
                  {isOOS ? "Sold Out" : product.stock <= 5 ? `Only ${product.stock} left` : "In Stock"}
                </span>
              </div>
            </div>

            {/* Qty + Add to cart */}
            <div className="flex gap-3 mb-4">
              {/* Qty stepper */}
              <div className="flex items-center bg-white border border-[#E8E2D9] rounded-xl overflow-hidden">
                <button
                  data-testid="qty-minus"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3.5 text-[#1A1A1A] hover:bg-[#F8F5F1] transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="px-4 text-sm font-semibold w-10 text-center">{qty}</span>
                <button
                  data-testid="qty-plus"
                  onClick={() => setQty((q) => Math.min(q + 1, product.stock || 99))}
                  className="px-4 py-3.5 text-[#1A1A1A] hover:bg-[#F8F5F1] transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              {/* Add to bag */}
              <button
                data-testid="add-to-cart-btn"
                disabled={isOOS || adding}
                onClick={handleAdd}
                className={`flex-1 rounded-xl text-[11px] font-bold uppercase tracking-[0.2em] py-3.5 transition-all duration-300 ${
                  isOOS
                    ? "bg-[#E8E2D9] text-[#9A9A9A] cursor-not-allowed"
                    : adding
                    ? "bg-green-500 text-white scale-95"
                    : "bg-[#0D0D0D] hover:bg-[#B45F45] text-white active:scale-95"
                }`}
              >
                {isOOS ? "Sold Out" : adding ? "✓ Added!" : "Add to Bag"}
              </button>
            </div>

            {/* Wishlist + Share row */}
            <div className="flex gap-3 mb-8">
              <button
                data-testid="wishlist-btn"
                onClick={() => toggleWishlist(product.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                  wishlisted
                    ? "border-[#B45F45] bg-[#B45F45]/10 text-[#B45F45]"
                    : "border-[#E8E2D9] hover:border-[#B45F45] text-[#6B6B6B] hover:text-[#B45F45]"
                }`}
              >
                <Heart
                  size={16}
                  strokeWidth={1.8}
                  fill={wishlisted ? "#B45F45" : "none"}
                  color={wishlisted ? "#B45F45" : "currentColor"}
                />
                {wishlisted ? "Saved" : "Save"}
              </button>
              <button
                onClick={() => navigator.share?.({ title: product.name, url: window.location.href }).catch(() => {})}
                className="px-4 py-3 rounded-xl border border-[#E8E2D9] text-[#6B6B6B] hover:border-[#0D0D0D] hover:text-[#0D0D0D] transition-colors"
              >
                <Share2 size={16} strokeWidth={1.8} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Truck,     title: "Free Delivery",  sub: "Orders above ₹999" },
                { icon: Shield,    title: "Easy Returns",   sub: "Within 7 days" },
                { icon: Sparkles,  title: "Handcrafted",    sub: "Made in India" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="bg-[#F8F5F1] rounded-2xl p-3 text-center">
                  <Icon className="mx-auto mb-1.5 text-[#B45F45]" size={18} strokeWidth={1.5} />
                  <p className="text-[11px] font-semibold text-[#1A1A1A]">{title}</p>
                  <p className="text-[10px] text-[#9A9A9A] mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16 border-t border-[#E8E2D9] pt-12">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </div>
  );
}
