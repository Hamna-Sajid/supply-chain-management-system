import * as analyticsService from '../services/analytics.js';

export const getDashboard = async (req, res) => {
  try {
    const data = await analyticsService.getAnalyticsDashboard(
      req.user.userId,
      req.user.role
    );
    res.json(data);
  } catch (error) {
    console.error('getDashboard error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getFinancialReport = async (req, res) => {
  try {
    const data = await analyticsService.getFinancialSummary(req.user.userId);
    res.json(data);
  } catch (error) {
    console.error('getFinancialReport error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getInventoryReport = async (req, res) => {
  try {
    const data = await analyticsService.getInventoryReport(
      req.user.userId,
      req.user.role
    );
    res.json(data);
  } catch (error) {
    console.error('getInventoryReport error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getOrderReport = async (req, res) => {
  try {
    const data = await analyticsService.getOrderReport(
      req.user.userId,
      req.user.role
    );
    res.json(data);
  } catch (error) {
    console.error('getOrderReport error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getShipmentReport = async (req, res) => {
  try {
    const data = await analyticsService.getShipmentReport(
      req.user.userId,
      req.user.role
    );
    res.json(data);
  } catch (error) {
    console.error('getShipmentReport error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getPerformanceReport = async (req, res) => {
  try {
    const data = await analyticsService.getPerformanceReport(
      req.user.userId,
      req.user.role
    );
    res.json(data);
  } catch (error) {
    console.error('getPerformanceReport error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const getAuditLog = async (req, res) => {
  try {
    const logs = await analyticsService.getAuditLog(req.user.userId);
    res.json(logs);
  } catch (error) {
    console.error('getAuditLog error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const createExpense = async (req, res) => {
  try {
    const result = await analyticsService.createExpense(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error('createExpense error:', error);
    const code = error.message.includes('required') ||
      error.message.includes('greater than 0') ||
      error.message.includes('Authenticated user not found')
      ? 400
      : 500;
    res.status(code).json({ error: error.message || 'Server error' });
  }
};