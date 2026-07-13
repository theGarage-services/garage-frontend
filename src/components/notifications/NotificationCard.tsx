import type { ReactNode } from 'react';
import { Card } from '../ui/card';
import { CheckCircle, Trash2 } from 'lucide-react';
import type { NotificationItem } from './types';
import { getNotificationIcon, getPriorityColor } from './utils';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  renderMetadata?: (n: NotificationItem) => ReactNode;
  renderActions?: (n: NotificationItem) => ReactNode;
  iconBgClass?: string;
  iconBorderClass?: string;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onDelete,
  renderMetadata,
  renderActions,
  iconBgClass = 'from-gray-50 to-gray-100',
  iconBorderClass = 'border-gray-200',
}: Readonly<NotificationCardProps>) {
  return (
    <Card
      className={`p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
        notification.isRead ? 'bg-white' : getPriorityColor(notification.priority)
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 bg-gradient-to-r ${iconBgClass} rounded-xl flex items-center justify-center border ${iconBorderClass}`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {!notification.isRead && <div className="w-2 h-2 bg-[#ff6b35] rounded-full" />}
              <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
            </div>
          </div>

          {renderMetadata && <div className="mt-4">{renderMetadata(notification)}</div>}

          <div className="flex flex-wrap items-center gap-3 mt-4">
            {renderActions?.(notification)}
            {!notification.isRead && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Read
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(notification.id)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
