import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

/**
 * @swagger
 * tags:
 *   - name: Analytics
 *     description: Data analytics and reporting endpoints scoped to the user's role
 */

const router = Router();

// All analytics routes require auth — each returns data scoped to the logged-in user's role
router.use(authenticateToken);

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Get combined KPI summary dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized (Token missing or invalid)
 *       500:
 *         description: Server error
 */
router.get('/dashboard',       analyticsController.getDashboard);

/**
 * @swagger
 * /analytics/financial:
 *   get:
 *     summary: Get financial report including revenue, expenses, profit, and trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Financial report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/financial',       analyticsController.getFinancialReport);

/**
 * @swagger
 * /analytics/inventory:
 *   get:
 *     summary: Get inventory report including stock levels, low stock, and categorization
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/inventory',       analyticsController.getInventoryReport);

/**
 * @swagger
 * /analytics/orders:
 *   get:
 *     summary: Get order report including status, completion rate, and trends
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Order report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/orders',          analyticsController.getOrderReport);

/**
 * @swagger
 * /analytics/shipments:
 *   get:
 *     summary: Get shipment report including tracking and on-time rates
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Shipment report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/shipments',       analyticsController.getShipmentReport);

/**
 * @swagger
 * /analytics/performance:
 *   get:
 *     summary: Get performance report including user ratings and fulfillment rates
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance report retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/performance',     analyticsController.getPerformanceReport);

/**
 * @swagger
 * /analytics/audit:
 *   get:
 *     summary: Get the system audit trail logs for the logged-in user
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/audit',           analyticsController.getAuditLog);

export default router;