"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', auth_controller_1.register);
router.post('/login', auth_controller_1.login);
router.post('/forgot-password', auth_controller_1.forgotPassword);
router.post('/reset-password', auth_controller_1.resetPassword);
// Protected routes
router.get('/me', auth_middleware_1.protect, auth_controller_1.getProfile);
router.put('/profile', auth_middleware_1.protect, auth_controller_1.updateProfile);
router.post('/logout', auth_middleware_1.protect, auth_controller_1.logout);
exports.default = router;
