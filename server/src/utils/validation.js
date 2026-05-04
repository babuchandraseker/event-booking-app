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

module.exports = {
  requireFields,
  assertNumber,
};
