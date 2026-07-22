import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Loader from "./components/Loader.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { loadUser } from "./features/user/userSlice.js";
import { SearchProvider } from "./context/SearchContext.jsx";
import { CONFIG } from "../src/config/config.js";
import { fetchSiteSettings } from "./features/settings/siteSettingsSlice.js";

const Home = lazy(() => import("./pages/Home.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const FAQ = lazy(() => import("./pages/FAQ.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));
const ProductDetails = lazy(() => import("./pages/ProductDetails.jsx"));
const Products = lazy(() => import("./pages/Products.jsx"));
const Register = lazy(() => import("./User/Register.jsx"));
const Login = lazy(() => import("./User/Login.jsx"));
const Profile = lazy(() => import("./User/Profile.jsx"));
const UpdateProfile = lazy(() => import("./User/UpdateProfile.jsx"));
const UpdatePassword = lazy(() => import("./User/UpdatePassword.jsx"));
const ForgotPassword = lazy(() => import("./User/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("./User/ResetPassword.jsx"));
const Cart = lazy(() => import("./Cart/Cart.jsx"));
const Shipping = lazy(() => import("./Cart/Shipping.jsx"));
const OrderConfirm = lazy(() => import("./Cart/OrderConfirm.jsx"));
const MyOrders = lazy(() => import("./Orders/MyOrders.jsx"));
const OrderDetails = lazy(() => import("./Orders/OrderDetails.jsx"));
const OrderTracking = lazy(() => import("./Orders/OrderTracking.jsx"));
const Dashboard = lazy(() => import("./Admin/Dashboard.jsx"));
const ProductsList = lazy(() => import("./Admin/ProductsList.jsx"));
const CreateProduct = lazy(() => import("./Admin/CreateProduct.jsx"));
const UpdateProduct = lazy(() => import("./Admin/UpdateProduct.jsx"));
const UpdateRole = lazy(() => import("./Admin/UpdateRole.jsx"));
const OrdersList = lazy(() => import("./Admin/OrdersList.jsx"));
const UpdateOrderStatus = lazy(() => import("./Admin/UpdateOrderStatus.jsx"));
const UsersList = lazy(() => import("./Admin/UsersList.jsx"));
const Reviews = lazy(() => import("./Admin/ReviewsList.jsx"));
const AdminSettings = lazy(() => import("./Admin/AdminSettings.jsx"));
const BannerManager = lazy(() => import("./Admin/BannerManager.jsx"));
const CouponsManager = lazy(() => import("./Admin/CouponsManager.jsx"));

function App() {
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    dispatch(loadUser());
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    document.title = settings?.storeName || CONFIG.appName;
  }, [settings?.storeName]);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-main", settings?.primaryColor || CONFIG.primaryColor);
    document.documentElement.style.setProperty("--primary-light", settings?.secondaryColor || "#F4A261");
    document.documentElement.style.setProperty("--primary-dark", settings?.accentColor || "#1F2937");
    document.documentElement.style.setProperty("--bg-primary", settings?.bgPrimary || "#F8FAFC");
    document.documentElement.style.setProperty("--bg-secondary", settings?.bgSecondary || "#EEF2FF");
    document.documentElement.style.setProperty("--surface-color", settings?.surfaceColor || "#FFFFFF");
    document.documentElement.style.setProperty("--surface-soft-color", settings?.surfaceSoftColor || "#F3F4F6");
    document.documentElement.style.setProperty("--navbar-bg", settings?.navbarBackground || "#0F172A");
    document.documentElement.style.setProperty("--footer-bg", settings?.footerBackground || "#111827");
    document.documentElement.style.setProperty("--heading-color", settings?.headingColor || "#111827"); // Good contrast
    document.documentElement.style.setProperty("--body-text-color", settings?.bodyTextColor || "#1F2937"); // Improved contrast
    document.documentElement.style.setProperty("--muted-text-color", settings?.mutedTextColor || "#4B5563"); // Improved contrast
    document.documentElement.style.setProperty("--text-light", settings?.textLightColor || "#FFFFFF");
    document.documentElement.style.setProperty("--text-primary", settings?.bodyTextColor || "#1F2937"); // Improved contrast
    document.documentElement.style.setProperty("--text-secondary", settings?.mutedTextColor || "#4B5563"); // Improved contrast
    document.documentElement.style.setProperty("--border-color", settings?.borderColor || "#D1D5DB");
    document.documentElement.style.setProperty("--success-color", settings?.successColor || "#22C55E");
    document.documentElement.style.setProperty("--warning-color", settings?.warningColor || "#F59E0B");
    document.documentElement.style.setProperty("--danger-color", settings?.dangerColor || "#EF4444");
    document.documentElement.style.setProperty("--info-color", settings?.infoColor || "#3B82F6");
    document.documentElement.style.setProperty("--font-heading", settings?.fontHeading || "'Poppins', sans-serif");
    document.documentElement.style.setProperty("--font-body", settings?.fontBody || "'Inter', sans-serif");
  }, [settings]);

  return (
    <SearchProvider>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about-us" element={<About />} />
          <Route path="/contact-us" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/profile" element={<ProtectedRoute element={<Profile />} />} />
          <Route path="/profile/update" element={<ProtectedRoute element={<UpdateProfile />} />} />
          <Route path="/password/change" element={<ProtectedRoute element={<UpdatePassword />} />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />

          <Route path="/cart" element={<Cart />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/order/confirm" element={<OrderConfirm />} />
          <Route path="/orders/user" element={<ProtectedRoute element={<MyOrders />} />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/track-order" element={<OrderTracking />} />

          <Route path="/admin/dashboard" element={<ProtectedRoute element={<Dashboard />} adminOnly />} />
          <Route path="/admin/products" element={<ProtectedRoute element={<ProductsList />} adminOnly />} />
          <Route path="/admin/create/product" element={<ProtectedRoute element={<CreateProduct />} adminOnly />} />
          <Route path="/admin/product/:id" element={<ProtectedRoute element={<UpdateProduct />} adminOnly />} />
          <Route path="/admin/usersList" element={<ProtectedRoute element={<UsersList />} adminOnly />} />
          <Route path="/admin/user/:id" element={<ProtectedRoute element={<UpdateRole />} adminOnly />} />
          <Route path="/admin/orders" element={<ProtectedRoute element={<OrdersList />} adminOnly />} />
          <Route path="/admin/orderUpdate/:id" element={<ProtectedRoute element={<UpdateOrderStatus />} adminOnly />} />
          <Route path="/admin/reviews" element={<ProtectedRoute element={<Reviews />} adminOnly />} />
          <Route path="/admin/settings" element={<ProtectedRoute element={<AdminSettings />} adminOnly />} />
          <Route path="/admin/banners" element={<ProtectedRoute element={<BannerManager />} adminOnly />} />
          <Route path="/admin/coupons" element={<ProtectedRoute element={<CouponsManager />} adminOnly />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={i18n.dir() === "rtl"}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </SearchProvider>
  );
}

export default App;
