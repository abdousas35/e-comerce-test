import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "../componentStyles/ImageSlider.css";

function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef(null);
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { settings } = useSelector((state) => state.settings);
  const slides = settings?.heroSlides?.length ? settings.heroSlides : [];

  useEffect(() => {
    if (slides.length <= 1) return undefined;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slides.length]);

  const handleTransitionEnd = () => {
    if (!slides.length) return;

    if (currentIndex >= slides.length) {
      sliderRef.current.style.transition = "none";
      setCurrentIndex(0);
      sliderRef.current.style.transform = `translateX(0%)`;
      setTimeout(() => {
        sliderRef.current.style.transition = "transform 0.8s ease-in-out";
      }, 50);
    }
  };

  return (
    <div className="image-slider-container">
      <div
        className="slider-images"
        ref={sliderRef}
        style={{
          transform: `translateX(${isRtl ? "" : "-"}${currentIndex * 100}%)`,
          transition: "transform 0.8s ease-in-out",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {slides.map((slide, index) => (
          <div className="slider-item" key={index}>
            <img src={slide.image || settings?.heroImage} alt={slide.title || t("imageSlider.slideAlt", { index: index + 1 })} />
            <div className="slider-overlay">
              <p className="slider-eyebrow">{settings?.tagline}</p>
              <h1>{slide.title || settings?.heroTitle}</h1>
              <p>{slide.subtitle || settings?.heroSubtitle}</p>
              <div className="slider-actions">
                <Link to={slide.ctaLink || "/products"} className="slider-primary-btn">
                  {slide.ctaLabel || "Explore now"}
                </Link>
                <Link to="/products" className="slider-secondary-btn">
                  {t("navbar.products")}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 0 ? (
          <div className="slider-item">
            <img src={slides[0].image || settings?.heroImage} alt={t("imageSlider.slideCloneAlt")} />
            <div className="slider-overlay">
              <p className="slider-eyebrow">{settings?.tagline}</p>
              <h1>{slides[0].title || settings?.heroTitle}</h1>
              <p>{slides[0].subtitle || settings?.heroSubtitle}</p>
              <div className="slider-actions">
                <Link to={slides[0].ctaLink || "/products"} className="slider-primary-btn">
                  {slides[0].ctaLabel || "Explore now"}
                </Link>
                <Link to="/products" className="slider-secondary-btn">
                  {t("navbar.products")}
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="slider-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === (currentIndex % slides.length) ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default ImageSlider;
