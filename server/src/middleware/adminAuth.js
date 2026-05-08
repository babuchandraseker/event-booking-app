const jwt = require("jsonwebtoken");
const createHttpError = require("../utils/httpError");

const getJwtSecret = () =>
  process.env.JWT_SECRET || "local-dev-jwt-secret";

const requireAdminAuth = (req, res, next) => {
  const authHeader = req.header("authorization") || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    throw createHttpError(401, "Admin token is required");
  }

  try {
    req.admin = jwt.verify(token, getJwtSecret());
    next();
  } catch {
    throw createHttpError(401, "Invalid or expired admin token");
  }
};

module.exports = requireAdminAuth;
module.exports.getJwtSecret = getJwtSecret;
