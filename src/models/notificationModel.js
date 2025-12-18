import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // so each notification is linked to a user
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["new_report", "status_update"],
      default: "new_report",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Notification", notificationSchema);
