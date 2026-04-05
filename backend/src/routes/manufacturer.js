import { Router } from 'express';
import * as manufacturerController from '../controllers/manufacturer.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Manufacturer
 *     description: Manufacturer operations including products, orders, inventory, and shipments
 */

const router = Router();

// Apply auth + role check to all manufacturer routes
router.use(authenticateToken, authorizeRole('manufacturer'));

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/dashboard:
 *   get:
 *     summary: Get manufacturer dashboard metrics
 *     tags: [Manufacturer]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/dashboard', manufacturerController.getDashboard);

// ─── Raw Materials (supplier catalog) ────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/raw-materials:
 *   get:
 *     summary: Get a catalog of available raw materials from suppliers
 *     tags: [Manufacturer - Raw Materials]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of raw materials
 *       500:
 *         description: Server error
 */
router.get('/raw-materials', manufacturerController.getRawMaterials);

// ─── Orders (placed with suppliers) ──────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/orders:
 *   post:
 *     summary: Place a new order with a supplier for raw materials
 *     tags: [Manufacturer - Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - supplier_id
 *               - items
 *               - shipping_address
 *             properties:
 *               supplier_id:
 *                 type: string
 *                 example: "sup_123456"
 *                 description: UUID of the supplier to order from
 *               shipping_address:
 *                 type: string
 *                 example: "123 Main St, Anytown, USA"
 *               items:
 *                 type: array
 *                 description: List of raw materials to order
 *                 items:
 *                   type: object
 *                   required:
 *                     - material_id
 *                     - quantity
 *                   properties:
 *                     material_id:
 *                       type: string
 *                       example: "mat_789"
 *                     quantity:
 *                       type: integer
 *                       example: 100
 *                     unit_price:
 *                       type: number
 *                       format: float
 *                       example: 25.50
 *                       description: Optional; if not provided, price from supplier catalog is used
 *     responses:
 *       201:
 *         description: Order placed successfully
 *       400:
 *         description: Bad request (Missing required fields or invalid data)
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all raw material orders placed by the manufacturer
 *     tags: [Manufacturer - Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Server error
 */
router.post('/orders', manufacturerController.placeOrder);

/**
 * @swagger
 * /manufacturer/orders:
 *   get:
 *     summary: Get all raw material orders placed by the manufacturer
 *     tags: [Manufacturer - Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of orders
 *       500:
 *         description: Server error
 */
router.get('/orders', manufacturerController.getOrders);

// ─── Products & Production Pipeline ──────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/products:
 *   get:
 *     summary: Get all products in the production pipeline
 *     tags: [Manufacturer - Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Server error
 *   post:
 *     summary: Create a new product in the production pipeline
 *     tags: [Manufacturer - Products]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Widget A"
 *               quantity:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request (Missing required fields or invalid data)
 *       500:
 *         description: Server error
 */
router.get('/products', manufacturerController.getProducts);

/**
 * @swagger
 * /manufacturer/products:
 *   post:
 *     summary: Create a new product in the production pipeline
 *     tags: [Manufacturer - Products]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Widget A"
 *               quantity:
 *                 type: integer
 *                 example: 500
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Bad request (Missing required fields or invalid data)
 *       500:
 *         description: Server error
 */
router.post('/products', manufacturerController.createProduct);

/**
 * @swagger
 * /manufacturer/products/{id}/stage:
 *   put:
 *     summary: Update the production stage of a product
 *     tags: [Manufacturer - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - production_stage
 *             properties:
 *               production_stage:
 *                 type: string
 *                 example: "Valid values: 'design', 'cutting', 'sewing', 'quality', 'packaging', 'completed'"
 *     responses:
 *       200:
 *         description: Product stage updated successfully
 *       400:
 *         description: Bad request (Missing stage, invalid stage, or moving backwards)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/products/:id/stage', manufacturerController.updateProductStage);

/**
 * @swagger
 * /manufacturer/products/{id}/quantity:
 *   put:
 *     summary: Update the target quantity of a product in production
 *     tags: [Manufacturer - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *             properties:
 *               quantity:
 *                 type: integer
 *                 example: 600
 *     responses:
 *       200:
 *         description: Product quantity updated successfully
 *       400:
 *         description: Bad request (Missing quantity or product already completed)
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/products/:id/quantity', manufacturerController.updateProductQuantity);

/**
 * @swagger
 * /manufacturer/products/{id}:
 *   delete:
 *     summary: Delete a product from the production pipeline
 *     tags: [Manufacturer - Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/products/:id', manufacturerController.deleteProduct);

// ─── Finished Goods Inventory ─────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/inventory:
 *   get:
 *     summary: Get finished goods inventory
 *     tags: [Manufacturer - Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of finished goods
 *       500:
 *         description: Server error
 */
router.get('/inventory', manufacturerController.getInventory);

/**
 * @swagger
 * /manufacturer/inventory/{id}:
 *   put:
 *     summary: Update pricing for an item in finished goods inventory
 *     tags: [Manufacturer - Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               price:
 *                 type: number
 *                 example: 99.99
 *     responses:
 *       200:
 *         description: Inventory prices updated successfully
 *       400:
 *         description: Bad request (Missing required fields)
 *       404:
 *         description: Inventory item not found
 *       500:
 *         description: Server error
 */
router.put('/inventory/:id', manufacturerController.updateInventoryPrices);

// ─── Warehouses ───────────────────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/warehouses:
 *   get:
 *     summary: Get a list of available warehouses
 *     tags: [Manufacturer - Warehouses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of warehouses
 *       500:
 *         description: Server error
 */
router.get('/warehouses', manufacturerController.getWarehouses);

// ─── Shipments ────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/shipments:
 *   post:
 *     summary: Create a shipment to move finished goods to a warehouse
 *     tags: [Manufacturer - Shipments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - warehouse_id
 *               - inventory_id
 *               - quantity
 *             properties:
 *               warehouse_id:
 *                 type: string
 *                 example: "wh_123"
 *               inventory_id:
 *                 type: string
 *                 example: "inv_456"
 *               quantity:
 *                 type: integer
 *                 example: 250
 *     responses:
 *       201:
 *         description: Shipment created successfully
 *       400:
 *         description: Bad request (Missing required fields or product not completed)
 *       404:
 *         description: Not found
 *       500:
 *         description: Server error
 *   get:
 *     summary: Get all shipments created by the manufacturer
 *     tags: [Manufacturer - Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of shipments
 *       500:
 *         description: Server error
 */
router.post('/shipments', manufacturerController.createShipment);

/**
 * @swagger
 * /manufacturer/shipments:
 *   get:
 *     summary: Get all shipments created by the manufacturer
 *     tags: [Manufacturer - Shipments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of shipments
 *       500:
 *         description: Server error
 */
router.get('/shipments', manufacturerController.getShipments);

/**
 * @swagger
 * /manufacturer/shipments/{id}/status:
 *   put:
 *     summary: Update the status of a specific shipment
 *     tags: [Manufacturer - Shipments]
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
 *         description: Bad request (Missing or invalid status)
 *       404:
 *         description: Shipment not found
 *       500:
 *         description: Server error
 */
router.put('/shipments/:id/status', manufacturerController.updateShipmentStatus);

// ─── Payments ─────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/payments:
 *   get:
 *     summary: Get a list of payments
 *     tags: [Manufacturer - Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of payments
 *       500:
 *         description: Server error
 */
router.get('/payments', manufacturerController.getPayments);

// ─── Utility ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /manufacturer/production-stages:
 *   get:
 *     summary: Get a list of valid production stages
 *     tags: [Manufacturer - Utility]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of valid production stages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stages:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: ["planning", "assembly", "testing", "completed"]
 */
router.get('/production-stages', manufacturerController.getProductionStages);

export default router;