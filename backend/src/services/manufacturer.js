import prisma from '../config/db.js';
import { createNotification } from './notifications.js';

// Production stages in order
export const PRODUCTION_STAGES = [
  'design',
  'cutting',
  'sewing',
  'quality',
  'packaging',
  'completed'
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (manufacturerId) => {
  const [productsInProduction, inventoryData, totalOrders, totalShipments] = await Promise.all([
    prisma.product.count({
      where: {
        manufacturer_id: manufacturerId,
        production_stage: { not: 'completed' }
      }
    }),
    prisma.inventory.findMany({
      where: { user_id: manufacturerId },
      select: { quantity_available: true }
    }),
    prisma.order.count({
      where: { ordered_by_id: manufacturerId }
    }),
    prisma.shipment.count({
      where: { manufacturer_id: manufacturerId }
    })
  ]);

  const finishedGoodsStock = inventoryData.reduce(
    (sum, i) => sum + (i.quantity_available || 0), 0
  );

  return {
    products_in_production: productsInProduction,
    finished_goods_stock:   finishedGoodsStock,
    total_orders:           totalOrders,
    total_shipments:        totalShipments
  };
};

// ─── Raw Materials ────────────────────────────────────────────────────────────

export const getRawMaterials = async () => {
  const materials = await prisma.rawMaterial.findMany({
    include: {
      supplier: {
        select: { user_id: true, name: true }
      }
    }
  });

  const supplierIds = [...new Set(materials.map(m => m.supplier_id).filter(Boolean))];

  const ratings = supplierIds.length > 0
    ? await prisma.rating.findMany({
        where: { given_to_id: { in: supplierIds } },
        select: { given_to_id: true, rating_value: true }
      })
    : [];

  const ratingMap = {};
  ratings.forEach(r => {
    if (!ratingMap[r.given_to_id]) ratingMap[r.given_to_id] = { sum: 0, count: 0 };
    ratingMap[r.given_to_id].sum   += r.rating_value;
    ratingMap[r.given_to_id].count += 1;
  });

  return materials.map(m => {
    const rInfo = ratingMap[m.supplier_id] || { sum: 0, count: 0 };
    return {
      material_id:        m.material_id,
      material_name:      m.material_name,
      description:        m.description,
      quantity_available: m.quantity_available,
      unit_price:         Number(m.unit_price),
      supplier_id:        m.supplier_id,
      supplier_name:      m.supplier?.name || 'Unknown',
      avg_rating:         rInfo.count > 0 ? (rInfo.sum / rInfo.count).toFixed(1) : '0.0',
      rating_count:       rInfo.count
    };
  });
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const placeOrder = async (manufacturerId, { supplier_id, items, shipping_address }) => {
  if (!supplier_id || !items || items.length === 0) {
    throw new Error('supplier_id and items are required');
  }

  const total_amount = items.reduce(
    (sum, item) => sum + (parseFloat(item.unit_price || 0) * parseInt(item.quantity || 0)), 0
  );

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        ordered_by_id:   manufacturerId,
        delivered_by_id: supplier_id,
        order_status:    'pending',
        total_amount,
        shipping_address: shipping_address || null
      }
    });

    await tx.orderItem.createMany({
      data: items.map(item => ({
        order_id:   newOrder.order_id,
        product_id: item.material_id,
        quantity:   parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price)
      }))
    });

    return newOrder;
  });

  await createNotification(
    supplier_id,
    'New Order',
    `New order #${order.order_id} received from manufacturer. Total: $${total_amount.toFixed(2)}`
  );

  return {
    order_id:     order.order_id,
    total_amount: Number(order.total_amount),
    message:      'Order placed successfully'
  };
};

