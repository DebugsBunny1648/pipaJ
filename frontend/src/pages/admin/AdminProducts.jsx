import { useEffect, useState } from "react";
import { api, inr } from "@/lib/api";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", description: "", price: "", compare_price: "", category: "earrings", material: "Brass", stock: "0", images: "", featured: false, bestseller: false, sku: "" };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [q, setQ] = useState("");

  const load = () => api.get("/products?limit=200").then((r) => setProducts(r.data));
  useEffect(() => { load(); api.get("/categories").then((r) => setCats(r.data)); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description, price: String(p.price), compare_price: p.compare_price ? String(p.compare_price) : "",
      category: p.category, material: p.material || "Brass", stock: String(p.stock), images: (p.images || []).join("\n"),
      featured: !!p.featured, bestseller: !!p.bestseller, sku: p.sku || "",
    });
    setShowForm(true);
  };

  const validate = () => {
    if (form.name.trim().length < 2) return "Name too short";
    if (form.description.trim().length < 5) return "Description too short";
    const price = parseFloat(form.price);
    if (!(price > 0)) return "Price must be > 0";
    const cmp = form.compare_price ? parseFloat(form.compare_price) : 0;
    if (cmp && cmp < price) return "Compare price must be > price";
    const stock = parseInt(form.stock || "0");
    if (stock < 0) return "Stock cannot be negative";
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) { toast.error(err); return; }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : null,
      category: form.category,
      material: form.material,
      stock: parseInt(form.stock || "0"),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      featured: form.featured,
      bestseller: form.bestseller,
      sku: form.sku || null,
    };
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      setShowForm(false); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const del = async (p) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    await api.delete(`/products/${p.id}`);
    toast.success("Deleted"); load();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div data-testid="admin-products">
      <div className="flex justify-between mb-5">
        <h2 className="font-serif-pipa text-3xl">Products</h2>
        <button data-testid="new-product-btn" onClick={openNew} className="bg-[#B45F45] text-white px-4 py-2 text-sm flex items-center gap-2 rounded">
          <Plus size={16} /> New Product
        </button>
      </div>

      <input
        data-testid="product-search"
        placeholder="Search products…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="bg-white border border-[#E5E0D8] px-3 py-2 text-sm w-full sm:w-64 mb-4 outline-none focus:border-[#B45F45] rounded"
      />

      <div className="bg-white border border-[#E5E0D8] rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#F3EFE9]">
            <tr>
              <th className="text-left p-3">Image</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Tags</th>
              <th className="text-right p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-[#E5E0D8]">
                <td className="p-3"><img src={p.images?.[0]} className="w-12 h-12 object-cover" /></td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{inr(p.price)}</td>
                <td className={`p-3 ${p.stock <= 5 ? "text-red-600" : ""}`}>{p.stock}</td>
                <td className="p-3 text-xs">{p.featured && "Featured "}{p.bestseller && "Bestseller"}</td>
                <td className="p-3 text-right">
                  <button data-testid={`edit-${p.id}`} onClick={() => openEdit(p)} className="p-1 hover:text-[#B45F45]"><Edit2 size={16} /></button>
                  <button data-testid={`del-${p.id}`} onClick={() => del(p)} className="p-1 hover:text-red-600 ml-2"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-md w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center p-5 border-b border-[#E5E0D8]">
              <h3 className="font-serif-pipa text-2xl">{editing ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="p-5 space-y-3">
              <input data-testid="form-name" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 rounded" />
              <textarea data-testid="form-desc" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 rounded h-24" />
              <div className="grid grid-cols-2 gap-3">
                <input data-testid="form-price" placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded" />
                <input data-testid="form-compare" placeholder="Compare Price (optional)" type="number" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded" />
                <select data-testid="form-category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded">
                  {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
                <input data-testid="form-material" placeholder="Material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded" />
                <input data-testid="form-stock" placeholder="Stock" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded" />
                <input data-testid="form-sku" placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="border border-[#E5E0D8] px-3 py-2 rounded" />
              </div>
              <textarea data-testid="form-images" placeholder="Image URLs (one per line)" value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} className="w-full border border-[#E5E0D8] px-3 py-2 rounded h-20 text-xs" />
              <div className="flex gap-6 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.bestseller} onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} /> Bestseller</label>
              </div>
            </div>
            <div className="p-5 border-t border-[#E5E0D8] flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-[#E5E0D8] rounded">Cancel</button>
              <button data-testid="form-save" onClick={submit} className="bg-[#B45F45] text-white px-4 py-2 text-sm rounded">{editing ? "Save" : "Create"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
