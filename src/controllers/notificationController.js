import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../services/notificationService.js";
import { getIO } from "../socket.js";

export const getAllNotificationsController = async (req, res) => {
  try {
    const notifications = await getNotifications(req.user._id);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error in getAllNotificationsController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markNotificationAsReadController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const updated = await markAsRead(id, userId);
    
    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        error: "Notification not found or unauthorized" 
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("Error in markNotificationAsReadController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const markAllAsReadController = async (req, res) => {
  try {
    const userId = req.user._id;
    const result = await markAllAsRead(userId);
    
    res.status(200).json({ 
      success: true, 
      data: { modifiedCount: result.modifiedCount } 
    });
  } catch (error) {
    console.error("Error in markAllAsReadController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteNotificationController = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const deleted = await deleteNotification(id, userId);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        error: "Notification not found or unauthorized" 
      });
    }

    res.status(200).json({ 
      success: true, 
      message: "Notification deleted successfully" 
    });
  } catch (error) {
    console.error("Error in deleteNotificationController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Called when a new report is created
export const notifyNewReport = async (report) => {
  try {
    if (!report.user) {
      console.error("Report does not have a user associated");
      return;
    }

    const message = `New report submitted: ${report.category}`;
    const notification = await createNotification({
      user: report.user,
      message,
      type: "new_report",
      reportId: report._id,
    });

    // Emit to specific user's room
    const io = getIO();
    if (io) {
      io.to(report.user.toString()).emit("notification", notification);
      console.log(`Notification sent to user ${report.user}: ${message}`);
    }
  } catch (error) {
    console.error("Error in notifyNewReport:", error);
  }
};

// Called when report status is updated
export const notifyStatusUpdate = async (report, newStatus) => {
  try {
    if (!report.user) {
      console.error("Report does not have a user associated");
      return;
    }

    const statusMessages = {
      pending: "Your report is pending review",
      in_progress: "Your report is being processed",
      resolved: "Your report has been resolved",
      rejected: "Your report has been reviewed",
    };

    const message = statusMessages[newStatus] || "Your report status has been updated";
    
    const notification = await createNotification({
      user: report.user,
      message,
      type: "status_update",
      reportId: report._id,
    });

    // Emit to specific user's room
    const io = getIO();
    if (io) {
      io.to(report.user.toString()).emit("notification", notification);
      console.log(`Status update notification sent to user ${report.user}`);
    }
  } catch (error) {
    console.error("Error in notifyStatusUpdate:", error);
  }
};

// Test endpoint to create a notification for the logged-in user
export const createTestNotificationController = async (req, res) => {
  try {
    const { message, type, reportId } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: "Message is required" 
      });
    }

    const notification = await createNotification({
      user: req.user._id,
      reportId: reportId || null,
      message,
      type: type || "info",
    });

    // Emit to user's room
    const io = getIO();
    if (io) {
      io.to(req.user._id.toString()).emit("notification", notification);
    }

    res.status(201).json({ success: true, data: notification });
  } catch (error) {
    console.error("Error in createTestNotificationController:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};