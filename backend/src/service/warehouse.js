import prisma from '../config/db.js';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (warehouseId) => {
  const [incomingShipments, inventoryItems, ordersFulfilled, allInventory] = await Promise.all([
    prisma.shipment.count({
      where: { whm_id: warehouseId, status: { not: 'delivered' } }
    }),
    prisma.inventory.count({
      where: { warehouse_id: warehouseId }
    }),
    prisma.order.count({
      where: { delivered_by_id: warehouseId, order_status: 'delivered' }
    }),
    prisma.inventory.findMany({
      where: { warehouse_id: warehouseId },
      select: { quantity_available: true, reorder_level: true }
    })
  ]);

  const lowStockAlerts = allInventory.filter(
    i => i.quantity_available < (i.reorder_level ?? 0)
  ).length;

  return { incoming_shipments: incomingShipments, inventory_items: inventoryItems, orders_fulfilled: ordersFulfilled, low_stock_alerts: lowStockAlerts };
};

// ─── Shipments ────────────────────────────────────────────────────────────────

export const getShipments = async (warehouseId) => {
  const shipments = await prisma.shipment.findMany({
    where: { whm_id: warehouseId },
    orderBy: { expected_delivery_date: 'asc' }
  });

  const manufacturerIds = [...new Set(shipments.map(s => s.manufacturer_id).filter(Boolean))];

  const [manufacturers, ratings] = await Promise.all([
    prisma.user.findMany({
      where: { user_id: { in: manufacturerIds } },
      select: { user_id: true, name: true }
    }),
    prisma.rating.findMany({
      where: { given_to_id: { in: manufacturerIds } },
      select: { given_to_id: true, rating_value: true }
    })
  ]);

  const manufacturerMap = Object.fromEntries(manufacturers.map(m => [m.user_id, m.name]));

  const ratingMap = {};
  ratings.forEach(r => {
    if (!ratingMap[r.given_to_id]) ratingMap[r.given_to_id] = { sum: 0, count: 0 };
    ratingMap[r.given_to_id].sum   += r.rating_value;
    ratingMap[r.given_to_id].count += 1;
  });

  return shipments.map(s => {
    const rInfo = ratingMap[s.manufacturer_id] || { sum: 0, count: 0 };
    return {
      shipment_id:            s.shipment_id,
      manufacturer_id:        s.manufacturer_id,
      manufacturer_name:      manufacturerMap[s.manufacturer_id] || 'Unknown',
      manufacturer_rating:    rInfo.count > 0 ? (rInfo.sum / rInfo.count).toFixed(1) : '0.0',
      status:                 s.status,
      expected_delivery_date: s.expected_delivery_date,
      actual_date_delivered:  s.actual_date_delivered,
      shipping_address:       s.shipping_address,
      created_at:             s.created_at
    };
  });
};

export const acceptShipment = async (shipmentId, warehouseId) => {
  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, whm_id: warehouseId }
  });
  if (!shipment) throw new Error('Shipment not found');

  await prisma.shipment.update({
    where: { shipment_id: shipmentId },
    data: { status: 'accepted' }
  });

  if (shipment.manufacturer_id) {
    await _notify(shipment.manufacturer_id, 'Shipment Accepted', `Shipment #${shipmentId} has been accepted by the warehouse.`);
  }

  return { message: 'Shipment accepted' };
};

export const rejectShipment = async (shipmentId, warehouseId) => {
  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, whm_id: warehouseId }
  });
  if (!shipment) throw new Error('Shipment not found');

  await prisma.shipment.update({
    where: { shipment_id: shipmentId },
    data: { status: 'rejected' }
  });

  if (shipment.manufacturer_id) {
    await _notify(shipment.manufacturer_id, 'Shipment Rejected', `Shipment #${shipmentId} has been rejected by the warehouse.`);
  }

  return { message: 'Shipment rejected' };
};

export const updateShipmentStatus = async (shipmentId, warehouseId, status) => {
  const validStatuses = ['preparing', 'in_transit', 'delivered', 'delayed', 'returned'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, whm_id: warehouseId }
  });
  if (!shipment) throw new Error('Shipment not found');

  const updated = await prisma.shipment.update({
    where: { shipment_id: shipmentId },
    data: {
      status,
      ...(status === 'delivered' && { actual_date_delivered: new Date() })
    }
  });

  return { message: `Shipment status updated to ${status}`, shipment: updated };
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getInventory = async (warehouseId) => {
  const items = await prisma.inventory.findMany({
    where: { warehouse_id: warehouseId },
    include: { product: { select: { product_name: true, category: true } } },
    orderBy: { quantity_available: 'asc' }
  });

  return items.map(i => ({
    inventory_id:       i.inventory_id,
    product_id:         i.product_id,
    product_name:       i.product.product_name,
    category:           i.product.category || '',
    quantity_available: i.quantity_available,
    reorder_level:      i.reorder_level ?? 0,
    cost_price:         Number(i.cost_price),
    selling_price:      Number(i.selling_price),
    last_restocked:     i.last_restocked
  }));
};

export const getLowStock = async (warehouseId) => {
  const items = await prisma.inventory.findMany({
    where: { warehouse_id: warehouseId },
    include: { product: { select: { product_name: true, category: true } } }
  });

  return items
    .filter(i => i.quantity_available < (i.reorder_level ?? 0))
    .map(i => ({
      inventory_id:       i.inventory_id,
      product_id:         i.product_id,
      product_name:       i.product.product_name,
      category:           i.product.category || '',
      quantity_available: i.quantity_available,
      reorder_level:      i.reorder_level ?? 0
    }));
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const getOrders = async (warehouseId) => {
  const orders = await prisma.order.findMany({
    where: { delivered_by_id: warehouseId },
    include: { ordered_by: { select: { name: true } } },
    orderBy: { order_date: 'desc' }
  });

  return orders.map(o => ({
    order_id:      o.order_id,
    retailer_name: o.ordered_by?.name || 'Unknown',
    order_date:    o.order_date,
    total_amount:  Number(o.total_amount),
    order_status:  o.order_status
  }));
};

export const updateOrderStatus = async (orderId, warehouseId, status) => {
  const order = await prisma.order.findFirst({
    where: { order_id: orderId, delivered_by_id: warehouseId }
  });
  if (!order) throw new Error('Order not found or does not belong to this warehouse');

  const updated = await prisma.order.update({
    where: { order_id: orderId },
    data: {
      order_status: status.toLowerCase(),
      ...(status.toLowerCase() === 'delivered' && { actual_date_delivered: new Date() })
    }
  });

  if (order.ordered_by_id) {
    await _notify(order.ordered_by_id, 'Order Update', `Your order #${orderId} status has been updated to: ${status}`);
  }

  return { message: `Order status updated to ${status}`, order: updated };
};

// ─── Internal helper ──────────────────────────────────────────────────────────

const _notify = async (userId, type, description) => {
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO notifications (user_id, type, description, is_read, created_at) VALUES ($1, $2, $3, false, NOW())`,
      userId, type, description
    );
  } catch (err) {
    console.warn('Notification skipped:', err.message);
  }
};