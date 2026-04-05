import { Router } from 'express';
import * as supplierController from '../controllers/supplier.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Supplier
 *     description: Supplier management, materials, and orders
 */

const router = Router();

// Apply auth + role check to all supplier routes
router.use(authenticateToken, authorizeRole('supplier'));

// ─── Materials ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /supplier/materials:
 *   get:
 *     summary: Get all materials for the supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of materials retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/materials',           supplierController.getMaterials);

/**
 * @swagger
 * /supplier/materials:
 *   post:
 *     summary: Add a new material for the supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - quantity
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Raw Aluminum"
 *               quantity:
 *                 type: integer
 *                 example: 500
 *               price:
 *                 type: number
 *                 example: 25.50
 *     responses:
 *       201:
 *         description: Material created successfully
 *       400:
 *         description: Bad request (Missing required fields)
 *       500:
 *         description: Server error
 */
router.post('/materials',          supplierController.addMaterial);

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /supplier/orders:
 *   get:
 *     summary: Get all orders for the supplier
 *     tags: [Supplier]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of supplier orders retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/orders',              supplierController.getOrders);

/**
 * @swagger
 * /supplier/orders/{id}/status:
 *   patch:
 *     summary: Update the status of a specific order
 *     tags: [Supplier]
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
 *                 example: "processing"
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Bad request (Status is required)
 *       404:
 *         description: Order not found
 *       500:
 *         description: Server error
 */
router.patch('/orders/:id/status',  supplierController.patchStatus);

export default router;