import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import "../componentStyles/CategoryShowcase.css";
import { useScrollReveal } from "../hooks/useScrollReveal.js";

function CategoryShowcase() {
  const { t } = useTranslation();
  const { settings } = useSelector((state) => state.settings);
  const [ref, isVisible] = useScrollReveal();

  const tiles = (settings?.categoryShowcase || [])
    .filter((item) => item.isFeatured !== false && item.image?.url && item.categoryName)
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  if (tiles.length === 0) return null;

  return (
    <section ref={ref} className={`category-showcase ${isVisible ? "reveal-visible" : "reveal-hidden"}`}>
      <div className="category-showcase-header">
        <span className="category-showcase-eyebrow">{t("home.categoryShowcase.eyebrow")}</span>
        <h2>{t("home.categoryShowcase.title")}</h2>
      </div>

      <div className="category-showcase-grid">
        {tiles.map((item) => (
          <Link
            to={`/products?category=${encodeURIComponent(item.categoryName)}`}
            key={item._id || item.categoryName}
            className={`category-showcase-card ${item.size === "large" ? "large" : "small"}`}
            style={{ backgroundImage: `url(${item.image.url})` }}
          >
            <div className="category-showcase-overlay">
              {item.subtitle ? <span className="category-showcase-subtitle">{item.subtitle}</span> : null}
              <h3 className="category-showcase-title">{item.title || item.categoryName}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryShowcase;
