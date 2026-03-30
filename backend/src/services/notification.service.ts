import prisma from '../config/db.js';

const prismaClient = prisma as any;

export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  resourceId?: string;
  resourceType?: string;
  actionUrl?: string;
}

export const createNotification = async (data: CreateNotificationDto) => {
  try {
    const notification = await prismaClient.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        resourceId: data.resourceId,
        resourceType: data.resourceType,
        actionUrl: data.actionUrl,
      },
    });
    console.log(`✅ Notification created: ${notification.type} for user ${data.userId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

export const getNotifications = async (userId: string, limit: number = 50) => {
  try {
    const notifications = await prismaClient.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

export const getUnreadNotifications = async (userId: string) => {
  try {
    const unreadNotifications = await prismaClient.notification.findMany({
      where: {
        userId,
        isRead: false,
      },
      orderBy: { createdAt: 'desc' },
    });
    return unreadNotifications;
  } catch (error) {
    console.error('❌ Error fetching unread notifications:', error);
    throw error;
  }
};

export const getUnreadCount = async (userId: string) => {
  try {
    const count = await prismaClient.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
    return count;
  } catch (error) {
    console.error('❌ Error counting unread notifications:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    const notification = await prismaClient.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    console.log(`✅ Notification marked as read: ${notificationId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    const result = await prismaClient.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    console.log(`✅ Marked ${result.count} notifications as read for user ${userId}`);
    return result;
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const notification = await prismaClient.notification.delete({
      where: { id: notificationId },
    });
    console.log(`✅ Notification deleted: ${notificationId}`);
    return notification;
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

export const deleteAllNotifications = async (userId: string) => {
  try {
    const result = await prismaClient.notification.deleteMany({
      where: { userId },
    });
    console.log(`✅ Deleted ${result.count} notifications for user ${userId}`);
    return result;
  } catch (error) {
    console.error('❌ Error deleting all notifications:', error);
    throw error;
  }
};
