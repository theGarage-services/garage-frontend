import {
  Bell, UserCheck, TrendingUp, Briefcase, Target,
  MessageCircle, MessageSquare, CheckCircle, XCircle,
  Coffee, ShieldAlert, BarChart3,
} from 'lucide-react';
import type { NotificationType } from './types';

export function mapNotificationType(backendType: string): NotificationType {
  const typeMap: Record<string, NotificationType> = {
    'consideration_received': 'recruiter-request',
    'new_message': 'new-message',
    'coffee_chat_request': 'chat-request',
    'coffee_chat_accepted': 'coffee-chat-accepted',
    'coffee_chat_declined': 'coffee-chat-declined',
    'consideration_accepted': 'consideration-accepted',
    'consideration_declined': 'consideration-declined',
    'interview_scheduled': 'application-update',
    'interview_reminder': 'application-update',
    'greenzone_status_update': 'greenzone-status-update',
    'systemic_rejection_alert': 'systemic-rejection-alert',
  };
  return typeMap[backendType] || 'new-message';
}

export function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'recruiter-request':
      return <UserCheck className="w-5 h-5 text-blue-600" />;
    case 'ranking-improvement':
      return <TrendingUp className="w-5 h-5 text-green-600" />;
    case 'application-update':
      return <Briefcase className="w-5 h-5 text-orange-600" />;
    case 'queue-activity':
      return <Target className="w-5 h-5 text-purple-600" />;
    case 'job-specific':
      return <Briefcase className="w-5 h-5 text-[#ff6b35]" />;
    case 'chat-request':
      return <MessageCircle className="w-5 h-5 text-blue-500" />;
    case 'candidate-message':
      return <MessageSquare className="w-5 h-5 text-[#ff6b35]" />;
    case 'consideration-accepted':
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'consideration-declined':
      return <XCircle className="w-5 h-5 text-red-500" />;
    case 'coffee-chat-accepted':
      return <Coffee className="w-5 h-5 text-amber-600" />;
    case 'coffee-chat-declined':
      return <Coffee className="w-5 h-5 text-gray-500" />;
    case 'new-message':
      return <MessageSquare className="w-5 h-5 text-indigo-500" />;
    case 'greenzone-status-update':
      return <ShieldAlert className="w-5 h-5 text-amber-600" />;
    case 'systemic-rejection-alert':
      return <BarChart3 className="w-5 h-5 text-red-600" />;
    default:
      return <Bell className="w-5 h-5 text-gray-600" />;
  }
}

export function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-50';
    case 'medium':
      return 'border-l-orange-500 bg-orange-50';
    case 'low':
      return 'border-l-blue-500 bg-blue-50';
    default:
      return 'border-l-gray-300 bg-gray-50';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Interview':
    case 'Interview Scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'Under Review':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'Rejected':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'Offer':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
