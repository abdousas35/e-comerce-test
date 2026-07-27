import express from "express";
import { roleBasedAccess, verifyUserAuth, verifyUserAuthOptional } from "../middleware/userAuth.js";
import { allMyOrders, createNewOrder, deleteOrder, getAllOrders, getSingleOrder, updateOrderStatus } from "../controller/OrderController.js";
import { orderLimiter } from "../middleware/rateLimiter.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import AdminLog from "../models/AdminLogModel.js";

const router = express.Router();

router.route("/new/order").post(orderLimiter, verifyUserAuthOptional, createNewOrder);
router.route("/order/:id").get(verifyUserAuthOptional, getSingleOrder);
router.route("/orders/user").get(verifyUserAuth, allMyOrders);

// Admin Order Routes
router.route("/admin/orders").get(verifyUserAuth, roleBasedAccess("admin"), getAllOrders);
router.route("/admin/order/:id")
    .get(verifyUserAuth, roleBasedAccess("admin"), getSingleOrder)
    .put(verifyUserAuth, roleBasedAccess("admin"), updateOrderStatus);

router.route("/admin/orderDelete/:id")
    .delete(verifyUserAuth, roleBasedAccess("admin"), deleteOrder);

router.route("/admin/activity-log").get(
  verifyUserAuth,
  roleBasedAccess("admin"),
  HandleAsyncError(async (req, res) => {
    const logs = await AdminLog.find()
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json({ success: true, logs });
  })
);

export default router;
