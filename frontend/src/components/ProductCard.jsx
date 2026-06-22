import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }) => {
  const { toggleWishlist, inWishlist, addToCart } = useCart();
  const discount = product.compare_price ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100) : 0;

  return (
    <div data-testid={`product-card-${product.id}`} className="product-card group relative">
      <Link to={`/product/${product.id}`} className="block overflow-hidden bg-white aspect-[3/4]">
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className="product-card-img w-full h-full object-cover"
        />
      </Link>
      <button
        data-testid={`wishlist-toggle-${product.id}`}
        onClick={() => toggleWishlist(product.id)}
        aria-label="Wishlist"
        className="absolute top-3 right-3 bg-white/90 hover:bg-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
      >
        <Heart size={16} strokeWidth={1.5} fill={inWishlist(product.id) ? "#B45F45" : "none"} color={inWishlist(product.id) ? "#B45F45" : "#1A1A1A"} />
      </button>
      {discount > 0 && (
        <div className="absolute top-3 left-3 bg-[#1A1A1A] text-white text-[10px] tracking-wider px-2 py-1">-{discount}%</div>
      )}
      <div className="pt-4 pb-2 px-1">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif-pipa text-lg leading-tight mb-1 hover:text-[#B45F45] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{inr(product.price)}</span>
          {product.compare_price && (
            <span className="text-xs text-[#4A4A4A] line-through">{inr(product.compare_price)}</span>
          )}
        </div>
        <button
          data-testid={`add-to-cart-${product.id}`}
          onClick={() => addToCart(product.id)}
          className="mt-3 w-full border border-[#1A1A1A] text-xs uppercase tracking-widest py-2 hover:bg-[#1A1A1A] hover:text-white transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
