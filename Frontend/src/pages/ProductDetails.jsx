import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import "../pageStyles/ProductDetails.css";
import PageTitle from "../components/PageTitle";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import Rating from "../components/Rating";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getProductDetails, createReview, removeSuccess, removeErrors } from "../features/products/productSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import MetaTags from "../components/MetaTags";
import { addItemsToCart, setQuickBuyItem, removeMessage, removeErrors as removeCartErrors } from "../features/cart/cartSlice";
import axios from "axios";

function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [selectedImage, setSelectedImage] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [selectedValues, setSelectedValues] = useState({});
  const [relatedProducts, setRelatedProducts] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const { loading, error, product, reviewSuccess, reviewLoading } = useSelector((state) => state.product);
  const { loading: cartLoading, message, error: cartError } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.user);
  const { settings } = useSelector((state) => state.settings);

  const optionGroups = product?.optionGroups || [];
  const combinations = product?.combinations || [];

  const availableValuesForGroup = (groupName) => {
    const otherSelections = Object.entries(selectedValues).filter(([name]) => name !== groupName);
    return Array.from(new Set(
      combinations
        .filter((combo) => otherSelections.every(([name, value]) => combo.selections.some((selection) => selection.groupName === name && selection.value === value)))
        .flatMap((combo) => combo.selections.filter((selection) => selection.groupName === groupName).map((selection) => selection.value))
    ));
  };

  const matchingCombo = useMemo(() => {
    if (optionGroups.length === 0) return null;
    if (optionGroups.some((group) => !selectedValues[group.name])) {
      return null;
    }
    return combinations.find((combo) => {
      const selectionMap = new Map(combo.selections.map((selection) => [selection.groupName, selection.value]));
      return optionGroups.every((group) => selectionMap.get(group.name) === selectedValues[group.name]);
    }) || null;
  }, [combinations, optionGroups, selectedValues]);

  const effectiveStock = useMemo(() => {
    if (matchingCombo) return Number(matchingCombo.stock ?? 0);
    return product?.stock ?? 0;
  }, [matchingCombo, product]);

  const effectivePrice = useMemo(() => {
    if (matchingCombo) return Number(matchingCombo.price ?? product?.price ?? 0);
    return product?.price ?? 0;
  }, [matchingCombo, product]);

  const discountAmount = Number(product?.discount || 0);
  const discountedPrice = Math.max(0, effectivePrice - discountAmount);

  const increase = () => {
    if (quantity >= effectiveStock) {
      toast.error(t("productDetails.quantityStock"), { position: "top-center", autoClose: 3000 });
    } else {
      setQuantity((prev) => prev + 1);
    }
  };

  const decrease = () => {
    if (quantity <= 1) {
      toast.error(t("productDetails.quantityMin"), { position: "top-center", autoClose: 3000 });
    } else {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleRatingChange = (newRating) => setUserRating(newRating || 0);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!userRating) {
      toast.error(t("productDetails.selectRating"), { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(createReview({ rating: userRating, comment, productId: id }));
  };

  const handleOptionSelect = (groupName, value) => {
    setSelectedValues((prev) => {
      const next = { ...prev, [groupName]: value };
      return Object.fromEntries(Object.entries(next).filter(([name, selectedValue]) => {
        if (name === groupName) return true;
        return availableValuesForGroup(name).includes(selectedValue);
      }));
    });
  };

  const allGroupsSelected = optionGroups.every((group) => selectedValues[group.name]);

  const addToCart = () => {
    if (optionGroups.length > 0 && !allGroupsSelected) {
      toast.error(t("productDetails.selectVariant"), { position: "top-center", autoClose: 3000 });
      return;
    }
    if (!product || effectiveStock === 0) {
      toast.error(t("productDetails.outOfStock"), { position: "top-center", autoClose: 3000 });
      return;
    }
    if (!matchingCombo) {
      toast.error(t("productDetails.selectVariant"), { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(addItemsToCart({ id, quantity, comboId: matchingCombo._id, product }));
  };

  const buildQuickBuyItem = () => {
    const itemPrice = Math.max(0, effectivePrice - discountAmount);
    return {
      cartKey: `${product._id}-${matchingCombo?._id || "default"}`,
      product: product._id,
      name: product.name,
      price: itemPrice,
      image: matchingCombo?.images?.[0]?.url || selectedImage || product.image?.[0]?.url || "",
      stock: effectiveStock,
      selectedOptions: selectedValues,
      quantity,
    };
  };

  const buyNow = () => {
    if (optionGroups.length > 0 && !allGroupsSelected) {
      toast.error(t("productDetails.selectVariant"), { position: "top-center", autoClose: 3000 });
      return;
    }
    if (!product || effectiveStock === 0) {
      toast.error(t("productDetails.outOfStock"), { position: "top-center", autoClose: 3000 });
      return;
    }
    dispatch(setQuickBuyItem(buildQuickBuyItem()));
    navigate("/shipping");
  };

  useEffect(() => {
    if (id) dispatch(getProductDetails(id));
    return () => dispatch(removeErrors());
  }, [dispatch, id]);

  useEffect(() => {
    if (id) {
      axios.get(`/api/v1/product/${id}/related`)
        .then(res => setRelatedProducts(res.data.products || []))
        .catch(() => {});
    }
  }, [id]);

  useEffect(() => {
    if (error) {
      toast.error(t("productDetails.loadFailed"), { position: "top-center", autoClose: 3000 });
      dispatch(removeErrors());
    }
  }, [dispatch, error, t]);

  useEffect(() => {
    if (message) {
      toast.success(message, { position: "top-center", autoClose: 3000 });
      dispatch(removeMessage());
    }
  }, [message, dispatch]);

  useEffect(() => {
    if (cartError) {
      toast.error(cartError, { position: "top-center", autoClose: 3000 });
      dispatch(removeCartErrors());
    }
  }, [cartError, dispatch]);

  useEffect(() => {
    if (reviewSuccess) {
      toast.success(t("productDetails.reviewSuccess"), { position: "top-center", autoClose: 3000 });
      setUserRating(0);
      setComment("");
      dispatch(removeSuccess());
      dispatch(getProductDetails(id));
    }
  }, [reviewSuccess, id, dispatch, t]);

  useEffect(() => {
    if (product && product.image && product.image.length > 0) {
      setSelectedImage(product.image[0].url);
      setQuantity(1);
      setSelectedValues({});
    }
  }, [product]);

  if (loading || cartLoading || reviewLoading) return <Loader />;
  if (error || !product) {
    return (
      <>
        <PageTitle title={t("productDetails.pageTitle")} />
        <Navbar />
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${product?.name || "Product"} - ${settings?.storeName || "Store"}`}</title>
        <meta name="description" content={product?.description || "Explore this product in our store."} />
      </Helmet>
      <PageTitle title={`${product?.name} - ${t("productDetails.pageSuffix")}`} />
      <MetaTags
        title={`${product?.name} | ${product?.storeName || "Store"}`}
        description={product?.description}
        keywords={product?.keywords || product?.name}
        image={selectedImage || product?.image?.[0]?.url}
        path={`/product/${id}`}
        type="product"
        schema={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: product?.name,
          description: product?.description,
          image: product?.image?.map((item) => item.url),
          sku: product?._id,
          offers: {
            "@type": "Offer",
            priceCurrency: "USD",
            price: effectivePrice,
            availability: effectiveStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          },
          aggregateRating: product?.numOfReviews
            ? { "@type": "AggregateRating", ratingValue: product?.ratings || 0, reviewCount: product?.numOfReviews || 0 }
            : undefined,
        }}
      />
      <Navbar />

      <div className="product-details-container fade-in">
        <div className="product-detail-container">
          <div className="product-image-container">
            <img src={selectedImage} alt={product?.name || t("productDetails.productAlt")} className="product-detail-image" />
            {product.image.length > 1 && (
              <div className="product-thumbnails">
                {product.image.map((img, index) => (
                  <img src={img.url} alt={`${t("productDetails.thumbnail")} ${index + 1}`} className="thumbnail-image" onClick={() => setSelectedImage(img.url)} key={img.url} />
                ))}
              </div>
            )}
          </div>

          <div className="product-info">
            <h2>{product.name}</h2>
            <p className="product-description">{product.description}</p>
            <div className="price-row">
              <span className="product-price">
                {t("product.price")} : {discountAmount > 0 ? discountedPrice.toFixed(2) : effectivePrice.toFixed(2)}
              </span>
              {discountAmount > 0 && <span className="old-price">{effectivePrice.toFixed(2)}</span>}
            </div>
            {discountAmount > 0 && <div className="discount-tag">-{discountAmount.toFixed(2)}</div>}

            <div className="product-rating">
              <Rating value={product.ratings} disabled={true} />
              <span className="productCardSpan">({product.numOfReviews} {product.numOfReviews === 1 ? t("product.review") : t("product.reviews")})</span>
            </div>

            <div className="stock-status">
              <span className="in-stock" style={{ color: effectiveStock === 0 ? "var(--danger-color)" : "var(--success-color)" }}>
                {effectiveStock === 0 ? t("productDetails.outOfStockLabel") : t("productDetails.inStock", { count: effectiveStock })}
              </span>
            </div>

            {optionGroups.map((group) => {
              const availableValues = availableValuesForGroup(group.name);
              return (
                <div className="variant-selector" key={group.name}>
                  <span className="quantity-label">{group.name}:</span>
                  <select
                    value={selectedValues[group.name] || ""}
                    onChange={(e) => handleOptionSelect(group.name, e.target.value)}
                  >
                    <option value="" disabled>{t("productDetails.selectVariant")}</option>
                    {(group.values || []).filter((value) => availableValues.length === 0 || availableValues.includes(value)).map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </div>
              );
            })}

            {effectiveStock > 0 && (
              <div className="quantity-controls">
                <span className="quantity-label">{t("productDetails.quantity")}:</span>
                <button className="quantity-button" onClick={decrease}>-</button>
                <input type="text" value={quantity} className="quantity-value" readOnly />
                <button className="quantity-button" onClick={increase}>+</button>
              </div>
            )}

            <div className="action-buttons">
              <button className="add-to-cart-btn" onClick={addToCart}>{t("product.addToCart")}</button>
              <button type="button" className="buy-now-btn" onClick={buyNow}>{t("product.buyNow")}</button>
            </div>

            {isAuthenticated ? (
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <h3>{t("productDetails.writeReview")}</h3>
                <Rating value={userRating || 0} onRatingChange={handleRatingChange} disabled={false} />
                <textarea placeholder={t("productDetails.reviewPlaceholder")} required className="review-input" value={comment} onChange={(e) => setComment(e.target.value)}></textarea>
                <button className="submit-review-btn" disabled={reviewLoading}>{t("productDetails.submitReview")}</button>
              </form>
            ) : (
              <div className="review-login-note">
                {t("productDetails.reviewLoginPrompt")} <Link to="/login">{t("productDetails.login")}</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="reviews-container">
        <h3>{t("productDetails.customerReviews")} :</h3>
        {product.reviews && product.reviews.length > 0 ? (
          <div className="review-section">
            {product.reviews.map((review, index) => (
              <div className="review-item" key={index}>
                <div className="review-header">
                  <p className="review-name">{review.name}</p>
                  <Rating value={review.rating} disabled={true} />
                </div>
                <p>{t("productDetails.comment")} :</p>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-reviews">{t("productDetails.noReviews")}</p>
        )}
      </div>

      <div className="sticky-action-bar">
        <div className="sticky-price-info">
          <span className="price-value">{discountAmount > 0 ? discountedPrice.toFixed(2) : effectivePrice.toFixed(2)} TND</span>
          {discountAmount > 0 && <span className="old-price">{effectivePrice.toFixed(2)} TND</span>}
        </div>
        <div className="sticky-buttons">
          <button className="add-to-cart-btn" onClick={addToCart}>{t("product.addToCart")}</button>
          <button type="button" className="buy-now-btn" onClick={buyNow}>{t("product.buyNow")}</button>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="related-products-section">
          <h3>{t("productDetails.relatedProducts")}</h3>
          <div className="related-products-grid">
            {relatedProducts.map(p => (
              <Link to={`/product/${p._id}`} key={p._id} className="related-product-card">
                <img src={p.image?.[0]?.url} alt={p.name} />
                <p className="related-product-name">{p.name}</p>
                <p className="related-product-price">{Math.max(0, p.price - (p.discount || 0)).toFixed(2)} TND</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

export default ProductDetails;