export const getOrders = async (manufacturerId) => {
  const orders = await prisma.order.findMany({
    where: { ordered_by_id: manufacturerId },
    include: {
      delivered_by: { select: { name: true } },
      items: {
        include: {
          product: { select: { product_name: true } }
        }
      }
    },
    orderBy: { order_date: 'desc' }
  });

  return orders.map(o => ({
    order_id:      o.order_id,
    order_date:    o.order_date,
    order_status:  o.order_status,
    total_amount:  Number(o.total_amount),
    supplier_name: o.delivered_by?.name || 'Unknown',
    items: o.items.map(i => ({
      order_item_id: i.order_item_id,
      product_id:    i.product_id,
      product_name:  i.product?.product_name || 'Unknown',
      quantity:      i.quantity,
      unit_price:    Number(i.unit_price)
    }))
  }));
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (manufacturerId) => {
  const products = await prisma.product.findMany({
    where: { manufacturer_id: manufacturerId },
    orderBy: { product_id: 'desc' }
  });

  return products.map(p => ({
    product_id:       p.product_id,
    product_name:     p.product_name,
    category:         p.category,
    size:             p.size,
    color:            p.color,
    cost_price:       Number(p.cost_price),
    selling_price:    Number(p.selling_price),
    production_stage: p.production_stage
  }));
};

export const createProduct = async (manufacturerId, { product_name, category, size, color, cost_price, selling_price, production_stage }) => {
  if (!product_name) throw new Error('product_name is required');

  const stage = production_stage || 'design';
  if (!PRODUCTION_STAGES.includes(stage)) {
    throw new Error(`Invalid production stage. Must be one of: ${PRODUCTION_STAGES.join(', ')}`);
  }

  const product = await prisma.product.create({
    data: {
      product_name,
      category:         category || null,
      size:             size || null,
      color:            color || null,
      cost_price:       parseFloat(cost_price || 0),
      selling_price:    parseFloat(selling_price || 0),
      production_stage: stage,
      manufacturer_id:  manufacturerId
    }
  });

  return {
    product_id:       product.product_id,
    product_name:     product.product_name,
    production_stage: product.production_stage,
    cost_price:       Number(product.cost_price),
    selling_price:    Number(product.selling_price)
  };
};

export const updateProductStage = async (productId, manufacturerId, production_stage) => {
  if (!production_stage) throw new Error('production_stage is required');

  if (!PRODUCTION_STAGES.includes(production_stage)) {
    throw new Error(`Invalid stage. Must be one of: ${PRODUCTION_STAGES.join(', ')}`);
  }

  const product = await prisma.product.findFirst({
    where: { product_id: productId, manufacturer_id: manufacturerId }
  });

  if (!product) throw new Error('Product not found');

  const currentIndex = PRODUCTION_STAGES.indexOf(product.production_stage);
  const newIndex     = PRODUCTION_STAGES.indexOf(production_stage);

  if (newIndex < currentIndex) {
    throw new Error(
      `Cannot move stage backwards. Current: ${product.production_stage}, Requested: ${production_stage}`
    );
  }

  const updated = await prisma.product.update({
    where: { product_id: productId },
    data: {
      production_stage,
      ...(production_stage === 'completed' && { updated_at: new Date() })
    }
  });

  return {
    product_id:       updated.product_id,
    product_name:     updated.product_name,
    production_stage: updated.production_stage,
    message:          `Stage updated to ${production_stage}`
  };
};

export const updateProductQuantity = async (productId, manufacturerId, quantity) => {
  if (quantity === undefined || quantity === null || quantity < 0) {
    throw new Error('Valid quantity is required');
  }

  const product = await prisma.product.findFirst({
    where: { product_id: productId, manufacturer_id: manufacturerId }
  });

  if (!product) throw new Error('Product not found');

  if (product.production_stage !== 'completed') {
    throw new Error('Quantity can only be added when production stage is completed');
  }

  const existing = await prisma.inventory.findFirst({
    where: { product_id: productId, user_id: manufacturerId }
  });

  let inventory;

  if (existing) {
    inventory = await prisma.inventory.update({
      where: { inventory_id: existing.inventory_id },
      data: {
        quantity_available: existing.quantity_available + parseInt(quantity),
        last_restocked:     new Date()
      }
    });
  } else {
    inventory = await prisma.inventory.create({
      data: {
        product_id:         productId,
        user_id:            manufacturerId,
        quantity_available: parseInt(quantity),
        cost_price:         product.cost_price || 0,
        selling_price:      product.selling_price || 0,
        reorder_level:      10,
        last_restocked:     new Date()
      }
    });
  }

  return {
    inventory_id:       inventory.inventory_id,
    quantity_available: inventory.quantity_available,
    message:            'Quantity added to inventory successfully'
  };
};

export const deleteProduct = async (productId, manufacturerId) => {
  const product = await prisma.product.findFirst({
    where: { product_id: productId, manufacturer_id: manufacturerId }
  });

  if (!product) throw new Error('Product not found');

  await prisma.product.delete({ where: { product_id: productId } });

  return { message: 'Product deleted successfully' };
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getInventory = async (manufacturerId) => {
  const items = await prisma.inventory.findMany({
    where: { user_id: manufacturerId },
    include: {
      product: { select: { product_name: true, category: true, production_stage: true } }
    }
  });

  return items.map(i => ({
    inventory_id:       i.inventory_id,
    product_id:         i.product_id,
    product_name:       i.product?.product_name || 'Unknown',
    category:           i.product?.category || '',
    production_stage:   i.product?.production_stage || '',
    quantity_available: i.quantity_available,
    cost_price:         Number(i.cost_price),
    selling_price:      Number(i.selling_price),
    reorder_level:      i.reorder_level ?? 0,
    last_restocked:     i.last_restocked
  }));
};

export const updateInventoryPrices = async (inventoryId, manufacturerId, { cost_price, selling_price }) => {
  if (cost_price === undefined && selling_price === undefined) {
    throw new Error('cost_price or selling_price is required');
  }

  const item = await prisma.inventory.findFirst({
    where: { inventory_id: inventoryId, user_id: manufacturerId }
  });

  if (!item) throw new Error('Inventory item not found');

  const updateData = {};
  if (cost_price    !== undefined) updateData.cost_price    = parseFloat(cost_price);
  if (selling_price !== undefined) updateData.selling_price = parseFloat(selling_price);

  const updated = await prisma.inventory.update({
    where: { inventory_id: inventoryId },
    data: updateData
  });

  return {
    inventory_id:  updated.inventory_id,
    cost_price:    Number(updated.cost_price),
    selling_price: Number(updated.selling_price),
    message:       'Inventory updated successfully'
  };
};

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouses = async () => {
  const warehouses = await prisma.user.findMany({
    where: { role: 'warehouse_manager' },
    select: {
      user_id:        true,
      name:           true,
      address:        true,
      contact_number: true
    },
    orderBy: { name: 'asc' }
  });

  const warehouseIds = warehouses.map(w => w.user_id);

  const ratings = warehouseIds.length > 0
    ? await prisma.rating.findMany({
        where: { given_to_id: { in: warehouseIds } },
        select: { given_to_id: true, rating_value: true }
      })
    : [];

  const ratingMap = {};
  ratings.forEach(r => {
    if (!ratingMap[r.given_to_id]) ratingMap[r.given_to_id] = { sum: 0, count: 0 };
    ratingMap[r.given_to_id].sum   += r.rating_value;
    ratingMap[r.given_to_id].count += 1;
  });

  return warehouses.map(w => {
    const rInfo = ratingMap[w.user_id] || { sum: 0, count: 0 };
    return {
      user_id:        w.user_id,
      name:           w.name,
      address:        w.address || '',
      contact_number: w.contact_number || '',
      avg_rating:     rInfo.count > 0 ? (rInfo.sum / rInfo.count).toFixed(1) : '0.0',
      rating_count:   rInfo.count
    };
  });
};

// ─── Shipments ────────────────────────────────────────────────────────────────

export const createShipment = async (manufacturerId, { warehouse_id, product_id, quantity, shipping_address, expected_delivery_date }) => {
  if (!warehouse_id || !product_id || !quantity || !shipping_address || !expected_delivery_date) {
    throw new Error('warehouse_id, product_id, quantity, shipping_address and expected_delivery_date are all required');
  }

  const product = await prisma.product.findFirst({
    where: { product_id, manufacturer_id: manufacturerId }
  });

  if (!product) throw new Error('Product not found');

  if (product.production_stage !== 'completed') {
    throw new Error('Only completed products can be shipped');
  }

  const shipment = await prisma.shipment.create({
    data: {
      manufacturer_id:        manufacturerId,
      whm_id:                 warehouse_id,
      product_id,
      quantity:               parseInt(quantity),
      shipping_address,
      expected_delivery_date: new Date(expected_delivery_date),
      status:                 'preparing'
    }
  });

  await createNotification(
    warehouse_id,
    'New Shipment',
    `New shipment #${shipment.shipment_id} incoming from manufacturer. Expected: ${expected_delivery_date}`
  );

  return {
    shipment_id:            shipment.shipment_id,
    status:                 shipment.status,
    expected_delivery_date: shipment.expected_delivery_date,
    message:                'Shipment created successfully'
  };
};

export const getShipments = async (manufacturerId) => {
  const shipments = await prisma.shipment.findMany({
    where: { manufacturer_id: manufacturerId },
    orderBy: { created_at: 'desc' }
  });

  const warehouseIds = [...new Set(shipments.map(s => s.whm_id).filter(Boolean))];
  const productIds   = [...new Set(shipments.map(s => s.product_id).filter(Boolean))];

  const [warehouses, products] = await Promise.all([
    warehouseIds.length > 0
      ? prisma.user.findMany({
          where: { user_id: { in: warehouseIds } },
          select: { user_id: true, name: true }
        })
      : [],
    productIds.length > 0
      ? prisma.product.findMany({
          where: { product_id: { in: productIds } },
          select: { product_id: true, product_name: true }
        })
      : []
  ]);

  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.user_id, w.name]));
  const productMap   = Object.fromEntries(products.map(p => [p.product_id, p.product_name]));

  return shipments.map(s => ({
    shipment_id:            s.shipment_id,
    warehouse_id:           s.whm_id,
    warehouse_name:         warehouseMap[s.whm_id] || 'Unknown',
    product_id:             s.product_id,
    product_name:           productMap[s.product_id] || 'Unknown',
    quantity:               s.quantity,
    status:                 s.status,
    shipping_address:       s.shipping_address,
    expected_delivery_date: s.expected_delivery_date,
    actual_date_delivered:  s.actual_date_delivered,
    created_at:             s.created_at
  }));
};

