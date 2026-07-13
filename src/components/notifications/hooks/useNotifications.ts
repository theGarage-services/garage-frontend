import { useState, useEffect, useCallback } from 'react';
import { getChatNotifications, markNotificationAsRead, deleteNotification } from '../../../api/notifications';
import { jobManagementApi } from '../../../api/jobManagement';
import type { NotificationItem } from '../types';
import { mapNotificationType, formatTimestamp } from '../utils';

const RECRUITER_TAB_TYPES = [
  'recruiter-request',
  'consideration-accepted',
  'consideration-declined',
] as const;

const CHAT_TAB_TYPES = [
  'chat-request',
  'new-message',
  'coffee-chat-accepted',
  'coffee-chat-declined',
] as const;

function categorizeNotifications(items: NotificationItem[]) {
  return {
    general: items.filter((n) => !RECRUITER_TAB_TYPES.includes(n.type as any) && !CHAT_TAB_TYPES.includes(n.type as any)),
    recruiter: items.filter((n) => RECRUITER_TAB_TYPES.includes(n.type as any)),
    chat: items.filter((n) => CHAT_TAB_TYPES.includes(n.type as any)),
  };
}

export function useNotifications(
  generalProp: NotificationItem[] = [],
  recruiterProp: NotificationItem[] = [],
  chatProp: NotificationItem[] = []
) {
  const [isLoading, setIsLoading] = useState(true);
  const [fetched, setFetched] = useState<NotificationItem[]>([]);
  const [activeVideoFlow, setActiveVideoFlow] = useState<{ notificationId: string; considerationId: string; jobId: number } | null>(null);

  const hasPropData = generalProp.length > 0 || recruiterProp.length > 0 || chatProp.length > 0;

  useEffect(() => {
    if (hasPropData) {
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    getChatNotifications()
      .then((data) => {
        if (cancelled) return;
        const mapped: NotificationItem[] = data.map((n) => ({
          id: String(n.id),
          type: mapNotificationType(n.notification_type),
          title: n.title,
          message: n.message_preview,
          timestamp: formatTimestamp(n.created_at),
          createdAt: n.created_at,
          isRead: n.is_read,
          priority: 'medium',
          metadata: {
            considerationId: n.consideration_request ? String(n.consideration_request) : undefined,
            conversationId: n.conversation ? String(n.conversation) : undefined,
            jobId: n.job_id ? String(n.job_id) : undefined,
          },
        }));
        setFetched(mapped);
      })
      .catch((err) => {
        console.error('Failed to load notifications:', err);
      })
      .finally(() => setIsLoading(false));
    return () => { cancelled = true; };
  }, [hasPropData]);

  const categories = categorizeNotifications(hasPropData ? [...generalProp, ...recruiterProp, ...chatProp] : fetched);

  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      await markNotificationAsRead(Number.parseInt(id, 10));
      setFetched((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteNotification(Number.parseInt(id, 10));
      setFetched((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  const handleAcceptConsideration = useCallback(async (notificationId: string, considerationId?: string, jobId?: string, videoResponseIds?: number[]) => {
    if (!considerationId) {
      console.error('No consideration request ID found in notification');
      alert('Unable to accept: missing consideration request ID.');
      return;
    }
    try {
      const response = await jobManagementApi.acceptConsiderationRequest(
        Number.parseInt(considerationId, 10),
        '',
        videoResponseIds
      );
      if (response.requires_video_prompts) {
        const missingJobId = jobId ? Number.parseInt(jobId, 10) : 0;
        setActiveVideoFlow({ notificationId, considerationId, jobId: missingJobId });
        return;
      }
      if (response.success) {
        setFetched((prev) => prev.map((n) =>
          n.id === notificationId
            ? { ...n, isRead: true, type: 'consideration-accepted' }
            : n
        ));
        alert('Consideration request accepted!');
      } else {
        alert(`Failed to accept: ${response.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to accept consideration request:', err);
      alert('Failed to accept consideration request.');
    }
  }, []);

  const completeVideoFlow = useCallback(async (videoResponseIds: number[]) => {
    if (!activeVideoFlow) return;
    await handleAcceptConsideration(
      activeVideoFlow.notificationId,
      activeVideoFlow.considerationId,
      String(activeVideoFlow.jobId),
      videoResponseIds
    );
    setActiveVideoFlow(null);
  }, [activeVideoFlow, handleAcceptConsideration]);

  const cancelVideoFlow = useCallback(() => {
    setActiveVideoFlow(null);
  }, []);

  return {
    isLoading,
    generalNotifications: hasPropData ? generalProp : categories.general,
    recruiterNotifications: hasPropData ? recruiterProp : categories.recruiter,
    chatNotifications: hasPropData ? chatProp : categories.chat,
    handleMarkAsRead,
    handleDelete,
    handleAcceptConsideration,
    activeVideoFlow,
    completeVideoFlow,
    cancelVideoFlow,
  };
}
