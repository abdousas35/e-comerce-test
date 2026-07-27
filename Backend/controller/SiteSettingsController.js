import { v2 as cloudinary } from "cloudinary";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import SiteSettings from "../models/SiteSettingsModel.js";

const DEFAULT_IMAGE_FIELDS = ["logo", "favicon", "heroImage"];

// رفع الصور عند الحاجة
const uploadAssetIfNeeded = async (value, folder) => {
  if (!value || typeof value !== "string") return value;
  if (!value.startsWith("data:image")) return value;

  const uploaded = await cloudinary.uploader.upload(value, { folder });
  return uploaded.secure_url;
};

// تجهيز السلايدات
const normalizeSlides = async (slides = []) => {
  const normalizedSlides = await Promise.all(
    slides.map(async (slide) => ({
      image: await uploadAssetIfNeeded(slide.image, "site-settings/slides"),
      title: slide.title || "",
      subtitle: slide.subtitle || "",
      ctaLabel: slide.ctaLabel || "",
      ctaLink: slide.ctaLink || "/products",
    }))
  );

  return normalizedSlides.filter((slide) => slide.image || slide.title || slide.subtitle);
};

export const getPublicSiteSettings = HandleAsyncError(async (req, res) => {
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }

  res.status(200).json({
    success: true,
    settings,
  });
});

export const updateSiteSettings = HandleAsyncError(async (req, res) => {
  // 1. جلب الإعدادات الحالية أو إنشائها
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({});
  }

  // كائن لتجميع التحديثات فقط
  const updateData = {};

  // 2. معالجة رفع الصور
  for (const field of DEFAULT_IMAGE_FIELDS) {
    if (typeof req.body[field] !== "undefined") {
      updateData[field] = await uploadAssetIfNeeded(req.body[field], "site-settings");
    }
  }

  // 3. الحقول النصية والبسيطة
  const simpleFields = [
    "storeName", "tagline", "heroTitle", "heroSubtitle", "primaryColor",
    "secondaryColor", "accentColor", "themePreset", "bgPrimary", "bgSecondary",
    "surfaceColor", "surfaceSoftColor", "navbarBackground", "footerBackground",
    "headingColor", "bodyTextColor", "mutedTextColor", "textLightColor",
    "borderColor", "successColor", "warningColor", "dangerColor", "infoColor",
    "fontHeading", "fontBody", "contactEmail", "contactPhone", "whatsappPhone",
    "address", "freeShippingThreshold", "defaultShippingRate", "codEnabled",
    "enableEmailNotifications", "enableWhatsAppNotifications",
    "manualPaymentInstructions", "newsletterText", "announcementText",
    "announcementEnabled", "footerAbout", "aboutTitle", "aboutIntro",
    "aboutBody", "contactTitle", "contactIntro", "contactSupportHours",
    "termsAndConditions", "privacyPolicy",
  ];

  simpleFields.forEach((field) => {
    if (typeof req.body[field] !== "undefined") {
      updateData[field] = req.body[field];
    }
  });

  // 4. معالجة الكائنات المتداخلة (socialLinks)
  if (req.body.socialLinks) {
    updateData.socialLinks = {
      ...(settings.socialLinks?.toObject ? settings.socialLinks.toObject() : settings.socialLinks),
      ...req.body.socialLinks,
    };
  }

  // 5. معالجة heroSlides
  if (Array.isArray(req.body.heroSlides)) {
    updateData.heroSlides = await normalizeSlides(req.body.heroSlides);
  }

  // 6. معالجة shippingZones
  if (Array.isArray(req.body.shippingZones)) {
    updateData.shippingZones = req.body.shippingZones
      .map((zone) => ({
        state: zone.state || "",
        cities: Array.isArray(zone.cities)
          ? zone.cities.filter(Boolean)
          : typeof zone.cities === "string"
            ? zone.cities.split(",").map((city) => city.trim()).filter(Boolean)
            : [],
        rate: Number(zone.rate) || 0,
        estimatedDays: zone.estimatedDays || "2-4 business days",
      }))
      .filter((zone) => zone.state);
  }

  // 7. الحفظ المباشر في قاعدة البيانات عبر findOneAndUpdate
  const updatedSettings = await SiteSettings.findOneAndUpdate(
    { _id: settings._id },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: "Site settings updated successfully",
    settings: updatedSettings,
  });
});