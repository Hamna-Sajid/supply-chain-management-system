import * as notificationService from '../services/notifications.js';

export const getNotifications = async (req, res) => {
  try {
    const unread_only = req.query.unread_only === 'true';
    const result = await notificationService.getNotifications(
      req.user.userId,
      { unread_only }
    );
    res.json(result);
  } catch (error) {
    console.error('getNotifications error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAsRead(
      req.params.id,
      req.user.userId
    );
    res.json(result);
  } catch (error) {
    console.error('markAsRead error:', error);
    res.status(error.message === 'Notification not found' ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('markAllAsRead error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const result = await notificationService.deleteNotification(
      req.params.id,
      req.user.userId
    );
    res.json(result);
  } catch (error) {
    console.error('deleteNotification error:', error);
    res.status(error.message === 'Notification not found' ? 404 : 500)
      .json({ error: error.message || 'Server error' });
  }
};