const createHttpError = require("../utils/httpError");

const buckets = new Map();

const createRateLimiter = ({
  windowMs = 60 * 1000,
  max = 20,
  message = "Too many requests. Please try again later.",
} = {}) => (req, res, next) => {
  const now = Date.now();
  const key = `${req.ip}:${req.method}:${req.originalUrl.split("?")[0]}`;
  const current = buckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + windowMs;
  }

  current.count += 1;
  buckets.set(key, current);

  res.setHeader("RateLimit-Limit", max);
  res.setHeader("RateLimit-Remaining", Math.max(max - current.count, 0));
  res.setHeader("RateLimit-Reset", Math.ceil(current.resetAt / 1000));

  if (current.count > max) {
    throw createHttpError(429, message);
  }

  next();
};

createRateLimiter.clear = () => buckets.clear();

module.exports = createRateLimiter;
