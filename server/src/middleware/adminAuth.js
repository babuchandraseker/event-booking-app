const createHttpError = require("../utils/httpError");

const requireAdminApiKey = (req, res, next) => {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    throw createHttpError(500, "ADMIN_API_KEY is not configured");
  }

  const providedKey = req.header("x-admin-api-key");

  if (providedKey !== configuredKey) {
    throw createHttpError(401, "Invalid admin API key");
  }

  next();
};

module.exports = requireAdminApiKey;
