import { useState, useEffect } from 'react';
import { JobApplication } from '../../types/job';
import { JobCard } from '../jobs/JobCard';
import { VideoApplicationModal } from '../jobs/applications/VideoApplicationModal';
import { Plus, Mail } from 'lucide-react';
import { candidateProfileService } from '../../api/candidateProfile';
import { toast } from 'sonner';

interface ConsiderationRequest {
  id: number;
  status: string;
  recruiter: { id: number; username: string; full_name: string };
  job: number;
  message: string;
  match_score: number | null;
  created_at: string;
}

interface KanbanColumnProps {
  title: string;
  status: JobApplication['status'];
  jobs: JobApplication[];
  onEditJob: (job: JobApplication) => void;
  onNavigateToJobDetails?: (job: JobApplication) => void;
  onRefresh?: () => void;
}

export function KanbanColumn({ title, status, jobs, onEditJob, onNavigateToJobDetails, onRefresh }: Readonly<KanbanColumnProps>) {
  const [considerationRequests, setConsiderationRequests] = useState<ConsiderationRequest[]>([]);
  const [activeVideoFlow, setActiveVideoFlow] = useState<{ requestId: number; jobId: number } | null>(null);

  // Fetch all consideration requests for this candidate
  useEffect(() => {
    const fetchConsiderations = async () => {
      try {
        const result = await candidateProfileService.getMyConsiderationRequests();
        if (result.success) {
          setConsiderationRequests(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch consideration requests:', error);
      }
    };
    fetchConsiderations();
  }, []);

  // Map job ID -> consideration request (prefer pending status)
  const getConsiderationForJob = (jobId: string): ConsiderationRequest | undefined => {
    const jobIdNum = Number.parseInt(jobId, 10);
    const requests = considerationRequests.filter(r => r.job === jobIdNum);
    // Prefer pending, then most recent
    const pending = requests.find(r => r.status === 'pending');
    if (pending) {
      return pending;
    }
    const sortedRequests = [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return sortedRequests[0];
  };

  // Count pending considerations for this column's jobs
  const pendingConsiderations = jobs.filter(job => {
    const req = getConsiderationForJob(job.id);
    return req?.status === 'pending';
  }).length;

  const getColumnColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'consider': return 'bg-yellow-50 border-yellow-200';
      case 'applied': return 'bg-blue-50 border-blue-200';
      case 'interviews': return 'bg-green-50 border-green-200';
      case 'offers': return 'bg-emerald-50 border-emerald-200';
      case 'hired': return 'bg-purple-50 border-purple-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'withdrawn': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border-2 border-dashed p-3 min-h-[450px] w-64 flex-shrink-0 ${getColumnColor(status)}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{title}</h3>
          {pendingConsiderations > 0 && (
            <span className="flex items-center gap-1 text-xs bg-[#ff6b35] text-white px-2 py-0.5 rounded-full">
              <Mail className="w-3 h-3" />
              {pendingConsiderations} new
            </span>
          )}
        </div>
        <span className="text-sm text-muted-foreground bg-white px-2 py-1 rounded">
          {jobs.length}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            onEdit={onEditJob}
            onNavigateToJobDetails={onNavigateToJobDetails}
            considerationRequest={getConsiderationForJob(job.id)}
            onAcceptConsideration={async (requestId) => {
              try {
                const result = await candidateProfileService.acceptConsiderationRequest(requestId);
                if (result.requires_video_prompts) {
                  const jobId = getConsiderationForJob(job.id)?.job ?? 0;
                  setActiveVideoFlow({ requestId, jobId });
                  return;
                }
                if (result.success) {
                  toast.success('Consideration accepted!');
                  onRefresh?.();
                } else {
                  toast.error(result.error || 'Failed to accept consideration');
                }
              } catch (error) {
                console.error('Failed to accept consideration:', error);
                toast.error('Failed to accept consideration');
              }
            }}
          />
        ))}
      </div>
      
      {jobs.length === 0 && (
        <div className="flex items-center justify-center h-24 text-gray-400">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 rounded-full flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <p className="text-xs">Jobs appear here automatically</p>
          </div>
        </div>
      )}

      {activeVideoFlow && activeVideoFlow.jobId > 0 && (
        <VideoApplicationModal
          jobId={activeVideoFlow.jobId}
          submitLabel="Submit & Accept Interest"
          onComplete={async (responses) => {
            const responseIds = responses.map((r) => Number(r.id)).filter(Boolean);
            try {
              const result = await candidateProfileService.acceptConsiderationRequest(
                activeVideoFlow.requestId,
                '',
                responseIds
              );
              if (result.success) {
                toast.success('Consideration accepted!');
                setActiveVideoFlow(null);
                onRefresh?.();
              } else {
                toast.error(result.error || 'Failed to accept consideration');
              }
            } catch (error) {
              console.error('Failed to accept consideration:', error);
              toast.error('Failed to accept consideration');
            }
          }}
          onCancel={() => setActiveVideoFlow(null)}
        />
      )}
    </div>
  );
}