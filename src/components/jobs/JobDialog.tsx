import { useState, useEffect } from 'react';
import { JobApplication } from '../../types/job';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ExternalLink, Calendar, MapPin, DollarSign, Briefcase, FileText, User, X } from 'lucide-react';

interface JobDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: (job: Partial<JobApplication>) => void;
  job?: JobApplication | null;
  initialStatus?: JobApplication['status'];
  onNavigateToJobDetails?: (job: any) => void;
  onNavigate?: (view: string) => void;
}

const statusLabels: Record<string, string> = {
  'consider': 'Consider',
  'applied': 'Applied',
  'interviews': 'Interviews',
  'offers': 'Offers',
  'hired': 'Hired',
  'rejected': 'Rejected',
  'withdrawn': 'Withdrawn',
};

const statusColors: Record<string, string> = {
  'consider': 'bg-yellow-100 text-yellow-800',
  'applied': 'bg-blue-100 text-blue-800',
  'interviews': 'bg-purple-100 text-purple-800',
  'offers': 'bg-emerald-100 text-emerald-800',
  'hired': 'bg-green-100 text-green-800',
  'rejected': 'bg-red-100 text-red-800',
  'withdrawn': 'bg-gray-100 text-gray-800',
};

export function JobDialog({ open, onClose, job, onNavigateToJobDetails, onNavigate }: Readonly<JobDialogProps>) {
  const [jobData, setJobData] = useState<JobApplication | null>(null);

  useEffect(() => {
    setJobData(job || null);
  }, [job]);

  if (!jobData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Job Application Details</DialogTitle>
          <DialogDescription>
            View the details of your job application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Job Title & Status */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{jobData.title}</h3>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Briefcase className="w-4 h-4" />
                <span>{jobData.company}</span>
              </div>
            </div>
            <Badge className={statusColors[jobData.status] || 'bg-gray-100'}>
              {statusLabels[jobData.status] || jobData.status}
            </Badge>
          </div>

          {/* Location & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            {jobData.location && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{jobData.location}</span>
              </div>
            )}
            {jobData.salary && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <DollarSign className="w-4 h-4" />
                <span>{jobData.salary}</span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Applied {jobData.dateApplied ? new Date(jobData.dateApplied).toLocaleDateString() : 'N/A'}</span>
            </div>
            {jobData.lastUpdated && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Updated {new Date(jobData.lastUpdated).toLocaleDateString()}</span>
              </div>
            )}
          </div>

          {/* Your Notes */}
          {jobData.notes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4" />
                <span>Your Notes</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {jobData.notes}
              </p>
            </div>
          )}

          {/* Recruiter Notes */}
          {jobData.recruiterNotes && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium">
                <User className="w-4 h-4" />
                <span>Recruiter Notes</span>
              </div>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {jobData.recruiterNotes}
              </p>
            </div>
          )}

          {/* Interview Info */}
          {jobData.interviewDate && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700">
                <Calendar className="w-4 h-4" />
                <span>Interview Scheduled</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {new Date(jobData.interviewDate).toLocaleDateString()} {jobData.interviewType && `• ${jobData.interviewType}`}
              </p>
              {jobData.interviewNotes && (
                <p className="text-sm text-muted-foreground bg-green-50 p-3 rounded-lg mt-1">
                  {jobData.interviewNotes}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
            <div className="flex flex-wrap gap-2">
              {onNavigateToJobDetails && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onNavigateToJobDetails(jobData);
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Full JD
                </Button>
              )}
              {jobData.company && onNavigate && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onNavigate('company-profile');
                    onClose();
                  }}
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Company
                </Button>
              )}
            </div>
            <Button type="button" variant="default" onClick={onClose} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
