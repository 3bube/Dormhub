import express from 'express';
import { protect, staffOnly } from '../middleware/auth.middleware';
import {
  getReports,
  getReportById,
  generateReport,
  getReportTemplates,
  scheduleReport,
  getScheduledReports,
  deleteScheduledReport
} from '../controllers/report.controller';

const router = express.Router();

// @route   GET /api/reports
// @desc    Get all reports
// @access  Private (Staff only)
router.get('/', protect, staffOnly, getReports);

// @route   GET /api/reports/:id
// @desc    Get report by ID
// @access  Private (Staff only)
router.get('/:id', protect, staffOnly, getReportById);

// @route   POST /api/reports/generate
// @desc    Generate new report
// @access  Private (Staff only)
router.post('/generate', protect, staffOnly, generateReport);

// @route   GET /api/reports/templates
// @desc    Get report templates
// @access  Private (Staff only)
router.get('/templates', protect, staffOnly, getReportTemplates);

// @route   POST /api/reports/schedule
// @desc    Schedule report generation
// @access  Private (Staff only)
router.post('/schedule', protect, staffOnly, scheduleReport);

// @route   GET /api/reports/scheduled
// @desc    Get scheduled reports
// @access  Private (Staff only)
router.get('/scheduled', protect, staffOnly, getScheduledReports);

// @route   DELETE /api/reports/scheduled/:id
// @desc    Delete scheduled report
// @access  Private (Staff only)
router.delete('/scheduled/:id', protect, staffOnly, deleteScheduledReport);

export default router;