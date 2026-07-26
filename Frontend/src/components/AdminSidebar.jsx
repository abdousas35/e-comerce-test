import React from "react";
import {
  Dashboard as DashboardIcon,
  Inventory,
  ShoppingCart,
  People,
  Star,
  Settings,
  ViewCarousel,
  Discount,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function AdminSidebar() {
  const { t } = useTranslation();

  return (
    <div className="sidebar open">
      <div className="logo">
        <DashboardIcon /> {t("template.sidebar.dashboard")}
      </div>

      <nav className="nav-menu">
        <div className="nav-section">
          <h3>{t("template.sidebar.products")}</h3>
          <Link to="/admin/products">
            <Inventory /> {t("template.sidebar.allProducts")}
          </Link>
          <Link to="/admin/create/product">
            <Inventory /> {t("template.sidebar.createProduct")}
          </Link>
        </div>

        <div className="nav-section">
          <h3>{t("template.sidebar.users")}</h3>
          <Link to="/admin/usersList">
            <People /> {t("template.sidebar.users")}
          </Link>
        </div>

        <div className="nav-section">
          <h3>{t("template.sidebar.orders")}</h3>
          <Link to="/admin/orders">
            <ShoppingCart /> {t("template.sidebar.orders")}
          </Link>
        </div>

        <div className="nav-section">
          <h3>{t("template.sidebar.reviews")}</h3>
          <Link to="/admin/reviews">
            <Star /> {t("template.sidebar.reviews")}
          </Link>
        </div>

        <div className="nav-section">
          <h3>{t("template.sidebar.store")}</h3>
          <Link to="/admin/settings">
            <Settings /> {t("template.sidebar.settings")}
          </Link>
          <Link to="/admin/banners">
            <ViewCarousel /> {t("template.sidebar.banners")}
          </Link>
          <Link to="/admin/coupons">
            <Discount /> {t("template.sidebar.coupons")}
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default AdminSidebar;
