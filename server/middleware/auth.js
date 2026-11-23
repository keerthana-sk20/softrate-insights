import jwt from "jsonwebtoken";

export function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (!token) return res.status(401).json({ message: "Sign in to continue." });
  try {
    const claims = jwt.verify(token, process.env.JWT_SECRET);
    if (claims.role !== "admin") return res.status(403).json({ message: "You do not have permission to do that." });
    req.admin = claims;
    next();
  } catch {
    return res.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}
