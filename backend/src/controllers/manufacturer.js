import * as manufacturerService from '../services/manufacturer.js';

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboard = async (req, res) => {
  try {
    const data = await manufacturerService.getDashboard(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Raw Materials ────────────────────────────────────────────────────────────

export const getRawMaterials = async (req, res) => {
  try {
    const materials = await manufacturerService.getRawMaterials();
    res.json(materials);
  } catch (error) {
    console.error('getRawMaterials error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Orders ───────────────────────────────────────────────────────────────────

export const placeOrder = async (req, res) => {
  try {
    const result = await manufacturerService.placeOrder(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('placeOrder error:', error);
    const code = error.message.includes('required') ? 400 : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await manufacturerService.getOrders(req.user.userId);
    res.json(orders);
  } catch (error) {
    console.error('getOrders error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = async (req, res) => {
  try {
    const products = await manufacturerService.getProducts(req.user.userId);
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createProduct = async (req, res) => {
  try {
    const product = await manufacturerService.createProduct(req.user.userId, req.body);
    res.status(201).json(product);
  } catch (error) {
    console.error('createProduct error:', error);
    const code = error.message.includes('required') ||
                 error.message.includes('Invalid') ? 400 : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

export const updateProductStage = async (req, res) => {
  const { production_stage } = req.body;

  if (!production_stage) {
    return res.status(400).json({ error: 'production_stage is required' });
  }

  try {
    const result = await manufacturerService.updateProductStage(
      req.params.id,
      req.user.userId,
      production_stage
    );
    res.json(result);
  } catch (error) {
    console.error('updateProductStage error:', error);
    const code = error.message === 'Product not found'           ? 404
               : error.message.includes('Invalid')               ? 400
               : error.message.includes('backwards')             ? 400
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

export const updateProductQuantity = async (req, res) => {
  const { quantity } = req.body;

  if (quantity === undefined || quantity === null) {
    return res.status(400).json({ error: 'quantity is required' });
  }

  try {
    const result = await manufacturerService.updateProductQuantity(
      req.params.id,
      req.user.userId,
      quantity
    );
    res.json(result);
  } catch (error) {
    console.error('updateProductQuantity error:', error);
    const code = error.message === 'Product not found'             ? 404
               : error.message.includes('completed')              ? 400
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await manufacturerService.deleteProduct(
      req.params.id,
      req.user.userId
    );
    res.json(result);
  } catch (error) {
    console.error('deleteProduct error:', error);
    res.status(error.message === 'Product not found' ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};

// ─── Inventory ────────────────────────────────────────────────────────────────

export const getInventory = async (req, res) => {
  try {
    const inventory = await manufacturerService.getInventory(req.user.userId);
    res.json(inventory);
  } catch (error) {
    console.error('getInventory error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const updateInventoryPrices = async (req, res) => {
  try {
    const result = await manufacturerService.updateInventoryPrices(
      req.params.id,
      req.user.userId,
      req.body
    );
    res.json(result);
  } catch (error) {
    console.error('updateInventoryPrices error:', error);
    const code = error.message.includes('required')      ? 400
               : error.message.includes('not found')     ? 404
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

// ─── Warehouses ───────────────────────────────────────────────────────────────

export const getWarehouses = async (req, res) => {
  try {
    const warehouses = await manufacturerService.getWarehouses();
    res.json(warehouses);
  } catch (error) {
    console.error('getWarehouses error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Shipments ────────────────────────────────────────────────────────────────

export const createShipment = async (req, res) => {
  try {
    const result = await manufacturerService.createShipment(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('createShipment error:', error);
    const code = error.message.includes('required')    ? 400
               : error.message.includes('not found')   ? 404
               : error.message.includes('completed')   ? 400
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

export const getShipments = async (req, res) => {
  try {
    const shipments = await manufacturerService.getShipments(req.user.userId);
    res.json(shipments);
  } catch (error) {
    console.error('getShipments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const updateShipmentStatus = async (req, res) => {
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'status is required' });
  }

  try {
    const result = await manufacturerService.updateShipmentStatus(
      req.params.id,
      req.user.userId,
      status
    );
    res.json(result);
  } catch (error) {
    console.error('updateShipmentStatus error:', error);
    const code = error.message.startsWith('Invalid')      ? 400
               : error.message === 'Shipment not found'   ? 404
               : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};

// ─── Payments ─────────────────────────────────────────────────────────────────

export const getPayments = async (req, res) => {
  try {
    const payments = await manufacturerService.getPayments(req.user.userId);
    res.json(payments);
  } catch (error) {
    console.error('getPayments error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

// ─── Utility — expose valid stages ───────────────────────────────────────────

export const getProductionStages = async (req, res) => {
  res.json({ stages: manufacturerService.PRODUCTION_STAGES });
};