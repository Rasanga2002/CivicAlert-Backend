import mongoose from "mongoose";
import Notification from "../models/notificationModel.js";

export const createNotification = async (data) => {
  try {
    const notification = await Notification.create(data);
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

export const getNotifications = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(50) // Limit to last 50 notifications
      .lean();

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const markAsRead = async (notificationId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new Error("Invalid notification id");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    // Find and update only if the notification belongs to the user
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return null;
    }

    return notification;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllAsRead = async (userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    const result = await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return result;
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId, userId) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new Error("Invalid notification id");
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user id");
    }

    // Delete only if the notification belongs to the user
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return null;
    }

    return notification;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};