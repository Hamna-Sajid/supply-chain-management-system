import prisma from '../config/db.js';
import { createNotification } from './notifications.js';

// ─── Dashboard (UNCHANGED) ────────────────────────────────────────────────────

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

  return {
    incoming_shipments: incomingShipments,
    inventory_items:    inventoryItems,
    orders_fulfilled:   ordersFulfilled,
    low_stock_alerts:   lowStockAlerts
  };
};

// ─── Shipments ────────────────────────────────────────────────────────────────

// FIXED: now also fetches product_name and quantity from shipment
export const getShipments = async (warehouseId) => {
  const shipments = await prisma.shipment.findMany({
    where: { whm_id: warehouseId },
    orderBy: { expected_delivery_date: 'asc' }
  });

  const manufacturerIds = [...new Set(shipments.map(s => s.manufacturer_id).filter(Boolean))];
  const productIds      = [...new Set(shipments.map(s => s.product_id).filter(Boolean))];

  const [manufacturers, ratings, products] = await Promise.all([
    manufacturerIds.length > 0
      ? prisma.user.findMany({
          where: { user_id: { in: manufacturerIds } },
          select: { user_id: true, name: true }
        })
      : [],
    manufacturerIds.length > 0
      ? prisma.rating.findMany({
          where: { given_to_id: { in: manufacturerIds } },
          select: { given_to_id: true, rating_value: true }
        })
      : [],
    // NEW: fetch product names
    productIds.length > 0
      ? prisma.product.findMany({
          where: { product_id: { in: productIds } },
          select: { product_id: true, product_name: true }
        })
      : []
  ]);

  const manufacturerMap = Object.fromEntries(manufacturers.map(m => [m.user_id, m.name]));
  const productMap      = Object.fromEntries(products.map(p => [p.product_id, p.product_name]));

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
      // NEW fields
      product_id:             s.product_id,
      product_name:           productMap[s.product_id] || 'Unknown',
      quantity:               s.quantity,
      // existing fields
      status:                 s.status,
      expected_delivery_date: s.expected_delivery_date,
      actual_date_delivered:  s.actual_date_delivered,
      shipping_address:       s.shipping_address,
      created_at:             s.created_at
    };
  });
};

// FIXED: now upserts inventory after accepting + accepts optional damage_notes on reject
export const acceptShipment = async (shipmentId, warehouseId) => {
  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, whm_id: warehouseId }
  });
  if (!shipment) throw new Error('Shipment not found');

  await prisma.shipment.update({
    where: { shipment_id: shipmentId },
    data: { status: 'accepted' }
  });

  // NEW: upsert inventory with received quantity
  if (shipment.product_id && shipment.quantity) {
    const existing = await prisma.inventory.findFirst({
      where: { product_id: shipment.product_id, warehouse_id: warehouseId }
    });

    if (existing) {
      await prisma.inventory.update({
        where: { inventory_id: existing.inventory_id },
        data: {
          quantity_available: existing.quantity_available + shipment.quantity,
          last_restocked:     new Date()
        }
      });
    } else {
      await prisma.inventory.create({
        data: {
          product_id:         shipment.product_id,
          user_id:            warehouseId,
          warehouse_id:       warehouseId,
          quantity_available: shipment.quantity,
          cost_price:         0,
          selling_price:      0,
          reorder_level:      10,
          last_restocked:     new Date()
        }
      });
    }
  }

  if (shipment.manufacturer_id) {
    await _notify(
      shipment.manufacturer_id,
      'Shipment Accepted',
      `Shipment #${shipmentId} has been accepted by the warehouse.`
    );
  }

  return { message: 'Shipment accepted and inventory updated' };
};

// FIXED: now accepts optional damage_notes
export const rejectShipment = async (shipmentId, warehouseId, damage_notes = null) => {
  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, whm_id: warehouseId }
  });
  if (!shipment) throw new Error('Shipment not found');

  await prisma.shipment.update({
    where: { shipment_id: shipmentId },
    data: { status: 'rejected' }
  });

  if (shipment.manufacturer_id) {
    const note = damage_notes ? ` Reason: ${damage_notes}` : '';
    await _notify(
      shipment.manufacturer_id,
      'Shipment Rejected',
      `Shipment #${shipmentId} has been rejected by the warehouse.${note}`
    );
  }

  return { message: 'Shipment rejected' };
};

