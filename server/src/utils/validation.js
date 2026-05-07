const createHttpError = require("./httpError");

const requireFields = (body, fields) => {
  const missingFields = fields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === "";
  });

  if (missingFields.length) {
    throw createHttpError(400, `Missing required fields: ${missingFields.join(", ")}`);
  }
};

const assertNumber = (value, fieldName) => {
  if (value === undefined || value === null) {
    return;
  }

  if (Number.isNaN(Number(value))) {
    throw createHttpError(400, `${fieldName} must be a number`);
  }
};

const assertPositiveNumber = (value, fieldName) => {
  assertNumber(value, fieldName);

  if (Number(value) <= 0) {
    throw createHttpError(400, `${fieldName} must be greater than 0`);
  }
};

const assertEmail = (value, fieldName = "email") => {
  if (!value) {
    return;
  }

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());

  if (!isValid) {
    throw createHttpError(400, `${fieldName} must be a valid email address`);
  }
};

const assertPhone = (value, fieldName = "phone") => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length < 10 || digits.length > 15) {
    throw createHttpError(400, `${fieldName} must contain 10 to 15 digits`);
  }
};

const assertFutureDate = (value, fieldName = "eventDate") => {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date <= today) {
    throw createHttpError(400, `${fieldName} must be a future date`);
  }
};

module.exports = {
  requireFields,
  assertNumber,
  assertPositiveNumber,
  assertEmail,
  assertPhone,
  assertFutureDate,
};
