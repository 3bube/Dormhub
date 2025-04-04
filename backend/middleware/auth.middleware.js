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
exports.studentOnly = exports.staffOnly = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const protect = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // Check if token exists in headers
    if (req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];
            // Check if JWT_SECRET is defined
            const secret = process.env.JWT_SECRET;
            if (!secret) {
                throw new Error('JWT_SECRET is not defined in environment variables');
            }
            // Verify token
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            // Get user from the token
            req.user = yield user_model_1.default.findById(decoded.id).select('-password');
            next();
        }
        catch (error) {
            console.error('Auth middleware error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
});
exports.protect = protect;
// Middleware to check if user has staff role
const staffOnly = (req, res, next) => {
    if (req.user && req.user.role === 'staff') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized, staff only' });
    }
};
exports.staffOnly = staffOnly;
// Middleware to check if user has student role
const studentOnly = (req, res, next) => {
    if (req.user && req.user.role === 'student') {
        next();
    }
    else {
        res.status(403).json({ message: 'Not authorized, student only' });
    }
};
exports.studentOnly = studentOnly;
