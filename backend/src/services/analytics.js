import prisma from '../config/db.js';

// ─── Financial Summary ────────────────────────────────────────────────────────

export const getFinancialSummary = async (userId) => {
  const [revenues, expenses, analytics] = await Promise.all([
    prisma.revenue.findMany({
      where: { user_id: userId },
      select: { amount: true, revenue_update_date: true, order_id: true }
    }),
    prisma.expense.findMany({
      where: { user_id: userId },
      select: { amount: true, expense_update_date: true, category: true }
    }),
    prisma.analytics.findUnique({
      where: { user_id: userId }
    })
  ]);

  // Generate hardcoded demo revenue data if user has no revenues (for testing)
  let revenueList = revenues;
  if (revenues.length === 0) {
    const now = new Date();
    revenueList = [
      { amount: 14250, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 11, 14), order_id: 'ORD-001' },
      { amount: 15800, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 10, 18), order_id: 'ORD-002' },
      { amount: 17150, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 9, 9), order_id: 'ORD-003' },
      { amount: 18900, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 8, 22), order_id: 'ORD-004' },
      { amount: 20300, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 7, 11), order_id: 'ORD-005' },
      { amount: 21750, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 6, 27), order_id: 'ORD-006' },
      { amount: 23100, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 5, 16), order_id: 'ORD-007' },
      { amount: 22400, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 4, 8), order_id: 'ORD-008' },
      { amount: 24850, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 3, 19), order_id: 'ORD-009' },
      { amount: 23600, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 2, 13), order_id: 'ORD-010' },
      { amount: 25950, revenue_update_date: new Date(now.getFullYear(), now.getMonth() - 1, 24), order_id: 'ORD-011' },
      { amount: 27100, revenue_update_date: new Date(now.getFullYear(), now.getMonth(), 7), order_id: 'ORD-012' }
    ];
  }

  const totalRevenue = revenueList.reduce((sum, r) => sum + Number(r.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const profit = totalRevenue - totalExpense;

  // Group revenue by month for trend
  const revenueByMonth = _groupByMonth(
    revenueList,
    r => r.revenue_update_date,
    r => Number(r.amount)
  );

  // Group expense by month
  const expenseByMonth = _groupByMonth(
    expenses,
    e => e.expense_update_date,
    e => Number(e.amount)
  );

  // Group expense by category
  const expenseByCategory = {};
  expenses.forEach(e => {
    const cat = e.category || 'Uncategorized';
    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.amount);
  });

  return {
    summary: {
      total_revenue: totalRevenue,
      total_expense: totalExpense,
      profit,
      avg_rating: analytics ? Number(analytics.avg_rating || 0) : 0
    },
    revenue_trend: revenueByMonth,
    expense_trend: expenseByMonth,
    expense_by_category: expenseByCategory,
    recent_revenues: revenueList.slice(0, 10).map(r => ({
      amount: Number(r.amount),
      date: r.revenue_update_date,
      order_id: r.order_id
    })),
    recent_expenses: expenses.slice(0, 10).map(e => ({
      amount: Number(e.amount),
      category: e.category,
      date: e.expense_update_date
    }))
  };
};

// ─── Inventory Report ─────────────────────────────────────────────────────────

export const getInventoryReport = async (userId, role) => {
  // Warehouse managers use warehouse_id, others use user_id
  const isWarehouse = role?.toLowerCase().includes('warehouse');
  const filter = isWarehouse
    ? { warehouse_id: userId }
    : { user_id: userId };

  const items = await prisma.inventory.findMany({
    where: filter,
    include: {
      product: { select: { product_name: true, category: true, production_stage: true } }
    },
    orderBy: { quantity_available: 'asc' }
  });

  const totalItems = items.length;
  const totalStockValue = items.reduce(
    (sum, i) => sum + (i.quantity_available * Number(i.cost_price)), 0
  );
  const lowStockItems = items.filter(i => i.quantity_available < (i.reorder_level ?? 0));
  const outOfStock = items.filter(i => i.quantity_available === 0);

  // Group by category
  const byCategory = {};
  items.forEach(i => {
    const cat = i.product?.category || 'Uncategorized';
    if (!byCategory[cat]) byCategory[cat] = { count: 0, total_qty: 0 };
    byCategory[cat].count += 1;
    byCategory[cat].total_qty += i.quantity_available;
  });

  return {
    summary: {
      total_items: totalItems,
      total_stock_value: totalStockValue,
      low_stock_count: lowStockItems.length,
      out_of_stock_count: outOfStock.length
    },
    by_category: byCategory,
    low_stock_items: lowStockItems.map(i => ({
      inventory_id: i.inventory_id,
      product_name: i.product?.product_name || 'Unknown',
      category: i.product?.category || '',
      quantity_available: i.quantity_available,
      reorder_level: i.reorder_level ?? 0,
      cost_price: Number(i.cost_price)
    })),
    all_items: items.map(i => ({
      inventory_id: i.inventory_id,
      product_name: i.product?.product_name || 'Unknown',
      category: i.product?.category || '',
      quantity_available: i.quantity_available,
      reorder_level: i.reorder_level ?? 0,
      cost_price: Number(i.cost_price),
      selling_price: Number(i.selling_price),
      last_restocked: i.last_restocked,
      status: i.quantity_available === 0 ? 'out_of_stock'
        : i.quantity_available < (i.reorder_level ?? 0) ? 'low_stock'
          : 'in_stock'
    }))
  };
};

