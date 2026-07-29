import { routes } from '@vercel/config';

export const config = {
  rewrites: [
    routes.rewrite(
      '/(.*)',
      'https://service.prerender.io/https://www.easy-shopping-official.com/$1',
      {
        has: [
          {
            type: 'header',
            key: 'user-agent',
            value: '/.*(googlebot|bingbot|yandex|baiduspider|facebookexternalhit|twitterbot|rogerbot|linkedinbot|embedly|quora link preview|showyouhaveit|outbrain|pinterest|slackbot|vkshare|w3c_validator|whatsapp).*/i',
          },
        ],
        requestHeaders: {
          'X-Prerender-Token': process.env.PRERENDER_TOKEN,
        },
      },
    ),
    routes.rewrite('/(.*)', '/index.html'),
  ],
};