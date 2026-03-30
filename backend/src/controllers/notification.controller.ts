import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
} from '../services/notification.service.js';

export const getAllNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const notifications = await getNotifications(req.user.id, limit);
    
    res.json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications',
    });
  }
};

export const getUnreadNotificationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const unreadNotifications = await getUnreadNotifications(req.user.id);
    
    res.json({
      success: true,
      count: unreadNotifications.length,
      notifications: unreadNotifications,
    });
  } catch (error) {
    console.error('Error fetching unread notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread notifications',
    });
  }
};

export const getUnreadCountHandler = async (req: AuthRequest, res: Response) => {
  try {
    const count = await getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      unreadCount: count,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unread count',
    });
  }
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required',
      });
    }
    
    const notification = await markAsRead(notificationId);
    const unreadCount = await getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark notification as read',
    });
  }
};

export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const result = await markAllAsRead(req.user.id);
    
    res.json({
      success: true,
      updatedCount: result.count,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark all notifications as read',
    });
  }
};

export const deleteNotificationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId) {
      return res.status(400).json({
        success: false,
        error: 'Notification ID is required',
      });
    }
    
    const notification = await deleteNotification(notificationId);
    const unreadCount = await getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      notification,
      unreadCount,
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete notification',
    });
  }
};

export const deleteAllNotificationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const result = await deleteAllNotifications(req.user.id);
    
    res.json({
      success: true,
      deletedCount: result.count,
      unreadCount: 0,
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete all notifications',
    });
  }
};
