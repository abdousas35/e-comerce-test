import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import "../pageStyles/Products.css";
import PageTitle from "../components/PageTitle";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Loader from "../components/Loader.jsx";
import MetaTags from "../components/MetaTags";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Product from "../components/Product";
import { getProduct, removeErrors } from "../features/products/productSlice";
import { useLocation, useNavigate } from "react-router-dom";
import Pagination from "../components/Pagination.jsx";

function Products() {
  const { loading, error, products } = useSelector((state) => state.product);
  const { settings } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get("keyword") || "";
  const pageFromURL = parseInt(searchParams.get("page"), 10) || 1;
  const [currentPage, setCurrentPage] = useState(pageFromURL);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch({ type: "product/clearProducts" });
    dispatch(getProduct({ keyword, page: currentPage, limit: 8 }));
  }, [dispatch, keyword, currentPage]);

  useEffect(() => {
    if (error) {
      dispatch(removeErrors());
    }
  }, [dispatch, error]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      setCurrentPage(page);
      const newSearchParams = new URLSearchParams(location.search);
      if (page === 1) {
        newSearchParams.delete("page");
      } else {
        newSearchParams.set("page", page);
      }

      newSearchParams.set("limit", 8);
      navigate(`?${newSearchParams.toString()}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>{`${t("products.pageTitle")} - ${settings?.storeName || "Store"}`}</title>
        <meta
          name="description"
          content={`${settings?.storeName || "Store"} catalog includes ${products.length || "multiple"} products for browsing, searching, and ordering online with a simple and secure checkout experience.`}
        />
      </Helmet>
      <PageTitle title={t("products.pageTitle")} />
      <MetaTags
        title={`${t("products.pageTitle")} | ${settings?.storeName || "Store"}`}
        description={keyword ? `Browse products matching ${keyword}` : "Browse the full product catalog."}
        keywords={keyword ? `${keyword}, products, catalog` : "products, catalog, ecommerce"}
        image={settings?.heroImage || settings?.logo}
        path={`/products${location.search}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `${settings?.storeName || "Store"} product catalog`,
          description: keyword ? `Browse products matching ${keyword}` : "Browse the full product catalog.",
        }}
      />
      <Navbar />
      {loading ? (
        <Loader />
      ) : (
        <div className="products-layout fade-in">
          <div className="products-section">
            <div className="products-product-container">
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => <Product key={product._id} product={product} />)
              ) : (
                <p className="no-products">
                  <span className="no-products-big">!</span>{" "}
                  <span className="no-products-bold">{t("products.noProducts")}</span>{" "}
                  <span className="no-products-small">{t("products.noProductsDesc", { keyword })}</span>
                </p>
              )}
            </div>

            <Pagination currentPage={currentPage} onPageChange={handlePageChange} />
          </div>
        </div>
      )}
      {products && products.length > 0 && <Footer />}
    </>
  );
}

export default Products;
