"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const report_controller_1 = require("../controllers/report.controller");
const router = express_1.default.Router();
// @route   GET /api/reports
// @desc    Get all reports
// @access  Private (Staff only)
router.get('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.getReports);
// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private (Staff only)
router.get('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.getReportById);
// @route   POST /api/reports/generate
// @desc    Generate new report
// @access  Private (Staff only)
router.post('/generate', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.generateReport);
// @route   GET /api/reports/templates
// @desc    Get report templates
// @access  Private (Staff only)
router.get('/templates', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.getReportTemplates);
// @route   POST /api/reports/schedule
// @desc    Schedule report generation
// @access  Private (Staff only)
router.post('/schedule', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.scheduleReport);
// @route   GET /api/reports/scheduled
// @desc    Get scheduled reports
// @access  Private (Staff only)
router.get('/scheduled', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.getScheduledReports);
// @route   DELETE /api/reports/scheduled/:id
// @desc    Delete scheduled report
// @access  Private (Staff only)
router.delete('/scheduled/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, report_controller_1.deleteScheduledReport);
exports.default = router;
