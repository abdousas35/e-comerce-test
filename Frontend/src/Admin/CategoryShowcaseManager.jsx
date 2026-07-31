import React, { useEffect, useState } from "react";
import { AddPhotoAlternate, Add, DeleteOutline, Save, GridView } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import axios from "axios";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import { clearSettingsError, fetchSiteSettings, updateSiteSettings } from "../features/settings/siteSettingsSlice";
import "../AdminStyles/BannerManager.css";
import "../AdminStyles/CategoryShowcaseManager.css";
import GoToDashboard from "../components/GoToDashboard";

const generateId = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const createEmptyItem = () => ({
  clientId: generateId(),
  categoryName: "",
  image: null,
  title: "",
  subtitle: "",
  size: "small",
  order: 0,
  isFeatured: true,
});

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function CategoryShowcaseManager() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { settings, loading, saving, error } = useSelector((state) => state.settings);
  const [items, setItems] = useState([createEmptyItem()]);
  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    axios.get("/api/v1/products/categories")
      .then((res) => setAvailableCategories(res.data.categories || []))
      .catch(() => setAvailableCategories([]));
  }, []);

  useEffect(() => {
    if (settings?.categoryShowcase?.length) {
      setItems(settings.categoryShowcase.map((item) => ({
        clientId: item._id || generateId(),
        categoryName: item.categoryName || "",
        image: item.image || null,
        title: item.title || "",
        subtitle: item.subtitle || "",
        size: item.size || "small",
        order: item.order ?? 0,
        isFeatured: item.isFeatured !== false,
      })));
    }
  }, [settings]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(clearSettingsError());
    }
  }, [dispatch, error]);

  const updateItem = (clientId, field, value) => {
    setItems((prev) => prev.map((item) => (item.clientId === clientId ? { ...item, [field]: value } : item)));
  };

  const handleImageChange = async (event, clientId) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const image = await toDataUrl(file);
    updateItem(clientId, "image", image);
  };

  const addItem = () => {
    setItems((prev) => [...prev, createEmptyItem()]);
  };

  const removeItem = (clientId) => {
    setItems((prev) => {
      if (prev.length === 1) return [createEmptyItem()];
      return prev.filter((item) => item.clientId !== clientId);
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const categoryShowcase = items
      .filter((item) => item.categoryName.trim())
      .map((item) => ({
        categoryName: item.categoryName.trim(),
        image: item.image,
        title: item.title,
        subtitle: item.subtitle,
        size: item.size,
        order: Number(item.order) || 0,
        isFeatured: item.isFeatured,
      }));

    dispatch(updateSiteSettings({ categoryShowcase }))
      .unwrap()
      .then(() => {
        toast.success(t("template.categoryShowcase.updated"), {
          position: "top-center",
          autoClose: 2500,
        });
      });
  };

  return (
    <>
      <Navbar />
      <GoToDashboard />
      <PageTitle title={t("template.categoryShowcase.pageTitle")} />

      <div className="banner-manager-shell">
        <AdminSidebar />

        <main className="banner-manager-main">
          <div className="banner-manager-header">
            <div>
              <h1>{t("template.categoryShowcase.pageTitle")}</h1>
              <p>{t("template.categoryShowcase.headerDesc")}</p>
            </div>
            <div className="banner-manager-actions">
              <button type="button" className="banner-manager-add" onClick={addItem}>
                <Add fontSize="small" />
                {t("template.categoryShowcase.addTile")}
              </button>
              <button type="submit" form="category-showcase-form" className="banner-manager-save" disabled={saving || loading}>
                <Save fontSize="small" />
                {saving ? t("template.common.saving") : t("template.categoryShowcase.saveTiles")}
              </button>
            </div>
          </div>

          <form id="category-showcase-form" className="banner-manager-grid" onSubmit={handleSubmit}>
            {items.map((item, index) => (
              <section className="banner-slide-card" key={item.clientId}>
                <div className="banner-slide-head">
                  <div className="banner-slide-title-group">
                    <GridView />
                    <div>
                      <h2>{t("template.categoryShowcase.tile")} {index + 1}</h2>
                      <p>{t("template.categoryShowcase.tileDesc")}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="banner-remove-btn"
                    onClick={() => removeItem(item.clientId)}
                    aria-label={`Remove tile ${index + 1}`}
                  >
                    <DeleteOutline fontSize="small" />
                  </button>
                </div>

                <label>
                  {t("template.categoryShowcase.category")}
                  <select
                    value={item.categoryName}
                    onChange={(e) => updateItem(item.clientId, "categoryName", e.target.value)}
                  >
                    <option value="">{t("template.categoryShowcase.selectCategory")}</option>
                    {availableCategories.map((categoryName) => (
                      <option value={categoryName} key={categoryName}>{categoryName}</option>
                    ))}
                  </select>
                </label>

                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    id={`category-showcase-file-${item.clientId}`}
                    onChange={(e) => handleImageChange(e, item.clientId)}
                  />
                  <label htmlFor={`category-showcase-file-${item.clientId}`} className="file-input-label banner-file-input-label">
                    <AddPhotoAlternate fontSize="small" />
                    {t("template.categoryShowcase.uploadImage")}
                  </label>
                </div>

                {item.image ? (
                  <div className="banner-preview-wrapper">
                    <img
                      src={typeof item.image === "string" ? item.image : item.image?.url}
                      alt={`${t("template.categoryShowcase.tile")} ${index + 1}`}
                      className="banner-preview-image"
                    />
                  </div>
                ) : null}

                <label>
                  {t("template.categoryShowcase.title")}
                  <input value={item.title} onChange={(e) => updateItem(item.clientId, "title", e.target.value)} placeholder={t("template.categoryShowcase.titlePlaceholder")} />
                </label>

                <label>
                  {t("template.categoryShowcase.subtitle")}
                  <input value={item.subtitle} onChange={(e) => updateItem(item.clientId, "subtitle", e.target.value)} placeholder={t("template.categoryShowcase.subtitlePlaceholder")} />
                </label>

                <div className="banner-inline-fields">
                  <label>
                    {t("template.categoryShowcase.size")}
                    <select value={item.size} onChange={(e) => updateItem(item.clientId, "size", e.target.value)}>
                      <option value="small">{t("template.categoryShowcase.sizeSmall")}</option>
                      <option value="large">{t("template.categoryShowcase.sizeLarge")}</option>
                    </select>
                  </label>

                  <label>
                    {t("template.categoryShowcase.order")}
                    <input type="number" value={item.order} onChange={(e) => updateItem(item.clientId, "order", e.target.value)} />
                  </label>
                </div>

                <label className="category-showcase-featured">
                  <input
                    type="checkbox"
                    checked={item.isFeatured}
                    onChange={(e) => updateItem(item.clientId, "isFeatured", e.target.checked)}
                  />
                  {t("template.categoryShowcase.showOnHomepage")}
                </label>
              </section>
            ))}
          </form>
        </main>
      </div>
    </>
  );
}

export default CategoryShowcaseManager;