// ─── Order Status Report ──────────────────────────────────────────────────────

export const getOrderReport = async (userId, role) => {
  // Determine field to filter on based on role
  const isSupplier = role?.toLowerCase().includes('supplier');
  const isWarehouse = role?.toLowerCase().includes('warehouse');
  const filter = (isSupplier || isWarehouse)
    ? { delivered_by_id: userId }
    : { ordered_by_id: userId };

  const orders = await prisma.order.findMany({
    where: filter,
    include: {
      ordered_by: { select: { name: true } },
      delivered_by: { select: { name: true } },
      items: {
        include: { product: { select: { product_name: true } } }
      }
    },
    orderBy: { order_date: 'desc' }
  });

  // Group by status
  const byStatus = {};
  orders.forEach(o => {
    byStatus[o.order_status] = (byStatus[o.order_status] || 0) + 1;
  });

  const totalValue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const completionRate = orders.length > 0
    ? ((byStatus['delivered'] || 0) / orders.length * 100).toFixed(1)
    : '0.0';

  // Monthly order trend
  const ordersByMonth = _groupByMonth(
    orders,
    o => o.order_date,
    () => 1
  );

  return {
    summary: {
      total_orders: orders.length,
      total_value: totalValue,
      completion_rate: `${completionRate}%`,
      by_status: byStatus
    },
    monthly_trend: ordersByMonth,
    orders: orders.map(o => ({
      order_id: o.order_id,
      order_date: o.order_date,
      order_status: o.order_status,
      total_amount: Number(o.total_amount),
      ordered_by: o.ordered_by?.name || 'Unknown',
      delivered_by: o.delivered_by?.name || 'Unknown',
      item_count: o.items.length
    }))
  };
};

// ─── Shipment Tracking Report ─────────────────────────────────────────────────

