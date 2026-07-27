import React from "react";
import "../componentStyles/Product.css";
import { Link } from "react-router-dom";
import Rating from "./Rating";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";



function Product({product}) {

    const [rating, setrating] = useState(0);
    const { t } = useTranslation();
    const handleRatingChange = (newRating) => {

        setrating(newRating);

    }
    const navigate = useNavigate();


  return (
    <div className="product-card">
      <Link to={`/product/${product._id}`} className="product_id">
        <div className="product-media">
          <img src={product.image[0]?.url || "/images/default.jpg"} alt={product.name} className="product-image-card" />
        </div>

        <div className="product-details">
          <h3 className="product-title">{product.name}</h3>

          <p className="product-price">
            <strong>{t("product.price")}: {product.price}</strong>
          </p>

          <div className="rating-container">
            <Rating
              value={product.ratings}
              onRatingChange={handleRatingChange}
              disabled={true}
            />
          </div>

          <span className="productCardSpan">
            ({product.numOfReviews}){" "}
            {product.numOfReviews == 1
              ? t("product.review")
              : t("product.reviews")}
          </span>
        </div>
      </Link>

        <button className="add-to-cart" onClick={() => navigate(`/product/${product._id}`)}>
          {t("product.MoreInfo")}
        </button>
    </div>
  )
}

export default Product
