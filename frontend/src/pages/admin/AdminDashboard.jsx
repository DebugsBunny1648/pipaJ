import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { Package, ShoppingCart, Users, IndianRupee, AlertTriangle } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const Stat = ({ icon: Icon, label, value, testId }) => (
  <div data-testid={testId} className="bg-white border border-[#E5E0D8] rounded-md p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-widest text-[#4A4A4A]">{label}</p>
      <Icon size={20} strokeWidth={1.5} className="text-[#B45F45]" />
    </div>
    <p className="font-serif-pipa text-3xl mt-3">{value}</p>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  useEffect(() => { api.get("/admin/stats").then((r) => setStats(r.data)); }, []);
  if (!stats) return <div>Loading…</div>;

  return (
    <div data-testid="admin-dashboard" className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Stat icon={IndianRupee} label="Revenue" value={inr(stats.total_revenue)} testId="stat-revenue" />
        <Stat icon={ShoppingCart} label="Orders" value={stats.total_orders} testId="stat-orders" />
        <Stat icon={Users} label="Customers" value={stats.total_users} testId="stat-users" />
        <Stat icon={Package} label="Products" value={stats.total_products} testId="stat-products" />
        <Stat icon={AlertTriangle} label="Low Stock" value={stats.low_stock} testId="stat-low-stock" />
      </div>

      <div className="bg-white border border-[#E5E0D8] rounded-md p-5">
        <h3 className="font-serif-pipa text-2xl mb-4">Revenue (Last 7 days)</h3>
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <LineChart data={stats.daily_revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E0D8" />
              <XAxis dataKey="date" stroke="#4A4A4A" fontSize={12} />
              <YAxis stroke="#4A4A4A" fontSize={12} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#B45F45" strokeWidth={2} dot={{ fill: "#B45F45" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {stats.daily_revenue.length === 0 && <p className="text-sm text-[#4A4A4A] text-center py-10">No revenue yet</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
