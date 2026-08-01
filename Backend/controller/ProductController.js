import Product from "../models/ProductModel.js";
import Order from "../models/OrderModel.js";
import Section from "../models/SectionModel.js";
import HandelError from "../utils/handelError.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import APIFunctionality from "../utils/apiFunctionality.js";
import { v2 as cloudinary } from "cloudinary";
import { logAdminAction } from "../utils/adminLog.js";

const MONGO_ID_REGEX = /^[a-f\d]{24}$/i;

// Keeps only well-formed Mongo ObjectId strings coming from the admin form's
// section multi-select, dropping anything malformed/empty.
const sanitizeSectionIds = (rawSections) => {
  if (!Array.isArray(rawSections)) return [];
  return rawSections.filter((id) => typeof id === "string" && MONGO_ID_REGEX.test(id));
};

const createSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Parses the raw optionGroups payload (JSON string or array) coming from the
// admin form. Shape: [{ name: "Couleur", values: ["Rouge", "Bleu"] }]
const parseOptionGroups = (rawGroups = []) => {
  let parsedGroups = rawGroups;

  if (typeof rawGroups === "string") {
    try {
      parsedGroups = JSON.parse(rawGroups);
    } catch {
      parsedGroups = [];
    }
  }

  if (!Array.isArray(parsedGroups)) {
    return [];
  }

  return parsedGroups
    .map((group) => {
      const values = Array.isArray(group.values)
        ? group.values.map((value) => String(value || "").trim()).filter(Boolean)
        : [];

      return {
        name: (group.name || "").trim(),
        values,
      };
    })
    .filter((group) => group.name && group.values.length > 0);
};

const parseCombinations = (rawCombinations = []) => {
  let parsedCombinations = rawCombinations;

  if (typeof rawCombinations === "string") {
    try {
      parsedCombinations = JSON.parse(rawCombinations);
    } catch {
      parsedCombinations = [];
    }
  }

  if (!Array.isArray(parsedCombinations)) {
    return [];
  }

  return parsedCombinations
    .map((combination) => ({
      selections: Array.isArray(combination.selections)
        ? combination.selections
            .filter((selection) => selection?.groupName && selection?.value)
            .map((selection) => ({
              groupName: String(selection.groupName).trim(),
              value: String(selection.value).trim(),
            }))
        : [],
      price: Number(combination.price) || 0,
      stock: Number(combination.stock) || 0,
      images: Array.isArray(combination.images) ? combination.images : combination.images ? [combination.images] : [],
    }))
    .filter((combination) => combination.selections.length > 0);
};

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

const uploadImages = async (images = [], folder = "products") => {
  const imageList = Array.isArray(images) ? images : [images];
  const imagesLinks = [];

  for (let i = 0; i < imageList.length; i += 1) {
    const result = await cloudinary.uploader.upload(imageList[i], {
      folder,
    });

    imagesLinks.push({
      publicId: result.public_id,
      url: result.secure_url,
    });
  }

  return imagesLinks;
};

// Uploads any raw base64 images attached to each combination while leaving
// already uploaded objects untouched.
const uploadCombinationsImages = async (combinations = []) => {
  const uploadedCombinations = [];

  for (const combination of combinations) {
    const alreadyUploaded = (combination.images || []).filter((img) => img && typeof img === "object" && img.url);
    const rawImages = (combination.images || []).filter((img) => typeof img === "string");
    const newlyUploaded = rawImages.length > 0 ? await uploadImages(rawImages, "products/combinations") : [];

    uploadedCombinations.push({
      ...combination,
      images: [...alreadyUploaded, ...newlyUploaded],
    });
  }

  return uploadedCombinations;
};

