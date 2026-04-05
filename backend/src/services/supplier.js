import * as notificationService from './notifications.js';
import prisma from '../config/db.js';

export const getSupplierMaterials = (supplierId) => 
  prisma.rawMaterial.findMany({ 
    where: { supplier_id: supplierId } 
  });

export const createMaterial = (supplierId, data) => {
  if (!data.name || !data.quantity_available || !data.unit_price) {
    throw new Error('name, quantity_available, and unit_price are required');
  }

  return prisma.rawMaterial.create({
    data: { 
      ...data, 
      material_id: crypto.randomUUID(), 
      supplier_id: supplierId, 
      quantity_available: parseInt(data.quantity_available), 
      unit_price: parseFloat(data.unit_price) 
    }
  });
};

export const getSupplierOrders = (supplierId) => 
  prisma.order.findMany({
    where: { delivered_by_id: supplierId },
    include: { 
      ordered_by: { 
        select: { name: true, contact_number: true } 
      }, 
      items: { 
        include: { product: true } 
      } 
    }
  });

export const updateStatus = async (orderId, status) => {
  const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
  
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await prisma.order.findFirst({
    where: { order_id: orderId }
  });

  if (!order) {
    throw new Error('Order not found');
  }

  const updatedOrder = await prisma.order.update({
    where: { order_id: orderId }, 
    data: { order_status: status }
  });

  // NOTIFY the manufacturer who placed the order
  await notificationService.notifyOrderStatusChange(
    order.ordered_by_id,
    orderId,
    status
  );

  return updatedOrder;
};