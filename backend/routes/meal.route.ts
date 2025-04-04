import express, { Router } from 'express';
import {
  getMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
  getMealPlans,
  getMealPlanById,
  createMealPlan,
  updateMealPlan,
  deleteMealPlan,
  getStudentMealPlan,
  subscribeMealPlan,
  cancelMealPlan,
  orderMeal,
  getStudentMealOrders,
  getMealAttendance,
  recordMealAttendance,
  getDietaryRequests,
  getMealStats
} from '../controllers/meal.controller';
import { protect, staffOnly } from '../middleware/auth.middleware';

const router = Router();

// Meal attendance routes (staff only)
router.get('/attendance', protect, staffOnly, getMealAttendance as express.RequestHandler);
router.post('/attendance', protect, staffOnly, recordMealAttendance as express.RequestHandler);

// Dietary requests routes (staff only)
router.get('/dietary-requests', protect, staffOnly, getDietaryRequests as express.RequestHandler);

// Meal statistics routes (staff only)
router.get('/stats', protect, staffOnly, getMealStats as express.RequestHandler);

// Meal plan routes
router.get('/plans', getMealPlans as express.RequestHandler);
router.get('/plans/:id', getMealPlanById as express.RequestHandler);
router.post('/plans', protect, staffOnly, createMealPlan as express.RequestHandler);
router.put('/plans/:id', protect, staffOnly, updateMealPlan as express.RequestHandler);
router.delete('/plans/:id', protect, staffOnly, deleteMealPlan as express.RequestHandler);

// Meal order routes
router.post('/order', protect, orderMeal as express.RequestHandler);

// Student meal plan routes
router.get('/students/:id/plan', protect, getStudentMealPlan as express.RequestHandler);
router.post('/students/plan', protect, subscribeMealPlan as express.RequestHandler);
router.delete('/students/plan/:id', protect, cancelMealPlan as express.RequestHandler);

// Student meal orders route
router.get('/students/:id/orders', protect, getStudentMealOrders as express.RequestHandler);

// Basic meal routes
router.get('/', getMeals as express.RequestHandler);
router.get('/:id', getMealById as express.RequestHandler);
router.post('/', protect, staffOnly, createMeal as express.RequestHandler);
router.put('/:id', protect, staffOnly, updateMeal as express.RequestHandler);
router.delete('/:id', protect, staffOnly, deleteMeal as express.RequestHandler);

export default router;