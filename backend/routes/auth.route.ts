import express, { Router, RequestHandler } from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  forgotPassword,
  resetPassword,
  logout,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.post('/forgot-password', forgotPassword as RequestHandler);
router.post('/reset-password', resetPassword as RequestHandler);

// Protected routes
router.get('/me', protect, getProfile as RequestHandler);
router.put('/profile', protect, updateProfile as RequestHandler);
router.post('/logout', protect, logout as RequestHandler);

export default router;