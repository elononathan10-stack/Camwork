import jwt from "jsonwebtoken";

export const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token)
    return res.status(401).json({ error: "Authentication required." });

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET || "camwork-secret");
    return next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired session." });
  }
};
