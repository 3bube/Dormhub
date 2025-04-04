import express, { Router, RequestHandler } from 'express';
import {
  getStudentDashboard,
  getStaffDashboard
} from '../controllers/dashboard.controller';
import { protect, staffOnly } from '../middleware/auth.middleware';

const router = Router();

// Protected routes
router.get('/student', protect, getStudentDashboard as RequestHandler);
router.get('/staff', protect, staffOnly, getStaffDashboard as RequestHandler);

export default router;
