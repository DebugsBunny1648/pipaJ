import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import AddressBook from "@/components/AddressBook";

const Account = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/orders/mine").then((r) => setOrders(r.data));
  }, []);

  return (
    <div data-testid="account-page" className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
      <h1 className="font-serif-pipa text-5xl mb-2">My Account</h1>
      <p className="text-[#4A4A4A] text-sm mb-10">Hi {user?.name}, welcome back.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <div className="bg-white border border-[#E5E0D8] p-5">
          <p className="text-xs uppercase tracking-widest text-[#4A4A4A]">Email</p>
          <p className="mt-1">{user?.email}</p>
        </div>
        <div className="bg-white border border-[#E5E0D8] p-5">
          <p className="text-xs uppercase tracking-widest text-[#4A4A4A]">Member Since</p>
          <p className="mt-1">{user?.created_at?.slice(0, 10)}</p>
        </div>
        <div className="bg-white border border-[#E5E0D8] p-5 flex items-center">
          <button
            data-testid="logout-btn"
            onClick={() => { logout(); navigate("/"); }}
            className="w-full border border-[#1A1A1A] py-2 text-xs uppercase tracking-widest hover:bg-[#1A1A1A] hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>

      <h2 className="font-serif-pipa text-3xl mb-5">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-[#4A4A4A]">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <div key={o.id} data-testid={`order-${o.order_no}`} className="bg-white border border-[#E5E0D8] p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-medium">{o.order_no}</div>
                  <div className="text-xs text-[#4A4A4A]">{o.created_at?.slice(0, 10)} • {o.items.length} items</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs uppercase tracking-widest bg-[#F3EFE9] px-3 py-1">{o.status}</span>
                  <span className="font-medium">{inr(o.total)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddressBook />
    </div>
  );
};

export default Account;
