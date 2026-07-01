import "@/App.css";
import PropTypes from "prop-types";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "@/components/ui/sonner";

import StoreLayout from "@/components/layout/StoreLayout";
import AdminLayout from "@/components/layout/AdminLayout";

import Home from "@/pages/Home";
import Shop from "@/pages/Shop";
import ProductDetail from "@/pages/ProductDetail";
import Cart from "@/pages/Cart";
import Wishlist from "@/pages/Wishlist";
import Checkout from "@/pages/Checkout";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Account from "@/pages/Account";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminCoupons from "@/pages/admin/AdminCoupons";
import AdminBanners from "@/pages/admin/AdminBanners";
import AdminLookbook from "@/pages/admin/AdminLookbook";
import AdminCollections from "@/pages/admin/AdminCollections";
import AdminCustomers from "@/pages/admin/AdminCustomers";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminBilling from "@/pages/admin/AdminBilling";
import AdminReports from "@/pages/admin/AdminReports";
import AdminDeliveryCharges from "@/pages/admin/AdminDeliveryCharges";
import AdminShipping from "@/pages/admin/AdminShipping";
import AdminLabelDownload from "@/pages/admin/AdminLabelDownload";
import AdminNotifications from "@/pages/admin/AdminNotifications";
import AdminSettings from "@/pages/admin/AdminSettings";
import AdminStore from "@/pages/admin/AdminStore";
import AdminCreateLink from "@/pages/admin/AdminCreateLink";
import AdminAutoDM from "@/pages/admin/AdminAutoDM";

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center font-serif-pipa text-2xl">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};
RequireAuth.propTypes = { children: PropTypes.node.isRequired };

const RequireAdmin = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-10 text-center font-serif-pipa text-2xl">Loading…</div>;
  if (user?.role !== "admin") return <Navigate to="/login" replace />;
  return children;
};
RequireAdmin.propTypes = { children: PropTypes.node.isRequired };

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-center" richColors />
            <Routes>
              {/* Store Routes */}
              <Route element={<StoreLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/:category" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/wishlist" element={<RequireAuth><Wishlist /></RequireAuth>} />
                <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
                <Route path="/account" element={<RequireAuth><Account /></RequireAuth>} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Route>

              {/* Admin Routes */}
              <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="collections" element={<AdminCollections />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="coupons" element={<AdminCoupons />} />
                <Route path="create-link" element={<AdminCreateLink />} />
                <Route path="auto-dm" element={<AdminAutoDM />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="payments" element={<AdminPayments />} />
                <Route path="billing" element={<AdminBilling />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="delivery-charges" element={<AdminDeliveryCharges />} />
                <Route path="shipping" element={<AdminShipping />} />
                <Route path="labels" element={<AdminLabelDownload />} />
                <Route path="store" element={<AdminStore />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="lookbook" element={<AdminLookbook />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
