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