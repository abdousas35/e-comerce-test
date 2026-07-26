import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  targetId: { type: mongoose.Schema.ObjectId },
  targetModel: { type: String },
  details: { type: String },
}, { timestamps: true });

export default mongoose.model("AdminLog", adminLogSchema);
