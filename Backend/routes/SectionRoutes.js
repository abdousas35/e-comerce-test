import express from "express";
import {
  getActiveSections,
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  reorderSections,
} from "../controller/SectionController.js";
import { verifyUserAuth, roleBasedAccess } from "../middleware/userAuth.js";

const router = express.Router();

router.route("/sections").get(getActiveSections);

router.route("/admin/sections").get(verifyUserAuth, roleBasedAccess("admin"), getAllSections);
router.route("/admin/sections").post(verifyUserAuth, roleBasedAccess("admin"), createSection);
router.route("/admin/sections/reorder").patch(verifyUserAuth, roleBasedAccess("admin"), reorderSections);
router.route("/admin/sections/:id")
  .put(verifyUserAuth, roleBasedAccess("admin"), updateSection)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteSection);

export default router;
