import HandleAsyncError from "../middleware/HandleAsyncError.js";
import UserModel from "../models/usersModel.js";
import ProductModel from "../models/ProductModel.js";
import ErrorHandler from "../utils/handelError.js";

const buildPopulatedCart = (user) =>
  user.cart.map(item => {
    if (!item.product) return null;
    const selectedCombination = item.comboId
      ? item.product.combinations?.find((combo) => String(combo._id) === String(item.comboId)) || null
      : null;
    const price = selectedCombination?.price ?? item.product.price;
    const stock = selectedCombination?.stock ?? item.product.stock;
    const discount = item.product.discount || 0;
    return {
      cartKey: `${item.product._id}-${item.comboId || 'default'}`,
      product: item.product._id,
      name: item.product.name,
      price: Math.max(0, price - discount),
      image: selectedCombination?.images?.[0]?.url || item.product.image?.[0]?.url,
      stock,
      comboId: item.comboId,
      variantLabel: selectedCombination ? selectedCombination.selections.map((selection) => `${selection.groupName}: ${selection.value}`).join(" / ") : "",
      quantity: item.quantity,
    };
  }).filter(Boolean);

/**
 * @route GET /api/v1/cart
 * @desc Get user's cart, populated with product details.
 * @access Private
 */
export const getUserCart = HandleAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'name price image stock optionGroups combinations discount'
  });

  if (!user) return next(new ErrorHandler("User not found", 404));

  res.status(200).json({ success: true, cart: buildPopulatedCart(user) });
});

/**
 * @route POST /api/v1/cart/merge
 * @desc Merge guest cart with user's DB cart.
 * @access Private
 */
export const mergeCarts = HandleAsyncError(async (req, res, next) => {
  const { cartItems: guestCart } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(guestCart) || guestCart.length === 0) {
    return next(new ErrorHandler("No cart items provided for merge.", 400));
  }

  const user = await UserModel.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found.", 404));
  }

  for (const guestItem of guestCart) {
    const productExists = await ProductModel.findById(guestItem.product);
    if (!productExists) {
        // Per user instructions, we silently ignore items that no longer exist.
        console.warn(`Product with ID ${guestItem.product} not found. Skipping from merge.`);
        continue;
    }

    const dbCartItem = user.cart.find(
      (item) =>
        item.product.toString() === guestItem.product &&
        String(item.comboId) === String(guestItem.comboId)
    );

    if (dbCartItem) {
      // Item exists, update quantity
      dbCartItem.quantity += guestItem.quantity;
    } else {
      // Item does not exist, add it
      user.cart.push({
        product: guestItem.product,
        comboId: guestItem.comboId,
        quantity: guestItem.quantity,
      });
    }
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await UserModel.findById(userId).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'name price image stock optionGroups combinations discount'
  });

  res.status(200).json({
    success: true,
    message: "Carts merged successfully.",
    cart: buildPopulatedCart(updatedUser),
  });
});

/**
 * @route PUT /api/v1/cart
 * @desc Update cart items (add/remove/change quantity)
 * @access Private
 */
export const updateCart = HandleAsyncError(async (req, res, next) => {
  const { cartItems } = req.body;
  if (!Array.isArray(cartItems)) return next(new ErrorHandler("cartItems must be an array", 400));

  const user = await UserModel.findById(req.user.id);
  if (!user) return next(new ErrorHandler("User not found", 404));

  user.cart = cartItems.map(item => ({
    product: item.product,
    comboId: item.comboId || undefined,
    quantity: item.quantity || 1,
  }));
  user.cartUpdatedAt = new Date();
  await user.save({ validateBeforeSave: false });

  const updatedUser = await UserModel.findById(req.user.id).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'name price image stock optionGroups combinations discount'
  });

  res.status(200).json({ success: true, cart: buildPopulatedCart(updatedUser) });
});
