import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const load = () => api.get("/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Order updated"); load();
  };

  return (
    <div data-testid="admin-orders">
      <h2 className="font-serif-pipa text-3xl mb-5">Orders</h2>
      <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F3EFE9]">
            <tr>
              <th className="text-left p-3">Order #</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">Items</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan="6" className="text-center p-6 text-[#4A4A4A]">No orders yet</td></tr>}
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[#E5E0D8]" data-testid={`admin-order-${o.order_no}`}>
                <td className="p-3 font-mono text-xs">{o.order_no}</td>
                <td className="p-3">{o.user_name}<br/><span className="text-xs text-[#4A4A4A]">{o.user_email}</span></td>
                <td className="p-3">{o.items.length}</td>
                <td className="p-3">{inr(o.total)}</td>
                <td className="p-3 text-xs">{o.created_at?.slice(0, 10)}</td>
                <td className="p-3">
                  <select data-testid={`status-${o.id}`} value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="border border-[#E5E0D8] px-2 py-1 text-xs rounded">
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
