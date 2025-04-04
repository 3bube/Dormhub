import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Resource from '../models/resource.model';
import ResourceRequest from '../models/resourceRequest.model';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, status } = req.query;
    let query: any = {};
    
    if (category) query.category = category;
    if (status) query.status = status;
    
    const resources = await Resource.find(query).sort({ name: 1 });
    
    res.json(resources);
  } catch (error: any) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get resource by ID
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    res.json(resource);
  } catch (error: any) {
    console.error('Get resource by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new resource
// @route   POST /api/resources
// @access  Private (Staff only)
export const createResource = async (req: AuthRequest, res: Response): Promise<void> => {
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
    } else if (availableQuantity <= threshold) {
      status = 'low_stock';
    }
    
    const newResource = new Resource({
      name,
      description,
      category,
      totalQuantity,
      availableQuantity: availableQuantity || totalQuantity,
      threshold,
      status
    });
    
    const savedResource = await newResource.save();
    
    res.status(201).json(savedResource);
  } catch (error: any) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update resource
// @route   PUT /api/resources/:id
// @access  Private (Staff only)
export const updateResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, category, totalQuantity, availableQuantity, threshold } = req.body;
    
    // Find resource
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    // Update fields
    if (name) resource.name = name;
    if (description) resource.description = description;
    if (category) resource.category = category;
    if (totalQuantity) resource.totalQuantity = totalQuantity;
    if (availableQuantity !== undefined) resource.availableQuantity = availableQuantity;
    if (threshold) resource.threshold = threshold;
    
    // Update status based on available quantity and threshold
    if (resource.availableQuantity <= 0) {
      resource.status = 'out_of_stock';
    } else if (resource.availableQuantity <= resource.threshold) {
      resource.status = 'low_stock';
    } else {
      resource.status = 'available';
    }
    
    resource.updatedAt = new Date();
    
    const updatedResource = await resource.save();
    
    res.json(updatedResource);
  } catch (error: any) {
    console.error('Update resource error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private (Staff only)
export const deleteResource = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const resource = await Resource.findById(req.params.id);
    
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    // Check if there are any pending resource requests for this resource
    const pendingRequests = await ResourceRequest.countDocuments({
      resourceId: req.params.id,
      status: { $in: ['pending', 'approved', 'in_progress'] }
    });
    
    if (pendingRequests > 0) {
      res.status(400).json({ 
        message: 'Cannot delete resource with pending requests. Please handle all requests first.' 
      });
      return;
    }
    
    await resource.deleteOne();
    
    res.json({ message: 'Resource removed' });
  } catch (error: any) {
    console.error('Delete resource error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get resource requests (filtered by user role)
// @route   GET /api/resource-requests
// @access  Private
export const getResourceRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let requests;
    
    // If user is staff, get all requests with optional filters
    // If user is student, get only their requests
    if (req.user?.role === 'staff') {
      const { status, startDate, endDate, resourceId } = req.query;
      let query: any = {};
      
      if (status) query.status = status;
      if (resourceId) query.resourceId = resourceId;
      
      // Date range filter
      if (startDate || endDate) {
        query.requestDate = {};
        if (startDate) query.requestDate.$gte = new Date(startDate as string);
        if (endDate) query.requestDate.$lte = new Date(endDate as string);
      }
      
      requests = await ResourceRequest.find(query)
        .populate('studentId', 'name email studentId')
        .populate('resourceId', 'name category')
        .populate('approvedBy', 'name')
        .sort({ requestDate: -1 });
    } else {
      // Student can only see their own requests
      requests = await ResourceRequest.find({
        studentId: req.user?._id
      })
        .populate('resourceId', 'name category')
        .populate('approvedBy', 'name')
        .sort({ requestDate: -1 });
    }
    
    res.json(requests);
  } catch (error: any) {
    console.error('Get resource requests error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Get resource request by ID
// @route   GET /api/resource-requests/:id
// @access  Private
export const getResourceRequestById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await ResourceRequest.findById(req.params.id)
      .populate('studentId', 'name email studentId')
      .populate('resourceId', 'name category description')
      .populate('approvedBy', 'name');
    
    if (!request) {
      res.status(404).json({ message: 'Resource request not found' });
      return;
    }
    
    // Check if user is authorized to view this request
    if (req.user?.role !== 'staff' && request.studentId.toString() !== req.user?._id.toString()) {
      res.status(403).json({ message: 'Not authorized to view this request' });
      return;
    }
    
    res.json(request);
  } catch (error: any) {
    console.error('Get resource request by ID error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Resource request not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Create new resource request
// @route   POST /api/resource-requests
// @access  Private
export const createResourceRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { resourceId, quantity, reason } = req.body;
    
    // Validate required fields
    if (!resourceId || !reason) {
      res.status(400).json({ message: 'Please provide all required fields' });
      return;
    }
    
    // Check if resource exists and has available quantity
    const resource = await Resource.findById(resourceId);
    
    if (!resource) {
      res.status(404).json({ message: 'Resource not found' });
      return;
    }
    
    if (resource.availableQuantity < (quantity || 1)) {
      res.status(400).json({ message: 'Requested quantity not available' });
      return;
    }
    
    const newRequest = new ResourceRequest({
      studentId: req.user?._id,
      resourceId,
      quantity: quantity || 1,
      reason,
      status: 'pending',
      requestDate: new Date()
    });
    
    const savedRequest = await newRequest.save();
    
    // Populate the response with resource details
    const populatedRequest = await ResourceRequest.findById(savedRequest._id)
      .populate('resourceId', 'name category')
      .populate('studentId', 'name email studentId');
    
    res.status(201).json(populatedRequest);
  } catch (error: any) {
    console.error('Create resource request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// @desc    Update resource request status
// @route   PUT /api/resource-requests/:id
// @access  Private (Staff only)
export const updateResourceRequestStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, denialReason } = req.body;
    
    // Validate status
    if (!status || !['pending', 'approved', 'in_progress', 'delivered', 'denied'].includes(status)) {
      res.status(400).json({ message: 'Please provide a valid status' });
      return;
    }
    
    // Find request
    const request = await ResourceRequest.findById(req.params.id);
    
    if (!request) {
      res.status(404).json({ message: 'Resource request not found' });
      return;
    }
    
    // Update resource availability if approving
    if (status === 'approved' && request.status !== 'approved') {
      const resource = await Resource.findById(request.resourceId);
      
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
      } else if (resource.availableQuantity <= resource.threshold) {
        resource.status = 'low_stock';
      }
      
      resource.updatedAt = new Date();
      await resource.save();
      
      // Set approval details
      request.approvedBy = req.user?._id;
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
    
    const updatedRequest = await request.save();
    
    // Populate the response with resource details
    const populatedRequest = await ResourceRequest.findById(updatedRequest._id)
      .populate('resourceId', 'name category')
      .populate('studentId', 'name email studentId')
      .populate('approvedBy', 'name');
    
    res.json(populatedRequest);
  } catch (error: any) {
    console.error('Update resource request status error:', error);
    
    if (error.kind === 'ObjectId') {
      res.status(404).json({ message: 'Resource request not found' });
      return;
    }
    
    res.status(500).json({ message: error.message || 'Server error' });
  }
};