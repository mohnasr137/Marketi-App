const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authJwt = async (req, res, next) => {
  try {
    // Automatically allow CORS preflight requests
    if (req.method === "OPTIONS") {
      return next();
    }

    const apiUrl = process.env.API_URL || "/api/v1";
    const currentPath = (req.originalUrl || req.url).split("?")[0].replace(/\/+$/, "");
    const method = req.method;

    // Public routes that don't require authentication
    const isPublicAuth =
      currentPath.startsWith(`${apiUrl}/auth/`) ||
      currentPath === `${apiUrl}/auth/signUp` ||
      currentPath === `${apiUrl}/auth/signIn` ||
      currentPath === `${apiUrl}/auth/sendPassEmail` ||
      currentPath === `${apiUrl}/auth/activeResetPass` ||
      currentPath === `${apiUrl}/auth/resetPassword`;

    const isPublicGet =
      method === "GET" &&
      (currentPath === "" ||
        currentPath === "/" ||
        currentPath === `${apiUrl}` ||
        currentPath.startsWith(`${apiUrl}/home`) ||
        currentPath.startsWith(`${apiUrl}/uploads`) ||
        currentPath.startsWith(`${apiUrl}/portfolio`) ||
        currentPath.startsWith(`${apiUrl}/images`) ||
        currentPath.startsWith(`${apiUrl}/data/start`) ||
        currentPath.startsWith(`${apiUrl}/data/test`));

    if (isPublicAuth || isPublicGet) {
      return next();
    }

    const authHeader = req.headers["authorization"] || req.headers["x-access-token"];
    if (!authHeader) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : authHeader.trim();

    if (!token) {
      return res.status(401).json({ error: "Malformed authorization header" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.SECRET || "secret_key");
    } catch (jwtError) {
      return res.status(401).json({
        error: jwtError.name === "TokenExpiredError" ? "Token has expired" : "Invalid token",
      });
    }

    const existingUser = await User.findById(decoded.id);
    if (!existingUser) {
      return res.status(404).json({ error: "User account not found" });
    }

    if (existingUser.verify === false) {
      return res.status(403).json({ error: "User email has not been verified" });
    }

    req.user = existingUser;
    req.userId = existingUser._id.toString();
    return next();
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = authJwt;
