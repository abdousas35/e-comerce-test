import AdminLog from "../models/AdminLogModel.js";

export const logAdminAction = async (adminId, action, targetId = null, targetModel = null, details = null) => {
  try {
    await AdminLog.create({ adminId, action, targetId, targetModel, details });
  } catch (err) {
    console.warn("[ADMIN_LOG] Failed to log action:", err.message);
  }
};
