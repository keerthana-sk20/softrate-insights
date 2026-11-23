import { Router } from "express";
import { timingSafeEqual } from "node:crypto";
import jwt from "jsonwebtoken";

const router = Router();

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(503).json({ message: "Admin sign-in is not configured on this server." });
    }
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const submittedPassword = Buffer.from(password);
    const configuredPassword = Buffer.from(process.env.ADMIN_PASSWORD);
    const passwordMatches = submittedPassword.length === configuredPassword.length
      && timingSafeEqual(submittedPassword, configuredPassword);
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL.toLowerCase() || !passwordMatches) {
      return res.status(401).json({ message: "That email and password combination did not match." });
    }
    const token = jwt.sign({ role: "admin", email: process.env.ADMIN_EMAIL }, process.env.JWT_SECRET, { expiresIn: "8h" });
    return res.json({ token });
  } catch (error) {
    return next(error);
  }
});

export default router;
