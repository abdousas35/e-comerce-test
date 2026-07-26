import React, { useEffect, useState } from "react";
import "../AdminStyles/ProductsList.css";
import Navbar from "../components/Navbar";
import Loader from "../components/Loader";
import PageTitle from "../components/PageTitle";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAdminProducts, removeErrors, deleteProduct, importProductsCsv } from "../features/admin/adminSlice";
import { Link } from "react-router-dom";
import { Edit, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";
import GoToDashboard from "../components/GoToDashboard";

function ProductsList() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.admin);
  const { t } = useTranslation();
  const [csvFileName, setCsvFileName] = useState("");

  const handleCsvImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const csvText = await file.text();
      await dispatch(importProductsCsv({ csvText })).unwrap();
      setCsvFileName(file.name);
      toast.success(t("admin.products.importSuccess"), { position: "top-center" });
      dispatch(fetchAdminProducts());
    } catch (importError) {
      toast.error(importError || t("admin.products.importFailed"), { position: "top-center" });
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    dispatch(fetchAdminProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(t("common.somethingWrong"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

  const handleDelete = async (id) => {
    if (window.confirm(t("admin.products.deleteConfirm"))) {
      try {
        await dispatch(deleteProduct(id)).unwrap();
        toast.success(t("admin.products.deleted"), { position: "top-center" });
        dispatch(fetchAdminProducts());
      } catch {
        toast.error(t("admin.products.deleteFailed"), { position: "top-center" });
      }
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="product-list-container">
        <h1 className="product-list-title">{t("admin.products.pageTitle")}</h1>
        <p className="no-admin-products">{t("admin.products.noProducts")}</p>
      </div>
    );
  }

  if (loading) return <Loader />;

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.products.pageTitle")} />

      <div className="product-list">
        <h1 className="product-list-title">{t("admin.products.allProducts")}</h1>

        {loading ? (
          <Loader />
        ) : error ? (
          <p className="error">{t("common.somethingWrong")}</p>
        ) : (
          <table className="product-table">
            <thead>
              <tr>
                <th>{t("admin.common.no")}</th>
                <th>{t("admin.products.productImage")}</th>
                <th>{t("admin.products.productName")}</th>
                <th>{t("product.price")}</th>
                <th>{t("admin.products.ratings")}</th>
                <th>{t("admin.common.stock")}</th>
                <th>Variants</th>
                <th>{t("admin.common.createdAt")}</th>
                <th>{t("cart.actions")}</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product, index) => (
                <tr key={product._id}>
                  <td>{index + 1}</td>
                  <td><img src={product.image?.[0]?.url} alt={product.name} className="admin-product-image" /></td>
                  <td>{product.name}</td>
                  <td>${product.price}</td>
                  <td>{product.ratings}</td>
                  <td>{product.stock}</td>
                  <td>{product.variants?.length || 0}</td>
                  <td>{new Date(product.createdAt).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/admin/product/${product._id}`} className="action-icon edit-icon"><Edit /></Link>
                    <button className="action-icon delete-icon" onClick={() => handleDelete(product._id)}><Delete /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

export default ProductsList;
