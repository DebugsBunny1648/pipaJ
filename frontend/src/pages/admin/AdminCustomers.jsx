import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { Search, Download, Users, ChevronLeft, ChevronRight, Mail, Phone } from "lucide-react";

const PER_PAGE = 15;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get("/admin/users").then((r) => setCustomers(r.data));
    api.get("/orders").then((r) => setOrders(r.data));
  }, []);

  const orderCount = (userId) => orders.filter((o) => o.user_id === userId).length;
  const totalSpend = (userId) => orders.filter((o) => o.user_id === userId && o.status !== "cancelled").reduce((s, o) => s + (o.total || 0), 0);

  const filtered = customers.filter((c) =>
    !q ||
    c.name?.toLowerCase().includes(q.toLowerCase()) ||
    c.email?.toLowerCase().includes(q.toLowerCase()) ||
    c.phone?.includes(q)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Orders", "Total Spend", "Joined"]];
    filtered.forEach((c) => {
      rows.push([c.name, c.email, c.phone || "—", orderCount(c.id), totalSpend(c.id), c.created_at?.slice(0, 10)]);
    });
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "customers.csv";
    a.click();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-0.5">{customers.length} registered customers</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 border border-gray-200 hover:bg-gray-50 px-4 py-2 text-sm rounded-xl text-gray-700 font-medium transition-colors"
        >
          <Download size={15} /> Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Search name, email, phone…"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          className="border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm w-full outline-none focus:border-blue-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium">Customer</th>
                <th className="text-left px-4 py-3 font-medium">Phone</th>
                <th className="text-left px-4 py-3 font-medium">Orders</th>
                <th className="text-left px-4 py-3 font-medium">Total Spend</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400">
                    <Users size={28} className="mx-auto mb-2 text-gray-300" />
                    No customers found
                  </td>
                </tr>
              )}
              {paged.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {c.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{c.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <Mail size={10} /> {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {c.phone ? (
                      <span className="flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {c.phone}</span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-gray-900">{orderCount(c.id)}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{inr(totalSpend(c.id))}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.created_at?.slice(0, 10) || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">{filtered.length} customers</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronLeft size={15} /></button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`w-7 h-7 text-xs rounded-lg transition-colors ${page === i + 1 ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100"}`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-40 transition-colors"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
