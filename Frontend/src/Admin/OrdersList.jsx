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
import { Edit, Delete } from '@mui/icons-material';

function OrdersList() {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { orders, loading, error } = useSelector((state) => state.admin);


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
    if (["Pending", "Confirmed", "Processing", "Shipped"].includes(status)) {
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
          toast.success(t("admin.orders.deleted"), { position: "top-center", autoClose: 2000 });
        })
        .catch(() => {
          toast.error(t("admin.orders.deleteFailed"), { position: "top-center", autoClose: 3000 });
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
                    {order.orderStatus || t("admin.orders.pending")}
                  </td>
                  <td>{order.totalPrice} TND</td>
                  <td>{order.orderItems?.length || 0}</td>
                  <td>

                    <Link to={`/admin/orderUpdate/${order._id}`} className="action-icon edit-icon">

                      <Edit />

                    </Link>

                    <button className="action-icon delete-icon" onClick={() => handleDelete(order._id, order.orderStatus)}>

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
