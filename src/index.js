import express from "express";
import "dotenv/config";
import { createServer } from "http";
import { initSocket } from "./socket.js";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Database connection
import { connectDB } from "./lib/db.js";

// Routes
import authRoutes from './routes/authRoutes.js';
import reportRoutes from "./routes/reportRoutes.js";
import chatRoutes from './routes/chatRoutes.js';

import notificationRoutes from "./routes/notificationRoutes.js"; 
import protectedRoutes from './routes/protectedRoutes.js';

// Initialize Express
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Initialize socket.io with correct server
initSocket(httpServer);

// ES Module dirname setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/chats", chatRoutes);

app.use("/api/notifications", notificationRoutes); 
app.use('/api', protectedRoutes);

// Serve login page
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
  });
});

// Start Server
const startServer = async () => {
  try {
    await connectDB();
    // initialize socket.io (will be a no-op if already initialized)
    try {
      initSocket(httpServer);
    } catch (err) {
      console.warn("Failed to initialize socket.io:", err.message);
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      if (process.env.MONGO_URI && process.env.MONGO_URI.includes("@")) {
        console.log(
          `MongoDB connected: ${process.env.MONGO_URI.split("@")[1]}`
        );
      } else {
        console.log("MongoDB connected");
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Error handlers
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();

export default app;