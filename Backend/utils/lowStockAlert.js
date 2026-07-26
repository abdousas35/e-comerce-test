import { sendEmail } from "./sendEmail.js";
import SiteSettings from "../models/SiteSettingsModel.js";

export const sendLowStockAlertEmail = async (product) => {
  try {
    const settings = await SiteSettings.findOne();
    const adminEmail = settings?.contactEmail || process.env.ADMIN_EMAIL;

    if (!adminEmail) {
      console.warn("No admin email configured for low stock alerts.");
      return;
    }

    const subject = `Low Stock Alert: ${product.name}`;
    const message = `
      <p>This is an automated alert to inform you that a product in your inventory is running low on stock.</p>
      
      <h2>Product Details:</h2>
      <ul>
        <li><strong>Product Name:</strong> ${product.name}</li>
        <li><strong>Product ID:</strong> ${product._id}</li>
        <li><strong>Remaining Stock:</strong> ${product.stock}</li>
        <li><strong>Low Stock Threshold:</strong> ${product.lowStock}</li>
      </ul>
      
      <p>Please consider restocking this item soon to avoid going out of stock.</p>
      
      <p>Thank you,<br>Your Inventory Management System</p>
    `;

    await sendEmail({
      email: adminEmail,
      subject,
      message,
    });

    console.log(`Low stock alert email sent for product: ${product.name}`);

  } catch (error) {
    console.error("Error sending low stock alert email:", error);
  }
};
