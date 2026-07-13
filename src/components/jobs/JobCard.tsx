import { useState, useEffect } from 'react';
import { JobApplication } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Calendar, MapPin, DollarSign, MessageCircle, Video, Crown, User, Sparkles } from 'lucide-react';
import { getJobInterviews, type Interview } from '@/api/interviews';

interface ConsiderationRequest {
  id: number;
  status: string;
  recruiter: { id: number; username: string; full_name: string };
  job: number;
  message: string;
  match_score: number | null;
  created_at: string;
}

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onNavigateToJobDetails?: (job: JobApplication) => void;
  considerationRequest?: ConsiderationRequest;
  onAcceptConsideration?: (requestId: number) => void;
}

export function JobCard({ job, onEdit, onNavigateToJobDetails, considerationRequest, onAcceptConsideration }: Readonly<JobCardProps>) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isAccepting, setIsAccepting] = useState(false);

  // Fetch interviews for this job
  useEffect(() => {
    const fetchInterviews = async () => {
      const jobIdNum = Number.parseInt(String(job.id), 10);
      if (Number.isNaN(jobIdNum)) return;
      try {
        const data = await getJobInterviews(jobIdNum);
        setInterviews(data);
      } catch (error) {
        console.error('Failed to fetch interviews:', error);
      }
    };
    fetchInterviews();
  }, [job.id]);

  const handleAcceptConsideration = async () => {
    if (!considerationRequest || !onAcceptConsideration) return;
    setIsAccepting(true);
    try {
      onAcceptConsideration(considerationRequest.id);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleClick = () => {
    // If onNavigateToJobDetails is provided, navigate to job details
    // Otherwise, use the edit dialog (legacy behavior)
    if (onNavigateToJobDetails) {
      onNavigateToJobDetails(job);
    } else {
      onEdit(job);
    }
  };

  // Check if job has recruiter communication features
  const hasRecruiterContact = (job as any).hasRecruiterContact;
  const lastRecruiterMessage = (job as any).lastRecruiterMessage;
  const lastRecruiterMessageTime = (job as any).lastRecruiterMessageTime;
  const interviewScheduled = interviews.length > 0 ? interviews[0] : null;
  const isPremiumCandidate = (job as any).applicationMethod === 'recruiter-consideration';
  const hasPendingConsideration = considerationRequest?.status === 'pending';
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <Card 
      className={`p-3 mb-2 hover:shadow-md transition-shadow cursor-pointer border-l-4 ${
        hasRecruiterContact ? 'border-l-[#ff6b35]' : 'border-l-blue-500'
      }`}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-1">
            <h4 className="font-medium text-sm">{job.title}</h4>
            <div className="flex items-center gap-1">
              {hasPendingConsideration && (
                <span title="New consideration request">
                  <MessageCircle className="w-3 h-3 text-[#ff6b35]" />
                </span>
              )}
              {isPremiumCandidate && (
                <span title="Premium consideration">
                  <Crown className="w-3 h-3 text-yellow-500" />
                </span>
              )}
              {hasRecruiterContact && !hasPendingConsideration && (
                <span title="Recruiter contact">
                  <MessageCircle className="w-3 h-3 text-[#ff6b35]" />
                </span>
              )}
              {interviewScheduled && (
                <span title="Interview scheduled">
                  <Video className="w-3 h-3 text-green-600" />
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{job.company}</p>
        </div>
        
        {(job.location || job.salary) && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span>{job.location}</span>
              </div>
            )}
            {job.salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span>{job.salary}</span>
              </div>
            )}
          </div>
        )}
        
        {hasPendingConsideration && considerationRequest && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <User className="w-3 h-3 text-[#ff6b35]" />
              <span className="font-medium text-[#ff6b35]">Consideration from {considerationRequest.recruiter.full_name || considerationRequest.recruiter.username}</span>
            </div>
            <p className="text-gray-700 mb-2">{considerationRequest.message}</p>
            <div className="flex items-center justify-between">
              {considerationRequest.match_score !== null && considerationRequest.match_score !== undefined && (
                <div className="flex items-center gap-1 text-orange-600">
                  <Sparkles className="w-3 h-3" />
                  <span>{considerationRequest.match_score}% match</span>
                </div>
              )}
              <Button
                size="sm"
                variant="default"
                className="h-7 text-xs bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptConsideration();
                }}
                disabled={isAccepting}
              >
                {isAccepting ? 'Accepting...' : 'Accept'}
              </Button>
            </div>
          </div>
        )}

        {hasRecruiterContact && lastRecruiterMessage && !hasPendingConsideration && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <MessageCircle className="w-3 h-3 text-[#ff6b35]" />
              <span className="font-medium text-[#ff6b35]">Recruiter message</span>
              <span className="text-gray-500">• {lastRecruiterMessageTime}</span>
            </div>
            <p className="text-gray-700">{lastRecruiterMessage}</p>
          </div>
        )}

        {interviewScheduled && (
          <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
            <div className="flex items-center gap-1 mb-1">
              <Video className="w-3 h-3 text-green-600" />
              <span className="font-medium text-green-700">Interview Scheduled</span>
            </div>
            <p className="text-gray-700">
              {parseLocalDate(interviewScheduled.scheduled_date).toLocaleDateString()} at {interviewScheduled.scheduled_time}
            </p>
            <p className="text-gray-600">{interviewScheduled.interview_type_display} • {interviewScheduled.formatted_duration}</p>
          </div>
        )}

        {job.recruiterNotes && !hasRecruiterContact && (
          <div className="p-2 bg-muted rounded text-xs">
            <span className="font-medium">Recruiter: </span>
            {job.recruiterNotes}
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>Applied {new Date(job.dateApplied || job.dateAdded).toLocaleDateString()}</span>
          </div>
          
          {job.lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              Updated {new Date(job.lastUpdated).toLocaleDateString()}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}