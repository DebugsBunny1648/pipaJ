import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminLookbook = () => {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ image: "", caption: "", product_ids: [], active: true });

  const load = () => api.get("/lookbook").then((r) => setItems(r.data));
  useEffect(() => {
    load();
    api.get("/products?limit=200").then((r) => setProducts(r.data));
  }, []);

  const toggleProduct = (id) => {
    setForm((f) => ({ ...f, product_ids: f.product_ids.includes(id) ? f.product_ids.filter((x) => x !== id) : [...f.product_ids, id] }));
  };

  const submit = async () => {
    if (!form.image) { toast.error("Image URL required"); return; }
    try {
      await api.post("/lookbook", form);
      toast.success("Look added");
      setForm({ image: "", caption: "", product_ids: [], active: true });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => { if (!confirm("Delete?")) return; await api.delete(`/lookbook/${id}`); load(); };

  return (
    <div data-testid="admin-lookbook" className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="font-serif-pipa text-3xl mb-5">Shop The Look</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map((it) => (
            <div key={it.id} className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
              <img src={it.image} alt="" className="w-full aspect-[3/4] object-cover" />
              <div className="p-3 flex justify-between items-center">
                <div>
                  <div className="font-medium text-sm">{it.caption}</div>
                  <div className="text-xs text-[#4A4A4A]">{(it.products || []).length} products</div>
                </div>
                <button data-testid={`del-look-${it.id}`} onClick={() => del(it.id)} className="hover:text-red-600"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-[#E5E0D8] rounded-md p-5 h-fit">
        <h3 className="font-serif-pipa text-2xl mb-4">New Look</h3>
        <div className="space-y-3">
          <input data-testid="look-image" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="look-caption" placeholder="Caption" value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <div>
            <p className="text-xs text-[#4A4A4A] mb-2">Tag products in this look:</p>
            <div className="max-h-60 overflow-auto border border-[#E5E0D8] rounded p-2 space-y-1 scrollbar-thin">
              {products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-xs">
                  <input type="checkbox" checked={form.product_ids.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                  {p.name}
                </label>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active</label>
          <button data-testid="look-create" onClick={submit} className="w-full bg-[#B45F45] text-white py-2 text-sm flex items-center justify-center gap-2 rounded"><Plus size={16}/> Add Look</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLookbook;