export const updateShipmentStatus = async (shipmentId, manufacturerId, status) => {
  const validStatuses = ['preparing', 'in_transit', 'delivered'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Allowed: ${validStatuses.join(', ')}`);
  }

  const shipment = await prisma.shipment.findFirst({
    where: { shipment_id: shipmentId, manufacturer_id: manufacturerId }
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

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getPayments = async (manufacturerId) => {
  const orders = await prisma.order.findMany({
    where: { ordered_by_id: manufacturerId },
    include: { delivered_by: { select: { name: true } } },
    orderBy: { order_date: 'desc' }
  });

  const orderIds = orders.map(o => o.order_id);

  const payments = orderIds.length > 0
    ? await prisma.payment.findMany({
        where: { user_id: manufacturerId, order_id: { in: orderIds } }
      })
    : [];

  const paymentMap = Object.fromEntries(payments.map(p => [p.order_id, p]));

  return orders.map(o => {
    const payment = paymentMap[o.order_id];
    return {
      order_id:      o.order_id,
      supplier_name: o.delivered_by?.name || 'Unknown',
      order_date:    o.order_date,
      order_status:  o.order_status,
      total_amount:  Number(o.total_amount),
      payment: {
        payment_id:     payment?.payment_id || null,
        payment_date:   payment?.payment_date || null,
        payment_status: payment?.status || 'pending',
        payment_amount: payment ? Number(payment.amount) : Number(o.total_amount)
      }
    };
  });
};