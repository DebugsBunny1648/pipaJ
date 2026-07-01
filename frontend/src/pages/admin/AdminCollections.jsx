import PropTypes from "prop-types";
import { useState } from "react";
import { Plus, GripVertical, Edit2, Trash2, X, ToggleLeft, ToggleRight, FolderOpen } from "lucide-react";
import { toast } from "sonner";

const INITIAL = [
  { id: "1", name: "Summer Glow", active: true, productCount: 12, description: "Light and breezy summer pieces" },
  { id: "2", name: "Bridal Essentials", active: true, productCount: 8, description: "Handpicked for your special day" },
  { id: "3", name: "Everyday Luxe", active: false, productCount: 15, description: "Effortless elegance for daily wear" },
  { id: "4", name: "Gift Sets", active: true, productCount: 6, description: "Curated sets perfect for gifting" },
];

const emptyForm = { name: "", description: "", active: true };

const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
FieldError.propTypes = { msg: PropTypes.string };
const inputCls = (err) =>
  `w-full border px-3 py-2.5 rounded-xl text-sm outline-none focus:border-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

const AdminCollections = () => {
  const [collections, setCollections] = useState(INITIAL);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const openNew = () => { setEditing(null); setForm(emptyForm); setErrors({}); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setErrors({}); setForm({ name: c.name, description: c.description, active: c.active }); setShowForm(true); };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    else if (form.name.trim().length > 80) e.name = "Name too long (max 80 characters)";
    if (form.description.length > 200) e.description = "Description too long (max 200 characters)";
    const dup = collections.find((c) => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editing?.id);
    if (dup) e.name = "A collection with this name already exists";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) { toast.error("Please fix the errors below"); return; }
    if (editing) {
      setCollections((prev) => prev.map((c) => c.id === editing.id ? { ...c, ...form } : c));
      toast.success("Collection updated");
    } else {
      setCollections((prev) => [...prev, { id: String(Date.now()), ...form, productCount: 0 }]);
      toast.success("Collection created");
    }
    setShowForm(false);
  };

  const del = (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    setCollections((prev) => prev.filter((c) => c.id !== id));
    toast.success("Collection deleted");
  };

  const toggle = (id) => {
    setCollections((prev) => prev.map((c) => c.id === id ? { ...c, active: !c.active } : c));
  };

  // Drag and drop reorder
  const onDragStart = (id) => setDragging(id);
  const onDragEnter = (id) => setDragOver(id);
  const onDragEnd = () => {
    if (!dragging || !dragOver || dragging === dragOver) { setDragging(null); setDragOver(null); return; }
    const from = collections.findIndex((c) => c.id === dragging);
    const to = collections.findIndex((c) => c.id === dragOver);
    const reordered = [...collections];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    setCollections(reordered);
    setDragging(null); setDragOver(null);
    toast.success("Order saved");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Collections</h1>
          <p className="text-sm text-gray-500 mt-0.5">Drag to reorder · {collections.length} collections</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors"
        >
          <Plus size={16} /> New Collection
        </button>
      </div>

      <div className="space-y-2">
        {collections.map((c) => (
          <div
            key={c.id}
            draggable
            onDragStart={() => onDragStart(c.id)}
            onDragEnter={() => onDragEnter(c.id)}
            onDragEnd={onDragEnd}
            onDragOver={(e) => e.preventDefault()}
            className={`bg-white border rounded-xl p-4 flex items-center gap-4 transition-all cursor-grab active:cursor-grabbing ${
              dragOver === c.id ? "border-blue-400 shadow-md scale-[1.01]" : "border-gray-200 hover:shadow-sm"
            } ${dragging === c.id ? "opacity-50" : ""}`}
          >
            <GripVertical size={18} className="text-gray-300 flex-shrink-0" />

            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
              <FolderOpen size={18} className="text-blue-600" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{c.description}</div>
            </div>

            <div className="text-sm font-medium text-gray-600 flex-shrink-0">{c.productCount} products</div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => toggle(c.id)}
                title={c.active ? "Disable" : "Enable"}
                className={`p-1.5 rounded-lg transition-colors ${c.active ? "text-green-600 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
              >
                {c.active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
              </button>
              <button
                onClick={() => openEdit(c)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit2 size={15} />
              </button>
              <button
                onClick={() => del(c.id, c.name)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}

        {collections.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
            <FolderOpen size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No collections yet. Create your first one.</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{editing ? "Edit Collection" : "New Collection"}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <label htmlFor="col-name" className="text-xs text-gray-500 mb-1 block">Collection Name *</label>
                <input
                  id="col-name"
                  placeholder="e.g. Summer Glow"
                  value={form.name}
                  maxLength={80}
                  onChange={(e) => { setForm({ ...form, name: e.target.value }); if (errors.name) setErrors((p) => ({ ...p, name: undefined })); }}
                  className={inputCls(errors.name)}
                />
                <FieldError msg={errors.name} />
              </div>
              <div>
                <label htmlFor="col-desc" className="text-xs text-gray-500 mb-1 block">
                  Description <span className="text-gray-400 font-normal">({form.description.length}/200)</span>
                </label>
                <textarea
                  id="col-desc"
                  placeholder="Short description…"
                  value={form.description}
                  maxLength={200}
                  onChange={(e) => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors((p) => ({ ...p, description: undefined })); }}
                  className={`${inputCls(errors.description)} h-20 resize-none`}
                />
                <FieldError msg={errors.description} />
              </div>
              <label htmlFor="col-active" className="flex items-center gap-2 cursor-pointer">
                <input id="col-active" type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 rounded text-blue-600" />
                <span className="text-sm text-gray-700">Active (visible on store)</span>
              </label>
            </div>
            <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={submit} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">
                {editing ? "Save Changes" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollections;
