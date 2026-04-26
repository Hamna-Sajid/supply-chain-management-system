import * as supplierService from '../services/supplier.js';

export const getMaterials = async (req, res) => {
    try {
        const data = await supplierService.getSupplierMaterials(req.user.userId);
        res.json(data);
    } catch (error) {
        console.error('getMaterials error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

export const addMaterial = async (req, res) => {
    try {
        const data = await supplierService.createMaterial(req.user.userId, req.body);
        res.status(201).json(data);
    } catch (error) {
        console.error('addMaterial error:', error);
        const code = error.message.includes('required') ? 400 : 500;
        res.status(code).json({ error: error.message || 'Server error' });
    }
};

export const getOrders = async (req, res) => {
    try {
        const data = await supplierService.getSupplierOrders(req.user.userId);
        res.json(data);
    } catch (error) {
        console.error('getOrders error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

export const patchStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ error: 'status is required' });
        }

        const data = await supplierService.updateStatus(req.params.id, status);
        res.json(data);
    } catch (error) {
        console.error('patchStatus error:', error);
        const code = error.message === 'Order not found' ? 404 : 500;
        res.status(code).json({ error: error.message || 'Server error' });
    }
};

export const updateMaterial = async (req, res) => {
    try {
        const data = await supplierService.updateMaterial(req.user.userId, req.params.id, req.body);
        res.json(data);
    } catch (error) {
        console.error('updateMaterial error:', error);
        const code = error.message === 'Material not found'
            ? 404
            : error.message.includes('required') || error.message.includes('At least one field')
                ? 400
                : 500;
        res.status(code).json({ error: error.message || 'Server error' });
    }
};

export const deleteMaterial = async (req, res) => {
    try {
        await supplierService.deleteMaterial(req.user.userId, req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('deleteMaterial error:', error);
        const code = error.message === 'Material not found' ? 404 : 500;
        res.status(code).json({ error: error.message || 'Server error' });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const data = await supplierService.getSupplierExpenses(req.user.userId);
        res.json(data);
    } catch (error) {
        console.error('getExpenses error:', error);
        res.status(500).json({ error: error.message || 'Server error' });
    }
};

export const addExpense = async (req, res) => {
    try {
        const data = await supplierService.createExpense(req.user.userId, req.body);
        res.status(201).json(data);
    } catch (error) {
        console.error('addExpense error:', error);
        const code = error.message.includes('required') || error.message.includes('positive') ? 400 : 500;
        res.status(code).json({ error: error.message || 'Server error' });
    }
};