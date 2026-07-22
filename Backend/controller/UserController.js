import HandleAsyncError from "../middleware/HandleAsyncError.js";
import User from "../models/usersModel.js";
import HandelError from "../utils/handelError.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";
import APIFunctionality from '../utils/apiFunctionality.js';
import { v2 as cloudinary } from "cloudinary";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";



// Register User
export const registerUser = HandleAsyncError(async (req, res, next) => {

    const { name, email, password, avatar } = req.body;
    console.log("🟢 REGISTER API HIT");
    console.log("📥 req.body keys:", Object.keys(req.body));
    console.log("👤 Name:", req.body.name);
    console.log("📧 Email:", req.body.email);
    console.log("🧬 Avatar exists?", !!req.body.avatar);
    console.log("🧬 Avatar length:", req.body.avatar?.length);

    let avatarData;

    if (avatar) {
        try {
            console.log("☁️ Uploading avatar to Cloudinary...");

            const base64Data = avatar.includes("base64,")
                ? avatar.split("base64,")[1]
                : avatar;

            console.log("🧬 Clean base64 length:", base64Data.length);

            const myCloud = await cloudinary.uploader.upload(
                `data:image/png;base64,${base64Data}`,
                {
                    folder: "avatars",
                    width: 150,
                    crop: "scale",
                }
            );

            console.log("✅ Cloudinary upload success:", myCloud.secure_url);

            avatarData = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url
            };

        } catch (error) {
            console.error("❌ Cloudinary upload failed:", error);
            return next(new HandelError("Failed to upload avatar", 500));
        }


    } else {

        avatarData = {
            public_id: "",
            url: "/images/profile.png",
        };
    }

    const user = await User.create({
        name,
        email,
        password,
        avatar: avatarData,
    });

    sendToken(user, 201, res);
});

// Login User
export const loginUser = HandleAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) return next(new HandelError("Email or Password cannot be empty", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new HandelError("Invalid email or password", 401));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(new HandelError("Invalid email or password", 401));

    sendToken(user, 200, res);
});

// Logout
export const logout = HandleAsyncError(async (req, res, next) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", null, {

        expires: new Date(Date.now()),
        httpOnly: true,
        sameSite: isProduction ? "none" : "lax",
        secure: isProduction

    });
    res.status(200).json({

        success: true,
        message: "Successfully Logged out"

    });

});

// forgot Password 
export const reqestPasswordReset = HandleAsyncError(async (req, res, next) => {

    const { email } = req.body;
    const user = await User.findOne({ email: req.body.email });
    if (!user) {

        return next(new HandelError("User doesn't exist", 400));

    }
    let resetToken;

    try {

        resetToken = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });


    } catch (error) {

        return next(new HandelError("Could not save reset token , Please try again later", 500));

    }
    const clientUrl = process.env.FRONTEND_URL || `${req.protocol}://${req.get("host")}`;
    const resetPasswordURL = `${clientUrl.replace(/\/$/, "")}/reset/${resetToken}`;
    const message = `Use the following link to reset your password : ${resetPasswordURL}. \n \n This link will expire in 30 minutes. \n \n If you didn't request a password reset, please ignore this message.`;
    try {

        //send email 
        await sendEmail({

            email: user.email,
            subject: "Password Reset Request",
            message

        });
        res.status(200).json({

            success: true,
            messgae: `Email is sent to ${user.email} successfully`

        });

    } catch (error) {

        console.error("📧 SEND EMAIL ERROR:", error); // ⬅️ زيد هذا السطر
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new HandelError("Email could not be sent, Please try again later", 500));

    }

});

// reset password
export const resetPassword = HandleAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({

        resetPasswordToken: resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }

    });


    if (!user) {

        return next(new HandelError("Reset Password token is invalid or has been expired", 400));

    };
    const { password, confirmPassword } = req.body;
    if (password !== confirmPassword) {

        return next(new HandelError("Password doesn't match", 400));

    };
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    sendToken(user, 200, res);

});

// get user details
export const getUserDetails = HandleAsyncError(async (req, res, next) => {

    const user = await User.findById(req.user.id);
    res.status(200).json({

        success: true,
        user

    });

});

// update password
export const updatePassword = HandleAsyncError(async (req, res, next) => {

    const { oldPassword, newPassword, confirmPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    const chekPasswordMatch = await user.verifyPassword(oldPassword);
    if (!chekPasswordMatch) {

        return next(new HandelError('Old password is incorrect', 400));

    };
    if (newPassword !== confirmPassword) {

        return next(new HandelError("Password doesn't match", 400));

    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);


});

// updating user profile
export const updateProfile = HandleAsyncError(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    const { name, email, avatar } = req.body;

    if (name) user.name = name;
    if (email) user.email = email;

    if (avatar) {
        try {
            // رفع الصورة إلى Cloudinary
            const base64Data = avatar.includes("base64,") ? avatar.split("base64,")[1] : avatar;
            const myCloud = await cloudinary.uploader.upload(`data:image/png;base64,${base64Data}`, {
                folder: "avatars",
                width: 150,
                crop: "scale",
            });
            user.avatar = { public_id: myCloud.public_id, url: myCloud.secure_url };
        } catch (error) {
            console.error("Cloudinary upload failed:", error);
            return next(new HandelError("Failed to upload avatar", 500));
        }
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile Updated successfully",
        user,
    });
});

// admin - getting user information 
export const getUserList = HandleAsyncError(async (req, res, next) => {

    const apiFeatures = new APIFunctionality(User.find(), req.query)
    const filteredQuery = apiFeatures.query.clone();
    const usersCount = await filteredQuery.countDocuments();
    const users = await User.find();
    res.status(200).json({

        success: true,
        usersCount,
        users

    });

});

//admin - getting single user information
export const getSingleUser = HandleAsyncError(async (req, res, next) => {

    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {

        return next(new HandelError("User not found", 400));

    };
    res.status(200).json({

        success: true,
        user

    });

});

// admin - changing user role
export const updateUserRole = HandleAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { role } = req.body;


    if (req.user._id.toString() === id) {
        return res.status(400).json({
            success: false,
            message: "You cannot change your own role!",
        });
    }

    const user = await User.findByIdAndUpdate(
        id,
        { role },
        {
            new: true,
            runValidators: true,
        }
    );

    if (!user) {
        return next(new HandelError("User not found", 400));
    }

    res.status(200).json({
        success: true,
        message: "User role has been changed successfully",
        user,
    });
});


// admin - delete user profile
export const deleteUser = HandleAsyncError(async (req, res, next) => {
    const { id } = req.params;


    if (!req.user || !req.user._id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    if (req.user._id.toString() === id) {
        return res.status(400).json({
            success: false,
            message: "You cannot delete yourself!",
        });
    }


    const user = await User.findByIdAndDelete(id);

    if (!user) {
        return next(new HandelError("User not found", 400));
    }

    res.status(200).json({
        success: true,
        message: "User has been deleted successfully",
    });
});
