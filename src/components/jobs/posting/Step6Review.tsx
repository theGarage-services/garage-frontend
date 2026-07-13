import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import {
  CheckCircle,
  Building2,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  Save,
  Send,
  Check
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JobData } from '../../../api/jobPosts';
import { candidateProfileService } from '../../../api/candidateProfile';
import { companyService } from '../../../api/companies';
import { authService } from '../../../api/auth';
import { useState, useEffect } from 'react';

// Extracted components to reduce cognitive complexity
function JobPreview({ jobData }: { readonly jobData: JobData }) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-medium text-gray-900 mb-1">{jobData.title || 'Job Title'}</h3>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {jobData.department || 'Department'}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {jobData.location || 'Location'}
            </div>
            <div className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {jobData.salaryMin && jobData.salaryMax
                ? `$${jobData.salaryMin} - $${jobData.salaryMax} ${jobData.currency}`
                : 'Salary Range'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-800">{jobData.employmentType}</Badge>
            <Badge className="bg-green-100 text-green-800">{jobData.workArrangement}</Badge>
            {jobData.isUrgent && <Badge className="bg-red-100 text-red-800">Urgent</Badge>}
          </div>
        </div>
      </div>

      <div className="prose max-w-none">
        {jobData.summary && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700">{jobData.summary}</p>
          </div>
        )}

        {jobData.description && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-gray-700 whitespace-pre-line">{jobData.description}</p>
          </div>
        )}

        {(jobData.videoPrompts || []).length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Video Prompts</h4>
            <ul className="space-y-2">
              {jobData.videoPrompts.map((prompt, index) => (
                <li key={prompt.id ?? prompt.order} className="flex items-start gap-2 text-gray-700">
                  <span className="font-medium text-gray-900 min-w-[1.5rem]">{index + 1}.</span>
                  <span>
                    {prompt.questionText || <span className="italic text-gray-400">Empty prompt</span>}
                    <span className="text-xs text-gray-500 ml-2">
                      ({prompt.maxDurationSeconds / 60} min max)
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}

function TargetingSummary({ 
  jobData, 
  candidateCount, 
  isLoadingCount 
}: Readonly<{ 
  readonly jobData: JobData; 
  candidateCount: number; 
  isLoadingCount: boolean;
}>) {
  const totalRounds = Object.values(jobData.interviewRounds).reduce((sum, count) => sum + (count || 0), 0);
  
  return (
    <Card className="p-6">
      <h3 className="font-medium text-gray-900 mb-4">Targeting Summary</h3>
      
      {/* Targeting Mode */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Targeting Mode:</span>
          <Badge className={jobData.targetingMode === 'recommended' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}>
            {jobData.targetingMode === 'recommended' ? 'AI Recommended' : 'Manual Selection'}
          </Badge>
        </div>
        {jobData.targetingMode === 'recommended' && (
          <div className="text-sm text-gray-600">
            AI analyzed your job posting and recommended queues based on industry and level predictions.
          </div>
        )}
        {jobData.targetingMode === 'manual' && (
          <div className="text-sm text-gray-600">
            You manually adjusted industry and level predictions to fine-tune queue targeting.
          </div>
        )}
      </div>

      {/* AI Predictions / Manual Adjustments */}
      {(jobData.predicted_industry || jobData.predicted_level) && (
        <div className="mb-4 pb-4 border-b">
          <div className="text-sm font-medium text-gray-900 mb-2">
            {jobData.targetingMode === 'recommended' ? 'AI Predictions' : 'Manual Adjustments'}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            {jobData.predicted_industry && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Industry:</span>
                <span className="font-medium text-gray-900">{jobData.predicted_industry}</span>
              </div>
            )}
            {jobData.predicted_level && (
              <div className="flex items-center gap-1">
                <span className="text-gray-600">Level:</span>
                <span className="font-medium text-gray-900">{jobData.predicted_level}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidate Reach */}
      <div className="mb-4 pb-4 border-b">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-5 h-5 text-[#ff6b35]" />
          <span className="font-medium">
            {isLoadingCount ? 'Loading...' : candidateCount.toLocaleString()}
          </span>
          <span className="text-gray-600">
            {jobData.predicted_industry || jobData.industry ? 
              `${jobData.predicted_industry || jobData.industry} candidates match this job` :
              'No industry specified - job will be visible to all job seekers'
            }
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(jobData.predicted_industry || jobData.industry) && (jobData.predicted_level || jobData.experienceLevel) ? (
            <>
              <Badge className="bg-blue-100 text-blue-800">
                {jobData.predicted_industry || jobData.industry}
              </Badge>
              <Badge className="bg-green-100 text-green-800">
                {jobData.predicted_level || jobData.experienceLevel}
              </Badge>
            </>
          ) : (
            <span className="text-sm text-gray-500">
              No industry or experience level specified - job will be visible to all job seekers
            </span>
          )}
        </div>
      </div>

      {/* Interview Process */}
      {totalRounds > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-[#ff6b35]" />
            <span className="font-medium">{totalRounds}</span>
            <span className="text-gray-600">interview rounds configured for targeted queues</span>
          </div>
          <InterviewRoundsDisplay interviewRounds={jobData.interviewRounds} />
        </div>
      )}
    </Card>
  );
}

function InterviewRoundsDisplay({ interviewRounds }: { readonly interviewRounds: Record<string, number> }) {
  const INTERVIEW_LABELS: Record<string, { icon: string; label: string }> = {
    'phone-screening': { icon: '📞', label: 'Phone Screening' },
    'technical-interview': { icon: '💻', label: 'Technical Interview' },
    'final-interview': { icon: '🎯', label: 'Final Interview' }
  };
  
  return (
    <div className="space-y-2">
      {Object.entries(interviewRounds).map(([stageId, count]) => {
        if (count === 0) return null;
        const config = INTERVIEW_LABELS[stageId];
        return (
          <Badge key={stageId} className="bg-purple-100 text-purple-800 mr-2">
            {config?.icon} {config?.label} ({count} round{count > 1 ? 's' : ''})
          </Badge>
        );
      })}
    </div>
  );
}

function PublishingOptions({ 
  user, 
  isSubmitting, 
  onSubmit 
}: Readonly<{ 
  readonly user: any; 
  isSubmitting: boolean; 
  onSubmit: (action: 'draft' | 'publish') => void;
}>) {
  return (
    <Card className="p-6 w-full">
      <h3 className="font-medium text-gray-900 mb-4">Publishing Options</h3>
      <SubmissionOptions
        user={user}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </Card>
  );
}

function SubmissionOptions({
  user,
  isSubmitting,
  onSubmit
}: Readonly<{
  readonly user: any;
  isSubmitting: boolean;
  onSubmit: (action: 'draft' | 'publish') => void;
}>) {
  const [resolvedCompanyType, setResolvedCompanyType] = useState<string | null>(null);
  const [resolvedProfile, setResolvedProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Determine if user needs approval based on CompanyMember role and company type
  const companyType =
    resolvedProfile?.recruiter_profile_data?.company_type ||
    resolvedCompanyType ||
    user?.company_type ||
    user?.company?.company_type ||
    user?.company_memberships?.[0]?.company_type;

  useEffect(() => {
    let cancelled = false;

    const resolveCompany = async () => {
      let profile: any = null;

      try {
        // Fetch current profile as the source of truth for recruiter company type
        profile = (await authService.getCurrentUser()) as any;
        if (profile?.recruiter_profile_data?.company_type && !cancelled) {
          setResolvedProfile(profile);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }

      try {
        // Fallback to company endpoint if profile doesn't provide a company type
        if (!profile?.recruiter_profile_data?.company_type) {
          const company = await companyService.getMyCompany();
          if (company?.company_type && !cancelled) {
            setResolvedCompanyType(company.company_type);
          }
        }
      } catch (error) {
        console.error('Failed to fetch company:', error);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    resolveCompany();

    return () => {
      cancelled = true;
    };
  }, []);

  const membership =
    resolvedProfile?.company_memberships?.[0] ||
    user?.company_memberships?.[0];

  const needsApproval = () => {
    // Solo recruiters always publish directly
    if (companyType === 'solo') {
      return false;
    }

    // CompanyMember users
    if (membership) {
      // CompanyMember with role="recruiter" needs approval
      if (membership.role === 'recruiter') {
        return true;
      }
      // CompanyMember with role="owner" or role="team-lead" can publish without approval
      if (membership.role === 'owner' || membership.role === 'team-lead') {
        return false;
      }
      // Other roles (admin, viewer) default to needing approval
      return true;
    }

    // Default to needing approval for safety
    return true;
  };

  const requiresApproval = needsApproval();
  const effectiveRole = companyType === 'solo' ? 'solo recruiter' : membership?.role || 'recruiter';

  return (
    <div className="space-y-3 w-full">
      {isLoading ? (
        <Alert className="border-gray-200 bg-gray-50">
          <AlertDescription className="text-gray-700">
            Determining publishing permissions...
          </AlertDescription>
        </Alert>
      ) : requiresApproval ? (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-blue-700">
            <strong>Note:</strong> As a {effectiveRole}, your job posting will be submitted for approval.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-200 bg-green-50">
          <Check className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-700">
            <strong>Direct Publishing Enabled:</strong> You have permission to publish jobs immediately.
          </AlertDescription>
        </Alert>
      )}
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Button onClick={() => onSubmit('draft')} variant="outline" className="flex-1" disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
        <Button
          onClick={() => onSubmit('publish')}
          className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              Submitting...
            </div>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {isLoading ? 'Loading...' : requiresApproval ? 'Submit for Approval' : 'Publish Job'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

interface Queue {
  id: string;
  name: string;
  icon: LucideIcon;
  color: string;
  members: number;
}

interface Step6ReviewProps {
  jobData: JobData;
  availableQueues: Queue[];
  getQueueColor: (color: string) => string;
  user: any;
  isSubmitting: boolean;
  onSubmit: (action: 'draft' | 'publish') => void;
}

export function Step6Review({
  jobData,
  user,
  isSubmitting,
  onSubmit
}: Readonly<Omit<Step6ReviewProps, 'getQueueColor' | 'availableQueues'>>) {
  // State for candidate counts
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);

  // Fetch candidate count based on job's industry and experience level
  useEffect(() => {
    const fetchCandidateCount = async () => {
      if (!jobData.industry && !jobData.experienceLevel) {
        setCandidateCount(0);
        return;
      }

      setIsLoadingCount(true);
      try {
        // Use predicted values if available, otherwise use manual values
        const industry = jobData.predicted_industry || jobData.industry;
        const experienceLevel = jobData.predicted_level || jobData.experienceLevel;
        
        if (industry || experienceLevel) {
          const result = await candidateProfileService.getCandidateCountByIndustryLevel(
            industry,
            experienceLevel
          );
          setCandidateCount(result.count);
        } else {
          setCandidateCount(0);
        }
      } catch (error) {
        console.error('Failed to fetch candidate count:', error);
        setCandidateCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchCandidateCount();
  }, [jobData.industry, jobData.experienceLevel, jobData.predicted_industry, jobData.predicted_level]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Review & Publish</h2>
          <p className="text-gray-600">Review your job posting before publishing</p>
        </div>
      </div>

      <JobPreview jobData={jobData} />
      <TargetingSummary 
        jobData={jobData} 
        candidateCount={candidateCount} 
        isLoadingCount={isLoadingCount} 
      />
      <PublishingOptions 
        user={user} 
        isSubmitting={isSubmitting} 
        onSubmit={onSubmit} 
      />
    </div>
  );
}
