"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all payments (filtered by user role)
router.get('/', auth_middleware_1.protect, payment_controller_1.getPayments);
// Get pending payments (staff only)
router.get('/pending', auth_middleware_1.protect, auth_middleware_1.staffOnly, payment_controller_1.getPendingPayments);
// Get payment statistics (staff only)
router.get('/stats', auth_middleware_1.protect, auth_middleware_1.staffOnly, payment_controller_1.getPaymentStats);
// Get fee structure
router.get('/fee-structure', payment_controller_1.getFeeStructure);
// Get student's payments - must be before /:id route
router.get('/students/:id', auth_middleware_1.protect, payment_controller_1.getStudentPayments);
// Get payment by ID
router.get('/:id', auth_middleware_1.protect, payment_controller_1.getPaymentById);
// Create new payment
router.post('/', auth_middleware_1.protect, payment_controller_1.createPayment);
// Record payment (staff only)
router.post('/record', auth_middleware_1.protect, auth_middleware_1.staffOnly, payment_controller_1.recordPayment);
// Send payment reminders (staff only)
router.post('/send-reminders', auth_middleware_1.protect, auth_middleware_1.staffOnly, payment_controller_1.sendPaymentReminders);
exports.default = router;
