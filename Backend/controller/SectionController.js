import Section from "../models/SectionModel.js";
import Product from "../models/ProductModel.js";
import HandelError from "../utils/handelError.js";
import HandleAsyncError from "../middleware/HandleAsyncError.js";
import { logAdminAction } from "../utils/adminLog.js";

/**
 * @route GET /api/v1/homepage-sections
 * @desc Get active sections with their products for the homepage.
 * @access Public
 */
export const getHomepageSections = HandleAsyncError(async (req, res, next) => {
  const sections = await Section.aggregate([
    { $match: { isActive: true } },
    { $sort: { order: 1, createdAt: 1 } },
    {
      $lookup: {
        from: "products",
        let: { sectionId: "$_id" },
        pipeline: [
          { $match: { $expr: { $in: ["$$sectionId", "$sections"] } } },
          { $limit: 10 } 
        ],
        as: "products"
      }
    },
    {
      $project: {
        name: 1,
        slug: 1,
        products: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    sections,
  });
});

/**
 * @route GET /api/v1/sections
 * @desc Active sections only, ordered — used by the Products page tabs and
 *       the CreateProduct/UpdateProduct multi-select.
 * @access Public
 */
export const getActiveSections = HandleAsyncError(async (req, res) => {
  const sections = await Section.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
  res.status(200).json({ success: true, sections });
});

/**
 * @route GET /api/v1/admin/sections
 * @desc All sections (active + inactive) for the admin manager page.
 * @access Admin
 */
export const getAllSections = HandleAsyncError(async (req, res) => {
  const sections = await Section.find().sort({ order: 1, createdAt: 1 });
  res.status(200).json({ success: true, sections });
});

export const createSection = HandleAsyncError(async (req, res, next) => {
  const name = (req.body.name || "").trim();
  if (!name) {
    return next(new HandelError("Please enter a section name", 400));
  }

  const existing = await Section.findOne({ name });
  if (existing) {
    return next(new HandelError("A section with this name already exists", 400));
  }

  const lastSection = await Section.findOne().sort({ order: -1 });
  const nextOrder = typeof req.body.order === "number" ? req.body.order : (lastSection ? lastSection.order + 1 : 0);

  const section = await Section.create({ name, order: nextOrder });

  res.status(201).json({ success: true, section });
  logAdminAction(req.user._id, "CREATE_SECTION", section._id, "Section", section.name);
});

export const updateSection = HandleAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const section = await Section.findById(id);
  if (!section) {
    return next(new HandelError("Section not found", 404));
  }

  const update = {};

  if (typeof req.body.name !== "undefined") {
    const trimmedName = req.body.name.trim();
    if (!trimmedName) {
      return next(new HandelError("Please enter a section name", 400));
    }

    const duplicate = await Section.findOne({ _id: { $ne: id }, name: trimmedName });
    if (duplicate) {
      return next(new HandelError("A section with this name already exists", 400));
    }

    update.name = trimmedName;
  }

  if (typeof req.body.order !== "undefined") {
    update.order = Number(req.body.order) || 0;
  }

  if (typeof req.body.isActive !== "undefined") {
    update.isActive = Boolean(req.body.isActive);
  }

  const updatedSection = await Section.findByIdAndUpdate(id, update, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, section: updatedSection });
  logAdminAction(req.user._id, "UPDATE_SECTION", updatedSection._id, "Section", updatedSection.name);
});

export const deleteSection = HandleAsyncError(async (req, res, next) => {
  const { id } = req.params;
  const section = await Section.findById(id);
  if (!section) {
    return next(new HandelError("Section not found", 404));
  }

  // Cleanup: pull this section's ObjectId out of every product that
  // references it, so we never leave orphaned refs behind.
  const { modifiedCount } = await Product.updateMany(
    { sections: id },
    { $pull: { sections: id } }
  );

  await section.deleteOne();

  res.status(200).json({
    success: true,
    message: "Section deleted successfully",
    affectedProductsCount: modifiedCount,
  });
  logAdminAction(req.user._id, "DELETE_SECTION", id, "Section", section.name);
});

/**
 * @route PATCH /api/v1/admin/sections/reorder
 * @desc Persists a new display order for sections (drag-and-drop / arrow
 *       reordering in the admin manager).
 * @access Admin
 */
export const reorderSections = HandleAsyncError(async (req, res, next) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return next(new HandelError("orderedIds must be a non-empty array", 400));
  }

  const bulkOps = orderedIds.map((sectionId, index) => ({
    updateOne: { filter: { _id: sectionId }, update: { order: index } },
  }));

  await Section.bulkWrite(bulkOps);

  const sections = await Section.find().sort({ order: 1, createdAt: 1 });
  res.status(200).json({ success: true, sections });
});
