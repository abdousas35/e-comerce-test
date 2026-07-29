import express from 'express';
const router = express.Router();
import { SitemapStream, streamToPromise } from 'sitemap';
import { Readable } from 'stream';
import Product from '../models/ProductModel.js'; 

router.get('/sitemap.xml', async (req, res) => {
  try {
    const BASE_URL = 'https://www.easy-shopping-official.com';

    // 1. الصفحات الثابتة في الـ Frontend
    const staticPages = [
      { url: '/', changefreq: 'daily', priority: 1.0 },
      { url: '/products', changefreq: 'daily', priority: 0.9 },
      { url: '/about', changefreq: 'monthly', priority: 0.5 },
    ];

    // 2. جلب المنتجات من MongoDB
    const products = await Product.find({}, '_id slug updatedAt').lean();

    // 3. تحويل المنتجات إلى مسارات Sitemap
    const productPages = products.map((product) => ({
      url: `/products/${product.slug || product._id}`,
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
    }));

    const allLinks = [...staticPages, ...productPages];

    // 4. إنشاء الـ XML Stream
    const stream = new SitemapStream({ hostname: BASE_URL });
    res.setHeader('Content-Type', 'application/xml');

    const xmlData = await streamToPromise(Readable.from(allLinks).pipe(stream));

    res.send(xmlData.toString());
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).end();
  }
});

export default router;
