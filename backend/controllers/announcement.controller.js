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
exports.deleteAnnouncement = exports.updateAnnouncement = exports.createAnnouncement = exports.getAnnouncementById = exports.getAnnouncements = void 0;
const announcement_model_1 = __importDefault(require("../models/announcement.model"));
// @desc    Get announcements
// @route   GET /api/announcements
// @access  Public
const getAnnouncements = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { active, targetAudience } = req.query;
        let query = {};
        // Filter by active status if provided
        if (active !== undefined) {
            query.active = active === 'true';
        }
        else {
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
        const announcements = yield announcement_model_1.default.find(query)
            .populate('createdBy.id', 'name role')
            .sort({ createdAt: -1 });
        res.json(announcements);
    }
    catch (error) {
        console.error('Get announcements error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getAnnouncements = getAnnouncements;
// @desc    Get announcement by ID
// @route   GET /api/announcements/:id
// @access  Public
const getAnnouncementById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const announcement = yield announcement_model_1.default.findById(req.params.id)
            .populate('createdBy.id', 'name role');
        if (!announcement) {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        res.json(announcement);
    }
    catch (error) {
        console.error('Get announcement by ID error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getAnnouncementById = getAnnouncementById;
// @desc    Create new announcement
// @route   POST /api/announcements
// @access  Private (Staff only)
const createAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        const newAnnouncement = new announcement_model_1.default({
            title,
            message,
            createdBy: { id: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id },
            targetAudience,
            startDate: start,
            endDate: end,
            active: true
        });
        const savedAnnouncement = yield newAnnouncement.save();
        // Populate the response with creator details
        const populatedAnnouncement = yield announcement_model_1.default.findById(savedAnnouncement._id)
            .populate('createdBy.id', 'name role');
        res.status(201).json(populatedAnnouncement);
    }
    catch (error) {
        console.error('Create announcement error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.createAnnouncement = createAnnouncement;
// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Staff only)
const updateAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, message, targetAudience, startDate, endDate, active } = req.body;
        // Find announcement
        const announcement = yield announcement_model_1.default.findById(req.params.id);
        if (!announcement) {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        // Update fields
        if (title)
            announcement.title = title;
        if (message)
            announcement.message = message;
        if (targetAudience)
            announcement.targetAudience = targetAudience;
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
        const updatedAnnouncement = yield announcement.save();
        // Populate the response with creator details
        const populatedAnnouncement = yield announcement_model_1.default.findById(updatedAnnouncement._id)
            .populate('createdBy.id', 'name role');
        res.json(populatedAnnouncement);
    }
    catch (error) {
        console.error('Update announcement error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.updateAnnouncement = updateAnnouncement;
// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Staff only)
const deleteAnnouncement = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const announcement = yield announcement_model_1.default.findById(req.params.id);
        if (!announcement) {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        yield announcement.deleteOne();
        res.json({ message: 'Announcement removed' });
    }
    catch (error) {
        console.error('Delete announcement error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Announcement not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.deleteAnnouncement = deleteAnnouncement;
