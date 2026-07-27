import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import Coupon from "../models/CouponModel.js";
import SiteSettings from "../models/SiteSettingsModel.js";
import HandelError from "../utils/handelError.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import { sendOrderNotifications } from "../utils/orderNotifications.js";
import { logAdminAction } from "../utils/adminLog.js";

const ORDER_STATUSES = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];


const getStatusNote = (status) => {
  switch (status) {
    case "Pending":
      return "Order created";
    case "Confirmed":
      return "Order confirmed by store";
    case "Processing":
      return "Order is being prepared";
    case "Shipped":
      return "Order shipped to customer";
    case "Delivered":
      return "Order delivered successfully";
    case "Cancelled":
      return "Order cancelled";
    default:
      return "";
  }
};

const calculateShippingFromSettings = async (shippingInfo, itemPrice = 0) => {
  const settings = await SiteSettings.findOne();
  if (!settings) return 0;

  if (Number(settings.freeShippingThreshold) > 0 && Number(itemPrice) >= Number(settings.freeShippingThreshold)) {
    return 0;
  }

  const zone = settings.shippingZones?.find((entry) => entry.state === shippingInfo?.state);
  if (zone) return Number(zone.rate) || 0;

  return Number(settings.defaultShippingRate) || 0;
};

const validateAndCalculateDiscount = async (couponCode, orderAmount, userId, orderItems = []) => {
  if (!couponCode || couponCode.trim() === "") {
    return { discountAmount: 0, coupon: null };
  }

  const coupon = await Coupon.findOne({ 
    code: couponCode.toUpperCase(),
    isActive: true 
  });

  if (!coupon) throw new HandelError("Invalid coupon code", 400);
  if (new Date() > new Date(coupon.expiresAt)) throw new HandelError("Coupon has expired", 400);
  if (Number(orderAmount) < Number(coupon.minOrderAmount)) {
    throw new HandelError(`Minimum order amount is ${coupon.minOrderAmount}`, 400);
  }
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new HandelError("Coupon usage limit exceeded", 400);
  }
  if (userId) {
    const alreadyUsed = coupon.usedBy?.some(use => use.userId?.toString() === userId.toString());
    if (alreadyUsed) throw new HandelError("You have already used this coupon", 400);
  }

  // Check applicableCategories / applicableProducts
  if (coupon.applicableCategories?.length > 0 || coupon.applicableProducts?.length > 0) {
    const applicableProductIds = coupon.applicableProducts?.map(id => id.toString()) || [];
    const hasEligibleItem = orderItems.some(item => {
      if (applicableProductIds.includes(item.product?.toString())) return true;
      if (coupon.applicableCategories?.length > 0) {
        // We'll check category via product lookup — done after normalization so we use item.category if available
        return false; // category check handled below
      }
      return false;
    });

    if (coupon.applicableCategories?.length > 0) {
      const productIds = orderItems.map(i => i.product);
      const products = await Product.find({ _id: { $in: productIds } }).select('category');
      const categoryMatch = products.some(p => coupon.applicableCategories.includes(p.category));
      if (!categoryMatch && !hasEligibleItem) {
        throw new HandelError("Coupon is not applicable to items in your order", 400);
      }
    } else if (!hasEligibleItem) {
      throw new HandelError("Coupon is not applicable to items in your order", 400);
    }
  }

  let discountAmount = 0;
  if (coupon.type === "percent") {
    discountAmount = (Number(orderAmount) * Number(coupon.value)) / 100;
    if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
  } else {
    discountAmount = Number(coupon.value);
  }

  return { discountAmount, coupon };
};

const reserveStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variantId) {
      const variant = product.variants?.find((v) => v._id.toString() === item.variantId.toString());
      if (variant) {
        variant.stock -= item.quantity;
      }
    } else {
      product.stock -= item.quantity;
    }

    // Update total stock if variants exist
    if (product.variants?.length > 0) {
      product.stock = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    }

    await product.save({ validateBeforeSave: false });
  }
};

const releaseStock = async (orderItems) => {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    if (item.variantId) {
      const variant = product.variants?.find((v) => v._id.toString() === item.variantId.toString());
      if (variant) {
        variant.stock += item.quantity;
      }
    } else {
      product.stock += item.quantity;
    }

    // Update total stock if variants exist
    if (product.variants?.length > 0) {
      product.stock = product.variants.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
    }

    await product.save({ validateBeforeSave: false });
  }
};

const sanitizeVariantId = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  return value;
};

const normalizeIncomingOrderItems = (orderItems = []) => {
  return (orderItems || []).map((item) => ({
    ...item,
    variantId: sanitizeVariantId(item.variantId),
  }));
};

