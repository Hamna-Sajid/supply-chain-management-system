import * as notificationService from './notifications.js';
import prisma from '../config/db.js';
import { randomUUID } from 'crypto';

export const getSupplierMaterials = (supplierId) =>
  prisma.rawMaterial.findMany({
    where: { supplier_id: supplierId },
    orderBy: { material_name: 'asc' }
  });

export const createMaterial = (supplierId, data) => {
  if (!data.material_name || !data.quantity_available || !data.unit_price) {
    throw new Error('name, quantity_available, and unit_price are required');
  }

  return prisma.rawMaterial.create({
    data: {
      ...data,
      material_id: randomUUID(),
      supplier_id: supplierId,
      quantity_available: parseInt(data.quantity_available),
      unit_price: parseFloat(data.unit_price)
    }
  });
};

export const updateMaterial = async (supplierId, materialId, data) => {
  const existing = await prisma.rawMaterial.findFirst({
    where: {
      material_id: materialId,
      supplier_id: supplierId
    }
  });

  if (!existing) {
    throw new Error('Material not found');
  }

  const updateData = {};
  if (typeof data.material_name === 'string') updateData.material_name = data.material_name;
  if (typeof data.description === 'string') updateData.description = data.description;
  if (data.quantity_available !== undefined) updateData.quantity_available = parseInt(data.quantity_available);
  if (data.unit_price !== undefined) updateData.unit_price = parseFloat(data.unit_price);

  if (Object.keys(updateData).length === 0) {
    throw new Error('At least one field is required for update');
  }

  return prisma.rawMaterial.update({
    where: { material_id: materialId },
    data: updateData
  });
};

export const deleteMaterial = async (supplierId, materialId) => {
  const existing = await prisma.rawMaterial.findFirst({
    where: {
      material_id: materialId,
      supplier_id: supplierId
    }
  });

  if (!existing) {
    throw new Error('Material not found');
  }

  await prisma.rawMaterial.delete({ where: { material_id: materialId } });
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

export const getSupplierExpenses = (supplierId) =>
  prisma.expense.findMany({
    where: { user_id: supplierId },
    orderBy: { expense_update_date: 'desc' }
  });

export const createExpense = (supplierId, data) => {
  if (!data.amount || !data.category) {
    throw new Error('amount and category are required');
  }

  const amount = parseFloat(data.amount);
  if (Number.isNaN(amount) || amount <= 0) {
    throw new Error('amount must be a positive number');
  }

  return prisma.expense.create({
    data: {
      expense_id: randomUUID(),
      user_id: supplierId,
      order_id: null,
      amount,
      category: data.description
        ? `${data.category} - ${data.description}`.slice(0, 255)
        : data.category
    }
  });
};