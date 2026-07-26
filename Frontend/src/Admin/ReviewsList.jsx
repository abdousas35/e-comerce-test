import React, { useEffect, useState } from "react";
import "../AdminStyles/ReviewsList.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import { Delete } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchAdminProducts, fetchProductReviews, deleteReview } from "../features/admin/adminSlice";
import Loader from "../components/Loader";
import { toast } from "react-toastify";
import GoToDashboard from "../components/GoToDashboard";

function ReviewsList() {
  const { products, loading, reviews } = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const [currentProductId, setCurrentProductId] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        await dispatch(fetchAdminProducts()).unwrap();
      } catch {
        toast.error(t("admin.products.loadFailed"), { position: "top-center", autoClose: 3000 });
      }
    };
    fetchProducts();
  }, [dispatch, t]);

  const handleViewReviews = (productId) => {
    setCurrentProductId(productId);
    dispatch(fetchProductReviews(productId))
      .unwrap()
      .then((res) => {
        if (res.reviews.length === 0) {
          toast.info(t("admin.reviews.noReviewsForProduct"), { position: "top-center", autoClose: 2500 });
        } else {
          toast.success(t("admin.reviews.fetched"), { position: "top-center", autoClose: 2000 });
        }
      })
      .catch(() => {
        toast.error(t("admin.reviews.fetchFailed"), { position: "top-center", autoClose: 3000 });
      });
  };

  const handleDeleteReview = async (reviewId) => {
    if (!currentProductId) return;
    try {
      await dispatch(deleteReview({ reviewId, productId: currentProductId })).unwrap();
      toast.success(t("admin.reviews.deleted"), { position: "top-center", autoClose: 2000 });
      await dispatch(fetchProductReviews(currentProductId)).unwrap();
    } catch {
      toast.error(t("admin.reviews.deleteFailed"), { position: "top-center", autoClose: 3000 });
    }
  };

  if (loading) return <Loader />;

  if (!products || products.length === 0) {
    return (
      <div className="reviews-list-container">
        <h1 className="reviews-list-title">{t("admin.reviews.allReviews")}</h1>
        <p>{t("admin.products.noProducts")}</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("admin.reviews.allReviews")} />

      <div className="reviews-list-container">
        <h1 className="reviews-list-title">{t("admin.products.allProducts")}</h1>
        <table className="reviews-table">
          <thead>
            <tr>
              <th>{t("admin.common.no")}</th>
              <th>{t("admin.products.productName")}</th>
              <th>{t("admin.products.productImage")}</th>
              <th>{t("admin.reviews.numberOfReviews")}</th>
              <th>{t("cart.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product._id}>
                <td>{index + 1}</td>
                <td>{product.name}</td>
                <td><img src={product.image?.[0]?.url || ""} alt={product.name} className="product-image" /></td>
                <td>{product.numOfReviews}</td>
                <td>
                  <button className="action-btn view-btn" onClick={() => handleViewReviews(product._id)}>
                    {t("admin.reviews.viewReviews")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="reviews-details">
          <h2 className="reviews-list-title">{t("admin.reviews.forProduct")}</h2>
          <table className="reviews-table">
            <thead>
              <tr>
                <th>{t("admin.common.no")}</th>
                <th>{t("admin.reviews.reviewerName")}</th>
                <th>{t("admin.reviews.rating")}</th>
                <th>{t("productDetails.comment")}</th>
                <th>{t("cart.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {reviews && reviews.length > 0 ? (
                reviews.map((review, index) => (
                  <tr key={review._id}>
                    <td>{index + 1}</td>
                    <td>{review.name}</td>
                    <td>{review.rating}</td>
                    <td>{review.comment}</td>
                    <td>
                      <button className="action-icon delete-icon" onClick={() => handleDeleteReview(review._id)}>
                        <Delete />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>{t("admin.reviews.noReviewsFound")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default ReviewsList;
