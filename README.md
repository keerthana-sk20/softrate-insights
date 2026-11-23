# Softrate Insights

A responsive Softrate technology journal built with React, Express, and MongoDB. The public site includes featured and recent stories, topic filters, search, article pages with Markdown, related stories, sharing, and SEO metadata. The editorial studio supports authenticated article and category management, image uploads, drafts, publishing, and scheduled posts.

## Run locally

1. Install Node.js 20+ and MongoDB, then start MongoDB.
2. Copy `.env.example` to `.env`. Set a private `JWT_SECRET` with at least 32 characters and change `ADMIN_PASSWORD`.
3. Install packages and start the client and API:

   ```powershell
   npm install
   npm run dev
   ```

4. Open `http://localhost:5173`. The admin studio is at `http://localhost:5173/admin`; use the `ADMIN_EMAIL` and `ADMIN_PASSWORD` values from `.env`.

The app starts with example stories in the frontend so the visual experience is available before MongoDB has content. Published stories and categories are read from MongoDB when the API is configured. Uploaded images are stored in the project-level `uploads` directory.

## Production

Set `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN`, and `SITE_URL` to deployment-specific values. Configure `VITE_GA_MEASUREMENT_ID` and `VITE_GOOGLE_SITE_VERIFICATION` if needed, then run:

```powershell
npm run build
npm start
```

The Express server serves the built app, `/robots.txt`, and a generated `/sitemap.xml`. Article pages set canonical, Open Graph, Twitter, and `BlogPosting` schema metadata. Google Analytics and Search Console verification are opt-in through the Vite environment variables.

## Writing stories

Article content uses Markdown with GitHub-flavored tables and code blocks. Use a standalone YouTube or Vimeo Markdown link to embed a responsive video, for example:

```markdown
[Product walkthrough](https://youtu.be/abcdefghijk)
```

The studio accepts JPEG, PNG, WebP, or GIF featured images up to 5 MB.
