import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Report from '../models/report.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private (Staff only)
export const getReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, startDate, endDate } = req.query;
    let query: any = {};
    
    if (type) query.type = type;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate as string);
      if (endDate) query.createdAt.$lte = new Date(endDate as string);
    }
    
    const reports = await Report.find(query)
      .populate('generatedBy', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(reports);
  } catch (error: any) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private (Staff only)
export const getReportById = async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('generatedBy', 'name role');
    
    if (!report) {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    
    res.json(report);
  } catch (error: any) {
    console.error('Get report by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Report not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Generate new report
// @route   POST /api/reports/generate
// @access  Private (Staff only)
export const generateReport = async (req: AuthRequest, res: Response): Promise<void> => {
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
    
    const newReport = new Report({
      title,
      type,
      generatedBy: req.user?._id,
      parameters: parameters || {},
      fileUrl: `/reports/${type}_${Date.now()}.pdf` // Placeholder URL
    });
    
    const savedReport = await newReport.save();
    
    // Populate the response with generator details
    const populatedReport = await Report.findById(savedReport._id)
      .populate('generatedBy', 'name role');
    
    res.status(201).json(populatedReport);
  } catch (error: any) {
    console.error('Generate report error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get report templates
// @route   GET /api/reports/templates
// @access  Private (Staff only)
export const getReportTemplates = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('Get report templates error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Schedule report generation
// @route   POST /api/reports/schedule
// @access  Private (Staff only)
export const scheduleReport = async (req: AuthRequest, res: Response): Promise<void> => {
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
      _id: new mongoose.Types.ObjectId(),
      title,
      type,
      generatedBy: req.user?._id,
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
  } catch (error: any) {
    console.error('Schedule report error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get scheduled reports
// @route   GET /api/reports/scheduled
// @access  Private (Staff only)
export const getScheduledReports = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, this would fetch from a ScheduledReport collection
    // For now, we'll just return a placeholder empty array
    
    res.json([]);
  } catch (error: any) {
    console.error('Get scheduled reports error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete scheduled report
// @route   DELETE /api/reports/scheduled/:id
// @access  Private (Staff only)
export const deleteScheduledReport = async (req: Request, res: Response): Promise<void> => {
  try {
    // In a real implementation, this would delete from a ScheduledReport collection
    // For now, we'll just return a success message
    
    res.json({
      message: 'Scheduled report deleted successfully'
    });
  } catch (error: any) {
    console.error('Delete scheduled report error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Scheduled report not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Helper function to calculate the next run date based on frequency
const calculateNextRun = (frequency: string): Date => {
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