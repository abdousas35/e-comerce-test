import { next } from '@vercel/functions';

export const config = {
  matcher: '/:path*',
};

const BOT_UA_REGEX = /googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyouhaveit|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp/i;

export default async function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';

  // مش bot؟ كمل عادي، خلي الـ SPA تتسرح كيف ما هي
  if (!BOT_UA_REGEX.test(userAgent)) {
    return next();
  }

  // bot: روح جيب النسخة المرندرية من Prerender.io
  const targetUrl = `https://service.prerender.io/${request.url}`;

  const prerenderResponse = await fetch(targetUrl, {
    headers: {
      'X-Prerender-Token': process.env.PRERENDER_TOKEN,
    },
  });

  const body = await prerenderResponse.text();

  return new Response(body, {
    status: prerenderResponse.status,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}