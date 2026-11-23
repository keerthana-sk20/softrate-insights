import { Router } from "express";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import multer from "multer";
import Article from "../models/Article.js";
import Category from "../models/Category.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const fileExtensions = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif" };
const uploadsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
mkdirSync(uploadsDirectory, { recursive: true });
const storage = multer.diskStorage({
  destination: (_req, _file, callback) => callback(null, uploadsDirectory),
  filename: (_req, file, callback) => callback(null, `${randomUUID()}${fileExtensions[file.mimetype]}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedTypes.has(file.mimetype))
});

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function articlePayload(body) {
  const allowed = ["title", "slug", "excerpt", "content", "author", "category", "image", "seoTitle", "seoDescription", "status", "featured", "scheduledAt", "tags"];
  return Object.fromEntries(allowed.filter((key) => body[key] !== undefined).map((key) => [key, body[key]]));
}

router.post("/upload", requireAdmin, (req, res, next) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") return res.status(413).json({ message: "Choose an image smaller than 5 MB." });
      return res.status(400).json({ message: "Upload a JPEG, PNG, WebP, or GIF image." });
    }
    if (!req.file) return res.status(400).json({ message: "Choose an image to upload." });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

router.get("/admin/all", requireAdmin, async (_req, res, next) => {
  try {
    const articles = await Article.find().sort({ updatedAt: -1 }).lean();
    res.json({ articles });
  } catch (error) { next(error); }
});

router.get("/", async (req, res, next) => {
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 9));
    const filter = { status: "published", publishedAt: { $lte: new Date() } };
    if (typeof req.query.category === "string" && req.query.category.trim()) filter.category = req.query.category.trim();
    if (typeof req.query.search === "string" && req.query.search.trim()) {
      const term = new RegExp(escapeRegex(req.query.search.trim()), "i");
      filter.$or = [{ title: term }, { excerpt: term }, { content: term }, { category: term }, { author: term }, { tags: term }];
    }
    const [articles, total] = await Promise.all([
      Article.find(filter).sort({ featured: -1, publishedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Article.countDocuments(filter)
    ]);
    res.json({ articles, total, page, pages: Math.ceil(total / limit) });
  } catch (error) { next(error); }
});

router.get("/:slug", async (req, res, next) => {
  try {
    const article = await Article.findOne({ slug: req.params.slug, status: "published", publishedAt: { $lte: new Date() } }).lean();
    if (!article) return res.status(404).json({ message: "Story not found." });
    res.json(article);
  } catch (error) { next(error); }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const payload = articlePayload(req.body);
    if (payload.status === "scheduled" && (!payload.scheduledAt || new Date(payload.scheduledAt) <= new Date())) {
      return res.status(400).json({ message: "Choose a future date and time for scheduled stories." });
    }
    if (payload.category && !(await Category.exists({ name: payload.category }))) {
      return res.status(400).json({ message: "Choose an existing category." });
    }
    if (payload.status === "published") payload.publishedAt = new Date();
    if (payload.status === "draft") payload.publishedAt = null;
    const article = await Article.create(payload);
    res.status(201).json(article);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That URL slug is already in use." });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
});

router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const payload = articlePayload(req.body);
    if (payload.status === "scheduled" && (!payload.scheduledAt || new Date(payload.scheduledAt) <= new Date())) {
      return res.status(400).json({ message: "Choose a future date and time for scheduled stories." });
    }
    if (payload.category && !(await Category.exists({ name: payload.category }))) {
      return res.status(400).json({ message: "Choose an existing category." });
    }
    const existing = await Article.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Story not found." });
    if (payload.status === "published" && existing.status !== "published") payload.publishedAt = new Date();
    if (payload.status === "draft") payload.publishedAt = null;
    const article = await Article.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    res.json(article);
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That URL slug is already in use." });
    if (error.name === "ValidationError") return res.status(400).json({ message: error.message });
    next(error);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ message: "Story not found." });
    res.json({ message: "Story deleted." });
  } catch (error) { next(error); }
});

export default router;
