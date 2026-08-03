import React, { useEffect } from "react";
import "../AdminStyles/OrdersList.css";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import Loader from "../components/Loader";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAllOrders, removeErrors, deleteOrder } from "../features/admin/adminSlice";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Edit, Delete, Visibility } from '@mui/icons-material';
import GoToDashboard from "../components/GoToDashboard";

function OrdersList() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { orders, loading, error } = useSelector((state) => state.admin);

  const getTranslatedStatus = (status) => {
    const statusMap = {
      Pending: t("admin.orders.statusOptions.pending"),
      Confirmed: t("admin.orders.statusOptions.confirmed"),
      Processing: t("orders.processing"),
      Shipped: t("admin.orders.statusOptions.shipped"),
      Delivered: t("orders.delivered"),
      Cancelled: t("admin.orders.statusOptions.cancelled"),
    };

    return statusMap[status] || status || t("admin.orders.pending");
  };

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(t("common.somethingWrong"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

const handleDelete = (id, status) => {
  console.log("=== [1] React Component ===");
  console.log("The ID passed from button click is:", id);
  console.log("Type of ID:", typeof id);

  // يمنع الحذف إذا كانت حالة الطلب ليست Delivered ولا Cancelled
  const blockedStatuses = ["Pending", "Confirmed", "Processing", "Shipped"];
  
    if (blockedStatuses.includes(status)) {
      toast.error(t("admin.orders.cannotDeleteProcessing"), {
        position: "top-center",
        autoClose: 3000,
      });
      return;
    }

    if (window.confirm(t("admin.orders.deleteConfirm"))) {
      dispatch(deleteOrder(id))
        .unwrap()
        .then(() => {
          toast.success(t("admin.orders.deleted"), { 
            position: "top-center", 
            autoClose: 2000 
          });
        })
        .catch((err) => {
          // يمكنك إظهار رسالة الخطأ القادمة من الباك إند إذا وجدت
          const errorMessage = err?.message || t("admin.orders.deleteFailed");
          toast.error(errorMessage, { 
            position: "top-center", 
            autoClose: 3000 
          });
        });
    }
  };



  if (loading) {
    return (

      <Loader />

    );
  }

  if (!orders || orders.length === 0) {
    return (

      <>

        <Navbar />
        <div className="ordersList-container">
          <h1 className="ordersList-title">{t("admin.orders.allOrders")}</h1>
          <p className="no-orders">{t("admin.orders.noOrders")}</p>
        </div>

      </>
    );
  }

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.orders.allOrders")} />

      <div className="ordersList-container">
        <h1 className="ordersList-title">{t("admin.orders.section")}</h1>

        <div className="ordersList-table-container">
          <table className="ordersList-table">

            <thead>

              <tr>

                <th>{t("admin.common.no")}</th>
                <th>{t("orders.status")}</th>
                <th>{t("orders.totalPrice")}</th>
                <th>{t("admin.orders.numberOfItems")}</th>
                <th>{t("cart.actions")}</th>

              </tr>

            </thead>

            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>

                  <td>{index + 1}</td>
                  <td className={`order-status ${order.orderStatus ? order.orderStatus.toLowerCase() : ""}`}>
                    {getTranslatedStatus(order.orderStatus)}
                  </td>
                  <td>{order.totalPrice} TND</td>
                  <td>{order.orderItems?.length || 0}</td>
                  <td>
                    <Link to={`/order/${order._id}`} className="action-icon view-icon" title={t("orders.viewOrder")}>
                      <Visibility />
                    </Link>

                    <Link to={`/admin/orderUpdate/${order._id}`} className="action-icon edit-icon" title={t("admin.orders.updateStatus")}>
                      <Edit />
                    </Link>

                    <button className="action-icon delete-icon" onClick={() => handleDelete(order._id, order.orderStatus)} title={t("admin.orders.delete")}>
                      <Delete />
                    </button>
                  </td>

                </tr>

              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default OrdersList;
