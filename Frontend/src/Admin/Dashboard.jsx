import React, { useEffect, useState, useMemo } from "react";
import "../AdminStyles/Dashboard.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import {
  Inventory,
  Star,
  AttachMoney,
  Error,
  CheckCircle,
  ShoppingCart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAdminProducts, fetchAllOrders } from "../features/admin/adminSlice";
import AdminSidebar from "../components/AdminSidebar";

function Dashboard() {
  const dispatch = useDispatch();
  const { products, orders, loading: loadingAdmin } = useSelector(
    (state) => state.admin
  );

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTinyScreen, setIsTinyScreen] = useState(window.innerWidth <= 450);
  const { t } = useTranslation();

  useEffect(() => {
    dispatch(fetchAdminProducts());
    dispatch(fetchAllOrders());
  }, [dispatch]);

  useEffect(() => {
    const handleResize = () => {
      const tiny = window.innerWidth <= 450;
      setIsTinyScreen(tiny);
      if (!tiny) setIsSidebarOpen(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ===================== */
  /* 🧠 STATS */
  /* ===================== */

  const stats = useMemo(() => {
    return {
      totalProducts: products.length,
      totalReviews: products.reduce(
        (acc, p) => acc + (p.reviews?.length || 0),
        0
      ),
      inStock: products.filter((p) => p.stock > 0).length,
      outOfStock: products.filter((p) => p.stock <= 0).length,
      totalRevenue: orders
        .filter((o) => o.orderStatus === "Delivered")
        .reduce((acc, o) => acc + o.totalPrice, 0),
    };
  }, [products, orders]);

  /* ===================== */
  /* 📦 ORDERS BREAKDOWN */
  /* ===================== */

  const orderStats = useMemo(() => {
    return {
      delivered: orders.filter((o) => o.orderStatus === "Delivered").length,
      processing: orders.filter((o) => o.orderStatus === "Processing").length,
      pending: orders.filter((o) => o.orderStatus === "Pending").length,
      shipped: orders.filter((o) => o.orderStatus === "Shipped").length,
    };
  }, [orders]);

  /* ===================== */
  /* 📈 GROWTH */
  /* ===================== */

  const now = new Date();
  const last7Days = new Date();
  last7Days.setDate(now.getDate() - 7);

  const last14Days = new Date();
  last14Days.setDate(now.getDate() - 14);

  const productGrowth = useMemo(() => {
    const thisWeek = products.filter(
      (p) => new Date(p.createdAt) > last7Days
    ).length;

    const lastWeek = products.filter((p) => {
      const d = new Date(p.createdAt);
      return d < last7Days && d > last14Days;
    }).length;

    if (lastWeek === 0) return 100;
    return ((thisWeek - lastWeek) / lastWeek) * 100;
  }, [products]);

  const revenueGrowth = useMemo(() => {
    const thisWeek = orders
      .filter(
        (o) =>
          o.orderStatus === "Delivered" &&
          new Date(o.createdAt) > last7Days
      )
      .reduce((acc, o) => acc + o.totalPrice, 0);

    const lastWeek = orders
      .filter(
        (o) =>
          o.orderStatus === "Delivered" &&
          new Date(o.createdAt) <= last7Days
      )
      .reduce((acc, o) => acc + o.totalPrice, 0);

    if (lastWeek === 0) return 100;
    return ((thisWeek - lastWeek) / lastWeek) * 100;
  }, [orders]);

  return (
    <>
      <Navbar />
      <PageTitle title={t("admin.dashboard.pageTitle")} />

      <div
        className={`dashboard-container ${
          isTinyScreen && isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        {isTinyScreen && (
          <button
            className={`sidebar-toggle ${isSidebarOpen ? "open" : "closed"}`}
            onClick={() => setIsSidebarOpen((p) => !p)}
          >
            {isSidebarOpen ? (
              <KeyboardArrowLeft />
            ) : (
              <KeyboardArrowRight />
            )}
          </button>
        )}

        {/* SIDEBAR */}
        <div className={`${isTinyScreen && !isSidebarOpen ? "sidebar closed" : ""}`}>
          <AdminSidebar />
        </div>

        {/* MAIN */}
        <div
          className={`main-content ${
            isTinyScreen && !isSidebarOpen
              ? "sidebar-collapsed"
              : "sidebar-expanded"
          }`}
        >
          {/* TOP */}
          <div className="dashboard-topbar">
            <h2>{t("template.dashboard.title")}</h2>
            <p>{t("template.dashboard.subtitle")}</p>
          </div>

          <div className="quick-actions-grid">
            <Link to="/admin/create/product" className="quick-action-card">
              <strong>{t("template.dashboard.quickCreateProduct")}</strong>
              <span>{t("template.dashboard.quickCreateProductDesc")}</span>
            </Link>
            <Link to="/admin/banners" className="quick-action-card">
              <strong>{t("template.dashboard.quickManageBanners")}</strong>
              <span>{t("template.dashboard.quickManageBannersDesc")}</span>
            </Link>
            <Link to="/admin/coupons" className="quick-action-card">
              <strong>{t("template.dashboard.quickCreateCoupon")}</strong>
              <span>{t("template.dashboard.quickCreateCouponDesc")}</span>
            </Link>
          </div>

          {/* STATS */}
          <div className="stats-grid">
            <div className="stat-box">
              <Inventory className="icon" />
              <h3>{t("template.dashboard.products")}</h3>
              <p>{stats.totalProducts}</p>
              <span className="trend up">{productGrowth.toFixed(1)}%</span>
            </div>

            <div className="stat-box">
              <Star className="icon" />
              <h3>{t("template.dashboard.reviews")}</h3>
              <p>{stats.totalReviews}</p>
            </div>

            <div className="stat-box">
              <AttachMoney className="icon" />
              <h3>{t("template.dashboard.revenue")}</h3>
              <p>{stats.totalRevenue.toLocaleString()} TND</p>
              <span className="trend up">
                {revenueGrowth.toFixed(1)}%
              </span>
            </div>

            <div className="stat-box">
              <CheckCircle className="icon" />
              <h3>{t("template.dashboard.deliveredOrders")}</h3>
              <p>{orderStats.delivered}</p>
            </div>

            <div className="stat-box">
              <ShoppingCart className="icon" />
              <h3>{t("template.dashboard.processing")}</h3>
              <p>{orderStats.processing}</p>
            </div>

            <div className="stat-box">
              <ShoppingCart className="icon" />
              <h3>Shipped</h3>
              <p>{orderStats.shipped}</p>
            </div>

            <div className="stat-box">
              <Error className="icon" />
              <h3>{t("template.dashboard.pending")}</h3>
              <p>{orderStats.pending}</p>
            </div>

            <div className="stat-box">
              <CheckCircle className="icon" />
              <h3>{t("template.dashboard.inStock")}</h3>
              <p>{stats.inStock}</p>
            </div>

            <div className="stat-box">
              <Error className="icon" />
              <h3>{t("template.dashboard.outOfStock")}</h3>
              <p>{stats.outOfStock}</p>
            </div>
          </div>

          {/* TABLE */}
          <div className="products-section">
            <h2>{t("template.dashboard.latestProducts")}</h2>

            {loadingAdmin ? (
              <p>Loading...</p>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {products.slice(0, 10).map((p, i) => (
                    <tr key={p._id}>
                      <td>{i + 1}</td>
                      <td>{p.name}</td>
                      <td>{p.price} TND</td>
                      <td>{p.stock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="products-section">
            <h2>{t("template.dashboard.recentOrders")}</h2>

            {loadingAdmin ? (
              <p>Loading...</p>
            ) : (
              <table className="product-table">
                <thead>
                  <tr>
                    <th>{t("template.dashboard.order")}</th>
                    <th>{t("orders.status")}</th>
                    <th>{t("orders.items")}</th>
                    <th>{t("cart.total")}</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.slice(0, 8).map((order) => (
                    <tr key={order._id}>
                      <td>{order._id.slice(-8)}</td>
                      <td>{order.orderStatus}</td>
                      <td>{order.orderItems.length}</td>
                      <td>{order.totalPrice} TND</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
