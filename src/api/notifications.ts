import apiClient from './client';

export interface NotificationPreferences {
  email_new_applications: boolean;
  email_status_updates: boolean;
  email_weekly_report: boolean;
  push_new_applications: boolean;
  push_interview_reminders: boolean;
  push_messages: boolean;
  sms_important_updates: boolean;
  sms_interview_reminders: boolean;
}

class NotificationService {
  /**
   * Get the current user's notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences | null> {
    try {
      const response = await apiClient.request('/notifications/preferences/', {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      return await response.json() as NotificationPreferences;
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      return null;
    }
  }

  /**
   * Update the user's notification preferences
   */
  async updatePreferences(data: NotificationPreferences): Promise<NotificationPreferences> {
    const response = await apiClient.request('/notifications/preferences/', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || 'Failed to update notification preferences');
    }

    return await response.json() as NotificationPreferences;
  }

  /**
   * Transform frontend notification data to backend format
   */
  transformDataForBackend(data: Record<string, boolean>): NotificationPreferences {
    return {
      email_new_applications: data.emailNewApplications ?? true,
      email_status_updates: data.emailStatusUpdates ?? true,
      email_weekly_report: data.emailWeeklyReport ?? true,
      push_new_applications: data.pushNewApplications ?? true,
      push_interview_reminders: data.pushInterviewReminders ?? true,
      push_messages: data.pushMessages ?? false,
      sms_important_updates: data.smsImportantUpdates ?? false,
      sms_interview_reminders: data.smsInterviewReminders ?? false,
    };
  }

  /**
   * Transform backend preferences to frontend format
   */
  transformDataForFrontend(prefs: NotificationPreferences): Record<string, boolean> {
    return {
      emailNewApplications: prefs.email_new_applications,
      emailStatusUpdates: prefs.email_status_updates,
      emailWeeklyReport: prefs.email_weekly_report,
      pushNewApplications: prefs.push_new_applications,
      pushInterviewReminders: prefs.push_interview_reminders,
      pushMessages: prefs.push_messages,
      smsImportantUpdates: prefs.sms_important_updates,
      smsInterviewReminders: prefs.sms_interview_reminders,
    };
  }
}

export interface ChatNotification {
  id: number;
  notification_type: string;
  notification_type_display?: string;
  conversation?: number;
  message?: number;
  coffee_chat_request?: number;
  consideration_request?: number;
  job_id?: number;
  title: string;
  message_preview: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

/**
 * Fetch all chat notifications for the current user.
 */
export async function getChatNotifications(): Promise<ChatNotification[]> {
  const response = await apiClient.request('/chat/notifications/');
  if (!response.ok) {
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(id: number): Promise<ChatNotification> {
  const response = await apiClient.request(`/chat/notifications/${id}/mark_read/`, { method: 'POST' });
  if (!response.ok) {
    throw new Error('Failed to mark notification as read');
  }
  return response.json();
}

/**
 * Get count of unread notifications.
 */
export async function getUnreadNotificationCount(): Promise<{ unread_count: number }> {
  const response = await apiClient.request('/chat/notifications/unread_count/');
  if (!response.ok) {
    throw new Error('Failed to fetch unread count');
  }
  return response.json();
}

/**
 * Delete a notification by ID.
 */
export async function deleteNotification(id: number): Promise<void> {
  const response = await apiClient.request(`/chat/notifications/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete notification');
  }
}

export const notificationService = new NotificationService();
