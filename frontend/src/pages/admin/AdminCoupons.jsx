import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { Trash2, Plus, Ticket } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  code: "", discount_percent: "", min_order: "0", expiry_date: "", active: true,
};

const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
const inputCls = (err) =>
  `w-full border px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  const load = () => api.get("/coupons").then((r) => setCoupons(r.data));
  useEffect(() => { load(); }, []);

  const set = (field) => (e) => {
    const val = field === "code" ? e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, "") : e.target.value;
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.code.length < 3) e.code = "Code must be at least 3 characters";
    else if (form.code.length > 20) e.code = "Code must be at most 20 characters";
    else if (!/^[A-Z0-9_-]+$/.test(form.code)) e.code = "Only letters, numbers, - _ allowed";

    const dp = Number.parseFloat(form.discount_percent);
    if (isNaN(dp) || dp <= 0) e.discount_percent = "Discount must be greater than 0";
    else if (dp > 90) e.discount_percent = "Discount cannot exceed 90%";

    const mo = Number.parseFloat(form.min_order || "0");
    if (isNaN(mo) || mo < 0) e.min_order = "Minimum order cannot be negative";

    if (form.expiry_date) {
      const today = new Date(); today.setHours(0, 0, 0, 0);
      if (new Date(form.expiry_date) < today) e.expiry_date = "Expiry date cannot be in the past";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { toast.error("Please fix the errors below"); return; }
    try {
      await api.post("/coupons", {
        code: form.code,
        discount_percent: Number.parseFloat(form.discount_percent),
        min_order: Number.parseFloat(form.min_order || "0"),
        active: form.active,
        expiry_date: form.expiry_date || null,
      });
      toast.success("Coupon created");
      setForm(emptyForm); setErrors({});
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try { await api.delete(`/coupons/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const isExpired = (d) => d && new Date(d) < new Date();
  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-5" data-testid="admin-coupons">
      <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Coupon List */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium">Coupon</th>
                <th className="text-left px-4 py-3 font-medium">Discount</th>
                <th className="text-left px-4 py-3 font-medium">Min Order</th>
                <th className="text-left px-4 py-3 font-medium">Expiry</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-400">
                    <Ticket size={28} className="mx-auto mb-2 text-gray-300" />
                    No coupons yet
                  </td>
                </tr>
              )}
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono font-bold text-blue-600 text-sm bg-blue-50 px-2 py-0.5 rounded-lg">{c.code}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{c.discount_percent}%</td>
                  <td className="px-4 py-3 text-gray-600">{inr(c.min_order)}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {c.expiry_date ? (
                      <span className={isExpired(c.expiry_date) ? "text-red-500 font-medium" : "text-gray-600"}>
                        {new Date(c.expiry_date).toLocaleDateString()}
                        {isExpired(c.expiry_date) && " (Expired)"}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      isExpired(c.expiry_date) ? "bg-red-100 text-red-600" :
                      c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    }`}>
                      {isExpired(c.expiry_date) ? "Expired" : c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button data-testid={`del-coupon-${c.id}`} onClick={() => del(c.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">New Coupon</h3>
          <div className="space-y-3">

            <div>
              <label htmlFor="coupon-code" className="text-xs text-gray-500 mb-1 block">
                Coupon Code * <span className="text-gray-400 font-normal">(letters, numbers, - _)</span>
              </label>
              <input
                id="coupon-code" data-testid="coupon-code"
                placeholder="e.g. SAVE20"
                value={form.code}
                onChange={set("code")}
                maxLength={20}
                className={`${inputCls(errors.code)} font-mono uppercase tracking-wider`}
              />
              <FieldError msg={errors.code} />
            </div>

            <div>
              <label htmlFor="coupon-pct" className="text-xs text-gray-500 mb-1 block">Discount % (1–90) *</label>
              <input
                id="coupon-pct" data-testid="coupon-pct"
                placeholder="e.g. 10"
                type="number" min="1" max="90" step="0.5"
                value={form.discount_percent}
                onChange={set("discount_percent")}
                className={inputCls(errors.discount_percent)}
              />
              <FieldError msg={errors.discount_percent} />
            </div>

            <div>
              <label htmlFor="coupon-min" className="text-xs text-gray-500 mb-1 block">Minimum Order (₹)</label>
              <input
                id="coupon-min" data-testid="coupon-min"
                placeholder="0" type="number" min="0"
                value={form.min_order}
                onChange={set("min_order")}
                className={inputCls(errors.min_order)}
              />
              <FieldError msg={errors.min_order} />
            </div>

            <div>
              <label htmlFor="coupon-expiry" className="text-xs text-gray-500 mb-1 block">Expiry Date</label>
              <input
                id="coupon-expiry"
                type="date"
                min={todayStr}
                value={form.expiry_date}
                onChange={set("expiry_date")}
                className={inputCls(errors.expiry_date)}
              />
              <FieldError msg={errors.expiry_date} />
            </div>

            <label htmlFor="coupon-active" className="flex items-center gap-2 cursor-pointer">
              <input id="coupon-active" type="checkbox" checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm text-gray-700">Active immediately</span>
            </label>

            <button data-testid="coupon-create" onClick={submit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
              <Plus size={15} /> Create Coupon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
