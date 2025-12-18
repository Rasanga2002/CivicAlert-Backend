import express from "express";
import {
  getAllNotificationsController,
  markNotificationAsReadController,
  markAllAsReadController,
  deleteNotificationController,
  createTestNotificationController,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// GET /api/notifications - Get all notifications for logged-in user
router.get("/", getAllNotificationsController);

// PATCH /api/notifications/:id/read - Mark single notification as read
router.patch("/:id/read", markNotificationAsReadController);

// PATCH /api/notifications/mark-all-read - Mark all user's notifications as read
router.patch("/mark-all-read", markAllAsReadController);

// DELETE /api/notifications/:id - Delete a notification
router.delete("/:id", deleteNotificationController);

// POST /api/notifications/test - Create a test notification (for development)
router.post("/test", createTestNotificationController);

export default router;
