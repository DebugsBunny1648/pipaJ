import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState({ code: "", discount_percent: "", min_order: "0", active: true });
  const load = () => api.get("/coupons").then((r) => setCoupons(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (form.code.length < 3) { toast.error("Code too short"); return; }
    const dp = parseFloat(form.discount_percent);
    if (!(dp > 0 && dp <= 90)) { toast.error("Discount must be 1-90"); return; }
    try {
      await api.post("/coupons", { code: form.code, discount_percent: dp, min_order: parseFloat(form.min_order || "0"), active: form.active });
      toast.success("Coupon created"); setForm({ code: "", discount_percent: "", min_order: "0", active: true }); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/coupons/${id}`); toast.success("Deleted"); load(); };

  return (
    <div data-testid="admin-coupons" className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="font-serif-pipa text-3xl mb-5">Coupons</h2>
        <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F3EFE9]">
              <tr><th className="text-left p-3">Code</th><th className="text-left p-3">Discount</th><th className="text-left p-3">Min Order</th><th className="text-left p-3">Active</th><th className="text-right p-3">Action</th></tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id} className="border-t border-[#E5E0D8]">
                  <td className="p-3 font-mono">{c.code}</td>
                  <td className="p-3">{c.discount_percent}%</td>
                  <td className="p-3">₹{c.min_order}</td>
                  <td className="p-3">{c.active ? "Yes" : "No"}</td>
                  <td className="p-3 text-right"><button data-testid={`del-coupon-${c.id}`} onClick={() => del(c.id)} className="hover:text-red-600"><Trash2 size={16}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white border border-[#E5E0D8] rounded-md p-5 h-fit">
        <h3 className="font-serif-pipa text-2xl mb-4">New Coupon</h3>
        <div className="space-y-3">
          <input data-testid="coupon-code" placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="coupon-pct" placeholder="Discount %" type="number" value={form.discount_percent} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="coupon-min" placeholder="Min Order" type="number" value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <button data-testid="coupon-create" onClick={submit} className="w-full bg-[#B45F45] text-white py-2 text-sm flex items-center justify-center gap-2 rounded"><Plus size={16}/> Add Coupon</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCoupons;
