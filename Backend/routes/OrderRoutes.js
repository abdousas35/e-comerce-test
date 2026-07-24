import express from "express";
import { roleBasedAccess, verifyUserAuth, verifyUserAuthOptional } from "../middleware/userAuth.js";
import { allMyOrders, createNewOrder, deleteOrder, getAllOrders, getSingleOrder, updateOrderStatus } from "../controller/OrderController.js";
import { orderLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.route("/new/order").post(orderLimiter, verifyUserAuthOptional, createNewOrder);
router.route("/order/:id").get(verifyUserAuthOptional, getSingleOrder);
router.route("/orders/user").get(verifyUserAuth, allMyOrders);

// Admin Order Routes
router.route("/admin/orders").get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);
router.route("/admin/order/:id")
    .get(verifyUserAuth, roleBasedAccess("admin"), getSingleOrder)
    .put(verifyUserAuth, roleBasedAccess("admin"), updateOrderStatus)
    .delete(verifyUserAuth, roleBasedAccess("admin"), deleteOrder);

export default router;
