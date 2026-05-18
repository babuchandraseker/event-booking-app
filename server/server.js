require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const bookingRoutes = require("./src/routes/bookingRoutes");
const packageRoutes = require("./src/routes/packageRoutes");
const addonRoutes = require("./src/routes/addonRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");
const settingsRoutes = require("./src/routes/settingsRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const heroRoutes = require("./src/routes/heroRoutes");
const themeRoutes = require("./src/routes/themeRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
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
app.use(express.json({ limit: "180mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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
app.use("/api/reviews", reviewRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/hero", heroRoutes);
app.use("/api/themes", themeRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;
