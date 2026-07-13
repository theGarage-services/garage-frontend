import { ExternalLink, Calendar, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import type { Interview } from '@/api/interviews';

interface InterviewCardProps {
  interview: Interview;
  onJoinCall: (url: string) => void;
}

export function InterviewCard({ interview, onJoinCall }: Readonly<InterviewCardProps>) {
  const statusColors: Record<Interview['status'], string> = {
    confirmed: 'bg-green-50 border-green-200',
    pending: 'bg-yellow-50 border-yellow-200',
    scheduled: 'bg-white border-gray-200',
    completed: 'bg-blue-50 border-blue-200',
    cancelled: 'bg-red-50 border-red-200',
    'no-show': 'bg-gray-50 border-gray-200',
    rescheduled: 'bg-orange-50 border-orange-200'
  };

  const statusBadgeColors: Record<Interview['status'], string> = {
    confirmed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    scheduled: 'bg-gray-100 text-gray-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
    'no-show': 'bg-gray-100 text-gray-800',
    rescheduled: 'bg-orange-100 text-orange-800'
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = Number.parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isConfirmed = interview.status === 'confirmed';

  return (
    <Card className={`border shadow-sm ${statusColors[interview.status]}`}>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{interview.title}</h3>
            <div className="flex items-center gap-2">
              <Badge className="text-xs bg-blue-100 text-blue-800">
                {interview.stage_display}
              </Badge>
              <Badge className={`text-xs ${statusBadgeColors[interview.status]}`}>
                {interview.status_display}
              </Badge>
            </div>
          </div>
          {interview.status === 'confirmed' && <CheckCircle className="w-4 h-4 text-green-600" />}
          {interview.status === 'pending' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
        </div>

        <div className="space-y-3 text-sm text-gray-600 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">Format:</span>
            <span>{interview.interview_type_display}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">Scheduled by:</span>
            <span className="text-right">{interview.recruiter_name}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">Date:</span>
            <span>{new Date(interview.scheduled_date).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <span className="font-medium">Time:</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(interview.scheduled_time)} ({interview.formatted_duration})</span>
            </div>
          </div>
        </div>

        {isConfirmed && interview.meeting_link && (
          <div className="space-y-2">
            <Button
              onClick={() => onJoinCall(interview.meeting_link!)}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Join {interview.interview_type_display} Call
            </Button>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <Calendar className="w-3 h-3" />
              <span>Added to your theGarage calendar</span>
            </div>
            <p className="text-xs text-gray-500 text-center">
              Click to join the meeting 5 minutes before start time
            </p>
          </div>
        )}

        {interview.status === 'pending' && (
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800">
              Waiting for recruiter confirmation. You&apos;ll receive a calendar invite once confirmed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
