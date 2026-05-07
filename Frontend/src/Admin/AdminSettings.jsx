import React, { useEffect, useState } from "react";
import { Palette, Storefront, ContactMail, Save, Description } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import PageTitle from "../components/PageTitle";
import AdminSidebar from "../components/AdminSidebar";
import { clearSettingsError, fetchSiteSettings, updateSiteSettings } from "../features/settings/siteSettingsSlice";
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

  const handleSubmit = (event) => {
    event.preventDefault();

    dispatch(updateSiteSettings(formData))
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
              <h1>Store Settings</h1>
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
                  <h2>Brand Identity</h2>
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
                  <h2>Theme Colors</h2>
                  <p>{t("template.settings.themeDesc")}</p>
                </div>
              </div>

              <div className="admin-settings-grid admin-settings-colors">
                <label>
                  {t("template.settings.primaryColor")}
                  <input type="color" value={formData.primaryColor} onChange={(e) => handleFieldChange("primaryColor", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.secondaryColor")}
                  <input type="color" value={formData.secondaryColor} onChange={(e) => handleFieldChange("secondaryColor", e.target.value)} />
                </label>
                <label>
                  {t("template.settings.accentColor")}
                  <input type="color" value={formData.accentColor} onChange={(e) => handleFieldChange("accentColor", e.target.value)} />
                </label>
                <label>
                  Page background
                  <input type="color" value={formData.bgPrimary} onChange={(e) => handleFieldChange("bgPrimary", e.target.value)} />
                </label>
                <label>
                  Secondary background
                  <input type="color" value={formData.bgSecondary} onChange={(e) => handleFieldChange("bgSecondary", e.target.value)} />
                </label>
                <label>
                  Card surface
                  <input type="color" value={formData.surfaceColor} onChange={(e) => handleFieldChange("surfaceColor", e.target.value)} />
                </label>
                <label>
                  Soft surface
                  <input type="color" value={formData.surfaceSoftColor} onChange={(e) => handleFieldChange("surfaceSoftColor", e.target.value)} />
                </label>
                <label>
                  Navbar background
                  <input type="color" value={formData.navbarBackground} onChange={(e) => handleFieldChange("navbarBackground", e.target.value)} />
                </label>
                <label>
                  Footer background
                  <input type="color" value={formData.footerBackground} onChange={(e) => handleFieldChange("footerBackground", e.target.value)} />
                </label>
                <label>
                  Heading text
                  <input type="color" value={formData.headingColor} onChange={(e) => handleFieldChange("headingColor", e.target.value)} />
                </label>
                <label>
                  Body text
                  <input type="color" value={formData.bodyTextColor} onChange={(e) => handleFieldChange("bodyTextColor", e.target.value)} />
                </label>
                <label>
                  Muted text
                  <input type="color" value={formData.mutedTextColor} onChange={(e) => handleFieldChange("mutedTextColor", e.target.value)} />
                </label>
                <label>
                  Light text
                  <input type="color" value={formData.textLightColor} onChange={(e) => handleFieldChange("textLightColor", e.target.value)} />
                </label>
                <label>
                  Border color
                  <input type="color" value={formData.borderColor} onChange={(e) => handleFieldChange("borderColor", e.target.value)} />
                </label>
                <label>
                  Success color
                  <input type="color" value={formData.successColor} onChange={(e) => handleFieldChange("successColor", e.target.value)} />
                </label>
                <label>
                  Warning color
                  <input type="color" value={formData.warningColor} onChange={(e) => handleFieldChange("warningColor", e.target.value)} />
                </label>
                <label>
                  Danger color
                  <input type="color" value={formData.dangerColor} onChange={(e) => handleFieldChange("dangerColor", e.target.value)} />
                </label>
                <label>
                  Info color
                  <input type="color" value={formData.infoColor} onChange={(e) => handleFieldChange("infoColor", e.target.value)} />
                </label>
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
                  <h2>Contact and Social</h2>
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
                  <input value={formData.contactPhone} onChange={(e) => handleFieldChange("contactPhone", e.target.value)} />
                </label>
                <label>
                  WhatsApp phone
                  <input value={formData.whatsappPhone} onChange={(e) => handleFieldChange("whatsappPhone", e.target.value)} />
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
                <label>
                  Instagram
                  <input value={formData.socialLinks.instagram} onChange={(e) => handleSocialChange("instagram", e.target.value)} />
                </label>
                <label>
                  Facebook
                  <input value={formData.socialLinks.facebook} onChange={(e) => handleSocialChange("facebook", e.target.value)} />
                </label>
                <label>
                  TikTok
                  <input value={formData.socialLinks.tiktok} onChange={(e) => handleSocialChange("tiktok", e.target.value)} />
                </label>
                <label>
                  X
                  <input value={formData.socialLinks.x} onChange={(e) => handleSocialChange("x", e.target.value)} />
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Description />
                <div>
                  <h2>Shipping and Notifications</h2>
                  <p>Control base shipping rules and order notification channels.</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label>
                  Free shipping threshold
                  <input type="number" value={formData.freeShippingThreshold} onChange={(e) => handleFieldChange("freeShippingThreshold", Number(e.target.value) || 0)} />
                </label>
                <label>
                  Default shipping rate
                  <input type="number" value={formData.defaultShippingRate} onChange={(e) => handleFieldChange("defaultShippingRate", Number(e.target.value) || 0)} />
                </label>
                <label className="admin-settings-full">
                  Manual payment instructions
                  <textarea rows="3" value={formData.manualPaymentInstructions} onChange={(e) => handleFieldChange("manualPaymentInstructions", e.target.value)} />
                </label>
                <label>
                  Cash on delivery
                  <select value={String(formData.codEnabled)} onChange={(e) => handleFieldChange("codEnabled", e.target.value === "true")}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
                <label>
                  Email notifications
                  <select value={String(formData.enableEmailNotifications)} onChange={(e) => handleFieldChange("enableEmailNotifications", e.target.value === "true")}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
                <label>
                  WhatsApp notifications
                  <select value={String(formData.enableWhatsAppNotifications)} onChange={(e) => handleFieldChange("enableWhatsAppNotifications", e.target.value === "true")}>
                    <option value="true">Enabled</option>
                    <option value="false">Disabled</option>
                  </select>
                </label>
              </div>
            </section>

            <section className="admin-settings-card">
              <div className="admin-settings-section-title">
                <Description />
                <div>
                  <h2>About and Contact Pages</h2>
                  <p>Control the main copy shown in the public About Us and Contact Us pages.</p>
                </div>
              </div>

              <div className="admin-settings-grid">
                <label className="admin-settings-full">
                  About page heading
                  <input value={formData.aboutTitle} onChange={(e) => handleFieldChange("aboutTitle", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  About page intro
                  <textarea rows="3" value={formData.aboutIntro} onChange={(e) => handleFieldChange("aboutIntro", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  About page body
                  <textarea rows="5" value={formData.aboutBody} onChange={(e) => handleFieldChange("aboutBody", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  Contact page heading
                  <input value={formData.contactTitle} onChange={(e) => handleFieldChange("contactTitle", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  Contact page intro
                  <textarea rows="3" value={formData.contactIntro} onChange={(e) => handleFieldChange("contactIntro", e.target.value)} />
                </label>
                <label className="admin-settings-full">
                  Contact support hours
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
