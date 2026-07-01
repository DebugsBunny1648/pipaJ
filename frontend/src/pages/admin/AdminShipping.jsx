import { useState } from "react";
import { Edit2, X, CheckCircle, Package2 } from "lucide-react";
import { toast } from "sonner";

const PARTNERS = [
  { id: "shiprocket", name: "Shiprocket", logo: "🚀", description: "India's largest shipping aggregator. Covers 24,000+ pin codes.", tracking: true },
  { id: "delhivery", name: "Delhivery", logo: "📦", description: "Fastest growing logistics startup. Excellent last-mile delivery.", tracking: true },
  { id: "bluedart", name: "Blue Dart", logo: "🔵", description: "Premium express delivery. Best for high-value orders.", tracking: true },
  { id: "dtdc", name: "DTDC", logo: "🟡", description: "Wide coverage across Tier 2 & 3 cities.", tracking: true },
  { id: "xpressbees", name: "XpressBees", logo: "🐝", description: "Hyper-local delivery for same/next day shipments.", tracking: false },
];

const AdminShipping = () => {
  const [partners, setPartners] = useState(
    PARTNERS.map((p) => ({ ...p, enabled: p.id === "shiprocket" }))
  );
  const [editId, setEditId] = useState(null);
  const [configs, setConfigs] = useState({});
  const [editFields, setEditFields] = useState({});

  const toggle = (id) => {
    setPartners((prev) => prev.map((p) => p.id === id ? { ...p, enabled: !p.enabled } : p));
    const p = partners.find((p) => p.id === id);
    toast.success(`${p?.name} ${p?.enabled ? "disabled" : "enabled"}`);
  };

  const openEdit = (p) => { setEditId(p.id); setEditFields(configs[p.id] || {}); };

  const saveEdit = () => {
    setConfigs((prev) => ({ ...prev, [editId]: editFields }));
    toast.success("API credentials saved");
    setEditId(null);
  };

  const editing = PARTNERS.find((p) => p.id === editId);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Shipping Partners</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {partners.map((p) => (
          <div key={p.id} className={`bg-white border rounded-xl p-5 flex flex-col gap-3 transition-all ${p.enabled ? "border-gray-200 shadow-sm" : "border-gray-100 opacity-70"}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{p.logo}</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{p.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {p.enabled ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">{p.description}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {p.tracking && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Tracking
                </span>
              )}
              {configs[p.id] && (
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} /> Configured
                </span>
              )}
            </div>

            <div className="flex gap-2 mt-auto pt-1">
              <button
                onClick={() => toggle(p.id)}
                className={`flex-1 py-2 text-xs rounded-xl font-medium transition-colors ${
                  p.enabled ? "border border-gray-200 text-gray-600 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {p.enabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => openEdit(p)}
                className="flex-1 py-2 text-xs rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 size={12} /> API Setup
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">Integration Note</p>
        <p className="text-xs text-amber-700">
          Connect your shipping partner API keys to enable automatic label generation, tracking, and rate calculations.
        </p>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editing.logo}</span>
                <h3 className="font-semibold text-gray-900">{editing.name} — API Setup</h3>
              </div>
              <button onClick={() => setEditId(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label htmlFor="api-key" className="text-xs text-gray-500 mb-1 block">API Key / Email</label>
                <input id="api-key" type="text" placeholder="Enter API key or email" value={editFields.api_key || ""} onChange={(e) => setEditFields((f) => ({ ...f, api_key: e.target.value }))} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="api-secret" className="text-xs text-gray-500 mb-1 block">API Secret / Password</label>
                <input id="api-secret" type="password" placeholder="Enter secret" value={editFields.api_secret || ""} onChange={(e) => setEditFields((f) => ({ ...f, api_secret: e.target.value }))} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="channel-id" className="text-xs text-gray-500 mb-1 block">Channel ID / Merchant Code</label>
                <input id="channel-id" type="text" placeholder="Optional" value={editFields.channel_id || ""} onChange={(e) => setEditFields((f) => ({ ...f, channel_id: e.target.value }))} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setEditId(null)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveEdit} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminShipping;
