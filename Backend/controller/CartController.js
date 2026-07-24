import HandleAsyncError from "../middleware/HandleAsyncError.js";
import UserModel from "../models/usersModel.js";
import ProductModel from "../models/ProductModel.js";
import ErrorHandler from "../utils/handelError.js";

/**
 * @route GET /api/v1/cart
 * @desc Get user's cart, populated with product details.
 * @access Private
 */
export const getUserCart = HandleAsyncError(async (req, res, next) => {
  const user = await UserModel.findById(req.user.id).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'name price image stock variants discount'
  });

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const populatedCart = user.cart.map(item => {
    if (!item.product) {
      return null; 
    }

    const selectedVariant = item.variantId 
      ? item.product.variants.find(v => v._id.toString() === item.variantId)
      : null;

    const price = selectedVariant?.price ?? item.product.price;
    const stock = selectedVariant?.stock ?? item.product.stock;
    const discount = item.product.discount || 0;
    
    return {
      cartKey: `${item.product._id}-${item.variantId || 'default'}`,
      product: item.product._id,
      name: item.product.name,
      price: Math.max(0, price - discount),
      image: item.product.image?.[0]?.url,
      stock: stock,
      variantId: item.variantId,
      variantLabel: selectedVariant?.label,
      quantity: item.quantity,
    };
  }).filter(Boolean); // Filter out null items where product was not found

  res.status(200).json({
    success: true,
    cart: populatedCart,
  });
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
        String(item.variantId) === String(guestItem.variantId)
    );

    if (dbCartItem) {
      // Item exists, update quantity
      dbCartItem.quantity += guestItem.quantity;
    } else {
      // Item does not exist, add it
      user.cart.push({
        product: guestItem.product,
        variantId: guestItem.variantId,
        quantity: guestItem.quantity,
      });
    }
  }

  await user.save({ validateBeforeSave: false });

  // Now, fetch the newly merged and populated cart to return it
  const updatedUser = await UserModel.findById(userId).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'name price image stock variants discount'
  });

  const populatedCart = updatedUser.cart.map(item => {
    if (!item.product) return null;

    const selectedVariant = item.variantId 
      ? item.product.variants.find(v => v._id.toString() === item.variantId)
      : null;

    const price = selectedVariant?.price ?? item.product.price;
    const stock = selectedVariant?.stock ?? item.product.stock;
    const discount = item.product.discount || 0;
    
    return {
      cartKey: `${item.product._id}-${item.variantId || 'default'}`,
      product: item.product._id,
      name: item.product.name,
      price: Math.max(0, price - discount),
      image: item.product.image?.[0]?.url,
      stock: stock,
      variantId: item.variantId,
      variantLabel: selectedVariant?.label,
      quantity: item.quantity,
    };
  }).filter(Boolean);

  res.status(200).json({
    success: true,
    message: "Carts merged successfully.",
    cart: populatedCart,
  });
});
