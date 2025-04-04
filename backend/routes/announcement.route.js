"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const announcement_controller_1 = require("../controllers/announcement.controller");
const router = express_1.default.Router();
// @route   GET /api/announcements
// @desc    Get announcements
// @access  Public
router.get('/', announcement_controller_1.getAnnouncements);
// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Public
router.get('/:id', announcement_controller_1.getAnnouncementById);
// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Staff only)
router.post('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, announcement_controller_1.createAnnouncement);
// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Staff only)
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, announcement_controller_1.updateAnnouncement);
// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Staff only)
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, announcement_controller_1.deleteAnnouncement);
exports.default = router;
