import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useTranslation } from "react-i18next";
import Product from "./Product";
import "../componentStyles/ProductSections.css";

function ProductSections() {
  const { t } = useTranslation();
  const [sections, setSections] = useState([]);

  useEffect(() => {
    axios.get("/api/v1/homepage-sections")
      .then((res) => setSections(res.data.sections || []))
      .catch(() => setSections([]));
  }, []);

  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => (
        <section className="product-section" key={section._id}>
          <div className="product-section-header">
            <h2>{section.name}</h2>
            <Link to={`/products?section=${section._id}`} className="product-section-view-all">
              {t("home.productSections.viewAll")}
            </Link>
          </div>

          <div className="product-section-row">
            {section.products.map((product) => (
              <div className="product-section-item" key={product._id}>
                <Product product={product} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

export default ProductSections;
