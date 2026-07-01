import { useState } from "react";
import { CreditCard, Smartphone, Banknote, Wallet, DollarSign, Edit2, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const METHODS = [
  {
    id: "razorpay",
    name: "Razorpay",
    logo: "💳",
    description: "Accept cards, UPI, netbanking, and wallets via Razorpay.",
    enabled: true,
    fields: [
      { key: "key_id", label: "Key ID", type: "text", placeholder: "rzp_live_…" },
      { key: "key_secret", label: "Secret Key", type: "password", placeholder: "••••••••••••" },
    ],
  },
  {
    id: "phonepe",
    name: "PhonePe",
    logo: "📱",
    description: "UPI-first payment gateway with wide reach in India.",
    enabled: false,
    fields: [
      { key: "merchant_id", label: "Merchant ID", type: "text", placeholder: "MERCHANT123" },
      { key: "secret", label: "Secret", type: "password", placeholder: "••••••••••••" },
    ],
  },
  {
    id: "cod",
    name: "Cash on Delivery",
    logo: "💵",
    description: "Let customers pay in cash when their order is delivered.",
    enabled: true,
    fields: [
      { key: "delivery_charge", label: "Extra COD Charge (₹)", type: "number", placeholder: "0" },
    ],
  },
  {
    id: "manual_upi",
    name: "Manual UPI",
    logo: "🏦",
    description: "Display your UPI ID so customers can pay directly.",
    enabled: true,
    fields: [
      { key: "upi_id", label: "UPI ID", type: "text", placeholder: "yourname@upi" },
      { key: "instructions", label: "Payment Instructions", type: "textarea", placeholder: "e.g. Transfer to the above UPI ID and share screenshot." },
    ],
  },
  {
    id: "partial_cod",
    name: "Partial COD",
    logo: "🤝",
    description: "Collect a percentage online upfront, rest on delivery.",
    enabled: false,
    fields: [
      { key: "advance_percent", label: "Advance % (online)", type: "number", placeholder: "30" },
      { key: "extra_charge", label: "Extra Charge (₹)", type: "number", placeholder: "0" },
    ],
  },
];

const AdminPayments = () => {
  const [methods, setMethods] = useState(METHODS);
  const [editId, setEditId] = useState(null);
  const [configs, setConfigs] = useState({});
  const [editFields, setEditFields] = useState({});

  const toggle = (id) => {
    setMethods((prev) => prev.map((m) => m.id === id ? { ...m, enabled: !m.enabled } : m));
    const m = methods.find((m) => m.id === id);
    toast.success(`${m?.name} ${m?.enabled ? "disabled" : "enabled"}`);
  };

  const openEdit = (m) => {
    setEditId(m.id);
    setEditFields(configs[m.id] || {});
  };

  const saveEdit = () => {
    setConfigs((prev) => ({ ...prev, [editId]: editFields }));
    toast.success("Settings saved");
    setEditId(null);
  };

  const editing = methods.find((m) => m.id === editId);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Payment Methods</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {methods.map((m) => (
          <div
            key={m.id}
            className={`bg-white border rounded-xl p-5 flex flex-col gap-3 transition-all ${m.enabled ? "border-gray-200 shadow-sm" : "border-gray-100 opacity-70"}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{m.logo}</div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{m.name}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {m.enabled ? "Enabled" : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>

            {configs[m.id] && Object.keys(configs[m.id]).length > 0 && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                <CheckCircle size={12} /> Configured
              </div>
            )}

            <div className="flex gap-2 mt-auto pt-1">
              <button
                onClick={() => toggle(m.id)}
                className={`flex-1 py-2 text-xs rounded-xl font-medium transition-colors ${
                  m.enabled
                    ? "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {m.enabled ? "Disable" : "Enable"}
              </button>
              <button
                onClick={() => openEdit(m)}
                className="flex-1 py-2 text-xs rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit2 size={12} /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-semibold mb-1">Configuration Note</p>
        <p className="text-xs text-blue-600">
          API keys and secrets are saved locally for this session. In production, configure them via environment variables in your backend .env file for security.
        </p>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editing.logo}</span>
                <h3 className="font-semibold text-gray-900">{editing.name} — Configuration</h3>
              </div>
              <button onClick={() => setEditId(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              {editing.fields.map((f) => (
                <div key={f.key}>
                  <label htmlFor={f.key} className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={f.key}
                      placeholder={f.placeholder}
                      value={editFields[f.key] || ""}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500 resize-none h-20"
                    />
                  ) : (
                    <input
                      id={f.key}
                      type={f.type}
                      placeholder={f.placeholder}
                      value={editFields[f.key] || ""}
                      onChange={(e) => setEditFields((prev) => ({ ...prev, [f.key]: e.target.value }))}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
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

export default AdminPayments;
