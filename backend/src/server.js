import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Import routes (ESM requires .js extension)
import authRoutes from "../routes/authRoutes.js";

// Load environment variables (silent mode to suppress info messages)
dotenv.config({ silent: true });

const app = express();

// CORS middleware (must be before other middleware to handle preflight requests)
app.use(cors({
  origin: "*", // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: false // Set to false when using origin: "*"
}));

// Middleware
app.use(express.json());

// Health check endpoint (before routes)
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    message: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Mount routes
app.use("/api/auth", authRoutes);

// Start server first (so CORS works even if DB fails)
// Using 5001 instead of 5000 because macOS AirPlay uses port 5000
const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Database connection
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('⚠️  WARNING: MONGO_URI is not set in .env file');
} else {
  mongoose
    .connect(MONGO_URI)
    .then(() => {
      console.log("Database connected successfully");
    })
    .catch((err) => {
      console.error("DB connect error:", err);
      console.error("⚠️  Server is running but database connection failed");
    });
}
