import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart([]);
      setWishlist([]);
      return;
    }
    try {
      const [c, w] = await Promise.all([api.get("/cart"), api.get("/wishlist")]);
      setCart(c.data.items || []);
      setWishlist(w.data.items || []);
    } catch (e) {
      // silent
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addToCart = async (productId, quantity = 1) => {
    if (!user) { toast.error("Please sign in to add to cart"); return false; }
    await api.post("/cart/add", { product_id: productId, quantity });
    toast.success("Added to cart");
    refresh();
    return true;
  };

  const updateQty = async (productId, quantity) => {
    await api.post("/cart/update", { product_id: productId, quantity });
    refresh();
  };

  const removeItem = async (productId) => {
    await api.post("/cart/update", { product_id: productId, quantity: 0 });
    refresh();
  };

  const clearCart = async () => {
    await api.post("/cart/clear");
    refresh();
  };

  const toggleWishlist = async (productId) => {
    if (!user) { toast.error("Please sign in to use wishlist"); return; }
    const { data } = await api.post("/wishlist/toggle", { product_id: productId });
    toast.success(data.in_wishlist ? "Added to wishlist" : "Removed from wishlist");
    refresh();
  };

  const inWishlist = (id) => wishlist.some((p) => p.id === id);
  const cartCount = cart.reduce((s, it) => s + it.quantity, 0);
  const subtotal = cart.reduce((s, it) => s + it.product.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, wishlist, cartCount, subtotal, addToCart, updateQty, removeItem, clearCart, toggleWishlist, inWishlist, refresh }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
