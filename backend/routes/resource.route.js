"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const resource_controller_1 = require("../controllers/resource.controller");
const router = express_1.default.Router();
// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', resource_controller_1.getResources);
// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', resource_controller_1.getResourceById);
// @route   POST /api/resources
// @desc    Create new resource
// @access  Private (Staff only)
router.post('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, resource_controller_1.createResource);
// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private (Staff only)
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, resource_controller_1.updateResource);
// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private (Staff only)
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, resource_controller_1.deleteResource);
// @route   GET /api/resources/requests
// @desc    Get resource requests
// @access  Private
router.get('/requests', auth_middleware_1.protect, resource_controller_1.getResourceRequests);
// @route   GET /api/resources/requests/:id
// @desc    Get resource request by ID
// @access  Private
router.get('/requests/:id', auth_middleware_1.protect, resource_controller_1.getResourceRequestById);
// @route   POST /api/resources/requests
// @desc    Create resource request
// @access  Private
router.post('/requests', auth_middleware_1.protect, resource_controller_1.createResourceRequest);
// @route   PUT /api/resources/requests/:id
// @desc    Update resource request status
// @access  Private (Staff only)
router.put('/requests/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, resource_controller_1.updateResourceRequestStatus);
exports.default = router;
