const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const createHttpError = require("../utils/httpError");
const { assertNumber, requireFields } = require("../utils/validation");
const { saveReviewImage } = require("../services/imageUploadService");

const reviews = createRepository("reviews");

const normalizeReview = (review) => ({
  ...(review.customerName !== undefined ? { customerName: review.customerName } : {}),
  ...(review.eventType !== undefined ? { eventType: review.eventType } : {}),
  ...(review.rating !== undefined ? { rating: Number(review.rating) } : {}),
  ...(review.message !== undefined ? { message: review.message } : {}),
  ...(review.imageUrl !== undefined ? { imageUrl: review.imageUrl || null } : {}),
  ...(review.active !== undefined ? { active: review.active !== false } : {}),
});

const validateReviewPayload = (payload, { partial = false } = {}) => {
  if (!partial) {
    requireFields(payload, ["customerName", "eventType", "rating", "message"]);
  }

  if (payload.rating !== undefined) {
    assertNumber(payload.rating, "rating");
    const rating = Number(payload.rating);
    if (rating < 1 || rating > 5) {
      throw createHttpError(400, "rating must be between 1 and 5");
    }
  }
};

const listReviews = asyncHandler(async (req, res) => {
  const allReviews = await reviews.list();
  const data = allReviews
    .filter((review) => req.query.all === "true" || review.active !== false)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  res.json({ success: true, data });
});

const createReview = asyncHandler(async (req, res) => {
  validateReviewPayload(req.body);
  const imageUrl = await saveReviewImage(req.body.imageDataUrl);

  const review = await reviews.create(normalizeReview({
    ...req.body,
    active: req.body.active,
    imageUrl: imageUrl || req.body.imageUrl,
  }));

  res.status(201).json({ success: true, data: review });
});

const updateReview = asyncHandler(async (req, res) => {
  validateReviewPayload(req.body, { partial: true });
  const imageUrl = await saveReviewImage(req.body.imageDataUrl);
  const payload = normalizeReview({
    ...req.body,
    imageUrl: imageUrl || req.body.imageUrl,
    rating: req.body.rating,
  });

  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key];
    }
  });

  const review = await reviews.update(req.params.id, payload);

  if (!review) {
    throw createHttpError(404, "Review not found");
  }

  res.json({ success: true, data: review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const deleted = await reviews.remove(req.params.id);

  if (!deleted) {
    throw createHttpError(404, "Review not found");
  }

  res.json({ success: true, message: "Review deleted" });
});

module.exports = {
  createReview,
  deleteReview,
  listReviews,
  updateReview,
};
