import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Notification from '../models/notification.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { read, limit, relatedTo } = req.query;
    let query: any = { 'userId.id': req.user?._id };
    
    // Filter by read status if provided
    if (read !== undefined) {
      query.read = read === 'true';
    }
    
    // Filter by related entity type if provided
    if (relatedTo) {
      query.relatedTo = relatedTo;
    }
    
    // Find notifications for the current user
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit ? parseInt(limit as string) : 50);
    
    res.json(notifications);
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    // Check if user is authorized to view this notification
    if (notification.userId.id.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this notification' });
      return;
    }
    
    res.json(notification);
  } catch (error: any) {
    console.error('Get notification by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    // Check if user is authorized to update this notification
    if (notification.userId.id.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to update this notification' });
      return;
    }
    
    // Update read status
    notification.read = true;
    notification.updatedAt = new Date();
    
    const updatedNotification = await notification.save();
    
    res.json(updatedNotification);
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Update all unread notifications for the current user
    const result = await Notification.updateMany(
      { 'userId.id': req.user?._id, read: false },
      { $set: { read: true, updatedAt: new Date() } }
    );
    
    res.json({
      message: 'All notifications marked as read',
      count: result.modifiedCount
    });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Helper function to create a notification (used internally by other controllers)
export const createNotification = async (
  userId: mongoose.Types.ObjectId,
  title: string,
  message: string,
  relatedTo: string,
  relatedId?: mongoose.Types.ObjectId
): Promise<void> => {
  try {
    const notification = new Notification({
      userId: { id: userId },
      title,
      message,
      relatedTo,
      relatedId,
      read: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    await notification.save();
  } catch (error) {
    console.error('Create notification error:', error);
  }
};
