import express from 'express';
import { protect, staffOnly } from '../middleware/auth.middleware';
import {
  getResources,
  getResourceById,
  createResource,
  updateResource,
  deleteResource,
  getResourceRequests,
  getResourceRequestById,
  createResourceRequest,
  updateResourceRequestStatus
} from '../controllers/resource.controller';

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Public
router.get('/', getResources);

// @route   GET /api/resources/:id
// @desc    Get resource by ID
// @access  Public
router.get('/:id', getResourceById);

// @route   POST /api/resources
// @desc    Create new resource
// @access  Private (Staff only)
router.post('/', protect, staffOnly, createResource);

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private (Staff only)
router.put('/:id', protect, staffOnly, updateResource);

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private (Staff only)
router.delete('/:id', protect, staffOnly, deleteResource);

// @route   GET /api/resources/requests
// @desc    Get resource requests
// @access  Private
router.get('/requests', protect, getResourceRequests);

// @route   GET /api/resources/requests/:id
// @desc    Get resource request by ID
// @access  Private
router.get('/requests/:id', protect, getResourceRequestById);

// @route   POST /api/resources/requests
// @desc    Create resource request
// @access  Private
router.post('/requests', protect, createResourceRequest);

// @route   PUT /api/resources/requests/:id
// @desc    Update resource request status
// @access  Private (Staff only)
router.put('/requests/:id', protect, staffOnly, updateResourceRequestStatus);

export default router;