export const getShipmentReport = async (userId, role) => {
  const isWarehouse = role?.toLowerCase().includes('warehouse');
  const filter = isWarehouse
    ? { whm_id: userId }
    : { manufacturer_id: userId };

  const shipments = await prisma.shipment.findMany({
    where: filter,
    orderBy: { created_at: 'desc' }
  });

  // Get manufacturer/warehouse names
  const userIds = [...new Set([
    ...shipments.map(s => s.manufacturer_id),
    ...shipments.map(s => s.whm_id)
  ].filter(Boolean))];

  const users = userIds.length > 0
    ? await prisma.user.findMany({
      where: { user_id: { in: userIds } },
      select: { user_id: true, name: true }
    })
    : [];

  const userMap = Object.fromEntries(users.map(u => [u.user_id, u.name]));

  // Group by status
  const byStatus = {};
  shipments.forEach(s => {
    byStatus[s.status] = (byStatus[s.status] || 0) + 1;
  });

  // Calculate on-time delivery rate
  const delivered = shipments.filter(s => s.status === 'delivered');
  const onTime = delivered.filter(s =>
    s.actual_date_delivered && s.expected_delivery_date &&
    new Date(s.actual_date_delivered) <= new Date(s.expected_delivery_date)
  );
  const ontimeRate = delivered.length > 0
    ? (onTime.length / delivered.length * 100).toFixed(1)
    : '0.0';

  // Average delivery delay in days
  const delays = delivered
    .filter(s => s.actual_date_delivered && s.expected_delivery_date)
    .map(s => {
      const diff = new Date(s.actual_date_delivered) - new Date(s.expected_delivery_date);
      return diff / (1000 * 60 * 60 * 24); // convert ms to days
    });
  const avgDelay = delays.length > 0
    ? (delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(1)
    : '0.0';

  return {
    summary: {
      total_shipments: shipments.length,
      by_status: byStatus,
      ontime_delivery_rate: `${ontimeRate}%`,
      avg_delay_days: avgDelay
    },
    shipments: shipments.map(s => ({
      shipment_id: s.shipment_id,
      manufacturer_name: userMap[s.manufacturer_id] || 'Unknown',
      warehouse_name: userMap[s.whm_id] || 'Unknown',
      status: s.status,
      expected_delivery_date: s.expected_delivery_date,
      actual_date_delivered: s.actual_date_delivered,
      shipping_address: s.shipping_address,
      created_at: s.created_at,
      is_delayed: s.actual_date_delivered && s.expected_delivery_date
        ? new Date(s.actual_date_delivered) > new Date(s.expected_delivery_date)
        : false
    }))
  };
};

// ─── Supplier / Manufacturer Performance ─────────────────────────────────────

export const getPerformanceReport = async (userId, role) => {
  const [ratings, analytics, orders] = await Promise.all([
    prisma.rating.findMany({
      where: { given_to_id: userId },
      include: { given_by: { select: { name: true, role: true } } },
      orderBy: { created_at: 'desc' }
    }),
    prisma.analytics.findUnique({ where: { user_id: userId } }),
    prisma.order.findMany({
      where: { delivered_by_id: userId },
      select: { order_status: true, order_date: true }
    })
  ]);

  const avgRating = ratings.length > 0
    ? (ratings.reduce((sum, r) => sum + r.rating_value, 0) / ratings.length).toFixed(1)
    : '0.0';

  const ratingDist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => { ratingDist[r.rating_value] = (ratingDist[r.rating_value] || 0) + 1; });

  const ordersByStatus = {};
  orders.forEach(o => {
    ordersByStatus[o.order_status] = (ordersByStatus[o.order_status] || 0) + 1;
  });

  return {
    ratings: {
      average: parseFloat(avgRating),
      total: ratings.length,
      distribution: ratingDist,
      recent: ratings.slice(0, 10).map(r => ({
        rating_value: r.rating_value,
        review: r.review,
        given_by: r.given_by?.name || 'Unknown',
        created_at: r.created_at
      }))
    },
    orders: {
      total: orders.length,
      by_status: ordersByStatus,
      fulfillment_rate: orders.length > 0
        ? `${((ordersByStatus['delivered'] || 0) / orders.length * 100).toFixed(1)}%`
        : '0.0%'
    },
    analytics: analytics ? {
      total_shipments: analytics.total_shipments,
      ontime_shipments: analytics.ontime_shipments,
      ontime_delivery_rate: analytics.ontime_delivery_rate,
      quality_score: analytics.quality_score
    } : null
  };
};

// ─── Combined Dashboard ───────────────────────────────────────────────────────

export const getAnalyticsDashboard = async (userId, role) => {
  const [financial, inventory, orders, shipments, performance] = await Promise.all([
    getFinancialSummary(userId),
    getInventoryReport(userId, role),
    getOrderReport(userId, role),
    getShipmentReport(userId, role),
    getPerformanceReport(userId, role)
  ]);

  return {
    financial: financial.summary,
    inventory: inventory.summary,
    orders: orders.summary,
    shipments: shipments.summary,
    performance: {
      avg_rating: performance.ratings.average,
      total_ratings: performance.ratings.total,
      fulfillment_rate: performance.orders.fulfillment_rate
    }
  };
};

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const logAudit = async (userId, action, entity, entityId, details = null) => {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity,
        entity_id: String(entityId),
        details: details ? details : undefined
      }
    });
  } catch (err) {
    console.warn('Audit log failed:', err.message);
  }
};

export const getAuditLog = async (userId) => {
  const logs = await prisma.auditLog.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
    take: 100
  });

  return logs.map(l => ({
    log_id: l.log_id,
    action: l.action,
    entity: l.entity,
    entity_id: l.entity_id,
    details: l.details,
    created_at: l.created_at
  }));
};

// ─── Internal helper ──────────────────────────────────────────────────────────

const _groupByMonth = (items, getDate, getValue) => {
  const monthMap = {};
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  items.forEach(item => {
    const date = new Date(getDate(item));
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    monthMap[key] = (monthMap[key] || 0) + getValue(item);
  });

  // Return as object (key: value pairs) for easier consumption by frontend
  return monthMap;
};