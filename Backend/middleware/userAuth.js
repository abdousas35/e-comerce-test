import HandelError from "../utils/handelError.js";
import HandleAsyncError from "./HandleAsyncError.js";
import jwt from "jsonwebtoken";
import User from "../models/usersModel.js";


export const verifyUserAuth = HandleAsyncError(async (req, res, next) => {
    let token;


    if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    } 

    else if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return next(new HandelError("Authentication is missing! Please login to access resource", 401));
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY);
        req.user = await User.findById(decodedData.id);

        if (!req.user) {
            return next(new HandelError("User not found with this id", 404));
        }

        next();
    } catch (error) {
        return next(new HandelError("Invalid or expired token", 401));
    }
});

export const verifyUserAuthOptional = HandleAsyncError(async (req, _res, next) => {
    const { token } = req.cookies;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)
        req.user = await User.findById(decodedData.id);
    } catch (_error) {
        req.user = null;
    }

    next();
});
export const roleBasedAccess = (requiredRole) => {
  return HandleAsyncError(async (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const userRole = req.user.role;

    if (userRole !== requiredRole) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }


    next();
  });
};
