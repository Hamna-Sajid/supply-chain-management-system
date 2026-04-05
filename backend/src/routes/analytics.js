import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All analytics routes require auth — each returns data scoped to the logged-in user's role
router.use(authenticateToken);

router.get('/dashboard', analyticsController.getDashboard);     // combined KPI summary
router.get('/financial', analyticsController.getFinancialReport); // revenue, expenses, profit, trends
router.get('/inventory', analyticsController.getInventoryReport); // stock levels, low stock, by category
router.get('/orders', analyticsController.getOrderReport);     // order status, completion rate, trend
router.get('/shipments', analyticsController.getShipmentReport);  // shipment tracking, on-time rate
router.get('/performance', analyticsController.getPerformanceReport); // ratings, fulfillment rate
router.get('/audit', analyticsController.getAuditLog);        // audit trail

export default router;