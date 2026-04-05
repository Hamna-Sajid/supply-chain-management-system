import { Router } from 'express';
import * as supplierController from '../controllers/supplier.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth + role check to all supplier routes
router.use(authenticateToken, authorizeRole('supplier'));

// ─── Materials ────────────────────────────────────────────────────────────────
router.get('/materials',           supplierController.getMaterials);
router.post('/materials',          supplierController.addMaterial);

// ─── Orders ───────────────────────────────────────────────────────────────────
router.get('/orders',              supplierController.getOrders);
router.patch('/orders/:id/status',  supplierController.patchStatus);

export default router;