const normalizeOrderItems = async (orderItems = []) => {
  const normalizedOrderItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new HandelError(`Product not found for item ${item.name || item.product}`, 404);
    }

    let availableStock = Number(product.stock) || 0;
    let variantSnapshot = {
      variantId: null,
      variantLabel: "",
      selectedOptions: { size: "", color: "" },
      sku: "",
      price: Number(item.price) || Number(product.price) || 0,
    };

    if (item.variantId) {
      const selectedVariant = product.variants?.find((variant) => variant._id.toString() === item.variantId.toString());
      if (!selectedVariant) {
        throw new HandelError(`Variant not found for product ${product.name}`, 404);
      }

      availableStock = Number(selectedVariant.stock) || 0;
      variantSnapshot = {
        variantId: selectedVariant._id,
        variantLabel: selectedVariant.label || "",
        selectedOptions: {
          size: selectedVariant.size || "",
          color: selectedVariant.color || "",
        },
        sku: selectedVariant.sku || "",
        price: Number(selectedVariant.price) || Number(product.price) || 0,
      };
    }

    if (Number(item.quantity) > availableStock) {
      throw new HandelError(`Insufficient stock for ${product.name}`, 400);
    }

    normalizedOrderItems.push({
      name: item.name || product.name,
      price: variantSnapshot.price,
      quantity: Number(item.quantity) || 1,
      image: item.image || product.image?.[0]?.url || "",
      product: item.product,
      variantId: variantSnapshot.variantId,
      variantLabel: variantSnapshot.variantLabel,
      selectedOptions: variantSnapshot.selectedOptions,
      sku: variantSnapshot.sku,
    });
  }

  return normalizedOrderItems;
};

export const createNewOrder = HandleAsyncError(async (req, res, next) => {
  const { 
    shippingInfo, 
    orderItems, 
    itemPrice, 
    taxPrice, 
    shippingPrice, 
    discountPrice, 
    totalPrice, 
    couponCode, 
    notes,
    idempotencyKey 
  } = req.body;

  // ============ IDEMPOTENCY CHECK ============
  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ idempotencyKey });
    if (existingOrder) {
      return res.status(200).json({
        success: true,
        order: existingOrder,
        isDuplicate: true
      });
    }
  }

  try {
    // ============ NORMALIZE ITEMS ============
    const sanitizedOrderItems = normalizeIncomingOrderItems(orderItems || []);
    const normalizedOrderItems = await normalizeOrderItems(sanitizedOrderItems);

    // ============ CALCULATE PRICES (Backend Only) ============
    const computedShippingPrice = typeof shippingPrice === "number"
      ? shippingPrice
      : await calculateShippingFromSettings(shippingInfo, itemPrice);

    // ============ VALIDATE COUPON ============
    const subtotalWithShipping = Number(itemPrice || 0) + Number(computedShippingPrice || 0);
    const { discountAmount, coupon } = await validateAndCalculateDiscount(
      couponCode,
      subtotalWithShipping,
      req.user?._id || null,
      normalizedOrderItems
    );

    const computedTotalPrice = Number(itemPrice || 0) + Number(computedShippingPrice || 0) - Number(discountAmount || 0);

    // ============ CREATE ORDER (Initial State) ============
    const order = await Order.create({
      idempotencyKey,
      shippingInfo,
      orderItems: normalizedOrderItems,
      itemPrice: Number(itemPrice || 0),
      taxPrice: Number(taxPrice || 0),
      shippingPrice: computedShippingPrice,
      discountPrice: discountAmount,
      totalPrice: computedTotalPrice,
      couponCode: coupon?.code || "",
      couponValidatedAt: coupon ? new Date() : null,
      notes: notes || "",
      orderStatus: "Pending",
      stockReserved: false,
      statusHistory: [{ 
        status: "Pending", 
        note: "Order created",
        changedBy: req.user?._id || null,
        changedByRole: "user"
      }],
      user: req.user?._id || null,
    });

    let fullOrder = await Order.findById(order._id).populate("user", "name email");

    // ============ RESERVE STOCK ============
    try {
      await reserveStock(normalizedOrderItems);
      fullOrder.stockReserved = true;
      fullOrder.stockReservedAt = new Date();
      await fullOrder.save({ validateBeforeSave: false });
    } catch (stockError) {
      console.error("[ORDER_CREATE] Stock reservation failed", {
        orderId: fullOrder._id.toString(),
        error: stockError.message,
      });
    }

    // ============ UPDATE COUPON USAGE ============
    if (coupon) {
      coupon.usedCount += 1;
      if (req.user?._id) {
        coupon.usedBy.push({
          userId: req.user._id,
          orderId: fullOrder._id,
          usedAt: new Date()
        });
      }
      await coupon.save({ validateBeforeSave: false });
    }

    // ============ SEND NOTIFICATIONS ============
    try {
      const notifications = await sendOrderNotifications({
        order: fullOrder,
        user: req.user,
        type: "order_created",
      });

      fullOrder.notifications.push(...notifications);
      await fullOrder.save({ validateBeforeSave: false });
    } catch (notificationError) {
      console.warn("[ORDER_CREATE] Notification failed (order still created)", {
        orderId: fullOrder._id.toString(),
        error: notificationError.message,
      });
      fullOrder.notifications.push({
        channel: "system",
        type: "order_created",
        status: "failed",
        error: notificationError.message
      });
      await fullOrder.save({ validateBeforeSave: false });
    }

    // ============ RETURN SUCCESS ============
    res.status(201).json({
      success: true,
      order: fullOrder,
      message: "Order created successfully"
    });

  } catch (error) {
    console.error("[ORDER_CREATE] Error occurred", {
      error: error.message,
      stack: error.stack
    });
    return next(error);
  }
});

