import { useState } from "react";
import { Link2, Copy, ExternalLink, Trash2, Plus, QrCode } from "lucide-react";
import { toast } from "sonner";

const INITIAL_LINKS = [
  { id: "1", title: "Summer Sale", url: "https://pipajewellery.com/shop?promo=SUMMER", clicks: 142, created: "2026-06-01" },
  { id: "2", title: "Bridal Collection", url: "https://pipajewellery.com/collections/bridal", clicks: 89, created: "2026-05-15" },
];

const AdminCreateLink = () => {
  const [links, setLinks] = useState(INITIAL_LINKS);
  const [form, setForm] = useState({ title: "", url: "", utm_source: "instagram", utm_medium: "social", utm_campaign: "" });

  const buildTracked = () => {
    if (!form.url) return "";
    const u = new URL(form.url.startsWith("http") ? form.url : `https://${form.url}`);
    if (form.utm_source) u.searchParams.set("utm_source", form.utm_source);
    if (form.utm_medium) u.searchParams.set("utm_medium", form.utm_medium);
    if (form.utm_campaign) u.searchParams.set("utm_campaign", form.utm_campaign);
    return u.toString();
  };

  const create = () => {
    if (!form.title || !form.url) { toast.error("Title and URL are required"); return; }
    setLinks((prev) => [
      { id: String(Date.now()), title: form.title, url: buildTracked(), clicks: 0, created: new Date().toISOString().slice(0, 10) },
      ...prev,
    ]);
    setForm({ title: "", url: "", utm_source: "instagram", utm_medium: "social", utm_campaign: "" });
    toast.success("Link created!");
  };

  const copy = (url) => { navigator.clipboard.writeText(url); toast.success("Link copied!"); };
  const del = (id) => { setLinks((prev) => prev.filter((l) => l.id !== id)); toast.success("Link deleted"); };

  const tracked = (() => { try { return buildTracked(); } catch { return ""; } })();

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Create Link</h1>
      <p className="text-sm text-gray-500">Create trackable links with UTM parameters for your marketing campaigns.</p>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm">New Tracked Link</h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="link-title" className="text-xs text-gray-500 mb-1 block">Link Title</label>
              <input id="link-title" placeholder="e.g. Summer Sale Campaign" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
            </div>
            <div>
              <label htmlFor="link-url" className="text-xs text-gray-500 mb-1 block">Destination URL</label>
              <input id="link-url" placeholder="https://pipajewellery.com/shop" value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="utm-source" className="text-xs text-gray-500 mb-1 block">UTM Source</label>
                <select id="utm-source" value={form.utm_source} onChange={(e) => setForm({ ...form, utm_source: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500">
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                  <option value="google">Google</option>
                </select>
              </div>
              <div>
                <label htmlFor="utm-medium" className="text-xs text-gray-500 mb-1 block">UTM Medium</label>
                <select id="utm-medium" value={form.utm_medium} onChange={(e) => setForm({ ...form, utm_medium: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500">
                  <option value="social">Social</option>
                  <option value="email">Email</option>
                  <option value="cpc">CPC</option>
                  <option value="organic">Organic</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="utm-campaign" className="text-xs text-gray-500 mb-1 block">UTM Campaign</label>
              <input id="utm-campaign" placeholder="e.g. summer_sale_2026" value={form.utm_campaign} onChange={(e) => setForm({ ...form, utm_campaign: e.target.value })} className="w-full border border-gray-200 px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500" />
            </div>
          </div>

          {tracked && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1 font-medium">Generated Link</p>
              <p className="text-xs text-blue-600 break-all font-mono">{tracked}</p>
            </div>
          )}

          <button onClick={create} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 text-sm rounded-xl font-medium transition-colors">
            <Plus size={15} /> Create Link
          </button>
        </div>

        {/* Link List */}
        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900 text-sm">{links.length} Links Created</h2>
          {links.map((l) => (
            <div key={l.id} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Link2 size={14} className="text-blue-600 flex-shrink-0" />
                  <span className="font-semibold text-gray-900 text-sm">{l.title}</span>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => copy(l.url)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Copy size={13} /></button>
                  <a href={l.url} target="_blank" rel="noreferrer" className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><ExternalLink size={13} /></a>
                  <button onClick={() => del(l.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                </div>
              </div>
              <p className="text-xs text-gray-400 font-mono truncate">{l.url}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{l.created}</span>
                <span className="font-semibold text-gray-700">{l.clicks} clicks</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminCreateLink;
