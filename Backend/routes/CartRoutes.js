import express from "express";
import { verifyUserAuth } from "../middleware/userAuth.js";
import { getUserCart, mergeCarts, updateCart } from "../controller/CartController.js";

const router = express.Router();

router.route("/cart").get(verifyUserAuth, getUserCart).put(verifyUserAuth, updateCart);
router.route("/cart/merge").post(verifyUserAuth, mergeCarts);

export default router;
