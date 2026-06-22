import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Minus, Plus } from "lucide-react";

const Cart = () => {
  const { cart, updateQty, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  return (
    <div data-testid="cart-page" className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="font-serif-pipa text-5xl mb-10">Your Bag</h1>
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-serif-pipa text-2xl mb-6">Your bag is empty</p>
          <Link to="/shop" className="inline-block bg-[#1A1A1A] text-white px-8 py-3 text-xs uppercase tracking-widest hover:bg-[#B45F45]">Shop Now</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 space-y-6">
            {cart.map((it) => (
              <div key={it.product.id} data-testid={`cart-item-${it.product.id}`} className="flex gap-4 border-b border-[#E5E0D8] pb-6">
                <Link to={`/product/${it.product.id}`} className="w-28 h-32 bg-white overflow-hidden flex-shrink-0">
                  <img src={it.product.images?.[0]} alt={it.product.name} className="w-full h-full object-cover" />
                </Link>
                <div className="flex-1">
                  <Link to={`/product/${it.product.id}`}>
                    <h3 className="font-serif-pipa text-xl hover:text-[#B45F45]">{it.product.name}</h3>
                  </Link>
                  <p className="text-xs text-[#4A4A4A] mt-1 uppercase tracking-wide">{it.product.category}</p>
                  <p className="text-sm mt-2">{inr(it.product.price)}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center border border-[#E5E0D8]">
                      <button data-testid={`dec-${it.product.id}`} onClick={() => updateQty(it.product.id, Math.max(1, it.quantity - 1))} className="px-2 py-1"><Minus size={14}/></button>
                      <div className="px-3 text-sm">{it.quantity}</div>
                      <button data-testid={`inc-${it.product.id}`} onClick={() => updateQty(it.product.id, it.quantity + 1)} className="px-2 py-1"><Plus size={14}/></button>
                    </div>
                    <button data-testid={`remove-${it.product.id}`} onClick={() => removeItem(it.product.id)} className="text-[#4A4A4A] hover:text-[#B45F45]"><Trash2 size={16} strokeWidth={1.5} /></button>
                  </div>
                </div>
                <div className="text-sm">{inr(it.product.price * it.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border border-[#E5E0D8] bg-white p-6 h-fit sticky top-32">
            <h3 className="font-serif-pipa text-2xl mb-5">Summary</h3>
            <div className="flex justify-between text-sm py-2"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            <div className="flex justify-between text-sm py-2"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
            <div className="flex justify-between font-serif-pipa text-xl border-t border-[#E5E0D8] pt-3 mt-3"><span>Total</span><span>{inr(total)}</span></div>
            <button
              data-testid="checkout-btn"
              onClick={() => user ? navigate("/checkout") : navigate("/login")}
              className="mt-5 w-full bg-[#1A1A1A] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#B45F45]"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
