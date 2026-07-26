import React, { useEffect, useState } from "react";
import { Discount, DeleteOutline, Save } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import { createCoupon, deleteCoupon, fetchCoupons, removeErrors, removeSuccess } from "../features/admin/adminSlice";
import "../AdminStyles/CouponsManager.css";
import GoToDashboard from "../components/GoToDashboard";

function CouponsManager() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { coupons, loading, error } = useSelector((state) => state.admin);
  const [formData, setFormData] = useState({
    code: "",
    type: "percent",
    value: "",
    minOrderAmount: "",
    expiresAt: "",
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(createCoupon(formData))
      .unwrap()
      .then(() => {
        toast.success(t("template.coupons.created"), { position: "top-center", autoClose: 2500 });
        dispatch(removeSuccess());
        setFormData({
          code: "",
          type: "percent",
          value: "",
          minOrderAmount: "",
          expiresAt: "",
          isActive: true,
        });
      });
  };

  const handleDelete = (id) => {
    dispatch(deleteCoupon(id))
      .unwrap()
      .then(() => {
        toast.success(t("template.coupons.deleted"), { position: "top-center", autoClose: 2500 });
      });
  };

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("template.coupons.pageTitle")} />

      <div className="coupons-shell">
        <AdminSidebar />

        <main className="coupons-main">
          <div className="coupons-header">
            <div>
              <h1>Coupons</h1>
              <p>{t("template.coupons.headerDesc")}</p>
            </div>
          </div>

          <section className="coupons-card">
            <div className="coupons-section-title">
              <Discount />
              <div>
                <h2>Create coupon</h2>
                <p>{t("template.coupons.createDesc")}</p>
              </div>
            </div>

            <form className="coupons-form" onSubmit={handleSubmit}>
              <label>
                {t("template.coupons.code")}
                <input value={formData.code} onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))} />
              </label>
              <label>
                {t("template.coupons.type")}
                <select value={formData.type} onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}>
                  <option value="percent">{t("template.coupons.percent")}</option>
                  <option value="fixed">{t("template.coupons.fixed")}</option>
                </select>
              </label>
              <label>
                {t("template.coupons.value")}
                <input type="number" value={formData.value} onChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))} />
              </label>
              <label>
                {t("template.coupons.minOrder")}
                <input type="number" value={formData.minOrderAmount} onChange={(e) => setFormData((prev) => ({ ...prev, minOrderAmount: e.target.value }))} />
              </label>
              <label>
                {t("template.coupons.expiresAt")}
                <input type="date" value={formData.expiresAt} onChange={(e) => setFormData((prev) => ({ ...prev, expiresAt: e.target.value }))} />
              </label>
              <label>
                {t("template.coupons.status")}
                <select value={String(formData.isActive)} onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.value === "true" }))}>
                  <option value="true">{t("template.coupons.active")}</option>
                  <option value="false">{t("template.coupons.inactive")}</option>
                </select>
              </label>

              <button type="submit" className="coupons-save-btn" disabled={loading}>
                <Save fontSize="small" />
                {loading ? t("template.common.saving") : t("template.coupons.create")}
              </button>
            </form>
          </section>

          <section className="coupons-card">
            <h2>{t("template.coupons.allCoupons")}</h2>
            <div className="coupons-list">
              {coupons.map((coupon) => (
                <article key={coupon._id} className="coupon-item">
                  <div>
                    <strong>{coupon.code}</strong>
                    <p>{coupon.type === "percent" ? `${coupon.value}% off` : `${coupon.value} off`}</p>
                    <span>Min order: {coupon.minOrderAmount || 0}</span>
                  </div>
                  <button type="button" className="coupon-delete-btn" onClick={() => handleDelete(coupon._id)}>
                    <DeleteOutline fontSize="small" />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>
    </>
  );
}

export default CouponsManager;
