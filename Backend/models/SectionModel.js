import mongoose from "mongoose";

const createSlug = (value = "") =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

// Homepage/Products-page product groupings the admin defines (e.g.
// "Bestsellers", "New Arrivals"). A product can belong to multiple sections
// at once — see `sections: [ObjectId]` on ProductModel.
const sectionSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter a section name"],
            trim: true,
            unique: true
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        order: {
            type: Number,
            default: 0
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

sectionSchema.pre("validate", function (next) {
    if (this.name) {
        this.slug = createSlug(this.name);
    }
    next();
});

sectionSchema.index({ isActive: 1, order: 1 });

export default mongoose.model("Section", sectionSchema);
