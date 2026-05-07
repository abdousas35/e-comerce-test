import mongoose from "mongoose";

const createSlug = (value = "") =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const variantSchema = new mongoose.Schema(
    {
        label: {
            type: String,
            trim: true,
            default: ""
        },
        sku: {
            type: String,
            trim: true,
            default: ""
        },
        size: {
            type: String,
            trim: true,
            default: ""
        },
        color: {
            type: String,
            trim: true,
            default: ""
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Variant price cannot be negative"]
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "Variant stock cannot be negative"],
            default: 0
        }
    },
    { _id: true }
);

const productSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please Enter Product Name"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please Enter Product Description"],
        trim: true
    },
    keywords: {
        type: String,
        default: "",
        trim: true
    },
    price: {
        type: Number,
        required: [true, "Please Enter Product Price"],
        min: [0, "Product price cannot be negative"]

    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    ratings: {
        type: Number,
        default: 0

    },
    image: [

        {

            publicId: {

                type: String,
                required: true
            },

            url: {

                type: String,
                require: true

            }
        }

    ],
    category: {

        type: String,
        required: [true, "Please Enter Product Category"],

    },
    variants: {
        type: [variantSchema],
        default: []
    },
    stock: {

        type: Number,
        required: [true, "Please Enter Product Stock"],
        default: 1,
        min: [0, "Product stock cannot be negative"]

    },
    numOfReviews: {

        type: Number,
        default: 0

    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    createdAt: {

        type: Date,
        default: Date.now

    }


});

productSchema.pre("validate", function (next) {
    if (this.name) {
        this.slug = createSlug(this.name);
    }

    if (Array.isArray(this.variants) && this.variants.length > 0) {
        const totalVariantStock = this.variants.reduce((acc, variant) => acc + (Number(variant.stock) || 0), 0);
        this.stock = totalVariantStock;

        const cheapestVariant = this.variants.reduce((lowest, variant) => {
            if (!lowest) return variant;
            return Number(variant.price) < Number(lowest.price) ? variant : lowest;
        }, null);

        if (cheapestVariant?.price !== undefined) {
            this.price = Number(cheapestVariant.price);
        }

        this.variants = this.variants.map((variant) => ({
            ...variant.toObject?.() || variant,
            label: variant.label || [variant.size, variant.color].filter(Boolean).join(" / ") || "Default variant",
            sku: variant.sku || createSlug(`${this.name}-${variant.size || ""}-${variant.color || ""}-${variant._id || ""}`)
        }));
    }
    next();
});


export default mongoose.model("Product", productSchema, "products");

