import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, Truck, X, ChevronLeft, ChevronRight } from "lucide-react";

const TABS = ["All", "Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
const PER_PAGE = 10;

const payBadge = {
  razorpay: "bg-blue-100 text-blue-700",
  cod: "bg-gray-100 text-gray-700",
  manual_upi: "bg-purple-100 text-purple-700",
  partial_cod: "bg-orange-100 text-orange-700",
};
const payLabel = {
  razorpay: "Razorpay",
  cod: "COD",
  manual_upi: "Manual UPI",
  partial_cod: "Partial COD",
};

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [viewOrder, setViewOrder] = useState(null);

  const load = () => api.get("/orders").then((r) => setOrders(r.data));
  useEffect(() => { load(); }, []);

  const setStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Order updated");
    load();
    if (viewOrder?.id === id) setViewOrder((o) => ({ ...o, status }));
  };

  const filtered = orders.filter((o) => {
    if (tab !== "All" && o.status !== tab.toLowerCase()) return false;
    if (search && !o.order_no?.toLowerCase().includes(search.toLowerCase()) && !o.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && o.created_at < dateFrom) return false;
    if (dateTo && o.created_at > dateTo + "T23:59:59") return false;
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const tabCount = (t) => t === "All" ? orders.length : orders.filter((o) => o.status === t.toLowerCase()).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-400">{filtered.length} orders</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t}
            <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-500"}`}>
              {tabCount(t)}
            </span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-0 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search order / customer…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="border border-gray-200 rounded-lg pl-8 pr-3 py-2 text-sm w-full outline-none focus:border-blue-500"
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500"
        />
        {(search || dateFrom || dateTo) && (
          <button
            onClick={() => { setSearch(""); setDateFrom(""); setDateTo(""); setPage(1); }}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 px-2"
          >
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium">Order ID</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-12 text-gray-400">No orders found</td>
                </tr>
              )}
              {paged.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors" data-testid={`admin-order-${o.order_no}`}>
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{o.order_no}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{o.user_name}</div>
                    <div className="text-xs text-gray-400">{o.user_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.items?.length ?? 0} item{(o.items?.length ?? 0) !== 1 ? "s" : ""}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{inr(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${payBadge[o.payment_method] || "bg-gray-100 text-gray-600"}`}>
                      {payLabel[o.payment_method] || o.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusBadge[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{o.created_at?.slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => setViewOrder(o)}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      {o.status === "pending" && (
                        <button
                          onClick={() => setStatus(o.id, "confirmed")}
                          title="Confirm"
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Confirm
                        </button>
                      )}
                      {o.status === "confirmed" && (
                        <button
                          onClick={() => setStatus(o.id, "shipped")}
                          title="Ship"
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <Truck size={14} />
                        </button>
                      )}
                      {o.status === "shipped" && (
                        <button
                          onClick={() => setStatus(o.id, "delivered")}
                          title="Deliver"
                          className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{filtered.length} total</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${page === i + 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-semibold text-gray-900">Order {viewOrder.order_no}</h3>
                <p className="text-xs text-gray-400 mt-0.5">{viewOrder.created_at?.slice(0, 10)}</p>
              </div>
              <button onClick={() => setViewOrder(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Customer */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Customer</p>
                <p className="text-sm font-medium text-gray-900">{viewOrder.user_name}</p>
                <p className="text-xs text-gray-500">{viewOrder.user_email}</p>
              </div>
              {/* Items */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Items</p>
                <div className="space-y-2">
                  {viewOrder.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{item.name}</div>
                        <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-gray-900">{inr(item.price * item.quantity)}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Totals */}
              <div className="border-t border-gray-100 pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span><span>{inr(viewOrder.subtotal || viewOrder.total)}</span>
                </div>
                {viewOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span><span>-{inr(viewOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base pt-1 border-t border-gray-100">
                  <span>Total</span><span>{inr(viewOrder.total)}</span>
                </div>
              </div>
              {/* Status */}
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">Update Status</p>
                <select
                  value={viewOrder.status}
                  onChange={(e) => setStatus(viewOrder.id, e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-full outline-none focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
