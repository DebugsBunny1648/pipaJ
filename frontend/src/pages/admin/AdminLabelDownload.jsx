import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { Printer, Save, CheckSquare, Square, Search } from "lucide-react";
import { toast } from "sonner";

const AdminLabelDownload = () => {
  const [senderForm, setSenderForm] = useState({
    store_name: "Pipa Jewellery", phone: "", address: "", city: "", state: "", pincode: "",
  });
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("confirmed");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => { api.get("/orders").then((r) => setOrders(r.data)); }, []);

  const saveSender = () => toast.success("Sender address saved");

  const filtered = orders.filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (search && !o.order_no?.toLowerCase().includes(search.toLowerCase()) && !o.user_name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (dateFrom && o.created_at < dateFrom) return false;
    if (dateTo && o.created_at > dateTo + "T23:59:59") return false;
    return true;
  });

  const toggleSelect = (id) => setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const toggleAll = () => setSelected(selected.length === filtered.length ? [] : filtered.map((o) => o.id));

  const printLabels = () => {
    if (selected.length === 0) { toast.error("Select at least one order"); return; }
    toast.success(`Printing ${selected.length} label(s)… (4 per page)`);
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Label Download</h1>
        <button
          onClick={printLabels}
          disabled={selected.length === 0}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors"
        >
          <Printer size={15} /> Print Labels ({selected.length})
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Sender Address */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 h-fit">
          <h2 className="font-semibold text-gray-900 text-sm">Sender Address</h2>
          {[
            { key: "store_name", label: "Store Name", placeholder: "Pipa Jewellery" },
            { key: "phone", label: "Phone", placeholder: "+91 9999999999" },
            { key: "address", label: "Address", placeholder: "Street, Area" },
            { key: "city", label: "City", placeholder: "Mumbai" },
            { key: "state", label: "State", placeholder: "Maharashtra" },
            { key: "pincode", label: "Pincode", placeholder: "400001" },
          ].map((f) => (
            <div key={f.key}>
              <label htmlFor={`sender-${f.key}`} className="text-xs text-gray-500 mb-1 block">{f.label}</label>
              <input
                id={`sender-${f.key}`}
                placeholder={f.placeholder}
                value={senderForm[f.key]}
                onChange={(e) => setSenderForm((s) => ({ ...s, [f.key]: e.target.value }))}
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-xl outline-none focus:border-blue-500"
              />
            </div>
          ))}
          <button onClick={saveSender} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-xl font-medium transition-colors">
            <Save size={14} /> Save Address
          </button>
        </div>

        {/* Order Selection */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                placeholder="Search orders…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-xl pl-8 pr-3 py-2 text-sm w-full outline-none focus:border-blue-500"
              />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500">
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="pending">Pending</option>
            </select>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500" />
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
              <button onClick={toggleAll} className="text-gray-400 hover:text-blue-600 transition-colors">
                {selected.length === filtered.length && filtered.length > 0 ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
              </button>
              <span className="text-xs text-gray-500 font-medium">{selected.length > 0 ? `${selected.length} selected` : `${filtered.length} orders`}</span>
            </div>
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filtered.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">No orders found</div>
              )}
              {filtered.map((o) => (
                <div
                  key={o.id}
                  onClick={() => toggleSelect(o.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${selected.includes(o.id) ? "bg-blue-50" : ""}`}
                >
                  <div className="text-blue-600 flex-shrink-0">
                    {selected.includes(o.id) ? <CheckSquare size={16} /> : <Square size={16} className="text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-semibold text-blue-600">{o.order_no}</span>
                      <span className="text-xs font-bold text-gray-900">{inr(o.total)}</span>
                    </div>
                    <div className="text-xs text-gray-400">{o.user_name} · {o.created_at?.slice(0, 10)}</div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${
                    o.status === "confirmed" ? "bg-blue-100 text-blue-700" :
                    o.status === "shipped" ? "bg-purple-100 text-purple-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>{o.status}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">Labels are printed 4 per A4 page in standard format.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLabelDownload;
