require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const bookingRoutes = require("./src/routes/bookingRoutes");
const packageRoutes = require("./src/routes/packageRoutes");
const addonRoutes = require("./src/routes/addonRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Event booking backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/bookings", bookingRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/addons", addonRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
