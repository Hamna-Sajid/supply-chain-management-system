import { Router } from 'express';
import * as notificationController from '../controllers/notifications.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All notification routes require auth — any role can access their own notifications
router.use(authenticateToken);

router.get('/',                   notificationController.getNotifications);   // ?unread_only=true
router.put('/:id/read',           notificationController.markAsRead);
router.put('/read-all',           notificationController.markAllAsRead);
router.delete('/:id',             notificationController.deleteNotification);

export default router;