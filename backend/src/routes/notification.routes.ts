import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth.js';
import {
  getAllNotifications,
  getUnreadNotificationsHandler,
  getUnreadCountHandler,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationHandler,
  deleteAllNotificationsHandler,
} from '../controllers/notification.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticateJWT);

// Get all notifications
router.get('/', getAllNotifications);

// Get unread notifications only
router.get('/unread', getUnreadNotificationsHandler);

// Get unread count
router.get('/unread/count', getUnreadCountHandler);

// Mark specific notification as read
router.patch('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.patch('/read/all', markAllNotificationsAsRead);

// Delete specific notification
router.delete('/:notificationId', deleteNotificationHandler);

// Delete all notifications
router.delete('/delete/all', deleteAllNotificationsHandler);

export default router;
