import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader";
import PageTitle from "../components/PageTitle";
import { fetchWishlist, toggleWishlist } from "../features/user/userSlice";
import "./WishlistStyles.css";

function Wishlist() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { wishlist, wishlistLoading, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading) return <Loader />;

  return (
    <>
      <PageTitle title={t("wishlist.pageTitle")} />
      <Navbar />
      <div className="wishlist-page">
        <h2>{t("wishlist.title")}</h2>
        {wishlist.length === 0 ? (
          <p className="wishlist-empty">{t("wishlist.empty")}</p>
        ) : (
          <div className="wishlist-grid">
            {wishlist.map((product) => {
              const discounted = Math.max(0, product.price - (product.discount || 0));
              return (
                <div className="wishlist-card" key={product._id}>
                  <Link to={`/product/${product._id}`}>
                    <img src={product.image?.[0]?.url} alt={product.name} />
                    <p className="wishlist-card-name">{product.name}</p>
                    <p className="wishlist-card-price">{discounted.toFixed(2)} TND</p>
                  </Link>
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => dispatch(toggleWishlist(product._id))}
                    disabled={wishlistLoading}
                  >
                    ✕ {t("wishlist.remove")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
