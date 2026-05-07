import React, { useEffect } from "react";
import "../OrderStyles/OrderDetails.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { getOrderDetails, removeErrors } from "../features/Order/orderSlice";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";

function OrderDetails() {
  const { id } = useParams();
  const { order, error, loading } = useSelector((state) => state.order);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    if (id) {
      dispatch(getOrderDetails(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      toast.error(t("orders.loadDetailsFailed"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

  if (loading) {
    return (
      <>
        <Navbar />
        <PageTitle title={t("orders.detailsPageTitle")} />
        <div className="order-box">{t("common.loading")}...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTitle title={t("orders.detailsPageTitle")} />

      <div className="order-box">
        <div className="table-block">
          <h2 className="table-title">{order?.orderItems?.length === 1 ? t("orders.item") : t("orders.items")}</h2>
          <table className="table-main">
            <thead>
              <tr>
                <th className="head-cell">{t("orderConfirm.image")}</th>
                <th className="head-cell">{t("cart.product")}</th>
                <th className="head-cell">{t("cart.quantity")}</th>
                <th className="head-cell">{t("product.price")}</th>
              </tr>
            </thead>
            <tbody>
              {order?.orderItems?.map((item) => (
                <tr key={item._id} className="table-row">
                  <td className="table-cell"><img src={item.image} alt={item.name} className="item-img" /></td>
                  <td className="table-cell">{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ""}</td>
                  <td className="table-cell">{item.quantity}</td>
                  <td className="table-cell">{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="table-block">
          <h2 className="table-title">{t("orders.shippingInfo")}</h2>
          <table>
            <tbody>
              <tr className="table-row">
                <th className="table-cell">{t("cart.address")}</th>
                <td className="table-cell shipping-info">{order?.shippingInfo?.address}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">{t("cart.phoneNumber")}</th>
                <td className="table-cell shipping-info">{order?.shippingInfo?.phoneNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="table-block">
          <h2 className="table-title">{t("orders.orderSummary")}</h2>
          <table className="table-main">
            <tbody>
              <tr className="table-row">
                <th className="table-cell">{t("orders.status")}</th>
                <td className="table-cell">
                  <span className={`status-tag ${String(order?.orderStatus || "").toLowerCase()}`}>{order?.orderStatus}</span>
                </td>
              </tr>
              {order?.trackingNumber ? (
                <tr className="table-row">
                  <th className="table-cell">Tracking</th>
                  <td className="table-cell">{order.trackingNumber}</td>
                </tr>
              ) : null}
              {order?.courier ? (
                <tr className="table-row">
                  <th className="table-cell">Courier</th>
                  <td className="table-cell">{order.courier}</td>
                </tr>
              ) : null}
              <tr className="table-row">
                <th className="table-cell">{order?.orderItems?.length === 1 ? t("orders.itemPrice") : t("orders.itemsPrice")}</th>
                <td className="table-cell">{order?.itemPrice}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">{t("orderConfirm.shippingCharges")}</th>
                <td className="table-cell">{order?.shippingPrice}</td>
              </tr>
              <tr className="table-row">
                <th className="table-cell">{t("cart.total")}</th>
                <td className="table-cell">{order?.totalPrice}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <Footer />
    </>
  );
}

export default OrderDetails;
