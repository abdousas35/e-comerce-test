import * as Sentry from "@sentry/node";
import express from "express";
import product from "./routes/ProductsRoute.js";
import errorHandelMiddleware from "./middleware/error.js";
import user from "./routes/UserRoutes.js";
import order from "./routes/OrderRoutes.js";
import siteSettings from "./routes/SiteSettingsRoutes.js";
import coupon from "./routes/CouponRoutes.js";
import cart from "./routes/CartRoutes.js";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import cors from "cors";
import { globalLimiter } from "./middleware/rateLimiter.js";

const app = express();
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_PREVIEW_URL].filter(Boolean);

// 1. تسجيل الطلبات للـ Debugging
app.use((req, res, next) => {
    console.log("REQUEST:", req.method, req.originalUrl);
    next();
});

// 2. إصلاح الـ CORS بالكامل ليدعم PUT و OPTIONS والكوكيز
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
// الرد الفوري المعتمد على جميع طلبات Preflight OPTIONS
app.options("*", cors(corsOptions));

// 3. قراءة الـ Cookies والـ JSON بحجم مناسب (50mb للصور)
app.use(cookieParser());
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 4. تهيئة fileUpload بحيث لا تتعارض مع json
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/"
}));

// 5. الـ Routes
const apiV1Router = express.Router();
apiV1Router.use(globalLimiter);

apiV1Router.use(product);
apiV1Router.use(user);
apiV1Router.use(order);
apiV1Router.use(siteSettings);
apiV1Router.use(coupon);
apiV1Router.use(cart);

app.use("/api/v1", apiV1Router);

// Handle 404
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

Sentry.setupExpressErrorHandler(app);

app.use(errorHandelMiddleware);

export default app;