import { useState } from "react";
import { Bell, Mail, MessageSquare, Smartphone, Save } from "lucide-react";
import { toast } from "sonner";

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`relative w-10 h-5.5 rounded-full transition-colors flex-shrink-0 ${checked ? "bg-blue-600" : "bg-gray-200"}`}
    style={{ width: 40, height: 22 }}
  >
    <span
      className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-all duration-200`}
      style={{ width: 18, height: 18, left: checked ? 20 : 2, top: 2 }}
    />
  </button>
);

const Section = ({ icon: Icon, title, items, values, onChange }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 bg-gray-50">
      <Icon size={16} className="text-blue-600" />
      <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>
    </div>
    <div className="divide-y divide-gray-100">
      {items.map((item) => (
        <div key={item.key} className="flex items-center justify-between px-5 py-3.5">
          <div>
            <div className="text-sm font-medium text-gray-800">{item.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{item.desc}</div>
          </div>
          <Toggle checked={!!values[item.key]} onChange={(v) => onChange(item.key, v)} />
        </div>
      ))}
    </div>
  </div>
);

const AdminNotifications = () => {
  const [push, setPush] = useState({ new_order: true, payment: true, low_stock: true, review: false });
  const [email, setEmail] = useState({ order_confirm: true, order_shipped: true, payment_received: true, daily_summary: false });
  const [sms, setSms] = useState({ otp: true, order_status: false, promo: false });

  const save = () => toast.success("Notification preferences saved");

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
        <button onClick={save} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-xl font-medium transition-colors">
          <Save size={15} /> Save Preferences
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Section
          icon={Bell}
          title="Push Notifications"
          values={push}
          onChange={(k, v) => setPush((p) => ({ ...p, [k]: v }))}
          items={[
            { key: "new_order", label: "New Order", desc: "Alert when a new order is placed" },
            { key: "payment", label: "Payment Received", desc: "Alert when payment is confirmed" },
            { key: "low_stock", label: "Low Stock Alert", desc: "Alert when product stock drops below 5" },
            { key: "review", label: "New Review", desc: "Alert when a customer posts a review" },
          ]}
        />

        <Section
          icon={Mail}
          title="Email Notifications"
          values={email}
          onChange={(k, v) => setEmail((e) => ({ ...e, [k]: v }))}
          items={[
            { key: "order_confirm", label: "Order Confirmation", desc: "Email sent to customer on order" },
            { key: "order_shipped", label: "Shipment Update", desc: "Email when order is shipped" },
            { key: "payment_received", label: "Payment Receipt", desc: "Email receipt to customer" },
            { key: "daily_summary", label: "Daily Summary", desc: "Daily sales & orders digest to admin" },
          ]}
        />

        <Section
          icon={Smartphone}
          title="SMS Notifications"
          values={sms}
          onChange={(k, v) => setSms((s) => ({ ...s, [k]: v }))}
          items={[
            { key: "otp", label: "OTP Messages", desc: "One-time passwords for login/checkout" },
            { key: "order_status", label: "Order Status SMS", desc: "Status updates sent to customer" },
            { key: "promo", label: "Promotional SMS", desc: "Marketing & offer messages" },
          ]}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-blue-600" />
            <h3 className="font-semibold text-blue-900 text-sm">Notification Setup Tips</h3>
          </div>
          <ul className="space-y-2 text-xs text-blue-800">
            <li>• Configure your SMTP settings in Store Settings for email notifications</li>
            <li>• Set up Firebase Cloud Messaging for push notifications</li>
            <li>• Add Twilio or MSG91 credentials for SMS delivery</li>
            <li>• SMS requires a DLT-registered sender ID (TRAI mandate)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
