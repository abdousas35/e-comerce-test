import React, { useEffect, useState } from "react";
import { Palette, Storefront, ContactMail, Save, Description } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import { clearSettingsError, fetchSiteSettings, updateSiteSettings } from "../features/settings/siteSettingsSlice";
import demoPresets from "../config/demoPresets";
import "../AdminStyles/AdminSettings.css";

const toDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

function AdminSettings() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { settings, loading, saving, error } = useSelector((state) => state.settings);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    dispatch(fetchSiteSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings) {
      setFormData({
        storeName: settings.storeName || "",
        tagline: settings.tagline || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        primaryColor: settings.primaryColor || "#6C5B7B",
        secondaryColor: settings.secondaryColor || "#F4A261",
        accentColor: settings.accentColor || "#1F2937",
        bgPrimary: settings.bgPrimary || "#F8FAFC",
        bgSecondary: settings.bgSecondary || "#EEF2FF",
        surfaceColor: settings.surfaceColor || "#FFFFFF",
        surfaceSoftColor: settings.surfaceSoftColor || "#F3F4F6",
        navbarBackground: settings.navbarBackground || "#0F172A",
        footerBackground: settings.footerBackground || "#111827",
        headingColor: settings.headingColor || "#111827",
        bodyTextColor: settings.bodyTextColor || "#374151",
        mutedTextColor: settings.mutedTextColor || "#6B7280",
        textLightColor: settings.textLightColor || "#FFFFFF",
        borderColor: settings.borderColor || "#D1D5DB",
        successColor: settings.successColor || "#22C55E",
        warningColor: settings.warningColor || "#F59E0B",
        dangerColor: settings.dangerColor || "#EF4444",
        infoColor: settings.infoColor || "#3B82F6",
        announcementText: settings.announcementText || "",
        announcementEnabled: settings.announcementEnabled ?? true,
        contactEmail: settings.contactEmail || "",
        contactPhone: settings.contactPhone || "",
        whatsappPhone: settings.whatsappPhone || "",
        address: settings.address || "",
        freeShippingThreshold: settings.freeShippingThreshold || 0,
        defaultShippingRate: settings.defaultShippingRate || 0,
        codEnabled: settings.codEnabled ?? true,
        enableEmailNotifications: settings.enableEmailNotifications ?? true,
        enableWhatsAppNotifications: settings.enableWhatsAppNotifications ?? false,
        manualPaymentInstructions: settings.manualPaymentInstructions || "",
        footerAbout: settings.footerAbout || "",
        newsletterText: settings.newsletterText || "",
        aboutTitle: settings.aboutTitle || "",
        aboutIntro: settings.aboutIntro || "",
        aboutBody: settings.aboutBody || "",
        contactTitle: settings.contactTitle || "",
        contactIntro: settings.contactIntro || "",
        contactSupportHours: settings.contactSupportHours || "",
        logo: settings.logo || "",
        heroImage: settings.heroImage || "",
        socialLinks: {
          instagram: settings.socialLinks?.instagram || "",
          facebook: settings.socialLinks?.facebook || "",
          tiktok: settings.socialLinks?.tiktok || "",
          x: settings.socialLinks?.x || "",
        },
      });
    }
  }, [settings]);

  useEffect(() => {
    if (error) {
      toast.error(error, { position: "top-center", autoClose: 3000 });
      dispatch(clearSettingsError());
    }
  }, [dispatch, error]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value,
      },
    }));
  };

  const handleFileChange = async (event, target) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const dataUrl = await toDataUrl(file);
    handleFieldChange(target, dataUrl);
  };

  const applyThemePreset = (presetKey) => {
    const preset = demoPresets[presetKey];
    if (!preset) return;

    setFormData((prev) => ({
      ...prev,
      themePreset: presetKey,
      storeName: preset.storeName || prev.storeName,
      tagline: preset.tagline || prev.tagline,
      heroTitle: preset.heroTitle || prev.heroTitle,
      heroSubtitle: preset.heroSubtitle || prev.heroSubtitle,
      primaryColor: preset.primaryColor || prev.primaryColor,
      secondaryColor: preset.secondaryColor || prev.secondaryColor,
      accentColor: preset.accentColor || prev.accentColor,
      bgPrimary: preset.bgPrimary || prev.bgPrimary,
      bgSecondary: preset.bgSecondary || prev.bgSecondary,
      surfaceColor: preset.surfaceColor || prev.surfaceColor,
      surfaceSoftColor: preset.surfaceSoftColor || prev.surfaceSoftColor,
      navbarBackground: preset.navbarBackground || prev.navbarBackground,
      footerBackground: preset.footerBackground || prev.footerBackground,
      headingColor: preset.headingColor || prev.headingColor,
      bodyTextColor: preset.bodyTextColor || prev.bodyTextColor,
      mutedTextColor: preset.mutedTextColor || prev.mutedTextColor,
      borderColor: preset.borderColor || prev.borderColor,
      successColor: preset.successColor || prev.successColor,
      warningColor: preset.warningColor || prev.warningColor,
      dangerColor: preset.dangerColor || prev.dangerColor,
      infoColor: preset.infoColor || prev.infoColor,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const payload = {
      ...formData,
      bgSecondary: formData.bgSecondary || formData.bgPrimary,
      surfaceColor: formData.surfaceColor || "#FFFFFF",
      surfaceSoftColor: formData.surfaceSoftColor || formData.bgPrimary,
      footerBackground: formData.footerBackground || formData.navbarBackground,
      mutedTextColor: formData.mutedTextColor || formData.bodyTextColor,
      textLightColor: formData.textLightColor || "#FFFFFF",
      borderColor: formData.borderColor || formData.bodyTextColor,
    };

    dispatch(updateSiteSettings(payload))
      .unwrap()
      .then(() => {
        toast.success(t("template.settings.updated"), {
          position: "top-center",
          autoClose: 2500,
        });
      });
  };

  if (!formData || loading) {
    return (
      <>
        <Navbar />
        <PageTitle title={t("template.settings.pageTitle")} />
        <div className="admin-settings-shell">
          <div className="admin-settings-loading">{t("template.common.loadingSettings")}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PageTitle title={t("template.settings.pageTitle")} />

      <div className="admin-settings-shell">
        <AdminSidebar />

        <main className="admin-settings-main">
          <div className="admin-settings-header">
            <div>
              <h1>{t("template.settings.mainTitle")}</h1>
              <p>{t("template.settings.headerDesc")}</p>
            </div>
            <button type="submit" form="admin-settings-form" className="admin-settings-save-btn" disabled={saving}>
              <Save fontSize="small" />
              {saving ? t("template.common.saving") : t("template.common.saveChanges")}
            </button>
          </div>

          <form id="admin-settings-form" className="admin-settings-form" onSubmit={handleSubmit}>
            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Storefront />
                <div>
                  <h2>{t("template.settings.brandIdentityTitle")}</h2>
                  <p>{t("template.settings.brandDesc")}</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label>
                  {t("template.settings.storeName")}
                  <input value={formData.storeName} onChange={(e) => handleFieldChange("storeName", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.tagline")}
                  <input value={formData.tagline} onChange={(e) => handleFieldChange("tagline", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.heroTitle")}
                  <input value={formData.heroTitle} onChange={(e) => handleFieldChange("heroTitle", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.heroSubtitle")}
                  <textarea rows="3" value={formData.heroSubtitle} onChange={(e) => handleFieldChange("heroSubtitle", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.logoUrl")}
                  <input value={typeof formData.logo === "string" ? formData.logo : ""} onChange={(e) => handleFieldChange("logo", e.target.value)} placeholder="https://..." />
                </label>
                <label>
                  {t("template.settings.uploadLogo")}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "logo")} />
                </label>
                <label>
                  {t("template.settings.heroImageUrl")}
                  <input value={typeof formData.heroImage === "string" ? formData.heroImage : ""} onChange={(e) => handleFieldChange("heroImage", e.target.value)} placeholder="https://..." />
                </label>
                <label>
                  {t("template.settings.uploadHeroImage")}
                  <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "heroImage")} />
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Palette />
                <div>
                  <h2>{t("template.settings.themeColorsTitle")}</h2>
                  <p>{t("template.settings.themeColorsDesc")}</p>
                </div>
              </div>

                <div className="theme-selector-grid">
                  {Object.entries(demoPresets).map(([key, preset]) => (
                    <button
                      key={key}
                      type="button"
                      className={`theme-card ${formData.themePreset === key ? "active" : ""}`}
                      onClick={() => applyThemePreset(key)}
                    >
                      <div className="theme-card-swatch-row">
                        <span style={{ background: preset.primaryColor }} />
                        <span style={{ background: preset.secondaryColor }} />
                        <span style={{ background: preset.accentColor }} />
                      </div>
                      <h3>{preset.storeName}</h3>
                      <p>{preset.tagline}</p>
                    </button>
                  ))}
                </div>

                <div className="admin-settings-preview">
                  <span style={{ background: formData.primaryColor }} />
                  <span style={{ background: formData.secondaryColor }} />
                  <span style={{ background: formData.accentColor }} />
                  <span style={{ background: formData.navbarBackground }} />
                  <span style={{ background: formData.surfaceColor }} />
                  <span style={{ background: formData.bgPrimary }} />
                </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <ContactMail />
                <div>
                  <h2>{t("template.settings.contactSocialTitle")}</h2>
                  <p>{t("template.settings.contactDesc")}</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label>
                  {t("template.settings.contactEmail")}
                  <input value={formData.contactEmail} onChange={(e) => handleFieldChange("contactEmail", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.contactPhone")}
                  <input type="tel" inputMode="numeric" value={formData.contactPhone} onChange={(e) => handleFieldChange("contactPhone", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.whatsappPhone")}
                  <input type="tel" inputMode="numeric" value={formData.whatsappPhone} onChange={(e) => handleFieldChange("whatsappPhone", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.address")}
                  <input value={formData.address} onChange={(e) => handleFieldChange("address", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.footerAbout")}
                  <textarea rows="3" value={formData.footerAbout} onChange={(e) => handleFieldChange("footerAbout", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.newsletterText")}
                  <textarea rows="2" value={formData.newsletterText} onChange={(e) => handleFieldChange("newsletterText", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.announcementText")}
                  <input value={formData.announcementText} onChange={(e) => handleFieldChange("announcementText", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.announcementBar")}
                  <select value={String(formData.announcementEnabled)} onChange={(e) => handleFieldChange("announcementEnabled", e.target.value === "true")}>
                    <option value="true">{t("template.common.enabled")}</option>
                    <option value="false">{t("template.common.disabled")}</option>
                  </select>
                </label>
                <label>
                  {t("template.settings.instagram")}
                  <input value={formData.socialLinks.instagram} onChange={(e) => handleSocialChange("instagram", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.facebook")}
                  <input value={formData.socialLinks.facebook} onChange={(e) => handleSocialChange("facebook", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.tiktok")}
                  <input value={formData.socialLinks.tiktok} onChange={(e) => handleSocialChange("tiktok", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.x")}
                  <input value={formData.socialLinks.x} onChange={(e) => handleSocialChange("x", e.target.value)} />
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Description />
                <div>
                  <h2>{t("template.settings.shippingNotificationsTitle")}</h2>
                  <p>{t("template.settings.shippingNotificationsDesc")}</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label>
                  {t("template.settings.freeShippingThreshold")}
                  <input type="number" value={formData.freeShippingThreshold} onChange={(e) => handleFieldChange("freeShippingThreshold", Number(e.target.value) || 0)} />
                </label>
                <label>
                  {t("template.settings.defaultShippingRate")}
                  <input type="number" value={formData.defaultShippingRate} onChange={(e) => handleFieldChange("defaultShippingRate", Number(e.target.value) || 0)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.manualPaymentInstructions")}
                  <textarea rows="3" value={formData.manualPaymentInstructions} onChange={(e) => handleFieldChange("manualPaymentInstructions", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.cod")}
                  <select value={String(formData.codEnabled)} onChange={(e) => handleFieldChange("codEnabled", e.target.value === "true")}>
                    <option value="true">{t("template.common.enabled")}</option>
                    <option value="false">{t("template.common.disabled")}</option>
                  </select>
                </label>
                <label>
                  {t("template.settings.emailNotifications")}
                  <select value={String(formData.enableEmailNotifications)} onChange={(e) => handleFieldChange("enableEmailNotifications", e.target.value === "true")}>
                    <option value="true">{t("template.common.enabled")}</option>
                    <option value="false">{t("template.common.disabled")}</option>
                  </select>
                </label>
                <label>
                  {t("template.settings.whatsappNotifications")}
                  <select value={String(formData.enableWhatsAppNotifications)} onChange={(e) => handleFieldChange("enableWhatsAppNotifications", e.target.value === "true")}>
                    <option value="true">{t("template.common.enabled")}</option>
                    <option value="false">{t("template.common.disabled")}</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Description />
                <div>
                  <h2>{t("template.settings.aboutContactTitle")}</h2>
                  <p>{t("template.settings.aboutContactDesc")}</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label className="admin-settings-full">
                  {t("template.settings.aboutHeading")}
                  <input value={formData.aboutTitle} onChange={(e) => handleFieldChange("aboutTitle", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.aboutIntro")}
                  <textarea rows="3" value={formData.aboutIntro} onChange={(e) => handleFieldChange("aboutIntro", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.aboutBody")}
                  <textarea rows="5" value={formData.aboutBody} onChange={(e) => handleFieldChange("aboutBody", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.contactHeading")}
                  <input value={formData.contactTitle} onChange={(e) => handleFieldChange("contactTitle", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.contactIntro")}
                  <textarea rows="3" value={formData.contactIntro} onChange={(e) => handleFieldChange("contactIntro", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  {t("template.settings.contactSupport")}
                  <textarea rows="2" value={formData.contactSupportHours} onChange={(e) => handleFieldChange("contactSupportHours", e.target.value)} />
                </label>
              </div>
            </section>
          </form>
        </main>
      </div>
    </>
  );
}

export default AdminSettings;
