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
const allowedOrigins = [process.env.FRONTEND_URL, process.env.FRONTEND_PREVIEW_URL, process.env.CORS_ORIGIN]
    .filter(Boolean)
    .map((value) => value.trim());

const isAllowedOrigin = (origin) => {
    if (!origin) return true;

    if (allowedOrigins.includes(origin)) return true;

    if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
    if (/^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)) return true;
    if (/\.onrender\.com$/i.test(origin)) return true;
    if (/\.netlify\.app$/i.test(origin)) return true;
    if (/\.vercel\.app$/i.test(origin)) return true;

    return false;
};

// 1. تسجيل جميع الطلبات القادمة للـ Debugging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} -> ${req.originalUrl}`);
    next();
});

// 2. إعداد الـ CORS بالكامل
const corsOptions = {
    origin: (origin, callback) => {
        const allowed = isAllowedOrigin(origin);
        console.log("[cors] decision", { origin, allowed, configuredOrigins: allowedOrigins });
        if (allowed) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
};

app.use(cors(corsOptions));
app.options(/(.*)/, cors(corsOptions));

// 3. قراءة الـ Cookies
app.use(cookieParser());

// 4. رفع الملفات (مع مراعاة الترتيب لتسهيل قراءة الـ Body)
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    parseNested: true
}));

// 5. قراءة الـ JSON والـ URL-Encoded بحجم كبير لصور الـ Base64
app.use(express.json({ limit: "50mb" })); 
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// 6. تجميع وتحديد الـ Routes
const apiV1Router = express.Router();
apiV1Router.use(globalLimiter);

apiV1Router.use(product);
apiV1Router.use(user);
apiV1Router.use(order);
apiV1Router.use(siteSettings);
apiV1Router.use(coupon);
apiV1Router.use(cart);

app.use("/api/v1", apiV1Router);

// 7. معالجة الـ 404 Routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

Sentry.setupExpressErrorHandler(app);

app.use(errorHandelMiddleware);

export default app;