import PropTypes from "prop-types";
import { useState } from "react";
import { Save, Store, Globe, Search, AlertTriangle, Link } from "lucide-react";
import { toast } from "sonner";

const isUrl = (s) => /^https?:\/\/\S+\.\S+/.test(s);
const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
const isGST = (s) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(s);

const FieldError = ({ msg }) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null;
FieldError.propTypes = { msg: PropTypes.string };

const inputCls = (err = false) =>
  `w-full border px-3 py-2.5 text-sm rounded-xl outline-none focus:border-blue-500 ${err ? "border-red-400 bg-red-50" : "border-gray-200"}`;

const AdminSettings = () => {
  const [store, setStore] = useState({
    store_name: "Pipa Jewellery", tagline: "Elegance in Every Piece",
    email: "hello@pipajewellery.com", phone: "+91 9999999999",
    address: "", gst_number: "", logo: "", banner: "",
  });
  const [storeErrors, setStoreErrors] = useState({});

  const [social, setSocial] = useState({ instagram: "", facebook: "", twitter: "" });
  const [socialErrors, setSocialErrors] = useState({});

  const [seo, setSeo] = useState({
    meta_title: "Pipa Jewellery | Handcrafted Jewellery",
    meta_description: "", keywords: "",
  });
  const [seoErrors, setSeoErrors] = useState({});

  const [maintenance, setMaintenance] = useState(false);

  // ── Store validation ──────────────────────────────────────────────────────

  const validateStore = () => {
    const e = {};
    if (!store.store_name.trim()) e.store_name = "Store name is required";
    else if (store.store_name.trim().length < 2) e.store_name = "Store name too short";
    if (store.email && !isEmail(store.email)) e.email = "Enter a valid email address";
    if (store.phone) {
      const digits = store.phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) e.phone = "Phone must be 7–15 digits";
    }
    if (store.gst_number && !isGST(store.gst_number)) e.gst_number = "Invalid GST format (e.g. 22AAAAA0000A1Z5)";
    if (store.logo && !isUrl(store.logo)) e.logo = "Must be a valid http/https URL";
    if (store.banner && !isUrl(store.banner)) e.banner = "Must be a valid http/https URL";
    setStoreErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveStore = () => {
    if (!validateStore()) { toast.error("Please fix the errors below"); return; }
    toast.success("Store settings saved");
  };

  // ── Social validation ─────────────────────────────────────────────────────

  const validateSocial = () => {
    const e = {};
    if (social.instagram && !isUrl(social.instagram)) e.instagram = "Must be a valid URL";
    if (social.facebook && !isUrl(social.facebook)) e.facebook = "Must be a valid URL";
    if (social.twitter && !isUrl(social.twitter)) e.twitter = "Must be a valid URL";
    setSocialErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveSocial = () => {
    if (!validateSocial()) { toast.error("Please fix the errors below"); return; }
    toast.success("Social links saved");
  };

  // ── SEO validation ────────────────────────────────────────────────────────

  const validateSEO = () => {
    const e = {};
    if (seo.meta_title.length > 60) e.meta_title = "Meta title should be ≤ 60 characters for best SEO";
    if (seo.meta_description.length > 160) e.meta_description = "Meta description should be ≤ 160 characters";
    setSeoErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveSEO = () => {
    if (!validateSEO()) { toast.error("Please fix the errors below"); return; }
    toast.success("SEO settings saved");
  };

  const setStoreField = (field) => (value) => {
    setStore((s) => ({ ...s, [field]: value }));
    if (storeErrors[field]) setStoreErrors((p) => ({ ...p, [field]: undefined }));
  };

  const setSocialField = (field) => (e) => {
    setSocial((s) => ({ ...s, [field]: e.target.value }));
    if (socialErrors[field]) setSocialErrors((p) => ({ ...p, [field]: undefined }));
  };

  const setSeoField = (field) => (e) => {
    setSeo((s) => ({ ...s, [field]: e.target.value }));
    if (seoErrors[field]) setSeoErrors((p) => ({ ...p, [field]: undefined }));
  };

  const titleColor = seo.meta_title.length > 60 ? "text-red-500" : seo.meta_title.length > 50 ? "text-orange-500" : "text-gray-400";
  const descColor = seo.meta_description.length > 160 ? "text-red-500" : seo.meta_description.length > 140 ? "text-orange-500" : "text-gray-400";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Store Settings</h1>

      {/* Store Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <Store size={15} className="text-blue-600" /> Store Information
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="store-name" className="text-xs text-gray-500 mb-1 block">Store Name *</label>
            <input id="store-name" placeholder="Pipa Jewellery" value={store.store_name}
              onChange={(e) => setStoreField("store_name")(e.target.value)}
              className={inputCls(storeErrors.store_name)} />
            <FieldError msg={storeErrors.store_name} />
          </div>
          <div>
            <label htmlFor="store-tagline" className="text-xs text-gray-500 mb-1 block">Tagline</label>
            <input id="store-tagline" placeholder="Elegance in Every Piece" value={store.tagline}
              onChange={(e) => setStoreField("tagline")(e.target.value)}
              className={inputCls(false)} />
          </div>
          <div>
            <label htmlFor="store-email" className="text-xs text-gray-500 mb-1 block">Email</label>
            <input id="store-email" type="email" placeholder="hello@store.com" value={store.email}
              onChange={(e) => setStoreField("email")(e.target.value)}
              className={inputCls(storeErrors.email)} />
            <FieldError msg={storeErrors.email} />
          </div>
          <div>
            <label htmlFor="store-phone" className="text-xs text-gray-500 mb-1 block">Phone</label>
            <input id="store-phone" placeholder="+91 9999999999" value={store.phone}
              onChange={(e) => setStoreField("phone")(e.target.value)}
              className={inputCls(storeErrors.phone)} />
            <FieldError msg={storeErrors.phone} />
          </div>
          <div>
            <label htmlFor="store-gst" className="text-xs text-gray-500 mb-1 block">GST Number</label>
            <input id="store-gst" placeholder="22AAAAA0000A1Z5" value={store.gst_number}
              onChange={(e) => setStoreField("gst_number")(e.target.value.toUpperCase())}
              maxLength={15}
              className={inputCls(storeErrors.gst_number)} />
            <FieldError msg={storeErrors.gst_number} />
          </div>
          <div>
            <label htmlFor="store-address" className="text-xs text-gray-500 mb-1 block">Address</label>
            <input id="store-address" placeholder="Street, City, State" value={store.address}
              onChange={(e) => setStoreField("address")(e.target.value)}
              className={inputCls(false)} />
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="store-logo" className="text-xs text-gray-500 mb-1 block">Logo URL</label>
            <input id="store-logo" placeholder="https://…" value={store.logo}
              onChange={(e) => setStoreField("logo")(e.target.value)}
              className={inputCls(storeErrors.logo)} />
            <FieldError msg={storeErrors.logo} />
            {store.logo && !storeErrors.logo && (
              <img src={store.logo} alt="Logo" className="h-12 mt-2 rounded-lg object-contain border border-gray-100 p-1" />
            )}
          </div>
          <div>
            <label htmlFor="store-banner" className="text-xs text-gray-500 mb-1 block">Banner URL</label>
            <input id="store-banner" placeholder="https://…" value={store.banner}
              onChange={(e) => setStoreField("banner")(e.target.value)}
              className={inputCls(storeErrors.banner)} />
            <FieldError msg={storeErrors.banner} />
            {store.banner && !storeErrors.banner && (
              <img src={store.banner} alt="Banner" className="h-12 mt-2 rounded-lg object-cover w-full border border-gray-100" />
            )}
          </div>
        </div>
        <button onClick={saveStore}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
          <Save size={14} /> Save Store Info
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Social Links */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Globe size={15} className="text-blue-600" /> Social Links
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="instagram" className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Link size={11} /> Instagram
              </label>
              <input id="instagram" placeholder="https://instagram.com/yourpage" value={social.instagram}
                onChange={setSocialField("instagram")}
                className={inputCls(socialErrors.instagram)} />
              <FieldError msg={socialErrors.instagram} />
            </div>
            <div>
              <label htmlFor="facebook" className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Link size={11} /> Facebook
              </label>
              <input id="facebook" placeholder="https://facebook.com/yourpage" value={social.facebook}
                onChange={setSocialField("facebook")}
                className={inputCls(socialErrors.facebook)} />
              <FieldError msg={socialErrors.facebook} />
            </div>
            <div>
              <label htmlFor="twitter" className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                <Link size={11} /> Twitter / X
              </label>
              <input id="twitter" placeholder="https://twitter.com/yourpage" value={social.twitter}
                onChange={setSocialField("twitter")}
                className={inputCls(socialErrors.twitter)} />
              <FieldError msg={socialErrors.twitter} />
            </div>
          </div>
          <button onClick={saveSocial}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
            <Save size={14} /> Save Social Links
          </button>
        </div>

        {/* SEO */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <Search size={15} className="text-blue-600" /> SEO Settings
          </h2>
          <div className="space-y-3">
            <div>
              <label htmlFor="meta-title" className="text-xs text-gray-500 mb-1 block">
                Meta Title
                <span className={`ml-1 font-normal ${titleColor}`}>{seo.meta_title.length}/60</span>
              </label>
              <input id="meta-title" placeholder="Page title for search engines" value={seo.meta_title}
                onChange={setSeoField("meta_title")} maxLength={80}
                className={inputCls(seoErrors.meta_title)} />
              <FieldError msg={seoErrors.meta_title} />
            </div>
            <div>
              <label htmlFor="meta-desc" className="text-xs text-gray-500 mb-1 block">
                Meta Description
                <span className={`ml-1 font-normal ${descColor}`}>{seo.meta_description.length}/160</span>
              </label>
              <textarea id="meta-desc" placeholder="Short description for search results…"
                value={seo.meta_description} onChange={setSeoField("meta_description")}
                maxLength={200}
                className={`${inputCls(seoErrors.meta_description)} h-20 resize-none`} />
              <FieldError msg={seoErrors.meta_description} />
            </div>
            <div>
              <label htmlFor="keywords" className="text-xs text-gray-500 mb-1 block">Keywords</label>
              <input id="keywords" placeholder="jewellery, gold, earrings, necklace"
                value={seo.keywords} onChange={setSeoField("keywords")}
                className={inputCls(false)} />
            </div>
          </div>
          <button onClick={saveSEO}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
            <Save size={14} /> Save SEO
          </button>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className={`border rounded-xl p-5 flex items-start justify-between gap-4 ${maintenance ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}>
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className={`mt-0.5 flex-shrink-0 ${maintenance ? "text-orange-500" : "text-gray-400"}`} />
          <div>
            <div className="font-semibold text-gray-900 text-sm">Maintenance Mode</div>
            <p className="text-xs text-gray-500 mt-0.5">
              {maintenance
                ? "Your store is currently in maintenance mode. Customers see a \"Coming Soon\" page."
                : "Enable to temporarily close the store. Customers will see a maintenance page."}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setMaintenance((v) => !v); toast.info(maintenance ? "Store is live" : "Maintenance mode ON"); }}
          className={`px-4 py-2 text-sm rounded-xl font-medium flex-shrink-0 transition-colors ${maintenance ? "bg-orange-500 hover:bg-orange-600 text-white" : "border border-gray-200 text-gray-700 hover:bg-gray-50"}`}>
          {maintenance ? "Disable" : "Enable"}
        </button>
      </div>
    </div>
  );
};

export default AdminSettings;
