import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";

const Checkout = () => {
  const { cart, subtotal, refresh } = useCart();
  const navigate = useNavigate();
  const [addr, setAddr] = useState({ full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" });
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCode, setAppliedCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [selectedAddrId, setSelectedAddrId] = useState("");

  useEffect(() => {
    api.get("/addresses").then((r) => {
      setSavedAddrs(r.data);
      const def = r.data.find((a) => a.is_default) || r.data[0];
      if (def) {
        setSelectedAddrId(def.id);
        setAddr({ full_name: def.full_name, phone: def.phone, line1: def.line1, line2: def.line2 || "", city: def.city, state: def.state, pincode: def.pincode });
      }
    }).catch(() => {});
  }, []);

  const pickAddr = (id) => {
    setSelectedAddrId(id);
    const a = savedAddrs.find((x) => x.id === id);
    if (a) setAddr({ full_name: a.full_name, phone: a.phone, line1: a.line1, line2: a.line2 || "", city: a.city, state: a.state, pincode: a.pincode });
  };

  const shipping = subtotal >= 999 ? 0 : 79;
  const total = subtotal - discount + shipping;

  const validate = () => {
    if (!addr.full_name || addr.full_name.length < 2) return "Enter full name";
    if (!/^\d{7,15}$/.test(addr.phone)) return "Invalid phone number";
    if (!addr.line1) return "Address line required";
    if (!addr.city) return "City required";
    if (!addr.state) return "State required";
    if (!/^\d{4,10}$/.test(addr.pincode)) return "Invalid pincode";
    if (cart.length === 0) return "Cart is empty";
    return null;
  };

  const applyCoupon = async () => {
    try {
      const { data } = await api.post("/coupons/validate", { code: coupon, subtotal });
      setDiscount(data.discount_amount);
      setAppliedCode(data.code);
      toast.success(`${data.code} applied — ${data.discount_percent}% off`);
    } catch (e) {
      toast.error(e.response?.data?.detail || "Invalid coupon");
      setDiscount(0); setAppliedCode(null);
    }
  };

  const placeOrder = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/orders", {
        items: cart.map((it) => ({ product_id: it.product.id, quantity: it.quantity })),
        address: addr,
        coupon_code: appliedCode,
        payment_method: "COD",
      });
      toast.success(`Order ${data.order_no} placed!`);
      refresh();
      navigate("/account");
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to place order");
    } finally { setLoading(false); }
  };

  return (
    <div data-testid="checkout-page" className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="font-serif-pipa text-5xl mb-10">Checkout</h1>
      <div className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-serif-pipa text-2xl mb-2">Shipping Address</h2>
          {savedAddrs.length > 0 && (
            <div className="bg-white border border-[#E5E0D8] p-3 rounded mb-2">
              <label className="text-xs uppercase tracking-widest text-[#4A4A4A] block mb-2">Use saved address</label>
              <select
                data-testid="select-address"
                value={selectedAddrId}
                onChange={(e) => pickAddr(e.target.value)}
                className="w-full bg-white border border-[#E5E0D8] px-3 py-2 text-sm outline-none rounded"
              >
                <option value="">-- New address --</option>
                {savedAddrs.map((a) => (
                  <option key={a.id} value={a.id}>{a.label}: {a.full_name}, {a.city} {a.is_default ? "(default)" : ""}</option>
                ))}
              </select>
            </div>
          )}
          {[
            ["full_name", "Full Name"],
            ["phone", "Phone (7-15 digits)"],
            ["line1", "Address Line 1"],
            ["line2", "Address Line 2 (optional)"],
            ["city", "City"],
            ["state", "State"],
            ["pincode", "Pincode"],
          ].map(([k, l]) => (
            <input
              key={k}
              data-testid={`addr-${k}`}
              placeholder={l}
              value={addr[k]}
              onChange={(e) => setAddr({ ...addr, [k]: e.target.value })}
              className="w-full bg-white border border-[#E5E0D8] px-3 py-3 text-sm outline-none focus:border-[#B45F45]"
            />
          ))}
          <div className="border border-[#E5E0D8] bg-white p-4 mt-4">
            <h3 className="font-medium mb-2">Payment Method</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked readOnly /> Cash on Delivery (COD)
            </label>
          </div>
        </div>

        <div className="border border-[#E5E0D8] bg-white p-6 h-fit">
          <h3 className="font-serif-pipa text-2xl mb-4">Order Summary</h3>
          <div className="space-y-2 max-h-60 overflow-auto scrollbar-thin mb-4">
            {cart.map((it) => (
              <div key={it.product.id} className="flex justify-between text-sm">
                <span className="truncate">{it.product.name} × {it.quantity}</span>
                <span>{inr(it.product.price * it.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 my-3">
            <input
              data-testid="coupon-input"
              placeholder="Coupon code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="flex-1 bg-white border border-[#E5E0D8] px-3 py-2 text-sm outline-none"
            />
            <button data-testid="apply-coupon-btn" onClick={applyCoupon} className="bg-[#1A1A1A] text-white px-3 text-xs uppercase">Apply</button>
          </div>
          <div className="flex justify-between text-sm py-1"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
          {discount > 0 && <div className="flex justify-between text-sm py-1 text-[#388E3C]"><span>Discount</span><span>-{inr(discount)}</span></div>}
          <div className="flex justify-between text-sm py-1"><span>Shipping</span><span>{shipping === 0 ? "Free" : inr(shipping)}</span></div>
          <div className="flex justify-between font-serif-pipa text-xl border-t border-[#E5E0D8] pt-3 mt-3"><span>Total</span><span>{inr(total)}</span></div>
          <button
            data-testid="place-order-btn"
            onClick={placeOrder}
            disabled={loading}
            className="mt-5 w-full bg-[#B45F45] text-white py-3 text-xs uppercase tracking-widest hover:bg-[#9c4d36] disabled:opacity-60"
          >
            {loading ? "Placing…" : "Place Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
