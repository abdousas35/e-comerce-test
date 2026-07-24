import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const UserSchema = new mongoose.Schema({

    name: {

        type: String,
        required: [true, "Please Enter Your Name"],
        maxLength: [25, "Invalid name. The Name should not be longer than 25 characters"],
        minLength: [3, "Name should be longer then 3 characters"]

    },
    email: {

        type: String,
        required: [true, "Please Enter Your email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter valid Email"]

    },
    password: {

        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false

    },
    avatar: {

                

        publicId: {

            type: String,
            default: "default_avatar_public_Id"

        },

        url: {

            type: String,
            default: "deafault_avatar_url"

        }
        

    },
    role: {

        type: String,
        default: "user"

    },
    cart: [
        {
            product: { 
                type: mongoose.Schema.ObjectId, 
                ref: 'Product', 
                required: true 
            },
            variantId: { type: String },
            quantity: { type: Number, default: 1 }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date

},{timestamps: true});

//Password hashing

UserSchema.pre("save", async function (next){

    // 1st - updting profile(name, email, image)--hashed password will be hashed again ❌



    // 2nd - updating password ✅
    if(!this.isModified("password")){

        return next();

    };
    this.password = await bcrypt.hash(this.password, 10);
    next();

});

UserSchema.methods.getJWTToken = function(){

    return jwt.sign({id:this._id}, process.env.JWT_SECRET_KEY,
    {

        expiresIn: process.env.JWT_EXPIRE

    });

};

UserSchema.methods.verifyPassword = async function(userEnteredPassword){

    return await bcrypt.compare(String(userEnteredPassword), String(this.password));

}


//generating token

UserSchema.methods.generatePasswordResetToken = function(){

    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.resetPasswordExpire = Date.now()+ 30*60*1000;
    return resetToken;

}

export default mongoose.model("User", UserSchema);