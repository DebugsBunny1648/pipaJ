import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "", active: true });
  const load = () => api.get("/banners").then((r) => setBanners(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (!form.title || !form.image) { toast.error("Title and image required"); return; }
    await api.post("/banners", form);
    toast.success("Banner added");
    setForm({ title: "", subtitle: "", image: "", link: "", active: true });
    load();
  };
  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/banners/${id}`); load(); };

  return (
    <div data-testid="admin-banners" className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="font-serif-pipa text-3xl mb-5">Banners</h2>
        <div className="space-y-4">
          {banners.map((b) => (
            <div key={b.id} className="bg-white border border-[#E5E0D8] rounded-md flex overflow-hidden">
              <img src={b.image} alt="" className="w-40 h-28 object-cover" />
              <div className="flex-1 p-4">
                <div className="font-serif-pipa text-xl">{b.title}</div>
                <div className="text-xs text-[#4A4A4A]">{b.subtitle}</div>
                <div className="text-xs mt-1">Active: {b.active ? "Yes" : "No"}</div>
              </div>
              <button data-testid={`del-banner-${b.id}`} onClick={() => del(b.id)} className="p-4 hover:text-red-600"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#E5E0D8] rounded-md p-5 h-fit">
        <h3 className="font-serif-pipa text-2xl mb-4">New Banner</h3>
        <div className="space-y-3">
          <input data-testid="banner-title" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="banner-subtitle" placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="banner-image" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="banner-link" placeholder="Link (optional)" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <button data-testid="banner-create" onClick={submit} className="w-full bg-[#B45F45] text-white py-2 text-sm flex items-center justify-center gap-2 rounded"><Plus size={16}/> Add Banner</button>
        </div>
      </div>
    </div>
  );
};

export default AdminBanners;
