import express from "express";
import rateLimit from "express-rate-limit";
import {
  registerUser,
  loginUser,
  logout,
  reqestPasswordReset,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateProfile,
  getUserList,
  getSingleUser,
  updateUserRole,
  deleteUser,
} from "../controller/UserController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router
  .route("/password/forgot")
  .post(forgotPasswordLimiter, reqestPasswordReset);

router.route("/register").post(authLimiter, registerUser);
router.route("/login").post(authLimiter, loginUser);
router.route("/logout").post(verifyUserAuth, logout);
router.route("/reset/:token").post(resetPassword);
router.route("/profile").get(verifyUserAuth, getUserDetails);
router.route("/password/change").put(verifyUserAuth, updatePassword);
router.route("/profile/update").put(verifyUserAuth, updateProfile);
router
  .route("/admin/usersList")
  .get(verifyUserAuth, roleBasedAccess("admin"), getUserList);
router
  .route("/admin/user/:id")
  .get(verifyUserAuth, roleBasedAccess("admin"), getSingleUser)
  .put(verifyUserAuth, roleBasedAccess("admin"), updateUserRole)
  .delete(verifyUserAuth, roleBasedAccess("admin"), deleteUser);

export default router;
