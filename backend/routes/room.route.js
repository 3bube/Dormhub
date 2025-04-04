"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controllers/room.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Public routes
router.get('/', room_controller_1.getRooms);
router.get('/available', room_controller_1.getAvailableRooms);
router.get('/:id', room_controller_1.getRoomById);
router.get('/:id/beds', room_controller_1.getRoomBeds);
// Staff-only routes
router.post('/', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.createRoom);
router.put('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.updateRoom);
router.delete('/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.deleteRoom);
// Room allocation routes
router.post('/allocate', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.allocateRoom);
router.put('/allocate/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.updateAllocation);
router.delete('/allocate/:id', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.endAllocation);
router.get('/allocations/recent', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.getRecentAllocations);
router.get('/maintenance/pending', auth_middleware_1.protect, auth_middleware_1.staffOnly, room_controller_1.getPendingMaintenanceRequests);
// Maintenance request routes
router.post('/maintenance', auth_middleware_1.protect, room_controller_1.createMaintenanceRequest);
// Student allocation route
router.get('/students/:id/allocation', auth_middleware_1.protect, room_controller_1.getStudentAllocation);
exports.default = router;
