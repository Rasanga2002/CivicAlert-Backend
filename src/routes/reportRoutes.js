import express from "express";
import multer from "multer";
import path from "path";
import {
  createReportController,
  getAllReportsController,
  getReportByIdController,
  updateReportController,
  deleteReportController,
  getAllPriorityReportsController,
  getAllRecentReportsController,
  getReportStatsController,
  updateReportStatusController,
} from "../controllers/reportController.js";
import { protect } from "../middleware/auth.js"; // <- import protect middleware

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
});

// Routes

// Only logged-in users can create a report
router.post("/create", protect, upload.array("evidence", 10), createReportController);

// Logged-in user can get their own reports or all reports depending on controller logic
router.get("/", protect, getAllReportsController);

// Get single report by ID (protected)
router.get("/:id", protect, getReportByIdController);

// Update report by ID (protected)
router.put("/:id", protect, updateReportController);

// Delete report by ID (protected)
router.delete("/:id", protect, deleteReportController);

// Add these new routes
router.get("/priority/list", getAllPriorityReportsController);
router.get("/recent/list", getAllRecentReportsController);
router.get("/stats/data", getReportStatsController);
// Update report status (maybe only admin/policeman, add role check later)
router.put("/:id/status", protect, updateReportStatusController);

export default router;
