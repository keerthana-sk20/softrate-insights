import { Router } from "express";
import Article from "../models/Article.js";
import Category from "../models/Category.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const result = await Category.find().sort({ name: 1 }).select("name -_id").lean();
    res.json(result.map((category) => category.name));
  } catch (error) { next(error); }
});

router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const name = typeof req.body.name === "string" ? req.body.name.trim() : "";
    if (!name || name.length > 60) return res.status(400).json({ message: "Enter a category name with 1 to 60 characters." });
    const category = await Category.create({ name });
    res.status(201).json({ name: category.name });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "That category already exists." });
    next(error);
  }
});

router.delete("/:name", requireAdmin, async (req, res, next) => {
  try {
    if (await Article.exists({ category: req.params.name })) {
      return res.status(409).json({ message: "Move this category's stories to another topic before removing it." });
    }
    const category = await Category.findOneAndDelete({ name: req.params.name });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json({ message: "Category removed." });
  } catch (error) { next(error); }
});

export default router;
