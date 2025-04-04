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
exports.updateResourceRequestStatus = exports.createResourceRequest = exports.getResourceRequestById = exports.getResourceRequests = exports.deleteResource = exports.updateResource = exports.createResource = exports.getResourceById = exports.getResources = void 0;
const resource_model_1 = __importDefault(require("../models/resource.model"));
const resourceRequest_model_1 = __importDefault(require("../models/resourceRequest.model"));
// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
const getResources = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { category, status } = req.query;
        let query = {};
        if (category)
            query.category = category;
        if (status)
            query.status = status;
        const resources = yield resource_model_1.default.find(query).sort({ name: 1 });
        res.json(resources);
    }
    catch (error) {
        console.error('Get resources error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getResources = getResources;
// @desc    Get resource by ID
// @route   GET /api/resources/:id
// @access  Public
const getResourceById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield resource_model_1.default.findById(req.params.id);
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.json(resource);
    }
    catch (error) {
        console.error('Get resource by ID error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getResourceById = getResourceById;
// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Staff only)
const createResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, category, totalQuantity, availableQuantity, threshold } = req.body;
        // Validate required fields
        if (!name || !category || !totalQuantity || !threshold) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        // Set status based on available quantity and threshold
        let status = 'available';
        if (availableQuantity <= 0) {
            status = 'out_of_stock';
        }
        else if (availableQuantity <= threshold) {
            status = 'low_stock';
        }
        const newResource = new resource_model_1.default({
            name,
            description,
            category,
            totalQuantity,
            availableQuantity: availableQuantity || totalQuantity,
            threshold,
            status
        });
        const savedResource = yield newResource.save();
        res.status(201).json(savedResource);
    }
    catch (error) {
        console.error('Create resource error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.createResource = createResource;
// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Staff only)
const updateResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, description, category, totalQuantity, availableQuantity, threshold } = req.body;
        // Find resource
        const resource = yield resource_model_1.default.findById(req.params.id);
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        // Update fields
        if (name)
            resource.name = name;
        if (description)
            resource.description = description;
        if (category)
            resource.category = category;
        if (totalQuantity)
            resource.totalQuantity = totalQuantity;
        if (availableQuantity !== undefined)
            resource.availableQuantity = availableQuantity;
        if (threshold)
            resource.threshold = threshold;
        // Update status based on available quantity and threshold
        if (resource.availableQuantity <= 0) {
            resource.status = 'out_of_stock';
        }
        else if (resource.availableQuantity <= resource.threshold) {
            resource.status = 'low_stock';
        }
        else {
            resource.status = 'available';
        }
        resource.updatedAt = new Date();
        const updatedResource = yield resource.save();
        res.json(updatedResource);
    }
    catch (error) {
        console.error('Update resource error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.updateResource = updateResource;
// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Staff only)
const deleteResource = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resource = yield resource_model_1.default.findById(req.params.id);
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        // Check if there are any pending resource requests for this resource
        const pendingRequests = yield resourceRequest_model_1.default.countDocuments({
            resourceId: req.params.id,
            status: { $in: ['pending', 'approved', 'in_progress'] }
        });
        if (pendingRequests > 0) {
            res.status(400).json({
                message: 'Cannot delete resource with pending requests. Please handle all requests first.'
            });
            return;
        }
        yield resource.deleteOne();
        res.json({ message: 'Resource removed' });
    }
    catch (error) {
        console.error('Delete resource error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.deleteResource = deleteResource;
// @desc    Get resource requests (filtered by user role)
// @route   GET /api/resource-requests
// @access  Private
const getResourceRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        let requests;
        // If user is staff, get all requests with optional filters
        // If user is student, get only their requests
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) === 'staff') {
            const { status, startDate, endDate, resourceId } = req.query;
            let query = {};
            if (status)
                query.status = status;
            if (resourceId)
                query.resourceId = resourceId;
            // Date range filter
            if (startDate || endDate) {
                query.requestDate = {};
                if (startDate)
                    query.requestDate.$gte = new Date(startDate);
                if (endDate)
                    query.requestDate.$lte = new Date(endDate);
            }
            requests = yield resourceRequest_model_1.default.find(query)
                .populate('studentId', 'name email studentId')
                .populate('resourceId', 'name category')
                .populate('approvedBy', 'name')
                .sort({ requestDate: -1 });
        }
        else {
            // Student can only see their own requests
            requests = yield resourceRequest_model_1.default.find({
                studentId: (_b = req.user) === null || _b === void 0 ? void 0 : _b._id
            })
                .populate('resourceId', 'name category')
                .populate('approvedBy', 'name')
                .sort({ requestDate: -1 });
        }
        res.json(requests);
    }
    catch (error) {
        console.error('Get resource requests error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getResourceRequests = getResourceRequests;
// @desc    Get resource request by ID
// @route   GET /api/resource-requests/:id
// @access  Private
const getResourceRequestById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const request = yield resourceRequest_model_1.default.findById(req.params.id)
            .populate('studentId', 'name email studentId')
            .populate('resourceId', 'name category description')
            .populate('approvedBy', 'name');
        if (!request) {
            res.status(404).json({ message: 'Resource request not found' });
            return;
        }
        // Check if user is authorized to view this request
        if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== 'staff' && request.studentId.toString() !== ((_b = req.user) === null || _b === void 0 ? void 0 : _b._id.toString())) {
            res.status(403).json({ message: 'Not authorized to view this request' });
            return;
        }
        res.json(request);
    }
    catch (error) {
        console.error('Get resource request by ID error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Resource request not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.getResourceRequestById = getResourceRequestById;
// @desc    Create new resource request
// @route   POST /api/resource-requests
// @access  Private
const createResourceRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { resourceId, quantity, reason } = req.body;
        // Validate required fields
        if (!resourceId || !reason) {
            res.status(400).json({ message: 'Please provide all required fields' });
            return;
        }
        // Check if resource exists and has available quantity
        const resource = yield resource_model_1.default.findById(resourceId);
        if (!resource) {
            res.status(404).json({ message: 'Resource not found' });
            return;
        }
        if (resource.availableQuantity < (quantity || 1)) {
            res.status(400).json({ message: 'Requested quantity not available' });
            return;
        }
        const newRequest = new resourceRequest_model_1.default({
            studentId: (_a = req.user) === null || _a === void 0 ? void 0 : _a._id,
            resourceId,
            quantity: quantity || 1,
            reason,
            status: 'pending',
            requestDate: new Date()
        });
        const savedRequest = yield newRequest.save();
        // Populate the response with resource details
        const populatedRequest = yield resourceRequest_model_1.default.findById(savedRequest._id)
            .populate('resourceId', 'name category')
            .populate('studentId', 'name email studentId');
        res.status(201).json(populatedRequest);
    }
    catch (error) {
        console.error('Create resource request error:', error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.createResourceRequest = createResourceRequest;
// @desc    Update resource request status
// @route   PUT /api/resource-requests/:id
// @access  Private (Staff only)
const updateResourceRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { status, denialReason } = req.body;
        // Validate status
        if (!status || !['pending', 'approved', 'in_progress', 'delivered', 'denied'].includes(status)) {
            res.status(400).json({ message: 'Please provide a valid status' });
            return;
        }
        // Find request
        const request = yield resourceRequest_model_1.default.findById(req.params.id);
        if (!request) {
            res.status(404).json({ message: 'Resource request not found' });
            return;
        }
        // Update resource availability if approving
        if (status === 'approved' && request.status !== 'approved') {
            const resource = yield resource_model_1.default.findById(request.resourceId);
            if (!resource) {
                res.status(404).json({ message: 'Associated resource not found' });
                return;
            }
            if (resource.availableQuantity < request.quantity) {
                res.status(400).json({ message: 'Requested quantity not available' });
                return;
            }
            // Reduce available quantity
            resource.availableQuantity -= request.quantity;
            // Update resource status if needed
            if (resource.availableQuantity <= 0) {
                resource.status = 'out_of_stock';
            }
            else if (resource.availableQuantity <= resource.threshold) {
                resource.status = 'low_stock';
            }
            resource.updatedAt = new Date();
            yield resource.save();
            // Set approval details
            request.approvedBy = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
            request.approvedDate = new Date();
        }
        // If denying, require a reason
        if (status === 'denied') {
            if (!denialReason) {
                res.status(400).json({ message: 'Please provide a reason for denial' });
                return;
            }
            request.denialReason = denialReason;
        }
        // If delivered, set delivery date
        if (status === 'delivered') {
            request.deliveryDate = new Date();
        }
        // Update status
        request.status = status;
        request.updatedAt = new Date();
        const updatedRequest = yield request.save();
        // Populate the response with resource details
        const populatedRequest = yield resourceRequest_model_1.default.findById(updatedRequest._id)
            .populate('resourceId', 'name category')
            .populate('studentId', 'name email studentId')
            .populate('approvedBy', 'name');
        res.json(populatedRequest);
    }
    catch (error) {
        console.error('Update resource request status error:', error);
        if (error.kind === 'ObjectId') {
            res.status(404).json({ message: 'Resource request not found' });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error' });
    }
});
exports.updateResourceRequestStatus = updateResourceRequestStatus;
