import express, { Router } from 'express';
import {
  getPayments,
  getPaymentById,
  createPayment,
  getStudentPayments,
  getPendingPayments,
  recordPayment,
  getPaymentStats,
  sendPaymentReminders,
  getFeeStructure
} from '../controllers/payment.controller';
import { protect, staffOnly } from '../middleware/auth.middleware';

const router = Router();

// Get all payments (filtered by user role)
router.get('/', protect, getPayments as express.RequestHandler);

// Get pending payments (staff only)
router.get('/pending', protect, staffOnly, getPendingPayments as express.RequestHandler);

// Get payment statistics (staff only)
router.get('/stats', protect, staffOnly, getPaymentStats as express.RequestHandler);

// Get fee structure
router.get('/fee-structure', getFeeStructure as express.RequestHandler);

// Get student's payments - must be before /:id route
router.get('/students/:id', protect, getStudentPayments as express.RequestHandler);

// Get payment by ID
router.get('/:id', protect, getPaymentById as express.RequestHandler);

// Create new payment
router.post('/', protect, createPayment as express.RequestHandler);

// Record payment (staff only)
router.post('/record', protect, staffOnly, recordPayment as express.RequestHandler);

// Send payment reminders (staff only)
router.post('/send-reminders', protect, staffOnly, sendPaymentReminders as express.RequestHandler);

export default router;