import HandelError from "../utils/handelError.js";
import HandleAsyncError from "./HandleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";

export const verifyUserAuth = HandleAsyncError(async (req, res, next) => {
    console.log("[auth] verifyUserAuth -> start", { path: req.originalUrl, method: req.method });
    let token;

    // 1. استخراج الـ Token من Cookie أو Authorization Header
    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        console.log("[auth] verifyUserAuth -> no token found");
        return next(new HandelError("Authentication is missing! Please login to access resource", 401));
    }

    console.log("[auth] verifyUserAuth -> token found", { hasToken: !!token });

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            console.log("[auth] verifyUserAuth -> user not found for token");
            return next(new HandelError("User not found", 404));
        }

        console.log("[auth] verifyUserAuth -> authenticated user", { id: req.user._id?.toString(), role: req.user.role });
        next();
    } catch (error) {
        return next(new HandelError("Invalid or expired token", 401));
    }
});

export const verifyUserAuthOptional = HandleAsyncError(async (req, _res, next) => {
    let token;

    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decodedData.id);
    } catch (_error) {
        req.user = null;
    }

    next();
});

export const roleBasedAccess = (requiredRole) => {
    return HandleAsyncError(async (req, res, next) => {
        console.log("[auth] roleBasedAccess -> checking role", { requiredRole, userRole: req.user?.role, path: req.originalUrl });

        if (!req.user) {
            console.log("[auth] roleBasedAccess -> no user attached");
            return res.status(401).json({ message: "User not authenticated" });
        }

        if (req.user.role !== requiredRole) {
            console.log("[auth] roleBasedAccess -> forbidden due to role mismatch");
            return res.status(403).json({ message: "Access denied: insufficient permissions" });
        }

        console.log("[auth] roleBasedAccess -> access granted");
        next();
    });
};