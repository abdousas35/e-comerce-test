import React from "react";
import "../CartStyles/OrderConfirm.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { createOrder, removeSuccess } from "../features/Order/orderSlice";
import { clearCart } from "../features/cart/cartSlice";

function OrderConfirm() {
  const { shippingInfo, cartItems } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  const { loading } = useSelector((state) => state.order);
  const { settings } = useSelector((state) => state.settings);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [couponCode, setCouponCode] = React.useState("");
  const [discount, setDiscount] = React.useState(0);
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [couponLoading, setCouponLoading] = React.useState(false);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const matchedZone = settings?.shippingZones?.find((zone) => zone.state === shippingInfo?.selectedState);
  const shipping =
    settings?.freeShippingThreshold && subtotal >= settings.freeShippingThreshold
      ? 0
      : Number(matchedZone?.rate ?? settings?.defaultShippingRate ?? 0);
  const total = subtotal + shipping - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error(t("template.coupons.enterCode"), { position: "top-center", autoClose: 2500 });
      return;
    }

    try {
      setCouponLoading(true);
      const { data } = await axios.get(`/api/v1/coupon/${couponCode.trim()}?orderAmount=${subtotal + shipping}`);
      setDiscount(data.discountAmount || 0);
      setAppliedCoupon(data.coupon);
      toast.success(t("template.coupons.applied"), { position: "top-center", autoClose: 2500 });
    } catch (error) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(error.response?.data?.message || t("template.coupons.applyFailed"), { position: "top-center", autoClose: 2500 });
    } finally {
      setCouponLoading(false);
    }
  };

  const confirmOrder = () => {
    try {
      const orderData = {
        shippingInfo: {
          address: shippingInfo.address,
          city: shippingInfo.selectedCity,
          state: shippingInfo.selectedState,
          pincode: shippingInfo.pincode,
          country: shippingInfo.country || "Tunisia",
          phoneNumber: shippingInfo.phoneNumber,
        },
        orderItems: cartItems.map((item) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          product: item.product,
          variantId: item.variantId || "",
          variantLabel: item.variantLabel || "",
          selectedOptions: item.selectedOptions || {},
          sku: item.sku || "",
        })),
        itemPrice: subtotal,
        taxPrice: 0,
        shippingPrice: shipping,
        discountPrice: discount,
        totalPrice: total,
        couponCode: appliedCoupon?.code || "",
      };

      dispatch(createOrder(orderData))
        .unwrap()
        .then(() => {
          toast.success(t("orderConfirm.success"), { position: "top-center", autoClose: 3000 });
          dispatch(clearCart());
          dispatch(removeSuccess());
          navigate("/orders/user");
        })
        .catch(() => {
          toast.error(t("orderConfirm.createFailed"), { position: "top-center", autoClose: 3000 });
        });
    } catch (error) {
      toast.error(t("orderConfirm.confirmFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <>
          <Navbar />
          <PageTitle title={t("orderConfirm.pageTitle")} />

          <div className="confirm-container">
            <h1 className="confirm-header">{t("orderConfirm.title")}</h1>
            <div className="confirm-table-container">
              <table className="confirm-table">
                <caption>{t("orderConfirm.shippingDetails")}</caption>
                <thead>
                  <tr>
                    <th>{t("user.common.name")}</th>
                    <th>{t("cart.phoneNumber")}</th>
                    <th>{t("cart.address")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{user.name}</td>
                    <td>{shippingInfo.phoneNumber}</td>
                    <td>{shippingInfo.address}, {shippingInfo.selectedCity}, {shippingInfo.selectedState}, {shippingInfo.pincode}</td>
                  </tr>
                </tbody>
              </table>

              <table className="confirm-table">
                <caption>{t("orderConfirm.cartItems")}</caption>
                <thead>
                  <tr>
                    <th>{t("orderConfirm.image")}</th>
                    <th>{t("cart.product")}</th>
                    <th>{t("product.price")}</th>
                    <th>{t("cart.quantity")}</th>
                    <th>{t("orderConfirm.totalPrice")}</th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item.cartKey || item.product}>
                      <td><img src={item.image} alt={item.name} className="order-product-image" /></td>
                      <td>{item.name}{item.variantLabel ? ` (${item.variantLabel})` : ""}</td>
                      <td>{item.price}</td>
                      <td>{item.quantity}</td>
                      <td>{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <table className="confirm-table">
                <caption>{t("orderConfirm.orderSummary")}</caption>
                <thead>
                  <tr>
                    <th>{t("cart.subtotal")}</th>
                    <th>{t("orderConfirm.shippingCharges")}</th>
                    <th>{t("template.coupons.discount")}</th>
                    <th>{t("cart.total")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>{subtotal}</td>
                    <td>{shipping}</td>
                    <td>{discount}</td>
                    <td>{total}</td>
                  </tr>
                </tbody>
              </table>

              <div className="coupon-box">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder={t("template.coupons.enterCode")}
                />
                <button type="button" className="proceed-button" onClick={applyCoupon}>
                  {couponLoading ? t("template.coupons.applying") : t("template.coupons.apply")}
                </button>
              </div>
            </div>

            <button className="proceed-button" onClick={confirmOrder}>{t("orderConfirm.confirmOrder")}</button>
          </div>

          <Footer />
        </>
      )}
    </>
  );
}

export default OrderConfirm;
