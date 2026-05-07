import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CONFIG } from "../../config/config";

const defaultSettings = {
  storeName: CONFIG.appName,
  tagline: "Premium products curated for modern shoppers.",
  logo: CONFIG.logo,
  favicon: "",
  heroTitle: "A premium storefront ready for your next client.",
  heroSubtitle: "Swap the brand, upload products, and launch a polished online store in days.",
  heroImage: "",
  primaryColor: CONFIG.primaryColor,
  secondaryColor: "#F4A261",
  accentColor: "#1F2937",
  bgPrimary: "#F8FAFC",
  bgSecondary: "#EEF2FF",
  surfaceColor: "#FFFFFF",
  surfaceSoftColor: "#F3F4F6",
  navbarBackground: "#0F172A",
  footerBackground: "#111827",
  headingColor: "#111827",
  bodyTextColor: "#374151",
  mutedTextColor: "#6B7280",
  textLightColor: "#FFFFFF",
  borderColor: "#D1D5DB",
  successColor: "#22C55E",
  warningColor: "#F59E0B",
  dangerColor: "#EF4444",
  infoColor: "#3B82F6",
  fontHeading: "'Poppins', sans-serif",
  fontBody: "'Inter', sans-serif",
  contactEmail: "hello@example.com",
  contactPhone: "+000 000 000",
  whatsappPhone: "",
  address: "Your city, your store, your brand.",
  freeShippingThreshold: 0,
  defaultShippingRate: 0,
  codEnabled: true,
  enableEmailNotifications: true,
  enableWhatsAppNotifications: false,
  manualPaymentInstructions: "",
  shippingZones: [
    { state: "Tunis", cities: ["Tunis", "Carthage", "La Marsa"], rate: 7, estimatedDays: "1-2 business days" },
    { state: "Ariana", cities: ["Ariana City", "Mnihla", "Raoued"], rate: 6, estimatedDays: "1-2 business days" },
    { state: "Sousse", cities: ["Sousse City", "Hammam Sousse", "Akouda"], rate: 7, estimatedDays: "2-3 business days" },
    { state: "Sfax", cities: ["Sfax City", "Sakiet Ezzit", "Agareb"], rate: 8, estimatedDays: "2-3 business days" },
  ],
  newsletterText: "Subscribe for launches, limited offers, and product drops.",
  footerAbout: "A reusable white-label e-commerce template built for fast premium delivery.",
  aboutTitle: "Built for brands that want to feel premium from day one.",
  aboutIntro: "Use this page to introduce the store, explain the value behind the products, and build trust with new shoppers.",
  aboutBody: "This template helps you deliver a polished storefront with strong branding, smooth shopping flows, and a clean admin experience that clients can manage confidently.",
  contactTitle: "We are here to help before and after every order.",
  contactIntro: "Customize this section with your support tone, response expectations, and the best way for customers to reach you.",
  contactSupportHours: "Support hours: Monday to Saturday, 9:00 AM to 6:00 PM.",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    x: "",
  },
  heroSlides: [
    {
      image: "/images/image1.png",
      title: "Launch a premium store faster",
      subtitle: "Designed to help you ship polished client stores with less effort.",
      ctaLabel: "Shop collection",
      ctaLink: "/products",
    },
    {
      image: "/images/image2.png",
      title: "Flexible branding for every client",
      subtitle: "Swap banners, colors, logo, and messaging without touching core code.",
      ctaLabel: "Explore products",
      ctaLink: "/products",
    },
  ],
};

export const fetchSiteSettings = createAsyncThunk(
  "settings/fetchSiteSettings",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get("/api/v1/settings");
      return data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load site settings");
    }
  }
);

export const updateSiteSettings = createAsyncThunk(
  "settings/updateSiteSettings",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await axios.put("/api/v1/admin/settings", payload, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      return data.settings;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update site settings");
    }
  }
);

const siteSettingsSlice = createSlice({
  name: "settings",
  initialState: {
    loading: false,
    saving: false,
    error: null,
    settings: defaultSettings,
  },
  reducers: {
    clearSettingsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSiteSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSiteSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = {
          ...defaultSettings,
          ...action.payload,
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(action.payload?.socialLinks || {}),
          },
          heroSlides: action.payload?.heroSlides?.length ? action.payload.heroSlides : defaultSettings.heroSlides,
          shippingZones: action.payload?.shippingZones?.length ? action.payload.shippingZones : defaultSettings.shippingZones,
        };
      })
      .addCase(fetchSiteSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load site settings";
      })
      .addCase(updateSiteSettings.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateSiteSettings.fulfilled, (state, action) => {
        state.saving = false;
        state.settings = {
          ...defaultSettings,
          ...action.payload,
          socialLinks: {
            ...defaultSettings.socialLinks,
            ...(action.payload?.socialLinks || {}),
          },
          heroSlides: action.payload?.heroSlides?.length ? action.payload.heroSlides : defaultSettings.heroSlides,
          shippingZones: action.payload?.shippingZones?.length ? action.payload.shippingZones : defaultSettings.shippingZones,
        };
      })
      .addCase(updateSiteSettings.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || "Failed to update site settings";
      });
  },
});

export const { clearSettingsError } = siteSettingsSlice.actions;
export default siteSettingsSlice.reducer;
