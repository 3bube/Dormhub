import express from 'express';
import { protect, staffOnly } from '../middleware/auth.middleware';
import {
  getAnnouncements,
  getAnnouncementById,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller';

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get announcements
// @access  Public
router.get('/', getAnnouncements);

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Public
router.get('/:id', getAnnouncementById);

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Staff only)
router.post('/', protect, staffOnly, createAnnouncement);

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Staff only)
router.put('/:id', protect, staffOnly, updateAnnouncement);

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Staff only)
router.delete('/:id', protect, staffOnly, deleteAnnouncement);

export default router;
