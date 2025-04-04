"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const meal_controller_1 = require("../controllers/meal.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Meal attendance routes (staff only)
router.get('/attendance', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.getMealAttendance);
router.post('/attendance', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.recordMealAttendance);
// Dietary requests routes (staff only)
router.get('/dietary-requests', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.getDietaryRequests);
// Meal statistics routes (staff only)
router.get('/stats', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.getMealStats);
// Meal plan routes
router.get('/plans', meal_controller_1.getMealPlans);
router.get('/plans/:id', meal_controller_1.getMealPlanById);
router.post('/plans', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.createMealPlan);
router.put('/plans/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.updateMealPlan);
router.delete('/plans/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.deleteMealPlan);
// Meal order routes
router.post('/order', auth_middleware_1.protect, meal_controller_1.orderMeal);
// Student meal plan routes
router.get('/students/:id/plan', auth_middleware_1.protect, meal_controller_1.getStudentMealPlan);
router.post('/students/plan', auth_middleware_1.protect, meal_controller_1.subscribeMealPlan);
router.delete('/students/plan/:id', auth_middleware_1.protect, meal_controller_1.cancelMealPlan);
// Student meal orders route
router.get('/students/:id/orders', auth_middleware_1.protect, meal_controller_1.getStudentMealOrders);
// Basic meal routes
router.get('/', meal_controller_1.getMeals);
router.get('/:id', meal_controller_1.getMealById);
router.post('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.createMeal);
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.updateMeal);
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, meal_controller_1.deleteMeal);
exports.default = router;
