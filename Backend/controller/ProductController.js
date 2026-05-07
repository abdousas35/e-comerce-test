import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import HandelError from "../utils/handelError.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import APIFunctionality from "../utils/apiFunctionality.js";
import { v2 as cloudinary } from "cloudinary";

const createSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseVariants = (rawVariants = []) => {
  let parsedVariants = rawVariants;

  if (typeof rawVariants === "string") {
    try {
      parsedVariants = JSON.parse(rawVariants);
    } catch {
      parsedVariants = [];
    }
  }

  if (!Array.isArray(parsedVariants)) {
    return [];
  }

  return parsedVariants
    .map((variant, index) => ({
      label: variant.label || [variant.size, variant.color].filter(Boolean).join(" / ") || `Variant ${index + 1}`,
      sku: variant.sku || "",
      size: variant.size || "",
      color: variant.color || "",
      price: Number(variant.price) || 0,
      stock: Number(variant.stock) || 0,
    }))
    .filter((variant) => variant.price > 0 || variant.stock > 0 || variant.size || variant.color);
};

const getEffectiveStock = (variants = [], fallbackStock = 0) =>
  variants.length > 0
    ? variants.reduce((acc, variant) => acc + (Number(variant.stock) || 0), 0)
    : Number(fallbackStock) || 0;

const getEffectivePrice = (variants = [], fallbackPrice = 0) =>
  variants.length > 0
    ? Math.min(...variants.map((variant) => Number(variant.price) || 0))
    : Number(fallbackPrice) || 0;

const parseCsvLine = (line = "") => {
  const cells = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"' && line[index + 1] === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
};

const parseCsvRows = (csvText = "") => {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
};

const uploadImages = async (images = []) => {
  const imageList = Array.isArray(images) ? images : [images];
  const imagesLinks = [];

  for (let i = 0; i < imageList.length; i += 1) {
    const result = await cloudinary.uploader.upload(imageList[i], {
      folder: "products",
    });

    imagesLinks.push({
      publicId: result.public_id,
      url: result.secure_url,
    });
  }

  return imagesLinks;
};

export const createProducts = async (req, res, next) => {
  try {
    const { name, price, description, keywords, stock, image, category, variants } = req.body;
    const normalizedVariants = parseVariants(variants);

    if (!image || image.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    const imagesLinks = await uploadImages(image);

    const product = await Product.create({
      name,
      slug: createSlug(name),
      price: getEffectivePrice(normalizedVariants, price),
      description,
      keywords: keywords || "",
      stock: getEffectiveStock(normalizedVariants, stock),
      category: category || "Default",
      image: imagesLinks,
      variants: normalizedVariants,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllProducts = HandleAsyncError(async (req, res, next) => {
  const resultPerPage = Number(req.query.limit) || 8;

  const apiFeatures = new APIFunctionality(Product.find(), req.query);
  apiFeatures.search();
  apiFeatures.filter();

  const filteredQuery = apiFeatures.query.clone();
  const productCount = await filteredQuery.countDocuments();
  const totalPages = Math.ceil(productCount / resultPerPage);
  const page = Number(req.query.page) || 1;

  if (page > totalPages && productCount > 0) {
    return next(new HandelError("This page doesn't exist", 404));
  }

  apiFeatures.pagination(resultPerPage);
  const products = await apiFeatures.query;

  res.status(200).json({
    success: true,
    products,
    productCount,
    resultPerPage,
    totalPages,
    currentPage: page,
  });
});

export const updateProduct = HandleAsyncError(async (req, res, next) => {
  const { id } = req.params;
  if (req.body.name) {
    req.body.slug = createSlug(req.body.name);
  }

  let product = await Product.findById(id);
  if (!product) {
    return next(new HandelError("Product not found", 404));
  }

  if (typeof req.body.variants !== "undefined") {
    const parsedVariants = parseVariants(req.body.variants);
    req.body.variants = parsedVariants;
    req.body.stock = getEffectiveStock(parsedVariants, req.body.stock);
    req.body.price = getEffectivePrice(parsedVariants, req.body.price ?? product.price);
  }

  if (req.body.image) {
    for (let i = 0; i < product.image.length; i += 1) {
      if (product.image[i].publicId) {
        await cloudinary.uploader.destroy(product.image[i].publicId);
      }
    }

    req.body.image = await uploadImages(req.body.image);
  }

  product = await Product.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "The product has been successfully updated",
    product,
  });
});

export const deleteProduct = HandleAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new HandelError("Product not found", 404));
  }

  for (const img of product.image) {
    if (img.publicId) {
      await cloudinary.uploader.destroy(img.publicId);
    }
  }

  const deletedOrdersResult = await Order.deleteMany({
    "orderItems.product": product._id,
  });

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "the product has seccessfully deleted",
    deletedOrdersCount: deletedOrdersResult.deletedCount || 0,
  });
});

