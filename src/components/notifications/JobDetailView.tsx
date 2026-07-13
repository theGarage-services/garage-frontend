import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ArrowLeft, MapPin, DollarSign, Calendar, FileText, CheckCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import type { JobNotificationGroup, NotificationItem } from './types';
import { getStatusColor, getPriorityColor } from './utils';

interface JobDetailViewProps {
  job: JobNotificationGroup;
  onBack: () => void;
  onMarkAsRead: (id: string) => void;
}

export function JobDetailView({ job, onBack, onMarkAsRead }: Readonly<JobDetailViewProps>) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to My Jobs
        </Button>
      </div>

      {/* Job Summary Card */}
      <Card className="p-6 bg-gradient-to-r from-white to-orange-50 border-[#ff6b35]/20">
        <div className="flex items-start gap-4">
          {job.companyLogo && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-gray-200">
              <ImageWithFallback
                src={job.companyLogo}
                alt={`${job.companyName} logo`}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-1">{job.jobTitle}</h2>
                <p className="text-lg text-gray-700">{job.companyName}</p>
              </div>
              <Badge className={`${getStatusColor(job.currentStatus)} border px-3 py-1`}>
                {job.currentStatus}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Applied: {job.appliedDate}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Notifications Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#ff6b35]" />
          Application Timeline
        </h3>
        <div className="space-y-4">
          {job.notifications.map((notification, index) => (
            <TimelineItem
              key={notification.id}
              notification={notification}
              isLast={index === job.notifications.length - 1}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </Card>
    </div>
  );
}

function TimelineItem({
  notification,
  isLast,
  onMarkAsRead,
}: Readonly<{
  notification: NotificationItem;
  isLast: boolean;
  onMarkAsRead: (id: string) => void;
}>) {
  return (
    <div className={`relative pl-8 pb-6 ${isLast ? 'pb-0' : ''}`}>
      {!isLast && (
        <div className="absolute left-2 top-6 bottom-0 w-0.5 bg-gray-200" />
      )}
      <div
        className={`absolute left-0 top-1 w-4 h-4 rounded-full border-2 ${
          notification.isRead ? 'bg-white border-gray-300' : 'bg-[#ff6b35] border-[#ff6b35]'
        }`}
      />
      <Card
        className={`p-4 border-l-4 ${
          notification.isRead ? 'bg-white border-l-gray-300' : getPriorityColor(notification.priority)
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{notification.title}</h4>
              {!notification.isRead && <div className="w-2 h-2 bg-[#ff6b35] rounded-full" />}
            </div>
            <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
            <p className="text-xs text-gray-500">{notification.timestamp}</p>
          </div>
        </div>
        {!notification.isRead && (
          <Button size="sm" variant="outline" onClick={() => onMarkAsRead(notification.id)} className="mt-2">
            <CheckCircle className="w-3 h-3 mr-1" />
            Mark Read
          </Button>
        )}
      </Card>
    </div>
  );
}
