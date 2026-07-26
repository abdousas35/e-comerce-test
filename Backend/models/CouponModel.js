import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },
    applicableCategories: [{ type: String }],
    applicableProducts: [{ type: mongoose.Schema.ObjectId, ref: "Product" }],
    type: {
      type: String,
      enum: ["fixed", "percent"],
      default: "percent",
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Coupon value cannot be negative"],
    },
    minOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimum order amount cannot be negative"],
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: [0, "Max discount cannot be negative"]
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    usedBy: [{
      userId: {
        type: mongoose.Schema.ObjectId,
        ref: "User"
      },
      orderId: {
        type: mongoose.Schema.ObjectId,
        ref: "Order"
      },
      usedAt: {
        type: Date,
        default: Date.now
      }
    }],
    expiresAt: {
      type: Date,
      required: [true, "Coupon expiry date is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Coupon", couponSchema);
