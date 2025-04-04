import express, { Router } from 'express';
import {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomBeds,
  getAvailableRooms,
  allocateRoom,
  updateAllocation,
  endAllocation,
  getStudentAllocation,
  getRecentAllocations,
  getPendingMaintenanceRequests,
  createMaintenanceRequest
} from '../controllers/room.controller';
import { protect, staffOnly } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/', getRooms as express.RequestHandler);
router.get('/available', getAvailableRooms as express.RequestHandler);
router.get('/:id', getRoomById as express.RequestHandler);
router.get('/:id/beds', getRoomBeds as express.RequestHandler);

// Staff-only routes
router.post('/', protect, staffOnly, createRoom as express.RequestHandler);
router.put('/:id', protect, staffOnly, updateRoom as express.RequestHandler);
router.delete('/:id', protect, staffOnly, deleteRoom as express.RequestHandler);

// Room allocation routes
router.post('/allocate', protect, staffOnly, allocateRoom as express.RequestHandler);
router.put('/allocate/:id', protect, staffOnly, updateAllocation as express.RequestHandler);
router.delete('/allocate/:id', protect, staffOnly, endAllocation as express.RequestHandler);
router.get('/allocations/recent', protect, staffOnly, getRecentAllocations as express.RequestHandler);
router.get('/maintenance/pending', protect, staffOnly, getPendingMaintenanceRequests as express.RequestHandler);

// Maintenance request routes
router.post('/maintenance', protect, createMaintenanceRequest as express.RequestHandler);

// Student allocation route
router.get('/students/:id/allocation', protect, getStudentAllocation as express.RequestHandler);

export default router;