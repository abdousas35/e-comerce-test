import mongoose from "mongoose";

const createSlug = (value = "") =>
    value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

const combinationSelectionSchema = new mongoose.Schema(
    {
        groupName: {
            type: String,
            trim: true,
            required: true
        },
        value: {
            type: String,
            trim: true,
            required: true
        }
    },
    { _id: false }
);

const combinationImageSchema = new mongoose.Schema(
    {
        publicId: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    { _id: false }
);

const combinationSchema = new mongoose.Schema(
    {
        selections: {
            type: [combinationSelectionSchema],
            default: []
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Combination price cannot be negative"]
        },
        stock: {
            type: Number,
            required: true,
            min: [0, "Combination stock cannot be negative"],
            default: 0
        },
        images: {
            type: [combinationImageSchema],
            default: []
        }
    },
    { _id: true }
);

const optionGroupSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: [true, "Please enter an option group name"]
        },
        values: {
            type: [String],
            default: []
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
    discount: {
        type: Number,
        default: 0,
        min: [0, "Discount cannot be negative"]
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
    optionGroups: {
        type: [optionGroupSchema],
        default: []
    },
    combinations: {
        type: [combinationSchema],
        default: []
    },
    sections: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
        default: []
    },
    stock: {

        type: Number,
        required: [true, "Please Enter Product Stock"],
        default: 1,
        min: [0, "Product stock cannot be negative"]

    },
    lowStock: {
        type: Number,
        default: 3
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
    next();
});

productSchema.index({ sections: 1 });

export default mongoose.model("Product", productSchema, "products");

