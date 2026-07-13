import { useEffect, useState } from 'react';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { recruiterCandidatesApi } from '../../../api/recruiterCandidates';
import {
  Mail,
  Send,
  RefreshCw,
  Calendar,
  StickyNote,
  Clock,
  Loader2,
  User,
  AlertCircle,
} from 'lucide-react';

interface TimelineEvent {
  id: string;
  type: string;
  status: string;
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  actor_name: string;
  match_score?: number | null;
  interview_id?: number | null;
}

interface RecruiterCandidateTimelineProps {
  candidateId: string;
  jobId?: string | null;
}

function getEventIcon(type: string) {
  switch (type) {
    case 'consideration_request':
      return <Mail className="w-5 h-5 text-blue-500" />;
    case 'consideration_response':
      return <Mail className="w-5 h-5 text-green-500" />;
    case 'application_submitted':
      return <Send className="w-5 h-5 text-[#ff6b35]" />;
    case 'status_update':
      return <RefreshCw className="w-5 h-5 text-purple-500" />;
    case 'interview_scheduled':
      return <Calendar className="w-5 h-5 text-emerald-500" />;
    case 'recruiter_note':
      return <StickyNote className="w-5 h-5 text-yellow-500" />;
    default:
      return <Clock className="w-5 h-5 text-gray-500" />;
  }
}

function getEventBadgeColor(type: string, status: string): string {
  if (status === 'rejected' || status === 'declined') return 'bg-red-100 text-red-700 border-red-200';
  if (status === 'accepted' || status === 'hired' || status === 'completed') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'pending') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  if (status === 'interview_scheduled' || type === 'interview_scheduled') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (type === 'consideration_request') return 'bg-blue-100 text-blue-700 border-blue-200';
  if (type === 'application_submitted') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-gray-100 text-gray-700 border-gray-200';
}

function formatEventDate(timestamp: string): string {
  if (!timestamp) return 'Unknown date';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatEventTime(timestamp: string): string {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getActorLabel(event: TimelineEvent): string {
  if (event.actor === 'candidate') {
    return 'Candidate';
  }
  if (event.actor === 'recruiter') {
    return event.actor_name || 'Recruiter';
  }
  return event.actor_name || 'System';
}

export function RecruiterCandidateTimeline({
  candidateId,
  jobId,
}: Readonly<RecruiterCandidateTimelineProps>) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [jobTitle, setJobTitle] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTimeline = async () => {
      if (!candidateId) {
        setLoading(false);
        return;
      }
      try {
        const data = await recruiterCandidatesApi.getCandidateTimeline(
          candidateId,
          jobId || undefined
        );
        setEvents(data.events || []);
        setJobTitle(data.job_title);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load timeline');
      } finally {
        setLoading(false);
      }
    };

    void loadTimeline();
  }, [candidateId, jobId]);

  if (loading) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-xl text-gray-900">Activity Timeline</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading timeline...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-xl text-gray-900">Activity Timeline</h3>
        </div>
        <div className="flex items-start gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 mt-0.5" />
          {error}
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-xl text-gray-900">Activity Timeline</h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No timeline events yet.</p>
          <p className="text-sm mt-2">
            Activity will appear here as the candidate progresses through the hiring pipeline.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white/80 border-orange-100">
      <div className="flex items-center gap-2 mb-1">
        <Clock className="w-5 h-5 text-[#ff6b35]" />
        <h3 className="text-xl text-gray-900">Activity Timeline</h3>
      </div>
      {jobTitle && (
        <p className="text-sm text-gray-600 mb-6">For: <span className="font-medium">{jobTitle}</span></p>
      )}

      <div className="relative">
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-orange-100" />

        <div className="space-y-6">
          {events.map((event, index) => {
            const isLast = index === events.length - 1;
            return (
              <div key={event.id} className="relative flex gap-4">
                <div className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-orange-100 flex items-center justify-center">
                  {getEventIcon(event.type)}
                </div>
                <div className={`flex-1 pb-6 ${isLast ? '' : 'border-b border-gray-100'}`}>
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">{event.title}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${getEventBadgeColor(event.type, event.status)}`}
                      >
                        {event.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-500 text-right whitespace-nowrap">
                      <div>{formatEventDate(event.timestamp)}</div>
                      <div>{formatEventTime(event.timestamp)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <User className="w-3 h-3" />
                    <span>{getActorLabel(event)}</span>
                    {event.match_score !== undefined && event.match_score !== null && (
                      <span className="ml-3">Match score: {Math.round(event.match_score * 100) / 100}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
