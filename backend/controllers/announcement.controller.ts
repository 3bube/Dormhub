import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Announcement from '../models/announcement.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get announcements
// @route   GET /api/announcements
// @access  Public
export const getAnnouncements = async (req: Request, res: Response): Promise<void> => {
  try {
    const { active, targetAudience } = req.query;
    let query: any = {};
    
    // Filter by active status if provided
    if (active !== undefined) {
      query.active = active === 'true';
    } else {
      // By default, only show active announcements
      query.active = true;
    }
    
    // Filter by target audience if provided
    if (targetAudience) {
      query.targetAudience = targetAudience;
    }
    
    // Filter by date range (only show current announcements by default)
    const currentDate = new Date();
    query.startDate = { $lte: currentDate };
    query.endDate = { $gte: currentDate };
    
    const announcements = await Announcement.find(query)
      .populate('createdBy.id', 'name role')
      .sort({ createdAt: -1 });
    
    res.json(announcements);
  } catch (error: any) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
export const getAnnouncementById = async (req: Request, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id)
      .populate('createdBy.id', 'name role');
    
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    res.json(announcement);
  } catch (error: any) {
    console.error('Get announcement by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Staff only)
export const createAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, targetAudience, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!title || !message || !targetAudience || !startDate || !endDate) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }
    
    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
      res.status(400).json({ message: 'End date must be after start date' });
      return;
    }
    
    const newAnnouncement = new Announcement({
      title,
      message,
      createdBy: { id: req.user?._id },
      targetAudience,
      startDate: start,
      endDate: end,
      active: true
    });
    
    const savedAnnouncement = await newAnnouncement.save();
    
    // Populate the response with creator details
    const populatedAnnouncement = await Announcement.findById(savedAnnouncement._id)
      .populate('createdBy.id', 'name role');
    
    res.status(201).json(populatedAnnouncement);
  } catch (error: any) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Staff only)
export const updateAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, targetAudience, startDate, endDate, active } = req.body;
    
    // Find announcement
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    // Update fields
    if (title) announcement.title = title;
    if (message) announcement.message = message;
    if (targetAudience) announcement.targetAudience = targetAudience;
    
    if (startDate) {
      const start = new Date(startDate);
      announcement.startDate = start;
    }
    
    if (endDate) {
      const end = new Date(endDate);
      
      // Validate end date is after start date
      if (end < announcement.startDate) {
        res.status(400).json({ message: 'End date must be after start date' });
        return;
      }
      
      announcement.endDate = end;
    }
    
    if (active !== undefined) {
      announcement.active = active;
    }
    
    announcement.updatedAt = new Date();
    
    const updatedAnnouncement = await announcement.save();
    
    // Populate the response with creator details
    const populatedAnnouncement = await Announcement.findById(updatedAnnouncement._id)
      .populate('createdBy.id', 'name role');
    
    res.json(populatedAnnouncement);
  } catch (error: any) {
    console.error('Update announcement error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Staff only)
export const deleteAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    await announcement.deleteOne();
    
    res.json({ message: 'Announcement removed' });
  } catch (error: any) {
    console.error('Delete announcement error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
