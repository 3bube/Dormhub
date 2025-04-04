"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes
router.get('/student', auth_middleware_1.protect, dashboard_controller_1.getStudentDashboard);
router.get('/staff', auth_middleware_1.protect, auth_middleware_1.staffOnly, dashboard_controller_1.getStaffDashboard);
exports.default = router;
