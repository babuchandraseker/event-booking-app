const createRepository = require("../services/repository");
const asyncHandler = require("../middleware/asyncHandler");
const { requireFields } = require("../utils/validation");

const contactMessages = createRepository("contactMessages");

const createContactMessage = asyncHandler(async (req, res) => {
  requireFields(req.body, ["name", "phone", "message"]);

  const message = await contactMessages.create({
    name: req.body.name,
    phone: req.body.phone,
    email: req.body.email || null,
    message: req.body.message,
    status: "new",
  });

  res.status(201).json({ success: true, data: message });
});

const listContactMessages = asyncHandler(async (req, res) => {
  const data = await contactMessages.list();
  res.json({ success: true, data });
});

module.exports = {
  createContactMessage,
  listContactMessages,
};
