import { v2 as cloudinary } from "cloudinary";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import SiteSettings from "../models/SiteSettingsModel.js";

const DEFAULT_IMAGE_FIELDS = ["logo", "favicon", "heroImage"];
const DEFAULT_TERMS_AND_CONDITIONS = "<h2>Orders and payments</h2><p>Customers are responsible for providing accurate billing and shipping details. Orders are processed after successful review and confirmation.</p><h2>Returns and refunds</h2><p>Refund and return terms should be updated to match the client policy, including timelines, exclusions, and item condition rules.</p><h2>Store usage</h2><p>Visitors agree to use the site lawfully and not misuse storefront features, customer accounts, or protected content.</p>";
const DEFAULT_PRIVACY_POLICY = "<h2>Information we collect</h2><p>Orders, contact details, shipping information, and activity required to process purchases and improve service quality.</p><h2>How we use the information</h2><p>We use customer information to fulfill orders, provide support, send transactional updates, and improve the shopping experience.</p><h2>How we protect your data</h2><p>Administrative access is protected, customer sessions are authenticated, and business-critical actions are handled through controlled backend workflows.</p>";

const normalizeSettingsDocument = async () => {
  const settingsDocs = await SiteSettings.find({}).sort({ updatedAt: -1, createdAt: -1 });

  if (!settingsDocs.length) {
    return SiteSettings.create({});
  }

  if (settingsDocs.length > 1) {
    const duplicateIds = settingsDocs.slice(1).map((doc) => doc._id);
    await SiteSettings.deleteMany({ _id: { $in: duplicateIds } });
  }

  const [settings] = settingsDocs;
  const missingDefaults = {};

  if (typeof settings.termsAndConditions === "undefined") {
    missingDefaults.termsAndConditions = DEFAULT_TERMS_AND_CONDITIONS;
  }

  if (typeof settings.privacyPolicy === "undefined") {
    missingDefaults.privacyPolicy = DEFAULT_PRIVACY_POLICY;
  }

  if (Object.keys(missingDefaults).length) {
    return SiteSettings.findOneAndUpdate(
      { _id: settings._id },
      { $set: missingDefaults },
      { new: true, runValidators: true }
    );
  }

  return settings;
};

const uploadAssetIfNeeded = async (value, folder) => {
  if (!value || typeof value !== "string") return value;
  if (!value.startsWith("data:image")) return value;

  const uploaded = await cloudinary.uploader.upload(value, { folder });
  return uploaded.secure_url;
};

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

// Uploads any new (base64) category showcase images to Cloudinary, keeps
// already-uploaded {url, publicId} images untouched, and removes the old
// Cloudinary asset for any image that got replaced or removed.
const normalizeCategoryShowcase = async (items = [], previousItems = []) => {
  const normalizedItems = await Promise.all(
    items.map(async (item) => {
      let image = { url: null, publicId: null };

      if (typeof item.image === "string" && item.image.startsWith("data:image")) {
        const uploaded = await cloudinary.uploader.upload(item.image, {
          folder: "site-settings/category-showcase",
        });
        image = { url: uploaded.secure_url, publicId: uploaded.public_id };
      } else if (item.image && typeof item.image === "object") {
        image = { url: item.image.url || null, publicId: item.image.publicId || null };
      }

      return {
        categoryName: (item.categoryName || "").trim(),
        image,
        title: item.title || "",
        subtitle: item.subtitle || "",
        size: item.size === "large" ? "large" : "small",
        order: Number(item.order) || 0,
        isFeatured: item.isFeatured !== false,
      };
    })
  );

  const cleanedItems = normalizedItems.filter((item) => item.categoryName);

  const nextPublicIds = new Set(cleanedItems.map((item) => item.image?.publicId).filter(Boolean));
  const removedPublicIds = previousItems
    .map((item) => item.image?.publicId)
    .filter((publicId) => publicId && !nextPublicIds.has(publicId));

  for (const publicId of removedPublicIds) {
    await cloudinary.uploader.destroy(publicId).catch(() => {});
  }

  return cleanedItems;
};

export const getPublicSiteSettings = HandleAsyncError(async (req, res) => {
  console.log("[siteSettings] GET /settings -> starting fetch");
  const settings = await normalizeSettingsDocument();
  console.log("[siteSettings] GET /settings -> fetched document", {
    id: settings?._id?.toString(),
    hasTerms: typeof settings?.termsAndConditions !== "undefined",
    termsLength: settings?.termsAndConditions?.length || 0,
    hasPrivacy: typeof settings?.privacyPolicy !== "undefined",
    privacyLength: settings?.privacyPolicy?.length || 0,
    termsPreview: settings?.termsAndConditions?.slice?.(0, 80),
    privacyPreview: settings?.privacyPolicy?.slice?.(0, 80),
  });

  res.status(200).json({
    success: true,
    settings,
  });
});

export const updateSiteSettings = HandleAsyncError(async (req, res) => {
  console.log("[siteSettings] PUT /admin/settings -> request received");
  console.log("[siteSettings] PUT /admin/settings -> body keys", Object.keys(req.body || {}));
  console.log("[siteSettings] PUT /admin/settings -> termsAndConditions received", req.body?.termsAndConditions);
  console.log("[siteSettings] PUT /admin/settings -> privacyPolicy received", req.body?.privacyPolicy);

  let settings = await normalizeSettingsDocument();
  console.log("[siteSettings] PUT /admin/settings -> current doc", {
    id: settings?._id?.toString(),
    currentTerms: settings?.termsAndConditions?.slice?.(0, 80),
    currentPrivacy: settings?.privacyPolicy?.slice?.(0, 80),
  });

  const updateData = {};

  for (const field of DEFAULT_IMAGE_FIELDS) {
    if (typeof req.body[field] !== "undefined") {
      updateData[field] = await uploadAssetIfNeeded(req.body[field], "site-settings");
    }
  }

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
      if (field === "termsAndConditions" || field === "privacyPolicy") {
        console.log(`[siteSettings] PUT /admin/settings -> preparing ${field}`, req.body[field]);
      }
    }
  });

  if (req.body.socialLinks) {
    updateData.socialLinks = {
      ...(settings.socialLinks?.toObject ? settings.socialLinks.toObject() : settings.socialLinks),
      ...req.body.socialLinks,
    };
  }

  if (Array.isArray(req.body.heroSlides)) {
    updateData.heroSlides = await normalizeSlides(req.body.heroSlides);
  }

  if (Array.isArray(req.body.categoryShowcase)) {
    updateData.categoryShowcase = await normalizeCategoryShowcase(req.body.categoryShowcase, settings.categoryShowcase || []);
  }

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

  console.log("[siteSettings] PUT /admin/settings -> updateData", {
    hasTerms: typeof updateData.termsAndConditions !== "undefined",
    termsLength: updateData.termsAndConditions?.length || 0,
    hasPrivacy: typeof updateData.privacyPolicy !== "undefined",
    privacyLength: updateData.privacyPolicy?.length || 0,
  });

  const updatedSettings = await SiteSettings.findOneAndUpdate(
    { _id: settings._id },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  console.log("[siteSettings] PUT /admin/settings -> updated document", {
    id: updatedSettings?._id?.toString(),
    savedTerms: updatedSettings?.termsAndConditions?.slice?.(0, 80),
    savedPrivacy: updatedSettings?.privacyPolicy?.slice?.(0, 80),
  });

  res.status(200).json({
    success: true,
    message: "Site settings updated successfully",
    settings: updatedSettings,
  });
});