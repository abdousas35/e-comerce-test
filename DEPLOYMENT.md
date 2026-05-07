# Deployment Guide

## Stack
- `Frontend`: Vercel
- `Backend`: Railway or Render
- `Database`: MongoDB Atlas
- `Media`: Cloudinary
- `Mail`: SMTP
- `WhatsApp`: optional Meta WhatsApp Cloud API

## Backend env
Create `Backend/config/config.env` with:

```env
PORT=8080
DB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_TIME=7d
COOKIE_EXPIRE=7
FRONTEND_URL=https://your-store.vercel.app
FRONTEND_PREVIEW_URL=https://your-preview.vercel.app

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

SMTP_MAIL=you@example.com
SMTP_PASSWORD=your_password

WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
```

## Frontend env
Create `Frontend/.env` with:

```env
VITE_API_URL=https://your-api.railway.app
```

## Launch flow for a new client
1. Duplicate the project.
2. Update `Admin Settings`:
   - store name
   - logo
   - colors
   - about/contact
   - shipping defaults
   - notification settings
3. Import products with CSV or create them manually.
4. Configure Cloudinary, MongoDB, SMTP, and optional WhatsApp.
5. Deploy backend.
6. Deploy frontend.
7. Add production domain and update `FRONTEND_URL`.

## CSV format
Use these headers:

```csv
name,description,category,keywords,price,stock,image,images,variants
```

### Variants column example
Store JSON inside the `variants` cell:

```json
[{"label":"S / Black","size":"S","color":"Black","price":99,"stock":4},{"label":"M / Black","size":"M","color":"Black","price":109,"stock":3}]
```

### Images column example
Multiple URLs are separated by `|`:

```text
https://example.com/a.jpg|https://example.com/b.jpg
```

## Demo presets
Use the presets in `Frontend/src/config/demoPresets.js` as a fast starting point for:
- fashion
- electronics
- beauty
