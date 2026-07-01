import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { api, inr } from "@/lib/api";
import { Plus, Edit2, Trash2, X, Search, MoreVertical, AlertTriangle, Package } from "lucide-react";
import { toast } from "sonner";

const emptyForm = {
  name: "", description: "", price: "", compare_price: "",
  category: "earrings", material: "Brass", stock: "0",
  images: "", featured: false, bestseller: false, sku: "",
};

const isUrl = (s) => /^https?:\/\/\S+\.\S+/.test(s);
const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
FieldError.propTypes = { msg: PropTypes.string };
const inputCls = (err) =>
  `w-full border px-3 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

const MenuDot = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <MoreVertical size={15} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 min-w-[120px] overflow-hidden">
          <button onClick={() => { onEdit(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors">
            <Edit2 size={13} /> Edit
          </button>
          <button onClick={() => { onDelete(); setOpen(false); }} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};
MenuDot.propTypes = { onEdit: PropTypes.func.isRequired, onDelete: PropTypes.func.isRequired };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [cats, setCats] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [q, setQ] = useState("");

  const load = () => api.get("/products?limit=200").then((r) => setProducts(r.data));
  useEffect(() => { load(); api.get("/categories").then((r) => setCats(r.data)); }, []);

  const openNew = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowForm(true); };
  const openEdit = (p) => {
    setEditing(p); setErrors({});
    setForm({
      name: p.name, description: p.description || "", price: String(p.price),
      compare_price: p.compare_price ? String(p.compare_price) : "",
      category: p.category, material: p.material || "Brass", stock: String(p.stock),
      images: (p.images || []).join("\n"), featured: !!p.featured,
      bestseller: !!p.bestseller, sku: p.sku || "",
    });
    setShowForm(true);
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.description.trim().length < 5) e.description = "Description must be at least 5 characters";
    if (form.description.trim().length > 2000) e.description = "Description too long (max 2000 chars)";
    const price = Number.parseFloat(form.price);
    if (isNaN(price) || price <= 0) e.price = "Price must be greater than 0";
    if (form.compare_price) {
      const cmp = Number.parseFloat(form.compare_price);
      if (isNaN(cmp) || cmp < 0) e.compare_price = "Compare price must be a positive number";
      else if (!isNaN(price) && cmp < price) e.compare_price = "Compare price must be ≥ selling price";
    }
    const stock = Number.parseInt(form.stock || "0", 10);
    if (isNaN(stock) || stock < 0) e.stock = "Stock cannot be negative";
    if (form.sku && !/^[A-Za-z0-9_-]+$/.test(form.sku)) e.sku = "SKU: letters, numbers, - _ only";
    const imageLines = form.images.split("\n").map((s) => s.trim()).filter(Boolean);
    if (imageLines.length > 10) e.images = "Maximum 10 images allowed";
    else { const bad = imageLines.find((u) => !isUrl(u)); if (bad) e.images = `Invalid URL: ${bad.slice(0, 40)}`; }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const submit = async () => {
    if (!validate()) { toast.error("Please fix the errors below"); return; }
    const payload = {
      name: form.name.trim(), description: form.description.trim(),
      price: Number.parseFloat(form.price),
      compare_price: form.compare_price ? Number.parseFloat(form.compare_price) : null,
      category: form.category, material: form.material,
      stock: Number.parseInt(form.stock || "0", 10),
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      featured: form.featured, bestseller: form.bestseller, sku: form.sku || null,
    };
    try {
      if (editing) await api.put(`/products/${editing.id}`, payload);
      else await api.post("/products", payload);
      toast.success(editing ? "Product updated" : "Product created");
      setShowForm(false); load();
    } catch (e) {
      const detail = e.response?.data?.detail;
      if (Array.isArray(detail)) {
        const fieldErrors = {};
        detail.forEach((d) => { const f = d.loc?.[1]; if (f) fieldErrors[f] = d.msg; });
        setErrors(fieldErrors); toast.error("Please fix the errors below");
      } else { toast.error(detail || "Failed to save product"); }
    }
  };

  const del = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try { await api.delete(`/products/${p.id}`); toast.success("Product deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.category?.toLowerCase().includes(q.toLowerCase())
  );
  const lowStock = products.filter((p) => p.stock <= 5).length;

  return (
    <div className="space-y-5" data-testid="admin-products">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {products.length} total products
            {lowStock > 0 && <span className="ml-2 text-orange-600 font-medium">· {lowStock} low stock</span>}
          </p>
        </div>
        <button onClick={openNew} data-testid="new-product-btn"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
          <Plus size={16} /> Add New Product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input data-testid="product-search" placeholder="Search products…" value={q}
          onChange={(e) => setQ(e.target.value)}
          className="border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm w-full outline-none focus:border-blue-500" />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <Package size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No products found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="relative aspect-square bg-gray-100">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={32} /></div>}
                {p.stock <= 5 && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    <AlertTriangle size={10} /> Low Stock
                  </div>
                )}
                {p.featured && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">Featured</div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 capitalize">{p.category}</p>
                  </div>
                  <MenuDot onEdit={() => openEdit(p)} onDelete={() => del(p)} />
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="font-bold text-gray-900 text-sm">{inr(p.price)}</span>
                    {p.compare_price && <span className="text-xs text-gray-400 line-through ml-1">{inr(p.compare_price)}</span>}
                  </div>
                  <span className={`text-xs font-medium ${p.stock <= 5 ? "text-orange-600" : "text-gray-500"}`}>Stock: {p.stock}</span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{p.created_at?.slice(0, 10) || "—"}</span>
                  {p.bestseller && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">Bestseller</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-lg">{editing ? "Edit Product" : "New Product"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">

              <div>
                <label htmlFor="p-name" className="text-xs text-gray-500 mb-1 block">Product Name *</label>
                <input id="p-name" data-testid="form-name" placeholder="Product Name" value={form.name}
                  onChange={set("name")} maxLength={120} className={inputCls(errors.name)} />
                <FieldError msg={errors.name} />
              </div>

              <div>
                <label htmlFor="p-desc" className="text-xs text-gray-500 mb-1 block">
                  Description * <span className="text-gray-400 font-normal">({form.description.length}/2000)</span>
                </label>
                <textarea id="p-desc" data-testid="form-desc" placeholder="Description" value={form.description}
                  onChange={set("description")} maxLength={2000} className={`${inputCls(errors.description)} h-24 resize-none`} />
                <FieldError msg={errors.description} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="p-price" className="text-xs text-gray-500 mb-1 block">Price (₹) *</label>
                  <input id="p-price" data-testid="form-price" placeholder="0" type="number" min="0" step="0.01"
                    value={form.price} onChange={set("price")} className={inputCls(errors.price)} />
                  <FieldError msg={errors.price} />
                </div>
                <div>
                  <label htmlFor="p-cmp" className="text-xs text-gray-500 mb-1 block">Compare Price (₹)</label>
                  <input id="p-cmp" data-testid="form-compare" placeholder="Optional" type="number" min="0" step="0.01"
                    value={form.compare_price} onChange={set("compare_price")} className={inputCls(errors.compare_price)} />
                  <FieldError msg={errors.compare_price} />
                </div>
                <div>
                  <label htmlFor="p-cat" className="text-xs text-gray-500 mb-1 block">Category</label>
                  <select id="p-cat" data-testid="form-category" value={form.category} onChange={set("category")} className={inputCls(errors.category)}>
                    {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="p-mat" className="text-xs text-gray-500 mb-1 block">Material</label>
                  <input id="p-mat" data-testid="form-material" placeholder="e.g. Brass" value={form.material}
                    onChange={set("material")} maxLength={60} className={inputCls(errors.material)} />
                </div>
                <div>
                  <label htmlFor="p-stock" className="text-xs text-gray-500 mb-1 block">Stock *</label>
                  <input id="p-stock" data-testid="form-stock" placeholder="0" type="number" min="0"
                    value={form.stock} onChange={set("stock")} className={inputCls(errors.stock)} />
                  <FieldError msg={errors.stock} />
                </div>
                <div>
                  <label htmlFor="p-sku" className="text-xs text-gray-500 mb-1 block">SKU</label>
                  <input id="p-sku" data-testid="form-sku" placeholder="Optional (letters, numbers, - _)"
                    value={form.sku} onChange={set("sku")} maxLength={50} className={inputCls(errors.sku)} />
                  <FieldError msg={errors.sku} />
                </div>
              </div>

              <div>
                <label htmlFor="p-imgs" className="text-xs text-gray-500 mb-1 block">Image URLs (one per line, max 10)</label>
                <textarea id="p-imgs" data-testid="form-images" placeholder="https://example.com/image.jpg"
                  value={form.images} onChange={set("images")}
                  className={`${inputCls(errors.images)} h-20 font-mono text-xs resize-none`} />
                <FieldError msg={errors.images} />
              </div>

              <div className="flex gap-5 text-sm">
                <label htmlFor="p-featured" className="flex items-center gap-2 cursor-pointer">
                  <input id="p-featured" type="checkbox" checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-gray-700">Featured</span>
                </label>
                <label htmlFor="p-best" className="flex items-center gap-2 cursor-pointer">
                  <input id="p-best" type="checkbox" checked={form.bestseller}
                    onChange={(e) => setForm({ ...form, bestseller: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                  <span className="text-gray-700">Bestseller</span>
                </label>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button data-testid="form-save" onClick={submit}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                {editing ? "Save Changes" : "Create Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
