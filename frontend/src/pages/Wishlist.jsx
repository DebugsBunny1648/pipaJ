import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import { Link } from "react-router-dom";

const Wishlist = () => {
  const { wishlist } = useCart();
  return (
    <div data-testid="wishlist-page" className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="font-serif-pipa text-5xl mb-10">Your Wishlist</h1>
      {wishlist.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif-pipa text-2xl mb-6">Nothing saved yet</p>
          <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#B45F45]">Discover Pieces</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12">
          {wishlist.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
