import { Router } from 'express';
import * as manufacturerController from '../controllers/manufacturer.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.middleware.js';

const router = Router();

// Apply auth + role check to all manufacturer routes
router.use(authenticateToken, authorizeRole('manufacturer'));

// ─── Dashboard ────────────────────────────────────────────────────────────────
router.get('/dashboard',                        manufacturerController.getDashboard);

// ─── Raw Materials (supplier catalog) ────────────────────────────────────────
router.get('/raw-materials',                    manufacturerController.getRawMaterials);

// ─── Orders (placed with suppliers) ──────────────────────────────────────────
router.post('/orders',                          manufacturerController.placeOrder);
router.get('/orders',                           manufacturerController.getOrders);

// ─── Products & Production Pipeline ──────────────────────────────────────────
router.get('/products',                         manufacturerController.getProducts);
router.post('/products',                        manufacturerController.createProduct);
router.put('/products/:id/stage',               manufacturerController.updateProductStage);
router.put('/products/:id/quantity',            manufacturerController.updateProductQuantity);
router.delete('/products/:id',                  manufacturerController.deleteProduct);

// ─── Finished Goods Inventory ─────────────────────────────────────────────────
router.get('/inventory',                        manufacturerController.getInventory);
router.put('/inventory/:id',                    manufacturerController.updateInventoryPrices);

// ─── Warehouses ───────────────────────────────────────────────────────────────
router.get('/warehouses',                       manufacturerController.getWarehouses);

// ─── Shipments ────────────────────────────────────────────────────────────────
router.post('/shipments',                       manufacturerController.createShipment);
router.get('/shipments',                        manufacturerController.getShipments);
router.put('/shipments/:id/status',             manufacturerController.updateShipmentStatus);

// ─── Payments ─────────────────────────────────────────────────────────────────
router.get('/payments',                         manufacturerController.getPayments);

// ─── Utility ──────────────────────────────────────────────────────────────────
router.get('/production-stages',               manufacturerController.getProductionStages);

export default router;