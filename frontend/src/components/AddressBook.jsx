import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus, Star } from "lucide-react";
import { toast } from "sonner";

const emptyAddr = { label: "Home", full_name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", is_default: false };

const AddressBook = () => {
  const [addrs, setAddrs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddr);

  const load = () => api.get("/addresses").then((r) => setAddrs(r.data));
  useEffect(() => { load(); }, []);

  const validate = () => {
    if (!form.full_name || form.full_name.length < 2) return "Name required";
    if (!/^\d{7,15}$/.test(form.phone)) return "Phone must be 7-15 digits";
    if (!form.line1) return "Address required";
    if (!form.city || !form.state) return "City/State required";
    if (!/^\d{4,10}$/.test(form.pincode)) return "Pincode 4-10 digits";
    return null;
  };

  const save = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    try {
      await api.post("/addresses", form);
      toast.success("Address added");
      setForm(emptyAddr); setShowForm(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/addresses/${id}`); load(); };
  const setDefault = async (id) => { await api.post(`/addresses/${id}/default`); load(); };

  return (
    <div data-testid="address-book" className="mt-12">
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-serif-pipa text-3xl">Saved Addresses</h2>
        <button data-testid="add-address-btn" onClick={() => setShowForm(!showForm)} className="text-sm flex items-center gap-1 text-[#B45F45]">
          <Plus size={14} /> {showForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-[#E5E0D8] p-5 mb-5 rounded-md space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <input data-testid="addr-label" placeholder="Label (e.g. Home, Office)" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
            <input data-testid="addr-name" placeholder="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
            <input data-testid="addr-phone" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
            <input data-testid="addr-pincode" placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
            <input data-testid="addr-line1" placeholder="Address Line 1" value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded sm:col-span-2" />
            <input data-testid="addr-line2" placeholder="Address Line 2 (optional)" value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded sm:col-span-2" />
            <input data-testid="addr-city" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
            <input data-testid="addr-state" placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          </div>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} /> Set as default</label>
          <button data-testid="save-address" onClick={save} className="bg-[#B45F45] text-white px-5 py-2 text-xs uppercase tracking-widest rounded">Save Address</button>
        </div>
      )}

      {addrs.length === 0 ? (
        <p className="text-sm text-[#4A4A4A]">No saved addresses yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addrs.map((a) => (
            <div key={a.id} data-testid={`addr-card-${a.id}`} className="bg-white border border-[#E5E0D8] p-5 rounded-md">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest bg-[#F3EFE9] px-2 py-1">{a.label}</span>
                  {a.is_default && <span className="text-xs text-[#B45F45] flex items-center gap-1"><Star size={12} fill="#B45F45" /> Default</span>}
                </div>
                <button data-testid={`del-addr-${a.id}`} onClick={() => del(a.id)} className="text-[#4A4A4A] hover:text-red-600"><Trash2 size={14}/></button>
              </div>
              <p className="mt-3 font-medium">{a.full_name}</p>
              <p className="text-sm text-[#4A4A4A]">{a.line1}{a.line2 ? `, ${a.line2}` : ""}</p>
              <p className="text-sm text-[#4A4A4A]">{a.city}, {a.state} - {a.pincode}</p>
              <p className="text-sm text-[#4A4A4A] mt-1">📞 {a.phone}</p>
              {!a.is_default && (
                <button data-testid={`make-default-${a.id}`} onClick={() => setDefault(a.id)} className="mt-3 text-xs underline text-[#B45F45]">Make default</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressBook;
