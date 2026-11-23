import mongoose from "mongoose";

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  slug: { type: String, required: true, unique: true, trim: true, lowercase: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  excerpt: { type: String, required: true, trim: true, maxlength: 240 },
  content: { type: String, required: true },
  author: { type: String, required: true, trim: true, maxlength: 100 },
  category: { type: String, required: true, trim: true },
  tags: { type: [String], default: [] },
  image: { type: String, default: "" },
  seoTitle: { type: String, trim: true, maxlength: 70, default: "" },
  seoDescription: { type: String, trim: true, maxlength: 160, default: "" },
  status: { type: String, enum: ["draft", "published", "scheduled"], default: "draft", index: true },
  featured: { type: Boolean, default: false },
  scheduledAt: { type: Date, default: null },
  publishedAt: { type: Date, default: null }
}, { timestamps: true });

articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ category: 1, status: 1 });
articleSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

export default mongoose.model("Article", articleSchema);
