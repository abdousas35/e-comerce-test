import "./instrument.js";
import dotenv from "dotenv";
dotenv.config();
dotenv.config({ path: new URL("./config/config.env", import.meta.url) });
import app from "./app.js";
import { connectMongoDataBase } from "./config/db.js";
import { v2 as cloudinary } from "cloudinary";

connectMongoDataBase();

cloudinary.config({

  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,

});


process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    process.exit(1);
})

const port = process.env.PORT || 8000;

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on PORT ${port}`);
});


process.on('unhandledRejection', (err) => {
    console.error("Unhandled Rejection:", err);
    server.close(() => {
        process.exit(1)
    })
})
