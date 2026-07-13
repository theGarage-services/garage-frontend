import type { ReactNode } from 'react';

export interface NotificationMetadata {
  recruiterName?: string;
  recruiterTitle?: string;
  companyName?: string;
  companyLogo?: string;
  jobTitle?: string;
  queueName?: string;
  oldRank?: number;
  newRank?: number;
  oldStatus?: string;
  newStatus?: string;
  jobId?: string;
  senderName?: string;
  senderAvatar?: string;
  messagePreview?: string;
  conversationId?: string;
  coffeeChatId?: string;
  considerationId?: string;
  requesterName?: string;
  requesterAvatar?: string;
  // Greenzone / algorithmic-monoculture metadata
  greenzoneStatus?: string;
  greenzoneReason?: string;
  systemicRejectionRate?: number;
  isFlagged?: boolean;
}

export type NotificationType =
  | 'recruiter-request'
  | 'status-change'
  | 'ranking-improvement'
  | 'application-update'
  | 'queue-activity'
  | 'job-specific'
  | 'chat-request'
  | 'candidate-message'
  | 'consideration-accepted'
  | 'consideration-declined'
  | 'coffee-chat-accepted'
  | 'coffee-chat-declined'
  | 'new-message'
  | 'greenzone-status-update'
  | 'systemic-rejection-alert';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  createdAt: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  metadata?: NotificationMetadata;
}

export interface JobNotificationGroup {
  jobId: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  location: string;
  salary: string;
  currentStatus: string;
  appliedDate: string;
  notifications: NotificationItem[];
  unreadCount: number;
}

export interface NotificationsProps {
  onNavigate: (view: string) => void;
  user?: any;
  onLogout?: () => void;
  generalNotifications?: NotificationItem[];
  recruiterNotifications?: NotificationItem[];
  chatNotifications?: NotificationItem[];
  jobNotificationGroups?: JobNotificationGroup[];
}

export interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  renderMetadata?: (n: NotificationItem) => ReactNode;
  renderActions?: (n: NotificationItem) => ReactNode;
  iconBgClass?: string;
  iconBorderClass?: string;
}
