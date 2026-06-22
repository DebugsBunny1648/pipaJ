import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api, inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { Heart, Truck, Shield, Sparkles, Minus, Plus } from "lucide-react";
import ProductReviews from "@/components/ProductReviews";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart, toggleWishlist, inWishlist } = useCart();

  useEffect(() => {
    api.get(`/products/${id}`).then((r) => { setProduct(r.data); setActiveImg(0); setQty(1); });
  }, [id]);

  if (!product) return <div className="p-20 text-center font-serif-pipa text-2xl">Loading…</div>;

  return (
    <div data-testid="product-detail" className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
      <Link to="/shop" className="text-xs uppercase tracking-widest text-[#4A4A4A] hover:text-[#B45F45]">← Back to Shop</Link>

      <div className="grid md:grid-cols-2 gap-10 mt-6">
        <div>
          <div className="bg-white aspect-square overflow-hidden">
            <img src={product.images?.[activeImg]} alt={product.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-3 mt-3">
            {(product.images || []).map((im, i) => (
              <button
                key={i}
                data-testid={`thumb-${i}`}
                onClick={() => setActiveImg(i)}
                className={`w-20 h-20 overflow-hidden border ${activeImg === i ? "border-[#B45F45]" : "border-[#E5E0D8]"}`}
              >
                <img src={im} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#B45F45] mb-3">{product.category}</p>
          <h1 className="font-serif-pipa text-4xl sm:text-5xl leading-tight">{product.name}</h1>
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl">{inr(product.price)}</span>
            {product.compare_price && (
              <span className="text-base text-[#4A4A4A] line-through">{inr(product.compare_price)}</span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#4A4A4A]">Inclusive of all taxes</p>

          <div className="mt-6 text-[#4A4A4A] leading-relaxed">{product.description}</div>

          <div className="mt-6 text-sm space-y-1 text-[#4A4A4A]">
            <div><span className="text-[#1A1A1A]">Material:</span> {product.material}</div>
            <div><span className="text-[#1A1A1A]">SKU:</span> {product.sku}</div>
            <div><span className="text-[#1A1A1A]">Availability:</span> {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center border border-[#E5E0D8]">
              <button data-testid="qty-minus" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-3"><Minus size={14} /></button>
              <div className="px-4 text-sm">{qty}</div>
              <button data-testid="qty-plus" onClick={() => setQty(qty + 1)} className="px-3 py-3"><Plus size={14} /></button>
            </div>
            <button
              data-testid="add-to-cart-btn"
              disabled={product.stock <= 0}
              onClick={() => addToCart(product.id, qty)}
              className="flex-1 bg-[#1A1A1A] text-white tracking-widest text-xs uppercase py-4 hover:bg-[#B45F45] disabled:opacity-50 transition-colors"
            >
              {product.stock > 0 ? "Add to Bag" : "Sold Out"}
            </button>
            <button
              data-testid="wishlist-btn"
              onClick={() => toggleWishlist(product.id)}
              aria-label="Wishlist"
              className="border border-[#E5E0D8] p-4 hover:border-[#B45F45]"
            >
              <Heart size={18} strokeWidth={1.5} fill={inWishlist(product.id) ? "#B45F45" : "none"} color={inWishlist(product.id) ? "#B45F45" : "#1A1A1A"} />
            </button>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center border-t border-[#E5E0D8] pt-6">
            <div className="text-xs"><Truck className="mx-auto mb-2" size={20} strokeWidth={1.5}/>Free shipping over ₹999</div>
            <div className="text-xs"><Shield className="mx-auto mb-2" size={20} strokeWidth={1.5}/>Easy 7-day returns</div>
            <div className="text-xs"><Sparkles className="mx-auto mb-2" size={20} strokeWidth={1.5}/>Handcrafted in India</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
