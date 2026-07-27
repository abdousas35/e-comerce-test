import express from "express";
import { getPublicSiteSettings, updateSiteSettings } from "../controller/SiteSettingsController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/settings").get((req, res, next) => {
  console.log("[siteSettingsRoute] GET /settings -> entered");
  next();
}, getPublicSiteSettings);

router.route("/admin/settings").put((req, res, next) => {
  console.log("[siteSettingsRoute] PUT /admin/settings -> entered");
  next();
}, verifyUserAuth, roleBasedAccess("admin"), updateSiteSettings);

export default router;
