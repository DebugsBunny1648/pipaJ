import { useState } from "react";
import { Plus, Trash2, Save, Truck } from "lucide-react";
import { toast } from "sonner";

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh",
];

const AdminDeliveryCharges = () => {
  const [general, setGeneral] = useState({ free_shipping_above: "999", cod_charge: "40" });
  const [zones, setZones] = useState([
    { id: "1", name: "South India", states: ["Karnataka", "Tamil Nadu", "Kerala", "Telangana", "Andhra Pradesh"], charge: "49" },
    { id: "2", name: "North India", states: ["Delhi", "Haryana", "Punjab", "Uttar Pradesh", "Rajasthan"], charge: "59" },
  ]);
  const [weights, setWeights] = useState([
    { id: "1", upto_kg: "0.5", charge: "49" },
    { id: "2", upto_kg: "1", charge: "69" },
    { id: "3", upto_kg: "2", charge: "99" },
  ]);
  const [newZone, setNewZone] = useState({ name: "", states: [], charge: "" });

  const addZone = () => {
    if (!newZone.name || !newZone.charge) { toast.error("Fill zone name and charge"); return; }
    setZones((prev) => [...prev, { id: String(Date.now()), ...newZone }]);
    setNewZone({ name: "", states: [], charge: "" });
    toast.success("Zone added");
  };

  const delZone = (id) => setZones((prev) => prev.filter((z) => z.id !== id));
  const addWeight = () => setWeights((prev) => [...prev, { id: String(Date.now()), upto_kg: "", charge: "" }]);
  const updateWeight = (id, key, val) => setWeights((prev) => prev.map((w) => w.id === id ? { ...w, [key]: val } : w));
  const delWeight = (id) => setWeights((prev) => prev.filter((w) => w.id !== id));

  const save = () => toast.success("Delivery charges saved");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Delivery Charges</h1>
        <button onClick={save} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
          <Save size={15} /> Save All
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* General */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2"><Truck size={16} className="text-blue-600" /> General Settings</h2>
          <div>
            <label htmlFor="free-ship" className="text-xs text-gray-500 mb-1 block">Free Shipping Above (₹)</label>
            <input id="free-ship" type="number" value={general.free_shipping_above} onChange={(e) => setGeneral({ ...general, free_shipping_above: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label htmlFor="cod-charge" className="text-xs text-gray-500 mb-1 block">COD Charge (₹)</label>
            <input id="cod-charge" type="number" value={general.cod_charge} onChange={(e) => setGeneral({ ...general, cod_charge: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
          </div>
        </div>

        {/* Weight-based */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 text-sm">Weight-Based Charges</h2>
            <button onClick={addWeight} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
              <Plus size={13} /> Add Slab
            </button>
          </div>
          <div className="space-y-2">
            {weights.map((w) => (
              <div key={w.id} className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Up to kg"
                  value={w.upto_kg}
                  onChange={(e) => updateWeight(w.id, "upto_kg", e.target.value)}
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded-xl outline-none focus:border-blue-500"
                />
                <span className="text-gray-400 text-xs">kg →</span>
                <input
                  type="number"
                  placeholder="₹ charge"
                  value={w.charge}
                  onChange={(e) => updateWeight(w.id, "charge", e.target.value)}
                  className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded-xl outline-none focus:border-blue-500"
                />
                <button onClick={() => delWeight(w.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zones */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm">State-wise Zones</h2>
        <div className="space-y-3">
          {zones.map((z) => (
            <div key={z.id} className="flex items-start gap-4 p-3 border border-gray-100 rounded-xl">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">{z.name}</span>
                  <span className="text-sm font-bold text-blue-600">₹{z.charge}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {z.states.map((s) => (
                    <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => delZone(z.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add Zone */}
        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add New Zone</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            <input placeholder="Zone Name (e.g. East India)" value={newZone.name} onChange={(e) => setNewZone({ ...newZone, name: e.target.value })} className="border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
            <input type="number" placeholder="Charge (₹)" value={newZone.charge} onChange={(e) => setNewZone({ ...newZone, charge: e.target.value })} className="border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Select States</label>
            <div className="flex flex-wrap gap-1.5">
              {STATES.map((s) => (
                <button
                  key={s}
                  onClick={() => setNewZone((z) => ({
                    ...z,
                    states: z.states.includes(s) ? z.states.filter((x) => x !== s) : [...z.states, s],
                  }))}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${newZone.states.includes(s) ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <button onClick={addZone} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
            <Plus size={14} /> Add Zone
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeliveryCharges;
