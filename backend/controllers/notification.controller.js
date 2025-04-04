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
exports.createNotification = exports.markAllNotificationsAsRead = exports.markNotificationAsRead = exports.getNotificationById = exports.getNotifications = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { read, limit, relatedTo } = req.query;
        let query = { 'userId.id': (_a = req.user) === null || _a === void 0 ? void 0 : _a._id };
        // Filter by read status if provided
        if (read !== undefined) {
            query.read = read === 'true';
        }
        // Filter by related entity type if provided
        if (relatedTo) {
            query.relatedTo = relatedTo;
        }
        // Find notifications for the current user
        const notifications = yield notification_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(limit ? parseInt(limit) : 50);
        res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getNotifications = getNotifications;
// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
const getNotificationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notification = yield notification_model_1.default.findById(req.params.id);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        // Check if user is authorized to view this notification
        if (notification.userId.id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.status(403).json({ message: 'Not authorized to view this notification' });
            return;
        }
        res.json(notification);
    }
    catch (error) {
        console.error('Get notification by ID error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getNotificationById = getNotificationById;
// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markNotificationAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const notification = yield notification_model_1.default.findById(req.params.id);
        if (!notification) {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        // Check if user is authorized to update this notification
        if (notification.userId.id.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            res.status(403).json({ message: 'Not authorized to update this notification' });
            return;
        }
        // Update read status
        notification.read = true;
        notification.updatedAt = new Date();
        const updatedNotification = yield notification.save();
        res.json(updatedNotification);
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Notification not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.markNotificationAsRead = markNotificationAsRead;
// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
const markAllNotificationsAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Update all unread notifications for the current user
        const result = yield notification_model_1.default.updateMany({ 'userId.id': (_a = req.user) === null || _a === void 0 ? void 0 : _a._id, read: false }, { $set: { read: true, updatedAt: new Date() } });
        res.json({
            message: 'All notifications marked as read',
            count: result.modifiedCount
        });
    }
    catch (error) {
        console.error('Mark all notifications as read error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.markAllNotificationsAsRead = markAllNotificationsAsRead;
// Helper function to create a notification (used internally by other controllers)
const createNotification = (userId, title, message, relatedTo, relatedId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = new notification_model_1.default({
            userId: { id: userId },
            title,
            message,
            relatedTo,
            relatedId,
            read: false,
            createdAt: new Date(),
            updatedAt: new Date()
        });
        yield notification.save();
    }
    catch (error) {
        console.error('Create notification error:', error);
    }
});
exports.createNotification = createNotification;
