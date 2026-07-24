import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import { getUserCart, mergeCarts } from "../controller/CartController.js";

const router = express.Router();

// Get user's cart
router.route("/cart").get(verifyUserAuth, getUserCart);

// Merge guest cart with user's DB cart
router.route("/cart/merge").post(verifyUserAuth, mergeCarts);

export default router;
