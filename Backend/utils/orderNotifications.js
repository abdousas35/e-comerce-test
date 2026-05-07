import SiteSettings from "../models/SiteSettingsModel.js";
import { sendEmail } from "./sendEmail.js";

const WHATSAPP_API_URL = process.env.WHATSAPP_PHONE_NUMBER_ID
  ? `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`
  : "";

const buildOrderMessage = ({ type, order, customerName }) => {
  const baseSummary = `Order #${order._id} is now ${order.orderStatus}. Total: ${order.totalPrice}.`;

  switch (type) {
    case "order_created":
      return `Hello ${customerName}, your order #${order._id} has been received successfully. Current status: ${order.orderStatus}. Total: ${order.totalPrice}.`;
    case "status_updated":
      return `Hello ${customerName}, your order #${order._id} status changed to ${order.orderStatus}.${order.trackingNumber ? ` Tracking number: ${order.trackingNumber}.` : ""}${order.trackingUrl ? ` Track here: ${order.trackingUrl}` : ""}`;
    case "order_shipped":
      return `Hello ${customerName}, your order #${order._id} has been shipped.${order.trackingNumber ? ` Tracking number: ${order.trackingNumber}.` : ""}${order.trackingUrl ? ` Track here: ${order.trackingUrl}` : ""}`;
    default:
      return `Hello ${customerName}, ${baseSummary}`;
  }
};

const sendWhatsAppMessage = async ({ to, body }) => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !WHATSAPP_API_URL || !to) {
    return { status: "skipped", recipient: to || "", error: "WhatsApp provider not configured" };
  }

  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return { status: "failed", recipient: to, error: errorText || "WhatsApp request failed" };
    }

    return { status: "sent", recipient: to, error: "" };
  } catch (error) {
    return { status: "failed", recipient: to, error: error.message };
  }
};

export const sendOrderNotifications = async ({ order, user, type }) => {
  const settings = await SiteSettings.findOne();
  const customerName = user?.name || "Customer";
  const whatsappTarget = order?.shippingInfo?.phoneNumber || settings?.whatsappPhone || "";
  const message = buildOrderMessage({ type, order, customerName });
  const results = [];

  if (settings?.enableEmailNotifications && user?.email) {
    try {
      await sendEmail({
        email: user.email,
        subject: `Order update - ${order._id}`,
        message,
      });

      results.push({
        channel: "email",
        type,
        status: "sent",
        recipient: user.email,
      });
    } catch (error) {
      results.push({
        channel: "email",
        type,
        status: "failed",
        recipient: user.email,
        error: error.message,
      });
    }
  } else {
    results.push({
      channel: "email",
      type,
      status: "skipped",
      recipient: user?.email || "",
      error: "Email notifications disabled or recipient missing",
    });
  }

  if (settings?.enableWhatsAppNotifications) {
    const whatsappResult = await sendWhatsAppMessage({ to: whatsappTarget, body: message });
    results.push({
      channel: "whatsapp",
      type,
      ...whatsappResult,
    });
  } else {
    results.push({
      channel: "whatsapp",
      type,
      status: "skipped",
      recipient: whatsappTarget,
      error: "WhatsApp notifications disabled",
    });
  }

  return results;
};
