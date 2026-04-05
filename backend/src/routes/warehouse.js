import { Router } from 'express';
import * as warehouseController from '../controllers/warehouse.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Warehouse
 *     description: Warehouse management, inventory, orders, and shipments
 */

const router = Router();

// Apply auth + role to all warehouse routes
router.use(authenticateToken, authorizeRole('warehouse'));

// NEW: create outgoing shipment linked to an order
router.post('/shipments',                     warehouseController.createOutgoingShipment);

// NEW: manual stock level update
router.put('/inventory/:id',                  warehouseController.updateInventory);

/**
 * @swagger
 * /warehouse/dashboard:
 *   get:
 *     summary: Get warehouse dashboard metrics
 *     tags: [Warehouse]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       403:
 *         description: Forbidden (Requires warehouse role)
 *       500:
 *         description: Server error
 */
router.get('/dashboard',              warehouseController.getDashboard);

// Shipments
/**
 * @swagger
 * /warehouse/shipments:
 *   get:
 *     summary: Get all shipments for the warehouse
 *     tags: [Warehouse - Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of shipments
 *       500:
 *         description: Server error
 */
router.get('/shipments',              warehouseController.getShipments);

/**
 * @swagger
 * /warehouse/shipments/{id}/accept:
 *   put:
 *     summary: Accept a specific shipment
 *     tags: [Warehouse - Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: Shipment accepted successfully
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.put('/shipments/:id/accept',   warehouseController.acceptShipment);
/**
 * @swagger
 * /warehouse/shipments/{id}/reject:
 *   put:
 *     summary: Reject a specific shipment
 *     tags: [Warehouse - Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shipment ID
 *     responses:
 *       200:
 *         description: Shipment rejected successfully
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.put('/shipments/:id/reject',   warehouseController.rejectShipment);
/**
 * @swagger
 * /warehouse/shipments/{id}/status:
 *   put:
 *     summary: Update the status of a shipment
 *     tags: [Warehouse - Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The shipment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "in_transit"
 *     responses:
 *       200:
 *         description: Shipment status updated successfully
 *       400:
 *         description: Status is required or invalid
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.put('/shipments/:id/status',   warehouseController.updateShipmentStatus);

// Inventory
/**
 * @swagger
 * /warehouse/inventory:
 *   get:
 *     summary: Get current warehouse inventory
 *     tags: [Warehouse - Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of inventory items
 *       500:
 *         description: Server error
 */
router.get('/inventory',              warehouseController.getInventory);

/**
 * @swagger
 * /warehouse/low-stock:
 *   get:
 *     summary: Get low stock inventory items
 *     tags: [Warehouse - Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of low stock items
 *       500:
 *         description: Server error
 */
router.get('/low-stock',              warehouseController.getLowStock);

// Orders
/**
 * @swagger
 * /warehouse/orders:
 *   get:
 *     summary: Get all orders managed by this warehouse
 *     tags: [Warehouse - Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Server error
 */
router.get('/orders',                 warehouseController.getOrders);

/**
 * @swagger
 * /warehouse/orders/{id}/status:
 *   put:
 *     summary: Update the status of an order
 *     tags: [Warehouse - Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: "shipped"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Status is required
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.put('/orders/:id/status',      warehouseController.updateOrderStatus);

export default router;