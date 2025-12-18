// reportController.js
import {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
} from "../services/reportService.js";

import { notifyNewReport  } from "./notificationController.js";
import Report from "../models/reportModel.js";  // Add this import at the top

// Create a new report
export const createReportController = async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      address,
      description,
      full_name,
      nic,
      contact_number,
      category,
      priority,
    } = req.body;

    const location = {
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address || "",
    };

    const evidence = req.files
      ? req.files.map((file) => ({
          fileUrl: `/uploads/${file.filename}`,
          fileType: file.mimetype.startsWith("image/") ? "image" : "video",
        }))
      : [];

    const data = {
      category,
      location,
      description,
      evidence,
      full_name: full_name || "",
      nic: nic || "",
      contact_number: contact_number ? Number(contact_number) : undefined,
      priority: priority || "Medium",
      user: req.user._id, // associate report with logged-in user
    };

    const report = await createReport(data);

    // Trigger notification after report is created
    await notifyNewReport(report);

    res.status(201).json({
      success: true,
      data: report,
      message: "Report created successfully",
    });
  } catch (error) {
    console.error("Error in createReportController:", error);
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Get all reports for logged-in user
export const getAllReportsController = async (req, res) => {
  try {
    const reports = await getAllReports({ user: req.user._id }); // user-specific
    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single report by ID (only if it belongs to logged-in user)
export const getReportByIdController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to view this report",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

// Update report (only if it belongs to logged-in user)
export const updateReportController = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await getReportById(id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to update this report",
      });
    }

    const updatedReport = await updateReport(id, req.body);

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report updated successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete report (only if it belongs to logged-in user)
export const deleteReportController = async (req, res) => {
  try {
    const report = await getReportById(req.params.id);

    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: "You are not authorized to delete this report",
      });
    }

    await deleteReport(req.params.id);
    res.status(200).json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 500;
    res.status(status).json({ success: false, error: error.message });
  }
};

// Update report status (optional: could be admin-only)
export const updateReportStatusController = async (req, res) => {
  try {
    const updatedReport = await updateReportStatus(
      req.params.id,
      req.body.status
    );

    res.status(200).json({
      success: true,
      data: updatedReport,
      message: "Report status updated successfully",
    });
  } catch (error) {
    const status = error.message === "Report not found" ? 404 : 400;
    res.status(status).json({ success: false, error: error.message });
  }
};

export const getAllPriorityReportsController = async (req, res) => {
  try {
    const priorityReports = await Report.find({ 
      priority: "HIGH",
      status: { $ne: "Resolved" } 
    })
    .sort({ createdAt: -1 })
    .limit(5);

    res.status(200).json({
      success: true,
      data: priorityReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getAllRecentReportsController = async (req, res) => {
  try {
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: recentReports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

export const getReportStatsController = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formattedStats = {
      pending: 0,
      inProgress: 0,
      resolved: 0
    };

    stats.forEach(stat => {
      if (stat._id === "Submitted" || stat._id === "Under Review") {
        formattedStats.pending += stat.count;
      } else if (stat._id === "In Progress" || stat._id === "Action Taken") {
        formattedStats.inProgress += stat.count;
      } else if (stat._id === "Resolved") {
        formattedStats.resolved = stat.count;
      }
    });

    res.status(200).json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