export const getSingleOrder = HandleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name email")
    .populate("statusHistory.changedBy", "name email");
  
  if (!order) {
    return next(new HandelError("No order found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const allMyOrders = HandleAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getAllOrders = HandleAsyncError(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });
  
  let totalAmount = 0;
  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    orders,
    totalAmount,
  });
});

export const updateOrderStatus = HandleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    return next(new HandelError("No order found", 404));
  }

  const { status, trackingNumber, trackingUrl, courier, note } = req.body;

  if (!status || !ORDER_STATUSES.includes(status)) {
    return next(new HandelError("Invalid order status", 400));
  }

  if (order.orderStatus === status) {
    return next(new HandelError("Order status is already up to date", 400));
  }

  // ============ UPDATE STATUS WITH AUDIT TRAIL ============
  order.orderStatus = status;
  
  order.statusHistory.push({
    status,
    note: note || getStatusNote(status),
    changedBy: req.user?._id || null,
    changedByRole: "admin"
  });

  // ============ SET TIMESTAMP BASED ON STATUS ============
  if (status === "Confirmed") order.confirmedAt = Date.now();
  if (status === "Processing") order.processedAt = Date.now();
  if (status === "Shipped") order.shippedAt = Date.now();
  if (status === "Delivered") order.deliveredAt = Date.now();
  if (status === "Cancelled") {
    order.cancelledAt = Date.now();
    // Release stock if cancelled
    try {
      await releaseStock(order.orderItems);
    } catch (releaseError) {
      console.warn("[ORDER_CANCEL] Stock release failed", {
        orderId: order._id.toString(),
        error: releaseError.message,
      });
    }
  }

  // ============ UPDATE TRACKING INFO ============
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
  if (courier !== undefined) order.courier = courier;

  await order.save({ validateBeforeSave: false });

  // ============ SEND STATUS UPDATE NOTIFICATIONS ============
  try {
    const notificationType = status === "Shipped" ? "order_shipped" : "status_updated";
    const notifications = await sendOrderNotifications({
      order,
      user: order.user,
      type: notificationType,
    });

    order.notifications.push(...notifications);
    await order.save({ validateBeforeSave: false });
  } catch (notificationError) {
    console.warn("[ORDER_STATUS_UPDATE] Notification failed", {
      orderId: order._id.toString(),
      error: notificationError.message,
    });
    order.notifications.push({
      channel: "system",
      type: "status_updated",
      status: "failed",
      error: notificationError.message
    });
    await order.save({ validateBeforeSave: false });
  }

  res.status(200).json({
    success: true,
    order,
    message: `Order status updated to ${status}`
  });
  logAdminAction(req.user._id, "UPDATE_ORDER_STATUS", order._id, "Order", `Status: ${status}`);
});

export const deleteOrder = HandleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return next(new HandelError("Order not found", 404));
  }

  // Only delete pending orders
  if (order.orderStatus !== "Pending") {
    return next(new HandelError("Can only delete pending orders", 400));
  }

  // Release reserved stock before deletion
  if (order.stockReserved) {
    try {
      await releaseStock(order.orderItems);
    } catch (releaseError) {
      console.warn("[ORDER_DELETE] Stock release failed", {
        orderId: order._id.toString(),
        error: releaseError.message,
      });
    }
  }

  await Order.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Order deleted successfully"
  });
  logAdminAction(req.user._id, "DELETE_ORDER", order._id, "Order");
});
