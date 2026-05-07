import React, { useEffect, useMemo, useState } from "react";
import { LocalShipping, Search, Inventory2, CheckCircle } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { getOrderDetails, removeErrors } from "../features/Order/orderSlice";
import "../OrderStyles/OrderTracking.css";

const ORDER_FLOW = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

function OrderTracking() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { order, loading, error } = useSelector((state) => state.order);
  const [orderId, setOrderId] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (error && hasSearched) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, hasSearched]);

  const trackingSteps = useMemo(() => {
    const status = order?.orderStatus;
    const statusIndex = ORDER_FLOW.indexOf(status);
    return ORDER_FLOW.map((step, index) => ({
      label: step,
      active: status === "Cancelled" ? false : index <= statusIndex,
      icon: index === 0 ? <Inventory2 /> : index === ORDER_FLOW.length - 1 ? <CheckCircle /> : <LocalShipping />,
    }));
  }, [order]);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!orderId.trim()) {
      toast.error(t("template.tracking.enterOrderId"), { position: "top-center", autoClose: 2500 });
      return;
    }

    setHasSearched(true);
    dispatch(getOrderDetails(orderId.trim()));
  };

  return (
    <>
      <Navbar />
      <PageTitle title={t("template.tracking.pageTitle")} />

      <div className="order-tracking-page">
        <section className="tracking-hero-card">
          <p className="tracking-kicker">{t("template.tracking.kicker")}</p>
          <h1>{t("template.tracking.title")}</h1>
          <p>{t("template.tracking.subtitle")}</p>

          <form className="tracking-search-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={orderId}
              onChange={(event) => setOrderId(event.target.value)}
              placeholder={t("template.tracking.placeholder")}
            />
            <button type="submit" disabled={loading}>
              <Search fontSize="small" />
              {loading ? t("template.tracking.checking") : t("template.tracking.button")}
            </button>
          </form>
        </section>

        {hasSearched && order?._id ? (
          <section className="tracking-result-card">
            <div className="tracking-top">
              <div>
                <span className="tracking-label">{t("orders.orderId")}</span>
                <h2>{order._id}</h2>
              </div>
              <div className={`tracking-badge ${order.orderStatus === "Delivered" ? "delivered" : "processing"}`}>
                {order.orderStatus}
              </div>
            </div>

            <div className="tracking-steps">
              {trackingSteps.map((step) => (
                <div key={step.label} className={`tracking-step ${step.active ? "active" : ""}`}>
                  <div className="tracking-icon">{step.icon}</div>
                  <div>
                    <strong>{step.label}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="tracking-summary-grid">
              <article>
                <h3>{t("orders.shippingInfo")}</h3>
                <p>{order?.shippingInfo?.address || t("template.tracking.noAddress")}</p>
                <p>{order?.shippingInfo?.phoneNumber || t("template.tracking.noPhone")}</p>
              </article>
              <article>
                <h3>{t("orders.orderSummary")}</h3>
                <p>{order?.orderItems?.length || 0} {t("orders.items")}</p>
                <p>Total: {order?.totalPrice}</p>
                <p>Shipping: {order?.shippingPrice}</p>
                {order?.trackingNumber ? <p>Tracking: {order.trackingNumber}</p> : null}
                {order?.courier ? <p>Courier: {order.courier}</p> : null}
              </article>
            </div>
          </section>
        ) : null}
      </div>

      <Footer />
    </>
  );
}

export default OrderTracking;
