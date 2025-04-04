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
exports.logout = exports.resetPassword = exports.forgotPassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = __importDefault(require("../models/user.model"));
// Generate JWT token
const generateToken = (id) => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables");
    }
    return jsonwebtoken_1.default.sign({ id }, secret, {
        expiresIn: "30d",
    });
};
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        // Check if user already exists
        const userExists = yield user_model_1.default.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        // Create user
        const user = yield user_model_1.default.create({
            name,
            email,
            password,
            role,
        });
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        }
        else {
            res.status(400).json({ message: "Invalid user data" });
        }
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.register = register;
// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Check for user email
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        // Check if password matches
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({ message: "Invalid email or password" });
            return;
        }
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    }
    catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.login = login;
// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const user = yield user_model_1.default.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                staffId: user.staffId,
                profileImage: user.profileImage,
                phone: user.phone,
                emergencyContact: user.emergencyContact,
                roomNumber: user.roomNumber,
                joinDate: user.joinDate,
                status: user.status,
                notificationSettings: user.notificationSettings,
                privacySettings: user.privacySettings,
            });
        }
        else {
            res.status(404).json({ message: "User not found" });
        }
    }
    catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.getProfile = getProfile;
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({ message: "Not authorized" });
            return;
        }
        const user = yield user_model_1.default.findById(req.user._id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Update user fields
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.emergencyContact = req.body.emergencyContact || user.emergencyContact;
        user.profileImage = req.body.profileImage || user.profileImage;
        // Update password if provided
        if (req.body.password) {
            user.password = req.body.password;
        }
        // Update notification settings if provided
        if (req.body.notificationSettings) {
            user.notificationSettings = Object.assign(Object.assign({}, user.notificationSettings), req.body.notificationSettings);
        }
        // Update privacy settings if provided
        if (req.body.privacySettings) {
            user.privacySettings = Object.assign(Object.assign({}, user.privacySettings), req.body.privacySettings);
        }
        const updatedUser = yield user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            studentId: updatedUser.studentId,
            staffId: updatedUser.staffId,
            profileImage: updatedUser.profileImage,
            phone: updatedUser.phone,
            emergencyContact: updatedUser.emergencyContact,
            roomNumber: updatedUser.roomNumber,
            notificationSettings: updatedUser.notificationSettings,
            privacySettings: updatedUser.privacySettings,
            token: generateToken(updatedUser._id),
        });
    }
    catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.updateProfile = updateProfile;
// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        // Hash token and set to resetPasswordToken field
        const resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        // Set expire
        const resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
        // Update user with reset token info
        yield user_model_1.default.findByIdAndUpdate(user._id, {
            resetPasswordToken,
            resetPasswordExpire,
        });
        // In a real application, you would send an email with the reset token
        // For now, we'll just return it in the response
        res.json({
            message: "Password reset token generated",
            resetToken,
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.forgotPassword = forgotPassword;
// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { token, password } = req.body;
        // Hash token
        const resetPasswordToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        const user = yield user_model_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });
        if (!user) {
            res.status(400).json({ message: "Invalid or expired token" });
            return;
        }
        // Set new password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        yield user.save();
        res.json({ message: "Password reset successful" });
    }
    catch (error) {
        console.error("Reset password error:", error);
        res.status(500).json({ message: error.message || "Server error" });
    }
});
exports.resetPassword = resetPassword;
// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logout = (req, res) => {
    res.json({ message: "Logged out successfully" });
};
exports.logout = logout;