// updateShipmentStatus (UNCHANGED) ────────────────────────────────────────────

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

// getInventory (UNCHANGED) ────────────────────────────────────────────────────

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

// getLowStock (UNCHANGED) ─────────────────────────────────────────────────────

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

// NEW: manual inventory update (stock level + reorder level)
export const updateInventory = async (inventoryId, warehouseId, { quantity_available, reorder_level }) => {
  if (quantity_available === undefined && reorder_level === undefined) {
    throw new Error('quantity_available or reorder_level is required');
  }

  const item = await prisma.inventory.findFirst({
    where: { inventory_id: inventoryId, warehouse_id: warehouseId }
  });
  if (!item) throw new Error('Inventory item not found');

  const updateData = {};
  if (quantity_available !== undefined) updateData.quantity_available = parseInt(quantity_available);
  if (reorder_level      !== undefined) updateData.reorder_level      = parseInt(reorder_level);

  const updated = await prisma.inventory.update({
    where: { inventory_id: inventoryId },
    data: updateData
  });

  return {
    inventory_id:       updated.inventory_id,
    quantity_available: updated.quantity_available,
    reorder_level:      updated.reorder_level,
    message:            'Inventory updated successfully'
  };
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// getOrders (UNCHANGED) ───────────────────────────────────────────────────────

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

// FIXED: now deducts inventory on processing + fires restock alert if needed
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

  // NEW: deduct inventory when order moves to processing
  if (status.toLowerCase() === 'processing') {
    const orderItems = await prisma.orderItem.findMany({
      where: { order_id: orderId }
    });

    for (const item of orderItems) {
      const inv = await prisma.inventory.findFirst({
        where: { product_id: item.product_id, warehouse_id: warehouseId }
      });

      if (inv) {
        const newQty = Math.max(0, inv.quantity_available - item.quantity);

        await prisma.inventory.update({
          where: { inventory_id: inv.inventory_id },
          data: { quantity_available: newQty }
        });

        // NEW: fire restock alert if stock drops below reorder level
        if (newQty < (inv.reorder_level ?? 0)) {
          await _notify(
            warehouseId,
            'Low Stock Alert',
            `Product inventory is below reorder level after fulfilling order #${orderId}. Current stock: ${newQty}`
          );
        }
      }
    }
  }

  if (order.ordered_by_id) {
    await _notify(
      order.ordered_by_id,
      'Order Update',
      `Your order #${orderId} status has been updated to: ${status}`
    );
  }

  return { message: `Order status updated to ${status}`, order: updated };
};

// NEW: create outgoing shipment linked to an order
export const createOutgoingShipment = async (warehouseId, { order_id, product_id, quantity, shipping_address, expected_delivery_date }) => {
  if (!order_id || !product_id || !quantity || !shipping_address || !expected_delivery_date) {
    throw new Error('order_id, product_id, quantity, shipping_address and expected_delivery_date are all required');
  }

  // Verify order belongs to this warehouse
  const order = await prisma.order.findFirst({
    where: { order_id, delivered_by_id: warehouseId }
  });
  if (!order) throw new Error('Order not found or does not belong to this warehouse');

  // Verify sufficient stock
  const inv = await prisma.inventory.findFirst({
    where: { product_id, warehouse_id: warehouseId }
  });
  if (!inv || inv.quantity_available < parseInt(quantity)) {
    throw new Error('Insufficient stock to create shipment');
  }

  const shipment = await prisma.shipment.create({
    data: {
      manufacturer_id:        warehouseId, // warehouse is the sender in outgoing
      whm_id:                 order.ordered_by_id, // retailer is the receiver
      product_id,
      quantity:               parseInt(quantity),
      shipping_address,
      expected_delivery_date: new Date(expected_delivery_date),
      status:                 'preparing'
    }
  });

  // Notify retailer
  if (order.ordered_by_id) {
    await _notify(
      order.ordered_by_id,
      'Shipment Created',
      `A shipment has been created for your order #${order_id}. Expected delivery: ${expected_delivery_date}`
    );
  }

  return {
    shipment_id:            shipment.shipment_id,
    order_id,
    status:                 shipment.status,
    expected_delivery_date: shipment.expected_delivery_date,
    message:                'Outgoing shipment created successfully'
  };
};

// ─── Internal helper (UNCHANGED) ─────────────────────────────────────────────

await createNotification(userId, type, description);