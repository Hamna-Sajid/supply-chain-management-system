import * as warehouseService from '../services/warehouse.js';

// ─── Dashboard (UNCHANGED) ────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  try {
    const data = await warehouseService.getDashboard(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Shipments ────────────────────────────────────────────────────────────────

// UNCHANGED
export const getShipments = async (req, res) => {
  try {
    const shipments = await warehouseService.getShipments(req.user.userId);
    res.json(shipments);
  } catch (error) {
    console.error('getShipments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// UNCHANGED — service now handles inventory upsert internally
export const acceptShipment = async (req, res) => {
  try {
    const result = await warehouseService.acceptShipment(req.params.id, req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('acceptShipment error:', error);
    res.status(error.message === 'Shipment not found' ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};

// FIXED: now passes damage_notes from request body
export const rejectShipment = async (req, res) => {
  try {
    const result = await warehouseService.rejectShipment(
      req.params.id,
      req.user.userId,
      req.body.damage_notes || null   // optional field
    );
    res.json(result);
  } catch (error) {
    console.error('rejectShipment error:', error);
    res.status(error.message === 'Shipment not found' ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};

// UNCHANGED
export const updateShipmentStatus = async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const result = await warehouseService.updateShipmentStatus(
      req.params.id,
      req.user.userId,
      status
    );
    res.json(result);
  } catch (error) {
    console.error('updateShipmentStatus error:', error);
    const code = error.message.startsWith('Invalid status') ? 400
               : error.message === 'Shipment not found'     ? 404 : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

// NEW: create outgoing shipment linked to order
export const createOutgoingShipment = async (req, res) => {
  try {
    const result = await warehouseService.createOutgoingShipment(
      req.user.userId,
      req.body
    );
    res.status(201).json(result);
  } catch (error) {
    console.error('createOutgoingShipment error:', error);
    const code = error.message.includes('required')     ? 400
               : error.message.includes('not found')    ? 404
               : error.message.includes('Insufficient') ? 400
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

// ─── Inventory ────────────────────────────────────────────────────────────────

// UNCHANGED
export const getInventory = async (req, res) => {
  try {
    const inventory = await warehouseService.getInventory(req.user.userId);
    res.json(inventory);
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// UNCHANGED
export const getLowStock = async (req, res) => {
  try {
    const items = await warehouseService.getLowStock(req.user.userId);
    res.json(items);
  } catch (error) {
    console.error('getLowStock error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// NEW: manual inventory update
export const updateInventory = async (req, res) => {
  try {
    const result = await warehouseService.updateInventory(
      req.params.id,
      req.user.userId,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error('updateInventory error:', error);
    const code = error.message.includes('required')   ? 400
               : error.message.includes('not found')  ? 404
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

// UNCHANGED
export const getOrders = async (req, res) => {
  try {
    const orders = await warehouseService.getOrders(req.user.userId);
    res.json(orders);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// UNCHANGED — service now handles inventory deduction internally
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const result = await warehouseService.updateOrderStatus(
      req.params.id,
      req.user.userId,
      status
    );
    res.json(result);
  } catch (error) {
    console.error('updateOrderStatus error:', error);
    res.status(error.message.includes('not found') ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};