import React, { useEffect, useState } from "react";
import { AddPhotoAlternate, Add, DeleteOutline, Save, ViewCarousel } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import { clearSettingsError, fetchSiteSettings, updateSiteSettings } from "../features/settings/siteSettingsSlice";
import "../AdminStyles/BannerManager.css";

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function BannerManager() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { settings, loading, saving, error } = useSelector((state) => state.settings);
  const [slides, setSlides] = useState([
    { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "/products" },
  ]);

  useEffect(() => {
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings?.heroSlides?.length) {
      setSlides(settings.heroSlides);
    }
  }, [settings]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(clearSettingsError());
    }
  }, [dispatch, error]);

  const handleSlideChange = (index, field, value) => {
    setSlides((prev) => prev.map((slide, i) => (i === index ? { ...slide, [field]: value } : slide)));
  };

  const handleImageChange = async (event, index) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await toDataUrl(file);
    handleSlideChange(index, "image", image);
  };

  const addSlide = () => {
    setSlides((prev) => [
      ...prev,
      { image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "/products" },
    ]);
  };

  const removeSlide = (index) => {
    setSlides((prev) => {
      if (prev.length === 1) {
        return [{ image: "", title: "", subtitle: "", ctaLabel: "", ctaLink: "/products" }];
      }

      return prev.filter((_, slideIndex) => slideIndex !== index);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const heroSlides = slides.filter((slide) => slide.image || slide.title || slide.subtitle || slide.ctaLabel);

    dispatch(updateSiteSettings({ heroSlides }))
      .unwrap()
      .then(() => {
        toast.success(t("template.banners.updated"), {
          position: "top-center",
          autoClose: 2500,
        });
      });
  };

  return (
    <>
      <Navbar />
      <PageTitle title={t("template.banners.pageTitle")} />

      <div className="banner-manager-shell">
        <AdminSidebar />

        <main className="banner-manager-main">
          <div className="banner-manager-header">
            <div>
              <h1>Banner Management</h1>
              <p>{t("template.banners.headerDesc")}</p>
            </div>
            <div className="banner-manager-actions">
              <button type="button" className="banner-manager-add" onClick={addSlide}>
                <Add fontSize="small" />
                {t("template.banners.addSlide")}
              </button>
              <button type="submit" form="banner-manager-form" className="banner-manager-save" disabled={saving || loading}>
                <Save fontSize="small" />
                {saving ? t("template.common.saving") : t("template.banners.saveBanners")}
              </button>
            </div>
          </div>

          <form id="banner-manager-form" className="banner-manager-grid" onSubmit={handleSubmit}>
            {slides.map((slide, index) => (
              <section className="banner-slide-card" key={index}>
                <div className="banner-slide-head">
                  <div className="banner-slide-title-group">
                    <ViewCarousel />
                    <div>
                      <h2>{t("template.banners.slide")} {index + 1}</h2>
                      <p>{t("template.banners.slideDesc")}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="banner-remove-btn"
                    onClick={() => removeSlide(index)}
                    aria-label={`Remove slide ${index + 1}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>

                <label>
                  {t("template.banners.imageUrl")}
                  <input value={slide.image} onChange={(e) => handleSlideChange(index, "image", e.target.value)} placeholder="https://..." />
                </label>

                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id={`banner-file-${index}`}
                    onChange={(e) => handleImageChange(e, index)}
                  />
                  <label htmlFor={`banner-file-${index}`} className="file-input-label banner-file-input-label">
                    <AddPhotoAlternate fontSize="small" />
                    {t("template.banners.uploadImage")}
                  </label>
                </div>

                {slide.image ? (
                  <div className="banner-preview-wrapper">
                    <img src={slide.image} alt={`Slide ${index + 1}`} className="banner-preview-image" />
                  </div>
                ) : null}

                <label>
                  {t("template.banners.title")}
                  <input value={slide.title} onChange={(e) => handleSlideChange(index, "title", e.target.value)} />
                </label>

                <label>
                  {t("template.banners.subtitle")}
                  <textarea rows="3" value={slide.subtitle} onChange={(e) => handleSlideChange(index, "subtitle", e.target.value)} />
                </label>

                <div className="banner-inline-fields">
                  <label>
                    {t("template.banners.ctaLabel")}
                    <input value={slide.ctaLabel} onChange={(e) => handleSlideChange(index, "ctaLabel", e.target.value)} />
                  </label>
                  <label>
                    {t("template.banners.ctaLink")}
                    <input value={slide.ctaLink} onChange={(e) => handleSlideChange(index, "ctaLink", e.target.value)} />
                  </label>
                </div>
              </section>
            ))}
          </form>
        </main>
      </div>
    </>
  );
}

export default BannerManager;
