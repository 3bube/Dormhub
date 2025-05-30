"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ComplaintSchema = new mongoose_1.Schema({
    studentId: {
        id: { type: mongoose_1.default.Types.ObjectId, required: true, ref: "User" },
    },
    title: { required: true, type: String },
    description: { required: true, type: String },
    category: {
        required: true,
        type: String,
        enum: [
            "Electrical",
            "Plumbing",
            "Furniture",
            "Housekeeping",
            "Network",
            "Mess",
            "Security",
            "Resident Issue",
            "Other",
        ],
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Urgent"],
        default: "Medium",
    },
    status: {
        type: String,
        enum: ["pending", "in-progress", "resolved", "closed"],
        default: "pending",
    },
    location: { type: String },
    assignedTo: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        sparse: true,
    },
    resolution: { type: String },
    attachments: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
});
const Complaint = mongoose_1.default.model("Complaint", ComplaintSchema);
exports.default = Complaint;
