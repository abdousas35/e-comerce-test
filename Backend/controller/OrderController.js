import Order from "../models/OrderModel.js";
import Product from "../models/ProductModel.js";
import SiteSettings from "../models/SiteSettingsModel.js";
import HandelError from "../utils/handelError.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import { sendOrderNotifications } from "../utils/orderNotifications.js";

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

  if (!settings) {
    return 0;
  }

  if (Number(settings.freeShippingThreshold) > 0 && Number(itemPrice) >= Number(settings.freeShippingThreshold)) {
    return 0;
  }

  const zone = settings.shippingZones?.find((entry) => entry.state === shippingInfo?.state);
  if (zone) {
    return Number(zone.rate) || 0;
  }

  return Number(settings.defaultShippingRate) || 0;
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

export const createNewOrder = HandleAsyncError(async (req, res) => {
  const { shippingInfo, orderItems, itemPrice, taxPrice, shippingPrice, discountPrice, totalPrice, couponCode, notes } = req.body;

  const normalizedOrderItems = await normalizeOrderItems(orderItems || []);
  const computedShippingPrice =
    typeof shippingPrice === "number"
      ? shippingPrice
      : await calculateShippingFromSettings(shippingInfo, itemPrice);

  const order = await Order.create({
    shippingInfo,
    orderItems: normalizedOrderItems,
    itemPrice,
    taxPrice,
    shippingPrice: computedShippingPrice,
    discountPrice,
    totalPrice:
      typeof totalPrice === "number"
        ? totalPrice
        : Number(itemPrice || 0) + Number(computedShippingPrice || 0) - Number(discountPrice || 0),
    couponCode,
    notes: notes || "",
    orderStatus: "Pending",
    shippingStatus: "Pending",
    statusHistory: [{ status: "Pending", note: "Order created" }],
    user: req.user._id,
  });

  const fullOrder = await Order.findById(order._id);
  const notifications = await sendOrderNotifications({
    order: fullOrder,
    user: req.user,
    type: "order_created",
  });

  fullOrder.notifications.push(...notifications);
  await fullOrder.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order: fullOrder,
  });
});

export const getSingleOrder = HandleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate("user", "name email");
  if (!order) {
    return next(new HandelError("No order found", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const allMyOrders = HandleAsyncError(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
});

export const getAllOrders = HandleAsyncError(async (req, res) => {
  const orders = await Order.find();
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

  if (status === "Delivered" && order.orderStatus !== "Delivered") {
    await Promise.all(order.orderItems.map((item) => updateQuantity(item)));
    order.deliveredAt = Date.now();
    order.shippingStatus = "Delivered";
  }

  if (status === "Confirmed") {
    order.confirmedAt = Date.now();
  }

  if (status === "Processing") {
    order.processedAt = Date.now();
  }

  if (status === "Shipped") {
    order.shippedAt = Date.now();
    order.shippingStatus = "Shipped";
  }

  if (status === "Cancelled") {
    order.cancelledAt = Date.now();
    order.shippingStatus = "Cancelled";
  }

  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) order.trackingUrl = trackingUrl;
  if (courier !== undefined) order.courier = courier;

  order.orderStatus = status;
  order.statusHistory.push({
    status,
    note: note || getStatusNote(status),
  });

  await order.save({ validateBeforeSave: false });

  const notifications = await sendOrderNotifications({
    order,
    user: order.user,
    type: status === "Shipped" ? "order_shipped" : "status_updated",
  });

  order.notifications.push(...notifications);
  await order.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    order,
  });
});

async function updateQuantity(item) {
  const product = await Product.findById(item.product);
  if (!product) {
    return {
      productId: item.product?.toString?.() || item.product,
      skipped: true,
    };
  }

  if (item.variantId) {
    const variant = product.variants?.find((entry) => entry._id.toString() === item.variantId.toString());

    if (!variant) {
      return {
        productId: product._id.toString(),
        skipped: true,
      };
    }

    variant.stock -= item.quantity;
    product.stock = product.variants.reduce((acc, current) => acc + (Number(current.stock) || 0), 0);
    await product.save({ validateBeforeSave: false });

    return {
      productId: product._id.toString(),
      skipped: false,
    };
  }

  product.stock -= item.quantity;
  await product.save({ validateBeforeSave: false });
  return {
    productId: product._id.toString(),
    skipped: false,
  };
}

export const deleteOrder = HandleAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new HandelError("No order found", 404));
  }

  await Order.deleteOne({ _id: req.params.id });
  res.status(200).json({
    success: true,
    messgae: "Order deleted successfully",
  });
});
