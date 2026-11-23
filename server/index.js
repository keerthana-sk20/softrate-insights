import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import Article from "./models/Article.js";
import Category from "./models/Category.js";
import authRoutes from "./routes/auth.js";
import articleRoutes from "./routes/articles.js";
import categoryRoutes from "./routes/categories.js";

const app = express();
const port = Number(process.env.PORT) || 5000;
const root = path.dirname(fileURLToPath(import.meta.url));
const initialCategories = [
  "Software Development",
  "Artificial Intelligence & Machine Learning",
  "Web and Mobile App Development",
  "Technology & Innovation",
  "Cybersecurity",
  "Cloud Computing",
  "Industry Insights"
];

app.disable("x-powered-by");
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));
app.use("/uploads", express.static(path.resolve(root, "../uploads"), { maxAge: "7d", immutable: true }));
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/categories", categoryRoutes);

app.get("/robots.txt", (_req, res) => {
  res.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${process.env.SITE_URL || "http://localhost:5000"}/sitemap.xml\n`);
});

app.get("/sitemap.xml", async (_req, res, next) => {
  try {
    const siteUrl = (process.env.SITE_URL || `http://localhost:${port}`).replace(/\/$/, "");
    const articles = await Article.find({ status: "published", publishedAt: { $lte: new Date() } }).select("slug updatedAt publishedAt").lean();
    const urls = [
      `<url><loc>${siteUrl}/</loc></url>`,
      `<url><loc>${siteUrl}/blog</loc></url>`,
      ...articles.map((article) => `<url><loc>${siteUrl}/blog/${encodeURIComponent(article.slug)}</loc><lastmod>${new Date(article.updatedAt || article.publishedAt).toISOString()}</lastmod></url>`)
    ];
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}</urlset>`);
  } catch (error) { next(error); }
});

if (process.env.NODE_ENV === "production") {
  const builtIndex = path.resolve(root, "../dist/index.html");
  app.get("/blog/:slug", async (req, res, next) => {
    try {
      const article = await Article.findOne({ slug: req.params.slug, status: "published", publishedAt: { $lte: new Date() } }).lean();
      if (!article) return res.sendFile(builtIndex);
      const siteUrl = (process.env.SITE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "");
      const title = article.seoTitle || article.title;
      const description = article.seoDescription || article.excerpt;
      const image = article.image?.startsWith("http") ? article.image : `${siteUrl}${article.image || ""}`;
      const pageUrl = `${siteUrl}/blog/${encodeURIComponent(article.slug)}`;
      const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
      })[character]);
      const schema = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: article.title,
        description,
        image,
        datePublished: article.publishedAt,
        author: { "@type": "Person", name: article.author }
      }).replace(/</g, "\\u003c");
      const metadata = [
        `<meta data-article-meta="true" property="og:type" content="article">`,
        `<meta data-article-meta="true" property="og:title" content="${escapeHtml(title)}">`,
        `<meta data-article-meta="true" property="og:description" content="${escapeHtml(description)}">`,
        `<meta data-article-meta="true" property="og:image" content="${escapeHtml(image)}">`,
        `<meta data-article-meta="true" property="og:url" content="${escapeHtml(pageUrl)}">`,
        `<meta data-article-meta="true" name="twitter:card" content="summary_large_image">`,
        `<link data-article-meta="true" rel="canonical" href="${escapeHtml(pageUrl)}">`,
        `<script data-article-schema="true" type="application/ld+json">${schema}</script>`
      ].join("");
      let html = await readFile(builtIndex, "utf8");
      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)} | Softrate Insights</title>`);
      html = html.replace(/<meta name="description" content="[^"]*"\s*\/?>/i, `<meta name="description" content="${escapeHtml(description)}">`);
      res.type("html").send(html.replace("</head>", `${metadata}</head>`));
    } catch (error) { next(error); }
  });
  app.use(express.static(path.resolve(root, "../dist")));
  app.get("*", (_req, res) => res.sendFile(path.resolve(root, "../dist/index.html")));
}

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: "Something went wrong. Please try again." });
});

async function start() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required. Copy .env.example to .env and configure MongoDB.");
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) throw new Error("JWT_SECRET must be set to at least 32 characters.");
  await mongoose.connect(process.env.MONGO_URI);
  await Category.bulkWrite(initialCategories.map((name) => ({
    updateOne: { filter: { name }, update: { $setOnInsert: { name } }, upsert: true }
  })));
  const schedule = () => Article.updateMany(
    { status: "scheduled", scheduledAt: { $lte: new Date() } },
    [{ $set: { status: "published", publishedAt: "$scheduledAt" } }]
  ).catch((error) => console.error("Could not publish scheduled stories:", error));
  await schedule();
  setInterval(schedule, 60_000).unref();
  app.listen(port, () => console.log(`Softrate Insights API listening on http://localhost:${port}`));
}

start().catch((error) => {
  console.error("Unable to start Softrate Insights:", error.message);
  process.exitCode = 1;
});
