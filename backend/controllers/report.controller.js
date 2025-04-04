"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteScheduledReport = exports.getScheduledReports = exports.scheduleReport = exports.getReportTemplates = exports.generateReport = exports.getReportById = exports.getReports = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const report_model_1 = __importDefault(require("../models/report.model"));
// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Staff only)
const getReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, startDate, endDate } = req.query;
        let query = {};
        if (type)
            query.type = type;
        // Date range filter
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate)
                query.createdAt.$gte = new Date(startDate);
            if (endDate)
                query.createdAt.$lte = new Date(endDate);
        }
        const reports = yield report_model_1.default.find(query)
            .populate('generatedBy', 'name role')
            .sort({ createdAt: -1 });
        res.json(reports);
    }
    catch (error) {
        console.error('Get reports error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getReports = getReports;
// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private (Staff only)
const getReportById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report = yield report_model_1.default.findById(req.params.id)
            .populate('generatedBy', 'name role');
        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        res.json(report);
    }
    catch (error) {
        console.error('Get report by ID error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Report not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getReportById = getReportById;
// @desc    Generate new report
// @route   POST /api/reports/generate
// @access  Private (Staff only)
const generateReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, type, parameters } = req.body;
        // Validate required fields
        if (!title || !type) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        // Validate report type
        const validTypes = ['occupancy', 'financial', 'meal', 'complaint', 'inventory', 'student'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ message: 'Invalid report type' });
            return;
        }
        // Generate report data based on type
        // This would typically involve complex database queries and data processing
        // For now, we'll just create a placeholder report record
        const newReport = new report_model_1.default({
            title,
            type,
            generatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            parameters: parameters || {},
            fileUrl: `/reports/${type}_${Date.now()}.pdf` // Placeholder URL
        });
        const savedReport = yield newReport.save();
        // Populate the response with generator details
        const populatedReport = yield report_model_1.default.findById(savedReport._id)
            .populate('generatedBy', 'name role');
        res.status(201).json(populatedReport);
    }
    catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.generateReport = generateReport;
// @desc    Get report templates
// @route   GET /api/reports/templates
// @access  Private (Staff only)
const getReportTemplates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Return predefined report templates
        const templates = [
            {
                id: 'occupancy',
                name: 'Occupancy Report',
                description: 'Report on room occupancy rates and availability',
                parameters: [
                    { name: 'startDate', type: 'date', required: true },
                    { name: 'endDate', type: 'date', required: true },
                    { name: 'building', type: 'string', required: false }
                ]
            },
            {
                id: 'financial',
                name: 'Financial Report',
                description: 'Report on payments, dues, and financial status',
                parameters: [
                    { name: 'startDate', type: 'date', required: true },
                    { name: 'endDate', type: 'date', required: true },
                    { name: 'paymentStatus', type: 'string', required: false }
                ]
            },
            {
                id: 'meal',
                name: 'Meal Attendance Report',
                description: 'Report on meal plan usage and attendance',
                parameters: [
                    { name: 'startDate', type: 'date', required: true },
                    { name: 'endDate', type: 'date', required: true },
                    { name: 'mealType', type: 'string', required: false }
                ]
            },
            {
                id: 'complaint',
                name: 'Complaint Analysis Report',
                description: 'Report on complaints by category, status, and resolution time',
                parameters: [
                    { name: 'startDate', type: 'date', required: true },
                    { name: 'endDate', type: 'date', required: true },
                    { name: 'category', type: 'string', required: false }
                ]
            },
            {
                id: 'inventory',
                name: 'Inventory Status Report',
                description: 'Report on inventory items, condition, and availability',
                parameters: [
                    { name: 'itemType', type: 'string', required: false },
                    { name: 'condition', type: 'string', required: false }
                ]
            },
            {
                id: 'student',
                name: 'Student Status Report',
                description: 'Report on student occupancy, payments, and issues',
                parameters: [
                    { name: 'startDate', type: 'date', required: true },
                    { name: 'endDate', type: 'date', required: true },
                    { name: 'building', type: 'string', required: false }
                ]
            }
        ];
        res.json(templates);
    }
    catch (error) {
        console.error('Get report templates error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getReportTemplates = getReportTemplates;
// @desc    Schedule report generation
// @route   POST /api/reports/schedule
// @access  Private (Staff only)
const scheduleReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, type, parameters, schedule } = req.body;
        // Validate required fields
        if (!title || !type || !schedule || !schedule.frequency) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        // Validate report type
        const validTypes = ['occupancy', 'financial', 'meal', 'complaint', 'inventory', 'student'];
        if (!validTypes.includes(type)) {
            res.status(400).json({ message: 'Invalid report type' });
            return;
        }
        // Validate schedule frequency
        const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly'];
        if (!validFrequencies.includes(schedule.frequency)) {
            res.status(400).json({ message: 'Invalid schedule frequency' });
            return;
        }
        // In a real implementation, we would use a job scheduler like node-cron
        // For now, we'll just create a record of the scheduled report
        // Create a placeholder scheduled report
        const scheduledReport = {
            _id: new mongoose_1.default.Types.ObjectId(),
            title,
            type,
            generatedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            parameters: parameters || {},
            schedule,
            nextRun: calculateNextRun(schedule.frequency),
            createdAt: new Date()
        };
        // In a real implementation, this would be saved to a ScheduledReport collection
        // For now, we'll just return the scheduled report object
        res.status(201).json({
            message: 'Report scheduled successfully',
            scheduledReport
        });
    }
    catch (error) {
        console.error('Schedule report error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.scheduleReport = scheduleReport;
// @desc    Get scheduled reports
// @route   GET /api/reports/scheduled
// @access  Private (Staff only)
const getScheduledReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would fetch from a ScheduledReport collection
        // For now, we'll just return a placeholder empty array
        res.json([]);
    }
    catch (error) {
        console.error('Get scheduled reports error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getScheduledReports = getScheduledReports;
// @desc    Delete scheduled report
// @route   DELETE /api/reports/scheduled/:id
// @access  Private (Staff only)
const deleteScheduledReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // In a real implementation, this would delete from a ScheduledReport collection
        // For now, we'll just return a success message
        res.json({
            message: 'Scheduled report deleted successfully'
        });
    }
    catch (error) {
        console.error('Delete scheduled report error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Scheduled report not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.deleteScheduledReport = deleteScheduledReport;
// Helper function to calculate the next run date based on frequency
const calculateNextRun = (frequency) => {
    const now = new Date();
    const nextRun = new Date(now);
    switch (frequency) {
        case 'daily':
            nextRun.setDate(now.getDate() + 1);
            nextRun.setHours(0, 0, 0, 0);
            break;
        case 'weekly':
            nextRun.setDate(now.getDate() + (7 - now.getDay()));
            nextRun.setHours(0, 0, 0, 0);
            break;
        case 'monthly':
            nextRun.setMonth(now.getMonth() + 1);
            nextRun.setDate(1);
            nextRun.setHours(0, 0, 0, 0);
            break;
        case 'quarterly':
            const currentQuarter = Math.floor(now.getMonth() / 3);
            nextRun.setMonth((currentQuarter + 1) * 3);
            nextRun.setDate(1);
            nextRun.setHours(0, 0, 0, 0);
            break;
        default:
            nextRun.setDate(now.getDate() + 1);
            nextRun.setHours(0, 0, 0, 0);
    }
    return nextRun;
};
