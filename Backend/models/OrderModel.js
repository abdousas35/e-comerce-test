import mongoose from "mongoose";

const orderStatusHistorySchema = new mongoose.Schema(
    {
        status: {
            type: String,
            required: true
        },
        note: {
            type: String,
            default: ""
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const orderNotificationSchema = new mongoose.Schema(
    {
        channel: {
            type: String,
            enum: ["email", "whatsapp"],
            required: true
        },
        type: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["sent", "skipped", "failed"],
            required: true
        },
        recipient: {
            type: String,
            default: ""
        },
        error: {
            type: String,
            default: ""
        },
        sentAt: {
            type: Date,
            default: Date.now
        }
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema({

    shippingInfo: {

        address: {

            type: String,
            required: true

        },
        city: {

            type: String,
            required: true

        },
        state: {

            type: String,
            required: true

        },
        pincode: {
            type: String,
            default: ""
        },
        country: {
            type: String,
            default: "Tunisia"
        },
        phoneNumber: {

            type: String,
            required: true

        },





    },
    orderItems: [

        {

            name: {

            type: String,
            required: true
  
            },
            price: {

            type: Number,
            required: true
            
            },
            quantity: {

            type: Number,
            required: true
            
            },
            image: {
                
            type: String,
            required: true

            },
            product: {

                type: mongoose.Schema.ObjectId,
                required: true,
                ref: "Product"

            },
            variantId: {
                type: mongoose.Schema.Types.ObjectId,
                default: null
            },
            variantLabel: {
                type: String,
                default: ""
            },
            selectedOptions: {
                size: {
                    type: String,
                    default: ""
                },
                color: {
                    type: String,
                    default: ""
                }
            },
            sku: {
                type: String,
                default: ""
            }

        }

    ],
    orderStatus:{

        type: String,
        required: true,
        default: "Pending"

    },
    shippingStatus: {
        type: String,
        default: "Pending"
    },
    trackingNumber: {
        type: String,
        default: ""
    },
    trackingUrl: {
        type: String,
        default: ""
    },
    courier: {
        type: String,
        default: ""
    },
    user: {

        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true

    },
    itemPrice: {

        type: Number,
        required: true,
        default: 0

    },
    taxPrice: {

        type: Number,
        required: true,
        default: 0

    },
    shippingPrice: {

        type: Number,
        required: true,
        default: 0

    },
    discountPrice: {
        type: Number,
        default: 0
    },
    totalPrice: {

        type: Number,
        required: true,
        default: 0

    },
    couponCode: {
        type: String,
        default: ""
    },
    notes: {
        type: String,
        default: ""
    },
    statusHistory: {
        type: [orderStatusHistorySchema],
        default: () => [{ status: "Pending", note: "Order created" }]
    },
    notifications: {
        type: [orderNotificationSchema],
        default: []
    },
    confirmedAt: Date,
    processedAt: Date,
    shippedAt: Date,
    deliveredAt: Date,
    cancelledAt: Date,
    createdAt: {

        type: Date,
        default: Date.now()

    }

});


export default mongoose.model("Order",orderSchema);
