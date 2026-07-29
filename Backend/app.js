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
import Product from "./models/ProductModel.js";

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

// 7. 🚀 [SEO & Dynamic Meta Injection for Bots & Social Media Sharing]
app.get('/product/:id', async (req, res, next) => {
    const userAgent = req.headers['user-agent'] || '';
    const isBot = /googlebot|facebookexternalhit|twitterbot|whatsapp|telegrambot|bingbot|linkedinbot/i.test(userAgent);

    if (isBot) {
        try {
            const foundProduct = await Product.findById(req.params.id);

            if (!foundProduct) {
                return res.status(404).send('Product Not Found');
            }

            const title = `${foundProduct.name} | Shop Easy Tunisie`;
            const description = foundProduct.description ? foundProduct.description.substring(0, 160) : 'شراء أونلاين في تونس - الدفع عند الاستلام';
            const image = foundProduct.images && foundProduct.images[0] ? (foundProduct.images[0].url || foundProduct.images[0]) : '';
            const price = foundProduct.price || 0;

            return res.send(`
                <!DOCTYPE html>
                <html lang="ar">
                <head>
                    <meta charset="UTF-8">
                    <title>${title}</title>
                    <meta name="description" content="${description}">

                    <!-- Open Graph / Facebook / WhatsApp -->
                    <meta property="og:type" content="product" />
                    <meta property="og:title" content="${title}" />
                    <meta property="og:description" content="${description}" />
                    <meta property="og:image" content="${image}" />
                    <meta property="og:price:amount" content="${price}" />
                    <meta property="og:price:currency" content="TND" />

                    <!-- Schema.org for Google -->
                    <script type="application/ld+json">
                    {
                        "@context": "https://schema.org/",
                        "@type": "Product",
                        "name": "${foundProduct.name}",
                        "image": "${image}",
                        "description": "${description}",
                        "offers": {
                            "@type": "Offer",
                            "priceCurrency": "TND",
                            "price": "${price}",
                            "availability": "${foundProduct.Stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'}"
                        }
                    }
                    </script>
                </head>
                <body>
                    <h1>${foundProduct.name}</h1>
                    <p>${description}</p>
                    ${image ? `<img src="${image}" alt="${foundProduct.name}" />` : ''}
                </body>
                </html>
            `);
        } catch (error) {
            console.error("Bot SEO Error:", error);
            return next();
        }
    }

    // إذا كان زبون عادي يمر لـ 404 أو يستقبله تطبيق الفرونت إند
    next();
});

// 8. معالجة الـ 404 Routes
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.method} ${req.originalUrl}`
    });
});

Sentry.setupExpressErrorHandler(app);

app.use(errorHandelMiddleware);

export default app;