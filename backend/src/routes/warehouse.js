import { Router } from 'express';
import * as warehouseController from '../controllers/warehouse.controller.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth + role to all warehouse routes
router.use(authenticateToken, authorizeRole('warehouse'));

// ─── Dashboard
router.get('/dashboard',                      warehouseController.getDashboard);

// ─── Shipments
router.get('/shipments',                      warehouseController.getShipments);
router.put('/shipments/:id/accept',           warehouseController.acceptShipment);
router.put('/shipments/:id/reject',           warehouseController.rejectShipment);
router.put('/shipments/:id/status',           warehouseController.updateShipmentStatus);

// NEW: create outgoing shipment linked to an order
router.post('/shipments',                     warehouseController.createOutgoingShipment);

// ─── Inventory
router.get('/inventory',                      warehouseController.getInventory);
router.get('/low-stock',                      warehouseController.getLowStock);

// NEW: manual stock level update
router.put('/inventory/:id',                  warehouseController.updateInventory);

// ─── Orders
router.get('/orders',                         warehouseController.getOrders);
router.put('/orders/:id/status',              warehouseController.updateOrderStatus);

export default router;