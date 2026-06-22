import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [form, setForm] = useState({ name: "", slug: "", image: "", description: "" });
  const load = () => api.get("/categories").then((r) => setCats(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    if (form.name.length < 2) { toast.error("Name too short"); return; }
    if (!/^[a-z0-9-]+$/.test(form.slug)) { toast.error("Slug must be lowercase letters/numbers/hyphens"); return; }
    try {
      await api.post("/categories", form);
      toast.success("Category created");
      setForm({ name: "", slug: "", image: "", description: "" });
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (id) => {
    if (!confirm("Delete category?")) return;
    await api.delete(`/categories/${id}`); toast.success("Deleted"); load();
  };

  return (
    <div data-testid="admin-categories" className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="font-serif-pipa text-3xl mb-5">Categories</h2>
        <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F3EFE9]">
              <tr><th className="text-left p-3">Image</th><th className="text-left p-3">Name</th><th className="text-left p-3">Slug</th><th className="text-right p-3">Actions</th></tr>
            </thead>
            <tbody>
              {cats.map((c) => (
                <tr key={c.id} className="border-t border-[#E5E0D8]">
                  <td className="p-3">{c.image && <img src={c.image} className="w-12 h-12 object-cover" />}</td>
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 font-mono text-xs">{c.slug}</td>
                  <td className="p-3 text-right"><button data-testid={`del-cat-${c.id}`} onClick={() => del(c.id)} className="hover:text-red-600"><Trash2 size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="bg-white border border-[#E5E0D8] rounded-md p-5 h-fit">
        <h3 className="font-serif-pipa text-2xl mb-4">New Category</h3>
        <div className="space-y-3">
          <input data-testid="cat-name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-") })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="cat-slug" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <input data-testid="cat-image" placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded" />
          <textarea data-testid="cat-desc" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 text-sm rounded h-20" />
          <button data-testid="cat-create" onClick={submit} className="w-full bg-[#B45F45] text-white py-2 text-sm flex items-center justify-center gap-2 rounded"><Plus size={16}/> Add Category</button>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