export const accessingSingleProduct = HandleAsyncError(async (req, res, next) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) {
    return next(new HandelError("Product not found", 404));
  }

  res.status(200).json({
    success: true,
    product,
  });
});

export const createRiviewForProduct = HandleAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  if (!rating || !comment || !productId) {
    return next(new HandelError("Please provide all review fields", 400));
  }

  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandelError("Product not found", 404));
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const reviewIndex = product.reviews.findIndex((r) => r.user && r.user.toString() === req.user._id.toString());

  if (reviewIndex !== -1) {
    product.reviews[reviewIndex].rating = Number(rating);
    product.reviews[reviewIndex].comment = comment;
  } else {
    product.reviews.push(review);
  }

  product.numOfReviews = product.reviews.length;
  const sumRatings = product.reviews.reduce((acc, r) => acc + r.rating, 0);
  product.ratings = product.reviews.length > 0 ? sumRatings / product.reviews.length : 0;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: reviewIndex !== -1 ? "Review updated successfully" : "Review added successfully",
  });
});

export const getProductReviews = HandleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);
  if (!product) {
    return next(new HandelError("Product not found", 400));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

export const deleteProductReview = HandleAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);
  if (!product) {
    return next(new HandelError("Product not found", 400));
  }

  const reviewExists = product.reviews.find((r) => r._id.toString() === req.query.id.toString());

  if (!reviewExists) {
    return next(new HandelError("Review not found", 404));
  }

  product.reviews = product.reviews.filter((r) => r._id.toString() !== req.query.id.toString());

  let sum = 0;
  product.reviews.forEach((r) => {
    sum += r.rating;
  });

  product.ratings = product.reviews.length > 0 ? sum / product.reviews.length : 0;
  product.numOfReviews = product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    product,
  });
});

export const getAdminProducts = HandleAsyncError(async (req, res) => {
  const products = await Product.find();
  const productCount = products.length;

  res.status(200).json({
    success: true,
    productCount,
    products,
  });
});

export const importProductsFromCsv = HandleAsyncError(async (req, res, next) => {
  const csvText = req.body?.csvText || "";
  const rows = Array.isArray(req.body?.rows) ? req.body.rows : parseCsvRows(csvText);

  if (!rows.length) {
    return next(new HandelError("CSV file is empty or invalid", 400));
  }

  const createdProducts = [];
  const skippedRows = [];

  for (const [index, row] of rows.entries()) {
    const name = row.name || row.productname || "";
    const description = row.description || "";
    const category = row.category || "Default";
    const keywords = row.keywords || "";
    const parsedVariants = parseVariants(row.variants || "[]");
    const price = getEffectivePrice(parsedVariants, row.price);
    const stock = getEffectiveStock(parsedVariants, row.stock);
    const imageUrls = (row.images || row.image || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!name || !description || (!price && parsedVariants.length === 0)) {
      skippedRows.push({ row: index + 2, reason: "Missing required product fields" });
      continue;
    }

    const product = await Product.create({
      name,
      slug: createSlug(name),
      description,
      category,
      keywords,
      price,
      stock,
      variants: parsedVariants,
      image:
        imageUrls.length > 0
          ? imageUrls.map((url, imageIndex) => ({
              publicId: `csv-import-${Date.now()}-${index}-${imageIndex}`,
              url,
            }))
          : [
              {
                publicId: `csv-import-placeholder-${Date.now()}-${index}`,
                url: "/images/default.jpg",
              },
            ],
    });

    createdProducts.push(product);
  }

  res.status(201).json({
    success: true,
    importedCount: createdProducts.length,
    skippedRows,
    products: createdProducts,
  });
});
