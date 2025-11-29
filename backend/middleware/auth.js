import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/index.js";   // adjust path if needed

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader)
    return res.status(401).json({ message: "No token provided" });

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token)
    return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, jwtSecret);

    // Attach user data to request
    req.user = {
      id: decoded.userId,         // because token = { userId: ... }
      email: decoded.email || null
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