export const createProducts = async (req, res, next) => {
  try {
    const { name, price, description, keywords, stock, image, category, optionGroups, combinations, discount, sections } = req.body;
    const parsedOptionGroups = parseOptionGroups(optionGroups);
    const parsedCombinations = parseCombinations(combinations);
    const normalizedCombinations = await uploadCombinationsImages(parsedCombinations);

    if (!image || image.length === 0) {
      return res.status(400).json({ message: "Images are required" });
    }

    const imagesLinks = await uploadImages(image);

    const product = await Product.create({
      name,
      slug: createSlug(name),
      price: Number(price) || 0,
      discount: Number(discount) || 0,
      description,
      keywords: keywords || "",
      stock: Number(stock) || 0,
      category: category || "Default",
      image: imagesLinks,
      optionGroups: parsedOptionGroups,
      combinations: normalizedCombinations,
      sections: sanitizeSectionIds(sections),
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route GET /api/v1/products/categories
 * @desc Returns the distinct list of categories currently in use across all products.
 *       Powers the Navbar category select — no separate Category collection needed,
 *       a category simply "exists" as long as at least one product uses it.
 * @access Public
 */
export const getProductCategories = HandleAsyncError(async (req, res, next) => {
  const categories = await Product.distinct("category");

  const cleaned = categories
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  res.status(200).json({
    success: true,
    categories: cleaned,
  });
});

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

/**
 * @route GET /api/v1/products/suggestions?keyword=...
 * @desc Lightweight live-search preview for the navbar dropdown (name, price, image only)
 * @access Public
 */
export const searchSuggestions = HandleAsyncError(async (req, res, next) => {
  const keyword = (req.query.keyword || "").trim();

  if (!keyword) {
    return res.status(200).json({ success: true, products: [] });
  }

  // هروب الرموز الخاصة لتفادي كسر الـ Regex
  const safeKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const products = await Product.find({
    $or: [
      { name: { $regex: safeKeyword, $options: "i" } },
      { keywords: { $regex: safeKeyword, $options: "i" } },
      { description: { $regex: safeKeyword, $options: "i" } },
    ],
  })
    .select("name price image discount slug")
    .limit(6);

  res.status(200).json({ success: true, products });
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

  if (typeof req.body.optionGroups !== "undefined") {
    req.body.optionGroups = parseOptionGroups(req.body.optionGroups);
  }

  if (typeof req.body.combinations !== "undefined") {
    const parsedCombinations = parseCombinations(req.body.combinations);
    req.body.combinations = await uploadCombinationsImages(parsedCombinations);
  }

  if (typeof req.body.sections !== "undefined") {
    req.body.sections = sanitizeSectionIds(req.body.sections);
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
  logAdminAction(req.user._id, "UPDATE_PRODUCT", product._id, "Product");
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
  logAdminAction(req.user._id, "DELETE_PRODUCT", product._id, "Product", product.name);
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
    const price = Number(row.price) || 0;
    const stock = Number(row.stock) || 0;
    const imageUrls = (row.images || row.image || "")
      .split("|")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!name || !description || !price) {
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
      optionGroups: [],
      combinations: [],
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

export const getRelatedProducts = HandleAsyncError(async (req, res, next) => {
    const product = await Product.findById(req.params.id).select('category');
    if (!product) return next(new HandelError("Product not found", 404));

    const related = await Product.find({
        category: product.category,
        _id: { $ne: product._id },
    }).limit(6).select('name price image discount ratings numOfReviews stock slug');

    res.status(200).json({ success: true, products: related });
});

/**
 * @route GET /api/v1/homepage-sections
 * @desc Returns every active section together with a handful of its
 *       products in a single request, powering the homepage product rows.
 *       Sections with zero matching products are omitted so the homepage
 *       never renders an empty row.
 * @access Public
 */
export const getHomepageSections = HandleAsyncError(async (req, res) => {
    const sections = await Section.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

    const results = await Promise.all(
        sections.map(async (section) => {
            const products = await Product.find({ sections: section._id })
                .sort({ createdAt: -1 })
                .limit(10)
                .select('name price image discount stock ratings numOfReviews slug');

            return {
                _id: section._id,
                name: section.name,
                slug: section.slug,
                order: section.order,
                products,
            };
        })
    );

    res.status(200).json({
        success: true,
        sections: results.filter((section) => section.products.length > 0),
    });
});