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
const uploadRoutes = require("./src/routes/uploadRoutes");
const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");

const app = express();
const port = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Check whether an incoming origin is permitted.
// Supports exact matches AND *.vercel.app wildcard subdomains.
function isOriginAllowed(origin) {
  if (!origin) return true;             // same-origin / server-to-server requests
  if (!allowedOrigins.length) return true; // no allow-list → open (dev)
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel preview deployment automatically
  if (/^https:\/\/[^.]+\.vercel\.app$/.test(origin)) return true;
  return false;
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "180mb" }));
app.use(morgan("dev"));
// Long-lived cache for static media (images/videos) — content-hashed or
// rarely-changed assets, safe for aggressive caching. Does not affect any
// /api routes or behaviour.
const staticCacheOptions = {
  maxAge: "30d",
  setHeaders: (res, filePath) => {
    if (/\.(mp4|webm|webp|jpg|jpeg|png|svg|gif|avif)$/i.test(filePath)) {
      res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
    }
  },
};

app.use("/uploads", express.static(path.join(__dirname, "uploads"), staticCacheOptions));
// Serve client/public/themes so admin-uploaded images are accessible via /themes/<themeId>/<file>
app.use("/themes", express.static(path.resolve(__dirname, "../client/public/themes"), staticCacheOptions));
// Also serve client/public/addons under /addons for backward compat with images uploaded before the path change
app.use("/addons", express.static(path.resolve(__dirname, "../client/public/addons"), staticCacheOptions));

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
app.use("/api/upload", uploadRoutes);
// GET /api/addon-images/:filename — serves uploaded addon images.
// Kept under /api/ so Vite dev proxy always forwards to Express;
// Vite would serve client/public/ before proxy for any other prefix.
app.use("/api/addon-images", uploadRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

module.exports = app;