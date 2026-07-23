import express from "express";
import rateLimit from "express-rate-limit";
import {registerUser, loginUser, logout, reqestPasswordReset, resetPassword, getUserDetails, updatePassword, updateProfile, getUserList, getSingleUser, updateUserRole, deleteUser} from "../controller/UserController.js";
import { roleBasedAccess, verifyUserAuth } from "../middleware/userAuth.js";

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات كحد أقصى فكل 15 دقيقة لكل IP
  message: {
    success: false,
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.route("/register").post(registerUser);
router.route("/login").post(loginLimiter, loginUser);
router.route("/logout").post(logout);
router.route("/password/forgot").post(reqestPasswordReset);
router.route("/reset/:token").post(resetPassword);
router.route("/profile").get(verifyUserAuth, getUserDetails);
router.route("/password/change").put(verifyUserAuth, updatePassword);
router.route("/profile/update").put(verifyUserAuth, updateProfile);
router.route("/admin/usersList").get(verifyUserAuth, roleBasedAccess("admin"), getUserList);
router.route("/admin/user/:id").get(verifyUserAuth, roleBasedAccess("admin"), getSingleUser);
router.route("/admin/userRole/:id").put(verifyUserAuth, roleBasedAccess("admin"), updateUserRole);
router.route("/admin/userDelete/:id").delete(verifyUserAuth, roleBasedAccess("admin"), deleteUser);


export default router;