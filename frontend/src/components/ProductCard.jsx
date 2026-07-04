import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { inr } from "@/lib/api";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }) => {
  const { toggleWishlist, inWishlist, addToCart } = useCart();
  const wishlisted = inWishlist(product.id);
  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;
  const hasSecondImage = (product.images?.length || 0) > 1;
  const isOOS = (product.stock ?? 1) <= 0;

  return (
    <div
      data-testid={`product-card-${product.id}`}
      className="product-card group relative flex flex-col"
    >
      {/* Image container */}
      <div className="relative overflow-hidden rounded-2xl bg-stone-100 aspect-[3/4]">
        {/* Primary image */}
        <img
          src={product.images?.[0]}
          alt={product.name}
          loading="lazy"
          className={`product-img-primary absolute inset-0 w-full h-full object-cover ${
            !hasSecondImage ? "transition-transform duration-700 group-hover:scale-105" : ""
          }`}
        />

        {/* Secondary image (swap on hover) */}
        {hasSecondImage && (
          <img
            src={product.images[1]}
            alt={product.name}
            loading="lazy"
            className="product-img-secondary absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Out of stock overlay */}
        {isOOS && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white/90 text-[#1A1A1A] text-[10px] font-semibold uppercase tracking-[0.2em] px-3 py-1.5 rounded-full">
              Sold Out
            </span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount >= 5 && (
            <span className="bg-[#B45F45] text-white text-[10px] font-semibold px-2.5 py-1 rounded-full tracking-wide">
              -{discount}%
            </span>
          )}
          {product.bestseller && (
            <span className="bg-[#0D0D0D] text-white text-[10px] font-medium px-2.5 py-1 rounded-full tracking-wide">
              Bestseller
            </span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          data-testid={`wishlist-toggle-${product.id}`}
          onClick={() => toggleWishlist(product.id)}
          aria-label="Wishlist"
          className={`absolute top-3 right-3 w-9 h-9 rounded-full glass flex items-center justify-center shadow-sm transition-all duration-200 hover:scale-110 ${
            wishlisted ? "bg-[#B45F45]/90" : "bg-white/80 hover:bg-white"
          }`}
        >
          <Heart
            size={15}
            strokeWidth={1.8}
            fill={wishlisted ? "white" : "none"}
            color={wishlisted ? "white" : "#1A1A1A"}
          />
        </button>

        {/* Quick-add bar */}
        {!isOOS && (
          <div className="quick-add-bar absolute bottom-0 left-0 right-0">
            <button
              data-testid={`add-to-cart-${product.id}`}
              onClick={() => addToCart(product.id)}
              className="w-full bg-[#0D0D0D]/90 hover:bg-[#B45F45] backdrop-blur-sm text-white text-[10px] font-semibold uppercase tracking-[0.2em] py-3 flex items-center justify-center gap-2 transition-colors duration-200"
            >
              <ShoppingBag size={13} /> Quick Add
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-3 pb-1 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-serif-pipa text-base sm:text-lg leading-tight mb-1 hover:text-[#B45F45] transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-auto">
          <span className="text-sm font-semibold text-[#1A1A1A]">{inr(product.price)}</span>
          {product.compare_price && product.compare_price > product.price && (
            <span className="text-xs text-[#9A9A9A] line-through">{inr(product.compare_price)}</span>
          )}
        </div>

        {/* Stock dots */}
        {!isOOS && product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] text-[#B45F45] mt-1 font-medium">Only {product.stock} left</p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
