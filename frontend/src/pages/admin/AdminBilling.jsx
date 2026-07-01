import { useState } from "react";
import { Receipt, Download, CheckCircle, Crown } from "lucide-react";
import { toast } from "sonner";

const INVOICES = [
  { id: "INV-001", date: "2026-06-01", amount: 999, plan: "Growth", status: "paid" },
  { id: "INV-002", date: "2026-05-01", amount: 999, plan: "Growth", status: "paid" },
  { id: "INV-003", date: "2026-04-01", amount: 999, plan: "Growth", status: "paid" },
];

const AdminBilling = () => {
  const [gst, setGst] = useState({ gst_number: "", business_name: "", business_address: "" });

  const downloadInv = (id) => toast.success(`Downloading ${id}…`);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {/* Current Plan */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Crown size={20} className="text-yellow-300" />
              <span className="font-bold text-lg">Growth Plan</span>
            </div>
            <p className="text-blue-200 text-sm">Your plan renews on July 1, 2026</p>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-bold">₹999</span>
              <span className="text-blue-300 mb-1">/month</span>
            </div>
          </div>
          <div className="text-right">
            <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-medium">Active</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {["Unlimited Products", "All Payment Methods", "Priority Support", "Custom Domain"].map((f) => (
            <div key={f} className="flex items-center gap-1.5 text-xs text-blue-100">
              <CheckCircle size={12} className="text-green-300 flex-shrink-0" /> {f}
            </div>
          ))}
        </div>
        <button
          onClick={() => toast.info("Upgrade options coming soon!")}
          className="mt-5 bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 text-sm rounded-xl font-semibold transition-colors"
        >
          Upgrade Plan
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Invoices */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Receipt size={15} className="text-blue-600" /> Invoices & Transaction History
            </h2>
          </div>
          <div className="divide-y divide-gray-100">
            {INVOICES.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="font-mono font-semibold text-sm text-gray-900">{inv.id}</div>
                  <div className="text-xs text-gray-400">{inv.date} · {inv.plan}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900">₹{inv.amount}</span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Paid</span>
                  <button
                    onClick={() => downloadInv(inv.id)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GST Details */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 h-fit">
          <h2 className="font-semibold text-gray-900 text-sm">GST Details for Invoices</h2>
          <div className="space-y-3">
            {[
              { key: "gst_number", label: "GST Number", placeholder: "22AAAAA0000A1Z5" },
              { key: "business_name", label: "Business Name", placeholder: "Pipa Jewellery Pvt Ltd" },
              { key: "business_address", label: "Registered Address", placeholder: "Full address…" },
            ].map((f) => (
              <div key={f.key}>
                <label htmlFor={f.key} className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                <input
                  id={f.key}
                  placeholder={f.placeholder}
                  value={gst[f.key]}
                  onChange={(e) => setGst((g) => ({ ...g, [f.key]: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500"
                />
              </div>
            ))}
            <button
              onClick={() => toast.success("GST details saved")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-xl font-medium transition-colors"
            >
              Save GST Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBilling;
