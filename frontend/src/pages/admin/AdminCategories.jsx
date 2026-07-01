import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Trash2, Plus, Edit2, Tag } from "lucide-react";
import { toast } from "sonner";

const emptyForm = { name: "", slug: "", image: "", description: "" };

const isUrl = (s) => /^https?:\/\/\S+\.\S+/.test(s);
const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
const inputCls = (err) =>
  `w-full border px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});

  const load = () => {
    api.get("/categories").then((r) => setCats(r.data));
    api.get("/products?limit=500").then((r) => setProducts(r.data));
  };
  useEffect(() => { load(); }, []);

  const productCount = (slug) => products.filter((p) => p.category === slug).length;

  const set = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.name.trim().length > 60) e.name = "Name too long (max 60 characters)";
    if (!form.slug) e.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(form.slug)) e.slug = "Slug: lowercase letters, numbers and hyphens only";
    else if (form.slug.length < 2 || form.slug.length > 60) e.slug = "Slug must be 2–60 characters";
    if (form.image && !isUrl(form.image)) e.image = "Must be a valid http/https URL";
    if (form.description && form.description.length > 500) e.description = "Description too long (max 500 characters)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate()) { toast.error("Please fix the errors below"); return; }
    try {
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
        toast.success("Category updated");
      } else {
        await api.post("/categories", form);
        toast.success("Category created");
      }
      setForm(emptyForm); setEditing(null); setErrors({}); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const openEdit = (c) => {
    setEditing(c); setErrors({});
    setForm({ name: c.name, slug: c.slug, image: c.image || "", description: c.description || "" });
  };

  const del = async (id) => {
    if (!confirm("Delete category? Products in this category won't be deleted.")) return;
    try { await api.delete(`/categories/${id}`); toast.success("Deleted"); load(); }
    catch { toast.error("Failed to delete"); }
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setForm((f) => ({
      ...f, name,
      slug: editing ? f.slug : toSlug(name),
    }));
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
  };

  return (
    <div className="space-y-5" data-testid="admin-categories">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors"
        >
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Table */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium">Image</th>
                <th className="text-left px-4 py-3 font-medium">Category Name</th>
                <th className="text-left px-4 py-3 font-medium">Products</th>
                <th className="text-left px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cats.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-12 text-gray-400">
                    <Tag size={28} className="mx-auto mb-2 text-gray-300" />
                    No categories yet
                  </td>
                </tr>
              )}
              {cats.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    {c.image ? (
                      <img src={c.image} alt={c.name} className="w-12 h-12 rounded-xl object-cover bg-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                        <Tag size={16} className="text-gray-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{c.name}</div>
                    <div className="text-xs text-gray-400 font-mono">{c.slug}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-gray-900">{productCount(c.slug)}</span>
                    <span className="text-xs text-gray-400 ml-1">products</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button data-testid={`del-cat-${c.id}`} onClick={() => del(c.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 h-fit">
          <h3 className="font-semibold text-gray-900 mb-4">{editing ? "Edit Category" : "New Category"}</h3>
          <div className="space-y-3">

            <div>
              <label htmlFor="cat-name" className="text-xs text-gray-500 mb-1 block">Name *</label>
              <input
                id="cat-name" data-testid="cat-name"
                placeholder="e.g. Earrings"
                value={form.name}
                onChange={handleNameChange}
                maxLength={60}
                className={inputCls(errors.name)}
              />
              <FieldError msg={errors.name} />
            </div>

            <div>
              <label htmlFor="cat-slug" className="text-xs text-gray-500 mb-1 block">
                Slug * <span className="text-gray-400 font-normal">(lowercase, hyphens only)</span>
              </label>
              <input
                id="cat-slug" data-testid="cat-slug"
                placeholder="e.g. earrings"
                value={form.slug}
                onChange={set("slug")}
                maxLength={60}
                className={`${inputCls(errors.slug)} font-mono`}
              />
              <FieldError msg={errors.slug} />
            </div>

            <div>
              <label htmlFor="cat-image" className="text-xs text-gray-500 mb-1 block">Image URL</label>
              <input
                id="cat-image" data-testid="cat-image"
                placeholder="https://…"
                value={form.image}
                onChange={set("image")}
                className={inputCls(errors.image)}
              />
              <FieldError msg={errors.image} />
              {form.image && !errors.image && (
                <img src={form.image} alt="" className="w-full h-24 object-cover rounded-xl mt-2" />
              )}
            </div>

            <div>
              <label htmlFor="cat-desc" className="text-xs text-gray-500 mb-1 block">
                Description <span className="text-gray-400 font-normal">({form.description.length}/500)</span>
              </label>
              <textarea
                id="cat-desc" data-testid="cat-desc"
                placeholder="Optional description…"
                value={form.description}
                onChange={set("description")}
                maxLength={500}
                className={`${inputCls(errors.description)} h-20 resize-none`}
              />
              <FieldError msg={errors.description} />
            </div>

            <div className="flex gap-2">
              {editing && (
                <button
                  onClick={() => { setEditing(null); setForm(emptyForm); setErrors({}); }}
                  className="flex-1 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button data-testid="cat-create" onClick={submit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 text-sm rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                <Plus size={15} /> {editing ? "Save Changes" : "Add Category"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;
