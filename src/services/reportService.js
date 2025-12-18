import Report from "../models/reportModel.js";

// Create a new report
export const createReport = async (reportData) => {
  const { category, location, description } = reportData;

  if (!category || !location || !description) {
    throw new Error(
      "Please provide all required fields: category, location, description"
    );
  }
  if (!location.latitude || !location.longitude) {
    throw new Error("Please provide both latitude and longitude");
  }

  const report = new Report(reportData);
  await report.save();
  return report;
};

// Get all reports for a specific user
export const getAllReports = async (filter = {}) => {
  try {
    const reports = await Report.find(filter).sort({ createdAt: -1 });
    return reports;
  } catch (error) {
    throw new Error("Error fetching reports: " + error.message);
  }
};

// Get report by ID
export const getReportById = async (id) => {
  const report = await Report.findById(id);
  if (!report) throw new Error("Report not found");
  return report;
};

// Update report
export const updateReport = async (id, updateData) => {
  const updatedReport = await Report.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
  if (!updatedReport) throw new Error("Report not found");
  return updatedReport;
};

// Delete report
export const deleteReport = async (id) => {
  const deletedReport = await Report.findByIdAndDelete(id);
  if (!deletedReport) throw new Error("Report not found");
  return deletedReport;
};

// Update report status
export const updateReportStatus = async (id, status) => {
  const updatedReport = await Report.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );
  if (!updatedReport) throw new Error("Report not found");
  return updatedReport;
};

export default {
  createReport,
  getAllReports,
  getReportById,
  updateReport,
  deleteReport,
  updateReportStatus,
};