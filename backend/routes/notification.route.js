"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = express_1.default.Router();
// @route   GET /api/notifications
// @desc    Get user notifications
// @access  Private
router.get('/', auth_middleware_1.protect, notification_controller_1.getNotifications);
// @route   GET /api/notifications/:id
// @desc    Get notification by ID
// @access  Private
router.get('/:id', auth_middleware_1.protect, notification_controller_1.getNotificationById);
// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth_middleware_1.protect, notification_controller_1.markNotificationAsRead);
// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', auth_middleware_1.protect, notification_controller_1.markAllNotificationsAsRead);
exports.default = router;
