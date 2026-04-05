import prisma from '../config/db.js';

// ─── Create notification (used internally by other services) ─────────────────

export const createNotification = async (userId, type, description) => {
  try {
    return await prisma.notification.create({
      data: { user_id: userId, type, description }
    });
  } catch (err) {
    // Never crash the caller if notification fails
    console.warn(`Notification failed for ${userId}:`, err.message);
    return null;
  }
};

// ─── Bulk create (notify multiple users at once) ──────────────────────────────

export const createNotifications = async (userIds, type, description) => {
  try {
    return await prisma.notification.createMany({
      data: userIds.map(user_id => ({ user_id, type, description }))
    });
  } catch (err) {
    console.warn('Bulk notification failed:', err.message);
    return null;
  }
};

// ─── Get notifications for a user ─────────────────────────────────────────────

export const getNotifications = async (userId, { unread_only = false } = {}) => {
  const where = {
    user_id: userId,
    ...(unread_only && { is_read: false })
  };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { created_at: 'desc' },
    take: 50  // cap at 50 most recent
  });

  const unreadCount = await prisma.notification.count({
    where: { user_id: userId, is_read: false }
  });

  return {
    notifications: notifications.map(n => ({
      notification_id: n.notification_id,
      type:            n.type,
      description:     n.description,
      is_read:         n.is_read,
      created_at:      n.created_at
    })),
    unread_count: unreadCount
  };
};

// ─── Mark single notification as read ────────────────────────────────────────

export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { notification_id: notificationId, user_id: userId }
  });

  if (!notification) throw new Error('Notification not found');

  await prisma.notification.update({
    where: { notification_id: notificationId },
    data: { is_read: true }
  });

  return { message: 'Notification marked as read' };
};

// ─── Mark all notifications as read ──────────────────────────────────────────

export const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });

  return { message: `${result.count} notifications marked as read` };
};

// ─── Delete a notification ────────────────────────────────────────────────────

export const deleteNotification = async (notificationId, userId) => {
  const notification = await prisma.notification.findFirst({
    where: { notification_id: notificationId, user_id: userId }
  });

  if (!notification) throw new Error('Notification not found');

  await prisma.notification.delete({ where: { notification_id: notificationId } });

  return { message: 'Notification deleted' };
};

// ─── Trigger helpers — called by other services ───────────────────────────────

export const notifyNewOrder = async (supplierId, orderId, totalAmount) => {
  return createNotification(
    supplierId,
    'NEW_ORDER',
    `New order #${orderId} received. Total: $${Number(totalAmount).toFixed(2)}`
  );
};

export const notifyOrderStatusChange = async (retailerId, orderId, status) => {
  return createNotification(
    retailerId,
    'ORDER_UPDATE',
    `Your order #${orderId} has been updated to: ${status}`
  );
};

export const notifyShipmentUpdate = async (userId, shipmentId, status) => {
  return createNotification(
    userId,
    'SHIPMENT_UPDATE',
    `Shipment #${shipmentId} status updated to: ${status}`
  );
};

export const notifyLowStock = async (userId, productName, currentQty, reorderLevel) => {
  return createNotification(
    userId,
    'LOW_STOCK',
    `Low stock alert: ${productName} is at ${currentQty} units (reorder level: ${reorderLevel})`
  );
};

export const notifyPaymentStatus = async (userId, orderId, status) => {
  return createNotification(
    userId,
    'PAYMENT_UPDATE',
    `Payment for order #${orderId} is now: ${status}`
  );
};