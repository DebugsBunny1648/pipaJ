import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import {
  IndianRupee, ShoppingCart, Package, Users, Copy, ExternalLink,
  TrendingUp, RefreshCw, Eye, Truck, CheckCircle
} from "lucide-react";
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip,
  CartesianGrid, Legend
} from "recharts";
import { toast } from "sonner";

const Stat = ({ icon: Icon, label, value, sub, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
};

const paymentLabel = {
  razorpay: "Razorpay",
  cod: "COD",
  manual_upi: "UPI",
  partial_cod: "Part COD",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [payFilter, setPayFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [live, setLive] = useState(true);
  const PER_PAGE = 8;

  const storeUrl = window.location.origin;

  const load = () => {
    api.get("/admin/stats").then((r) => setStats(r.data));
    api.get("/orders").then((r) => setOrders(r.data));
  };

  useEffect(() => {
    load();
    if (live) {
      const t = setInterval(load, 30000);
      return () => clearInterval(t);
    }
  }, [live]);

  const copyUrl = () => {
    navigator.clipboard.writeText(storeUrl);
    toast.success("Store URL copied!");
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.order_no?.toLowerCase().includes(search.toLowerCase()) || o.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchPay = payFilter === "all" || o.payment_method === payFilter;
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchPay && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const setStatus = async (id, status) => {
    await api.put(`/orders/${id}/status`, { status });
    toast.success("Order updated");
    load();
  };

  const chartData = stats?.daily_revenue?.map((d) => ({
    date: d.date?.slice(5),
    Confirmed: d.confirmed ?? d.revenue ?? 0,
    Pending: d.pending ?? 0,
    Cancelled: d.cancelled ?? 0,
  })) || [];

  if (!stats) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-100 animate-pulse rounded-xl h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Store URL */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">Store URL</p>
          <p className="text-sm font-mono text-gray-700 truncate">{storeUrl}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={copyUrl}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Copy size={13} /> Copy
          </button>
          <a
            href={storeUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ExternalLink size={13} /> Open Website
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={IndianRupee} label="Total Sales" value={inr(stats.total_revenue)} sub="All time" color="green" />
        <Stat icon={ShoppingCart} label="Total Orders" value={stats.total_orders} sub="All time" color="blue" />
        <Stat icon={Package} label="Total Products" value={stats.total_products} sub={`${stats.low_stock ?? 0} low stock`} color="purple" />
        <Stat icon={Users} label="Total Customers" value={stats.total_users} sub="Registered" color="orange" />
      </div>

      {/* Sales Overview Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-600" />
              Sales Overview
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 7 days by status</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setLive((v) => !v); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${live ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${live ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
              {live ? "Realtime" : "Paused"}
            </button>
            <button onClick={load} className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" fontSize={11} stroke="#9ca3af" />
              <YAxis fontSize={11} stroke="#9ca3af" />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                formatter={(v) => inr(v)}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Confirmed" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Pending" stackId="a" fill="#f59e0b" />
              <Bar dataKey="Cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
            No sales data yet
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Orders</h2>
          <div className="flex flex-wrap gap-2">
            <input
              placeholder="Search order / customer…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500 flex-1 min-w-0"
            />
            <select
              value={payFilter}
              onChange={(e) => { setPayFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Payments</option>
              <option value="razorpay">Razorpay</option>
              <option value="cod">COD</option>
              <option value="manual_upi">UPI</option>
              <option value="partial_cod">Partial COD</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="text-left px-4 py-3 font-medium">Order</th>
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Items</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Payment</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-400 text-sm">No orders found</td>
                </tr>
              )}
              {paged.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{o.order_no}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900 text-xs">{o.user_name}</div>
                    <div className="text-gray-400 text-xs">{o.user_email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{o.items?.length ?? 0}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{inr(o.total)}</td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {paymentLabel[o.payment_method] || o.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[o.status] || "bg-gray-100 text-gray-600"}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => {}}
                        title="View"
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </button>
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
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-gray-400 text-xs">{filtered.length} orders</span>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-7 h-7 text-xs rounded-lg transition-colors ${page === i + 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
