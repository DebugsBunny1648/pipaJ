import { useState } from "react";
import { MessageSquare, Plus, Trash2, ToggleRight, ToggleLeft, Zap } from "lucide-react";
import { toast } from "sonner";

const TRIGGERS = ["New Order", "Order Confirmed", "Order Shipped", "Order Delivered", "Payment Failed", "Coupon Used", "New Review"];

const INITIAL = [
  { id: "1", name: "Order Confirmation DM", trigger: "Order Confirmed", message: "Hey {name}! 🎉 Your order #{order_no} has been confirmed. We're packing it with love! Track here: {link}", active: true, sent: 245 },
  { id: "2", name: "Shipping Update", trigger: "Order Shipped", message: "Hi {name}! Your Pipa Jewellery order is on its way 🚚 Track: {tracking_link}", active: true, sent: 189 },
  { id: "3", name: "Delivery Feedback", trigger: "Order Delivered", message: "Hey {name}! 💍 We hope you love your new jewellery! Share a pic and tag us @pipajewellery for a chance to be featured!", active: false, sent: 92 },
];

const AdminAutoDM = () => {
  const [dms, setDms] = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: TRIGGERS[0], message: "" });

  const toggle = (id) => {
    setDms((prev) => prev.map((d) => d.id === id ? { ...d, active: !d.active } : d));
  };

  const del = (id) => { setDms((prev) => prev.filter((d) => d.id !== id)); toast.success("Auto DM deleted"); };

  const create = () => {
    if (!form.name || !form.message) { toast.error("Name and message required"); return; }
    setDms((prev) => [...prev, { id: String(Date.now()), ...form, active: true, sent: 0 }]);
    setForm({ name: "", trigger: TRIGGERS[0], message: "" });
    setShowForm(false);
    toast.success("Auto DM created");
  };

  const VARIABLES = ["{name}", "{order_no}", "{link}", "{tracking_link}", "{coupon_code}"];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Auto DM</h1>
          <p className="text-sm text-gray-500 mt-0.5">Automatically send Instagram/WhatsApp DMs based on order events.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
          <Plus size={15} /> New Auto DM
        </button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><MessageSquare size={18} /></div>
          <div><p className="text-xs text-gray-500">Total DMs</p><p className="font-bold text-gray-900">{dms.reduce((s, d) => s + d.sent, 0)}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center"><Zap size={18} /></div>
          <div><p className="text-xs text-gray-500">Active Rules</p><p className="font-bold text-gray-900">{dms.filter((d) => d.active).length}</p></div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><MessageSquare size={18} /></div>
          <div><p className="text-xs text-gray-500">Total Rules</p><p className="font-bold text-gray-900">{dms.length}</p></div>
        </div>
      </div>

      {/* DM List */}
      <div className="space-y-3">
        {dms.map((d) => (
          <div key={d.id} className={`bg-white border rounded-xl p-4 transition-all ${d.active ? "border-gray-200" : "border-gray-100 opacity-70"}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900 text-sm">{d.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${d.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                    {d.active ? "Active" : "Paused"}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{d.trigger}</span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{d.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{d.sent} messages sent</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggle(d.id)} className={`p-1.5 rounded-lg transition-colors ${d.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}>
                  {d.active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                </button>
                <button onClick={() => del(d.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">New Auto DM Rule</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500">✕</button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label htmlFor="dm-name" className="text-xs text-gray-500 mb-1 block">Rule Name</label>
                <input id="dm-name" placeholder="e.g. Order Confirmation DM" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
              </div>
              <div>
                <label htmlFor="dm-trigger" className="text-xs text-gray-500 mb-1 block">Trigger Event</label>
                <select id="dm-trigger" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500">
                  {TRIGGERS.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="dm-msg" className="text-xs text-gray-500 mb-1 block">Message Template</label>
                <textarea id="dm-msg" placeholder="Hey {name}! Your order #{order_no} is confirmed…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl h-28 outline-none focus:border-blue-500 resize-none" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {VARIABLES.map((v) => (
                    <button key={v} onClick={() => setForm((f) => ({ ...f, message: f.message + v }))} className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2 py-0.5 rounded-full font-mono transition-colors">
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={create} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Create Rule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAutoDM;
