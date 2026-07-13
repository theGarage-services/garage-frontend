import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ChevronDown, MapPin, Briefcase, DollarSign, Building2, Clock, Share2, Heart, Zap, CheckCircle, Users, Star, FileText, X, Crown, BarChart3, Filter, Check, Shield, ShieldCheck, UserMinus, Building } from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { MyQueues } from '../queue/MyQueues';
import { candidateProfileService, type FilteredJobPost, type SystemicRejectionSummary } from '@/api/candidateProfile';
import { declineConsideration } from '@/api/chat';
import { flagJobPostAsFraud } from '@/api/fraud';
import { buildProfileImageUrl } from '@/api/recruiterProfile';
import { FlagFraudDialog } from '../common/FlagFraudDialog';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { VideoApplicationModal } from '../jobs/applications/VideoApplicationModal';

type ApplicationMethod = 'manual' | 'quick-apply' | 'recruiter-consideration';
type ApplicationStatus = 'consider' | 'applied' | 'interviews' | 'offers' | 'hired' | 'rejected' | 'withdrawn';

interface Recruiter {
  id: string;
  name: string;
  title: string;
  company: string;
  avatar: string;
  linkedinUrl: string;
  yearsExperience: number;
  contactInfo?: {
    email: string;
    phone: string;
  };
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  rank: string;
  postedTime: string;
  logo?: string;
  isFavorited: boolean;
  description: string;
  requirements: string[];
  benefits: string[];
  companySize: string;
  companyIndustry: string;
  workModel: string;
  vacancyType: string;
  experienceLevel: string;
  recruiter: Recruiter | null;
  // Application tracking fields
  applicationMethod?: ApplicationMethod;
  isApplied?: boolean;
  isSaved?: boolean;
  hasApplied?: boolean;
  status?: ApplicationStatus;
  dateApplied?: string;
  companyRating?: number;
  matchPercentage?: number;
  scoreBreakdown?: Record<string, any>;
  greenzoneStatus?: string | null;
  greenzoneReason?: string | null;
  // Consideration request fields
  hasPendingConsideration?: boolean;
  pendingConsiderationId?: number | null;
  pendingConsiderationMessage?: string | null;
}

const normalizeApplicationStatus = (status?: string | null): ApplicationStatus => {
  const validStatuses: ApplicationStatus[] = ['consider', 'applied', 'interviews', 'offers', 'hired', 'rejected', 'withdrawn'];
  return validStatuses.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : 'consider';
};

interface TrackedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  applicationMethod: ApplicationMethod;
  dateApplied: string;
  status: ApplicationStatus;
  notes?: string;
  recruiterNotes?: string;
  logo?: string;
  recruiter?: any;
  fullJobData?: any;
}

interface HomepageProps {
  onNavigate: (view: 'homepage' | 'tracker' | 'profile' | 'notifications' | 'settings' | 'support' | 'report-issue' | 'queue-detail' | 'my-queues' | 'queues') => void;
  onNavigateToJobDetails?: (job: any) => void;
  onNavigateToQueueDetail?: (queue: any) => void;
  onJobApplication: (job: any, method: 'manual' | 'quick-apply' | 'recruiter-consideration') => void;
  trackedJobs: TrackedJob[];
  user?: any;
  onLogout?: () => void;
  autoMatchEnabled: boolean;
  onToggleautoMatch: (enabled: boolean) => void;
}

const formatMatchScore = (score: number | undefined | null): string => {
  if (score == null || Number.isNaN(score)) return '0';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};

const GREENZONE_STYLES: Record<string, { label: string; className: string }> = {
  confirmed_in: { label: 'Strong Match', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  contested: { label: 'Competitive', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed_out: { label: 'Lower Fit', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

function updateJobById(jobs: Job[], jobId: string, updater: (job: Job) => Job): Job[] {
  return jobs.map(j => (j.id === jobId ? updater(j) : j));
}

function YourStandingWidget({ summary }: Readonly<{ summary: SystemicRejectionSummary | null }>) {
  if (!summary || summary.total_decisions === 0) return null;
  const pluralize = (count: number, noun: string) => `${count} ${noun}${count === 1 ? '' : 's'}`;
  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-white border-blue-100">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Standing</h3>
        <p className="text-sm text-gray-600 mb-3">
          {summary.confirmed_in_count > 0 && `Strongly matched with ${pluralize(summary.confirmed_in_count, 'role')}. `}
          {summary.contested_count > 0 && `In the competitive zone for ${pluralize(summary.contested_count, 'role')}. `}
          {summary.confirmed_out_count > 0 && `Lower fit for ${pluralize(summary.confirmed_out_count, 'role')}. `}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{summary.confirmed_in_count} Strong Match</Badge>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">{summary.contested_count} Competitive</Badge>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200">{summary.confirmed_out_count} Lower Fit</Badge>
        </div>
        {summary.is_flagged && (
          <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">
            Your lower-fit rate is higher than the platform average. This may indicate a pattern worth reviewing.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function Homepage({ onNavigate, onNavigateToJobDetails, onJobApplication, trackedJobs, user, onLogout, autoMatchEnabled }: Readonly<HomepageProps>) {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('All Jobs');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  
  // API-filtered jobs state
  const [apiJobs, setApiJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [jobsError, setJobsError] = useState<string | null>(null);
  const [standingSummary, setStandingSummary] = useState<SystemicRejectionSummary | null>(null);
  const [candidateProfile, setCandidateProfile] = useState<{
    industry: string;
    exp_level: string;
    preferred_locations: string[] | null;
    preferred_salary_ranges: string[] | null;
    preferred_job_types: string[] | null;
    preferred_work_arrangements: string[] | null;
    queue_buckets?: Array<{ industry: string; level: string }>;
  } | null>(null);
  
  // Filter states
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedSalaryRanges, setSelectedSalaryRanges] = useState<string[]>([]);
  const [selectedCompanySizes, setSelectedCompanySizes] = useState<string[]>([]);
  const [selectedExperienceLevels, setSelectedExperienceLevels] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<string[]>([]);

  // Transform API job to frontend Job format
  const transformApiJobToJob = useCallback((apiJob: FilteredJobPost): Job => {
    const salaryDisplay = apiJob.salary_min && apiJob.salary_max
      ? `$${Number.parseInt(apiJob.salary_min).toLocaleString()} - $${Number.parseInt(apiJob.salary_max).toLocaleString()}`
      : apiJob.salary_min
        ? `From $${Number.parseInt(apiJob.salary_min).toLocaleString()}`
        : apiJob.salary_max
          ? `Up to $${Number.parseInt(apiJob.salary_max).toLocaleString()}`
          : 'Salary not specified';

    // Map employment_type to display format
    const typeMap: Record<string, string> = {
      'full-time': 'FT/Permanent',
      'part-time': 'PT/Permanent',
      'contract': 'Contract',
      'internship': 'Internship',
    };

    // Map work_arrangement to workModel
    const workModelMap: Record<string, string> = {
      'remote': 'Remote',
      'hybrid': 'Hybrid',
      'onsite': 'On-site',
    };

    const vacancyTypeMap: Record<string, string> = {
      'current': 'Current Vacancy',
      'future': 'Future Position',
    };

    return {
      id: apiJob.id.toString(),
      title: apiJob.title,
      company: apiJob.company_name || apiJob.company || 'Unknown',
      location: apiJob.location,
      salary: salaryDisplay,
      type: typeMap[apiJob.employment_type] || apiJob.employment_type,
      rank: 'Matched',
      postedTime: apiJob.published_at
        ? `Posted ${Math.ceil((Date.now() - new Date(apiJob.published_at).getTime()) / (1000 * 60 * 60 * 24))} days ago`
        : 'Recently posted',
      logo: apiJob.company_logo ? buildProfileImageUrl(apiJob.company_logo) : undefined,
      isFavorited: false,
      description: apiJob.summary || apiJob.description || '',
      requirements: apiJob.requirements ? apiJob.requirements.split('\n').filter(r => r.trim()) : [],
      benefits: apiJob.benefits ? apiJob.benefits.split('\n').filter(b => b.trim()) : [],
      companySize: apiJob.company_size || 'Unknown',
      companyIndustry: apiJob.industry || 'Unknown',
      workModel: workModelMap[apiJob.work_arrangement] || apiJob.work_arrangement,
      vacancyType: vacancyTypeMap[apiJob.vacancy_type] || apiJob.vacancy_type || 'Current Vacancy',
      experienceLevel: apiJob.experience_level || 'Unknown',
      recruiter: null,
      isApplied: apiJob.has_applied || false,
      isSaved: apiJob.is_saved || false,
      hasApplied: apiJob.has_applied || false,
      status: normalizeApplicationStatus(apiJob.application_status),
      dateApplied: apiJob.date_applied ?? undefined,
      matchPercentage: apiJob.match_percentage ?? undefined,
      scoreBreakdown: apiJob.score_breakdown || undefined,
      greenzoneStatus: apiJob.greenzone_status ?? null,
      greenzoneReason: apiJob.greenzone_reason ?? null,
      hasPendingConsideration: apiJob.has_pending_consideration || false,
      pendingConsiderationId: apiJob.pending_consideration_id || null,
      pendingConsiderationMessage: apiJob.pending_consideration_message || null,
      applicationMethod: apiJob.application_method === 'recruiter-consideration' ? 'recruiter-consideration' : 'quick-apply',
    };
  }, []);

  // Fetch filtered jobs from API
  useEffect(() => {
    const fetchFilteredJobs = async () => {
      setJobsLoading(true);
      setJobsError(null);
      console.log(`[Homepage] Starting fetch for filter: ${selectedFilter}`);

      try {
        // Map filter to category
        const categoryMap: Record<string, 'available' | 'auto-matched' | 'manual' | 'saved'> = {
          'All Jobs': 'available',
          'Auto-Matched': 'auto-matched',
          'Manual Selections': 'manual',
          'Saved Jobs': 'saved'
        };
        const category = categoryMap[selectedFilter] || 'available';
        console.log(`[Homepage] Mapped filter '${selectedFilter}' to category '${category}'`);

        console.log(`[Homepage] Calling getQueueBasedJobs with category=${category}, limit=50, offset=0`);
        const response = await candidateProfileService.getQueueBasedJobs(category, { limit: 50, offset: 0 });

        if (response?.success) {
          // Single-pass transform: all scoring fields are already mapped inside transformApiJobToJob
          const transformedJobs = response.results.map(transformApiJobToJob);

          setApiJobs(transformedJobs);

          // Load standing summary in parallel (best-effort; failures shouldn't block the job list)
          candidateProfileService.getSystemicRejectionSummary().then((summaryResponse) => {
            if (summaryResponse?.success) {
              setStandingSummary(summaryResponse.summary);
            }
          }).catch((err) => {
            console.error('[Homepage] Failed to load standing summary:', err);
          });

          setCandidateProfile({
            ...response.candidate_profile,
            preferred_locations: null,
            preferred_salary_ranges: null,
            preferred_job_types: null,
            preferred_work_arrangements: null
          });
          
          console.log(`[Homepage] State updated successfully with ${transformedJobs.length} jobs`);
        } else {
          console.error(`[Homepage] Response not successful:`, response);
          setJobsError('Failed to fetch jobs - invalid response');
        }
      } catch (err: any) {
        console.error('[Homepage] Exception during fetch:', {
          message: err.message,
          stack: err.stack,
          error: err
        });
        setJobsError(err.message || 'Failed to fetch jobs. Please try again.');
      } finally {
        setJobsLoading(false);
        console.log(`[Homepage] Fetch complete, loading=${false}`);
      }
    };

    fetchFilteredJobs();
  }, [selectedFilter, transformApiJobToJob]);

  const selectedJob = selectedJobId ? apiJobs.find(job => job.id === selectedJobId) : null;

  // Check if job is already tracked/applied
  const isJobTracked = (jobId: string) => {
    return trackedJobs.some(trackedJob => trackedJob.id === jobId);
  };

  // Track pending consideration requests for selected job
  const [selectedJobConsideration, setSelectedJobConsideration] = useState<{
    id: number;
    status: string;
    message: string;
  } | null>(null);
  const [considerationVideoFlowId, setConsiderationVideoFlowId] = useState<number | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const fetchConsideration = async () => {
      if (!selectedJob) {
        setSelectedJobConsideration(null);
        return;
      }

      // If job data already has a pending consideration, use it directly
      if (selectedJob.hasPendingConsideration && selectedJob.pendingConsiderationId) {
        setSelectedJobConsideration({
          id: selectedJob.pendingConsiderationId,
          status: 'pending',
          message: selectedJob.pendingConsiderationMessage || ''
        });
        return;
      }

      // Fallback: fetch from API
      try {
        const result = await candidateProfileService.getReceivedConsiderationRequestsForJob(Number(selectedJob.id));
        if (result.success && result.data.length > 0) {
          // Prioritize pending (actionable), then accepted (applied), then any other
          const consideration = result.data.find((c: any) => c.status === 'pending')
            || result.data.find((c: any) => c.status === 'accepted')
            || result.data[0];
          setSelectedJobConsideration({
            id: consideration.id,
            status: consideration.status,
            message: consideration.message
          });
        } else {
          setSelectedJobConsideration(null);
        }
      } catch (err) {
        console.error('Error fetching consideration requests:', err);
        setSelectedJobConsideration(null);
      }
    };
    fetchConsideration();
  }, [selectedJob?.id]);

  const acceptPendingConsideration = async (job: Job) => {
    if (!selectedJobConsideration) return;
    try {
      const result = await candidateProfileService.acceptConsiderationRequest(
        selectedJobConsideration.id,
        'Thank you for your interest! I would like to proceed.'
      );
      if (result.requires_video_prompts) {
        setConsiderationVideoFlowId(selectedJobConsideration.id);
        setShowVideoModal(true);
        return;
      }
      if (result.success) {
        setApiJobs(prev => updateJobById(prev, job.id, j => ({
          ...j,
          hasApplied: true,
          isApplied: true,
          applicationMethod: 'recruiter-consideration',
          hasPendingConsideration: false,
          pendingConsiderationId: null,
          pendingConsiderationMessage: null
        })));
        setSelectedJobConsideration(null);
        alert('Interest accepted! Your profile has been shared with the recruiter.');
      } else {
        alert(`Failed to accept interest: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Failed to accept interest:', err);
      alert('Failed to accept interest. Please try again.');
    }
  };

  const performRegularQuickApply = async (job: Job) => {
    try {
      const result = await candidateProfileService.quickApplyToJob(Number(job.id), `Quick apply for ${job.title}`);
      if (result.success) {
        onJobApplication(job, 'quick-apply');
        setApiJobs(prev => updateJobById(prev, job.id, j => ({
          ...j,
          hasApplied: true,
          isApplied: true,
          applicationMethod: 'quick-apply'
        })));
        alert('Application submitted successfully!');
      } else {
        alert(`Failed to apply: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Failed to apply:', err);
      alert('Failed to apply. Please try again.');
    }
  };

  const handleQuickApply = async (job: Job) => {
    if (isJobTracked(job.id)) return;
    if (selectedJobConsideration?.status === 'pending') {
      await acceptPendingConsideration(job);
    } else {
      await performRegularQuickApply(job);
    }
  };

  const handleAcceptInterest = async () => {
    if (!selectedJob || !selectedJobConsideration) return;
    await handleQuickApply(selectedJob);
  };

  const handleCompleteConsiderationVideo = async (responses: any[]) => {
    if (!selectedJob || !considerationVideoFlowId) return;
    const responseIds = responses.map((r) => Number(r.id)).filter(Boolean);
    try {
      const result = await candidateProfileService.acceptConsiderationRequest(
        considerationVideoFlowId,
        'Thank you for your interest! I would like to proceed.',
        responseIds
      );
      if (result.success) {
        setApiJobs(prev => updateJobById(prev, selectedJob.id, j => ({
          ...j,
          hasApplied: true,
          isApplied: true,
          applicationMethod: 'recruiter-consideration',
          hasPendingConsideration: false,
          pendingConsiderationId: null,
          pendingConsiderationMessage: null
        })));
        setSelectedJobConsideration(null);
        setConsiderationVideoFlowId(null);
        setShowVideoModal(false);
        alert('Interest accepted! Your profile has been shared with the recruiter.');
      } else {
        alert(`Failed to accept interest: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Failed to accept interest:', err);
      alert('Failed to accept interest. Please try again.');
    }
  };

  const handleRejectInvitation = async () => {
    if (!selectedJob || !selectedJobConsideration) return;
    try {
      await declineConsideration(selectedJobConsideration.id, 'Thank you, but I am not interested at this time.');
      setSelectedJobConsideration(null);
      // Update the job in state to remove pending consideration
      setApiJobs(prev => updateJobById(prev, selectedJob.id, job => ({
        ...job,
        hasPendingConsideration: false,
        pendingConsiderationId: null,
        pendingConsiderationMessage: null
      })));
      alert('Invitation rejected.');
    } catch (err: any) {
      console.error('Failed to reject invitation:', err);
      alert('Failed to reject invitation. Please try again.');
    }
  };

  const handleWithdrawApplication = (_job: Job) => {
    // Remove from tracked jobs
    // Note: In real app, this would also remove from trackedJobs via parent component
  };

  const handleToggleSaveJob = async (job: Job) => {
    const jobId = Number.parseInt(job.id);
    const nextSaved = !job.isSaved;
    setApiJobs(prev => updateJobById(prev, job.id, j => ({ ...j, isSaved: nextSaved })));
    try {
      if (nextSaved) {
        await candidateProfileService.saveJob(jobId);
      } else {
        await candidateProfileService.unsaveJob(jobId);
      }
    } catch (error) {
      console.error('Failed to toggle save status:', error);
      setApiJobs(prev => updateJobById(prev, job.id, j => ({ ...j, isSaved: !nextSaved })));
      alert('Failed to update saved status. Please try again.');
    }
  };

  const handleFlagJobFraud = async (job: Job, reason: string) => {
    await flagJobPostAsFraud(job.id, reason);
    setApiJobs(prev => prev.filter(j => j.id !== job.id));
    if (selectedJobId === job.id) {
      setSelectedJobId(null);
    }
  };

  // Filter options derived from actual job data
  const filterOptions = {
    locations: Array.from(new Set(apiJobs.map(job => job.location))),
    jobTypes: Array.from(new Set(apiJobs.map(job => job.type))),
    salaryRanges: Array.from(new Set(apiJobs.map(job => job.salary))),
    companySizes: Array.from(new Set(apiJobs.map(job => job.companySize))),
    experienceLevels: Array.from(new Set(apiJobs.map(job => job.experienceLevel))),
    industries: Array.from(new Set(apiJobs.map(job => job.companyIndustry))),
    workModes: Array.from(new Set(apiJobs.map(job => job.workModel)))
  };

  // Filter jobs based on selected filters
  // Backend now handles category filtering, so we only apply UI filters here
  const displayedJobs = apiJobs.filter(job => {
    return (
      (selectedLocations.length === 0 || selectedLocations.includes(job.location)) &&
      (selectedJobTypes.length === 0 || selectedJobTypes.includes(job.type)) &&
      (selectedSalaryRanges.length === 0 || selectedSalaryRanges.includes(job.salary)) &&
      (selectedCompanySizes.length === 0 || selectedCompanySizes.includes(job.companySize)) &&
      (selectedExperienceLevels.length === 0 || selectedExperienceLevels.includes(job.experienceLevel)) &&
      (selectedIndustries.length === 0 || selectedIndustries.includes(job.companyIndustry)) &&
      (selectedWorkModes.length === 0 || selectedWorkModes.includes(job.workModel))
    );
  });

  const handleJobClick = (jobId: string) => {
    setSelectedJobId(jobId);
  };

  const handleFilterToggle = (filterType: string, value: string) => {
    switch (filterType) {
      case 'location':
        setSelectedLocations(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'jobType':
        setSelectedJobTypes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'salary':
        setSelectedSalaryRanges(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'companySize':
        setSelectedCompanySizes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'experience':
        setSelectedExperienceLevels(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'industry':
        setSelectedIndustries(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
      case 'workMode':
        setSelectedWorkModes(prev => 
          prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
        );
        break;
    }
  };

  const clearAllFilters = () => {
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedSalaryRanges([]);
    setSelectedCompanySizes([]);
    setSelectedExperienceLevels([]);
    setSelectedIndustries([]);
    setSelectedWorkModes([]);
  };

  const getFilterCount = () => {
    return selectedLocations.length + selectedJobTypes.length + selectedSalaryRanges.length + 
           selectedCompanySizes.length + selectedExperienceLevels.length + selectedIndustries.length + 
           selectedWorkModes.length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex">
      {/* Main Content */}
      <div className={`flex-1 min-w-0 transition-all duration-300 ${selectedJobId ? 'lg:mr-[800px]' : ''}`}>
        <AppHeader
          userRole="job-seeker"
          user={user}
          currentView="homepage"
          onNavigate={onNavigate as (view: string) => void}
          onLogout={onLogout || (() => {})}
        />

        {/* Enhanced Queue Leadership Section */}
        <div className="container mx-auto px-6 pt-8">
          <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 via-orange-50 to-blue-50 rounded-3xl border border-purple-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start sm:items-center gap-4 min-w-0">
                <div className="w-12 h-12 shrink-0 bg-gradient-to-r from-purple-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1 break-words">Queue Leadership & Analytics</h2>
                  <p className="text-gray-600 text-sm break-words">Click any queue below to view detailed analytics, leaderboards, and your competitive position</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-gradient-to-r from-purple-100 to-orange-100 text-purple-800 border border-purple-200">
                  <BarChart3 className="w-3 h-3 mr-1" />
                  Advanced Analytics
                </Badge>
                <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border border-yellow-200">
                  <Crown className="w-3 h-3 mr-1" />
                  Leaderboards
                </Badge>
              </div>
            </div>
          </div>

          <MyQueues
            onNavigate={(view) => onNavigate(view as any)}
            onQueueClick={(queue) => {
              navigate(`/queues/${encodeURIComponent(queue.id)}/${encodeURIComponent(queue.level)}`);
            }}
            className="mb-8"
            user={user}
          />
        </div>

        <div className="container mx-auto px-6 pb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="w-full lg:w-72 lg:sticky lg:top-24 h-fit">
              {/* Enhanced Filters Card */}
              <div className="bg-gradient-to-br from-white to-orange-50 rounded-3xl p-6 shadow-xl border border-orange-100/50 backdrop-blur-sm">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
                        <Filter className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">Smart Filters</h3>
                        <p className="text-sm text-gray-500">
                          {getFilterCount() > 0 ? `${getFilterCount()} filters applied` : 'Find your perfect match'}
                        </p>
                      </div>
                    </div>
                    {getFilterCount() > 0 && (
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-[#ff6b35] hover:text-[#e55a2b] transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Status Filter Buttons */}
                  <div className="space-y-2 mb-6">
                    {['All Jobs', 'Auto-Matched', 'Manual Selections', 'Saved Jobs'].map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setSelectedFilter(filter)}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                          selectedFilter === filter
                            ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg transform scale-[1.02]'
                            : 'bg-white/80 text-gray-700 hover:bg-orange-50 hover:text-[#ff6b35] border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{filter}</span>
                          {selectedFilter === filter && <Check className="w-4 h-4" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Advanced Filters */}
                <div className="space-y-4">
                  {/* Location Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#ff6b35]" />
                          <span className="text-sm font-medium text-gray-700">Location</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedLocations.length > 0 && (
                            <Badge className="bg-[#ff6b35] text-white text-xs px-2 py-1">
                              {selectedLocations.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-lg" side="right">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-3">Filter by Location</h4>
                        {filterOptions.locations.map((location) => (
                          <div key={location} className="flex items-center space-x-2">
                            <Checkbox
                              id={`location-${location}`}
                              checked={selectedLocations.includes(location)}
                              onCheckedChange={() => handleFilterToggle('location', location)}
                            />
                            <label
                              htmlFor={`location-${location}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {location}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Job Type Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-4 h-4 text-[#ff6b35]" />
                          <span className="text-sm font-medium text-gray-700">Job Type</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedJobTypes.length > 0 && (
                            <Badge className="bg-[#ff6b35] text-white text-xs px-2 py-1">
                              {selectedJobTypes.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-lg" side="right">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-3">Filter by Job Type</h4>
                        {filterOptions.jobTypes.map((type) => (
                          <div key={type} className="flex items-center space-x-2">
                            <Checkbox
                              id={`type-${type}`}
                              checked={selectedJobTypes.includes(type)}
                              onCheckedChange={() => handleFilterToggle('jobType', type)}
                            />
                            <label
                              htmlFor={`type-${type}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {type}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Salary Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-[#ff6b35]" />
                          <span className="text-sm font-medium text-gray-700">Salary Range</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedSalaryRanges.length > 0 && (
                            <Badge className="bg-[#ff6b35] text-white text-xs px-2 py-1">
                              {selectedSalaryRanges.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-lg" side="right">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-3">Filter by Salary</h4>
                        {filterOptions.salaryRanges.map((range) => (
                          <div key={range} className="flex items-center space-x-2">
                            <Checkbox
                              id={`salary-${range}`}
                              checked={selectedSalaryRanges.includes(range)}
                              onCheckedChange={() => handleFilterToggle('salary', range)}
                            />
                            <label
                              htmlFor={`salary-${range}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {range}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Company Size Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-[#ff6b35]" />
                          <span className="text-sm font-medium text-gray-700">Company Size</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedCompanySizes.length > 0 && (
                            <Badge className="bg-[#ff6b35] text-white text-xs px-2 py-1">
                              {selectedCompanySizes.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-lg" side="right">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-3">Filter by Company Size</h4>
                        {filterOptions.companySizes.map((size) => (
                          <div key={size} className="flex items-center space-x-2">
                            <Checkbox
                              id={`size-${size}`}
                              checked={selectedCompanySizes.includes(size)}
                              onCheckedChange={() => handleFilterToggle('companySize', size)}
                            />
                            <label
                              htmlFor={`size-${size}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {size}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  {/* Experience Level Filter */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center justify-between p-3 bg-white/80 rounded-xl border border-gray-200 hover:bg-orange-50 hover:border-orange-200 transition-colors">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-[#ff6b35]" />
                          <span className="text-sm font-medium text-gray-700">Experience</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedExperienceLevels.length > 0 && (
                            <Badge className="bg-[#ff6b35] text-white text-xs px-2 py-1">
                              {selectedExperienceLevels.length}
                            </Badge>
                          )}
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 bg-white border border-gray-200 shadow-lg" side="right">
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 mb-3">Filter by Experience Level</h4>
                        {filterOptions.experienceLevels.map((level) => (
                          <div key={level} className="flex items-center space-x-2">
                            <Checkbox
                              id={`experience-${level}`}
                              checked={selectedExperienceLevels.includes(level)}
                              onCheckedChange={() => handleFilterToggle('experience', level)}
                            />
                            <label
                              htmlFor={`experience-${level}`}
                              className="text-sm text-gray-700 cursor-pointer"
                            >
                              {level}
                            </label>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>


            </div>

            {/* Job Results */}
            <div className="flex-1">
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-semibold text-gray-900 break-words">
                      {selectedFilter === 'All Jobs' ? 'Available Jobs' : selectedFilter}
                    </h2>
                    <p className="text-gray-600 mt-1">{displayedJobs.length} opportunities found</p>
                  </div>
                  
                  {/* Smart Apply Status Indicator */}
                  <div className={`self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full border ${
                    autoMatchEnabled 
                      ? 'bg-green-50 border-green-200 text-green-700' 
                      : 'bg-gray-50 border-gray-200 text-gray-600'
                  }`}>
                    {autoMatchEnabled ? (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">Auto-Match Active</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span className="text-sm font-medium">Manual Only</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <YourStandingWidget summary={standingSummary} />

              {/* Loading State */}
              {jobsLoading && (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading jobs matching your preferences...</p>
                </div>
              )}
              
              {/* Error State */}
              {jobsError && (
                <div className="text-center py-12 bg-red-50 rounded-xl border border-red-200">
                  <p className="text-red-600 mb-2">Unable to load jobs</p>
                  <p className="text-red-500 text-sm mb-4">{jobsError}</p>
                  <Button 
                    onClick={() => globalThis.location.reload()}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Retry
                  </Button>
                </div>
              )}
              
              {/* Empty State */}
              {!jobsLoading && !jobsError && displayedJobs.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-600 mb-2">No jobs match your criteria</p>
                  {candidateProfile && (
                    <div className="text-sm text-gray-500 mt-2">
                      <p>Your profile: {candidateProfile.industry} • {candidateProfile.exp_level}</p>
                      <p className="mt-1">Try adjusting your filters or preferences</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Job List */}
              {!jobsLoading && !jobsError && displayedJobs.length > 0 && (
                <div className="space-y-4">
                  {displayedJobs.map((job) => (
                  <Card 
                    key={job.id} 
                    className={`p-4 sm:p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 ${
                      job.applicationMethod === 'recruiter-consideration' || job.hasPendingConsideration
                        ? 'border-l-green-500 bg-gradient-to-r from-green-50 to-white'
                        : job.hasApplied
                        ? 'border-l-blue-500 bg-gradient-to-r from-blue-50 to-white'
                        : job.isSaved
                        ? 'border-l-orange-500 bg-gradient-to-r from-orange-50 to-white'
                        : 'border-l-gray-200 hover:border-l-[#ff6b35]'
                    }`}
                    onClick={() => handleJobClick(job.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                          {job.logo ? (
                            <img
                              src={job.logo}
                              alt={`${job.company} logo`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#ff6b35]" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-gray-900 mb-1 break-words">{job.title}</h3>
                              <p className="text-gray-600 mb-2 break-words">{job.company}</p>
                              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {job.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  {job.salary}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Briefcase className="w-4 h-4" />
                                  {job.type}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {job.postedTime}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-2">
                              {job.hasPendingConsideration && (
                                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                  Invitation
                                </Badge>
                              )}
                              {job.hasApplied && !job.hasPendingConsideration && (
                                <Badge className={`text-xs px-2 py-1 ${
                                  job.applicationMethod === 'recruiter-consideration'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {job.applicationMethod === 'recruiter-consideration' ? 'Recruiter Selected' : 'Applied'}
                                </Badge>
                              )}
                              {job.isSaved && !job.hasApplied && !job.hasPendingConsideration && (
                                <Badge className="bg-orange-100 text-orange-800 text-xs px-2 py-1">
                                  Saved
                                </Badge>
                              )}
                              <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
                                {job.vacancyType}
                              </Badge>
                              {job.matchPercentage !== undefined && (
                                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                                  {formatMatchScore(job.matchPercentage)}% Match
                                </Badge>
                              )}
                              {job.greenzoneStatus && GREENZONE_STYLES[job.greenzoneStatus] && (
                                <Badge
                                  title={job.greenzoneReason || undefined}
                                  className={`text-xs px-2 py-1 border ${GREENZONE_STYLES[job.greenzoneStatus].className}`}
                                >
                                  {GREENZONE_STYLES[job.greenzoneStatus].label}
                                </Badge>
                              )}
                              {job.scoreBreakdown && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {[
                                    { key: 'semantic', label: 'Sem', color: 'bg-blue-500' },
                                    { key: 'skill_jaccard', label: 'Skill', color: 'bg-purple-500' },
                                    { key: 'education_score', label: 'Edu', color: 'bg-green-500' },
                                    { key: 'experience_score', label: 'Exp', color: 'bg-orange-500' },
                                    { key: 'industry_alignment', label: 'Ind', color: 'bg-cyan-500' },
                                    { key: 'level_alignment', label: 'Lvl', color: 'bg-pink-500' },
                                  ].map(({ key, label, color }) => {
                                    const val = job.scoreBreakdown![key];
                                    if (val === undefined || val === null) return null;
                                    const pct = Math.round(val * 100);
                                    return (
                                      <div key={key} className="flex items-center gap-0.5 text-[10px] bg-white border rounded px-1 py-0.5" title={`${label}: ${pct}%`}>
                                        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                                        <span className="text-gray-600">{label}</span>
                                        <span className="font-medium text-gray-900">{pct}%</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                              <FlagFraudDialog
                                title="Flag job as fraudulent"
                                description="This will suspend the job post and notify the platform. Please add a brief reason."
                                onConfirm={(reason) => handleFlagJobFraud(job, reason)}
                                buttonSize="icon"
                                buttonVariant="outline"
                                buttonText=""
                                className="px-2 border-red-300 text-red-500 hover:bg-red-50"
                              />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSaveJob(job);
                                }}
                                className={`p-2 rounded-lg transition-colors ${
                                  job.isSaved
                                    ? 'text-red-500 bg-red-50 hover:text-red-500 hover:bg-red-100'
                                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${job.isSaved ? 'fill-current' : ''}`} />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Building className="w-4 h-4" />
                              {job.companySize}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {job.experienceLevel}
                            </span>
                          </div>
                          
                          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                            {job.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
            </div>
          </div>
        </div>
      </div>

      {/* Job Details Sidebar */}
      {selectedJobId && selectedJob && (
        <div className="fixed right-0 top-16 w-full sm:w-[600px] lg:w-[800px] max-w-full h-[calc(100vh-4rem)] bg-white shadow-2xl z-40 overflow-y-auto border-l border-gray-200">
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Job Details</h2>
              <button
                onClick={() => setSelectedJobId(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close job details"
              >
                <X className="w-6 h-6 text-gray-500 hover:text-[#ff6b35]" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="font-medium text-blue-900 mb-1">AI-Assisted Review</p>
              <p className="text-sm text-blue-700">
                AI is utilised to help evaluate this application.
              </p>
            </div>

            <div className="space-y-6">
              {/* Company Header */}
              <div className="flex items-start gap-4 p-6 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shadow-lg flex items-center justify-center">
                  {selectedJob.logo ? (
                    <img
                      src={selectedJob.logo}
                      alt={`${selectedJob.company} logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#ff6b35]" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedJob.title}</h3>
                  <p className="text-lg text-gray-600 mb-3">{selectedJob.company}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {selectedJob.salary}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedJob.postedTime}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      {selectedJob.vacancyType}
                    </Badge>
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      {selectedJob.type}
                    </Badge>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {selectedJob.workModel}
                    </Badge>
                    <Badge className="bg-orange-100 text-orange-800 text-xs">
                      {selectedJob.experienceLevel}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {selectedJob.hasApplied || isJobTracked(selectedJob.id) || selectedJobConsideration?.status === 'accepted' ? (
                  <Button
                    variant="outline"
                    onClick={() => handleWithdrawApplication(selectedJob)}
                    className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Withdraw Application
                  </Button>
                ) : selectedJobConsideration?.status === 'pending' ? (
                  <>
                    <Button
                      onClick={() => handleAcceptInterest()}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Interest
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleRejectInvitation()}
                      className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject Invitation
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleQuickApply(selectedJob)}
                    className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Apply
                  </Button>
                )}
                <Button variant="outline" className="px-6 border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                  <Heart className="w-4 h-4" />
                </Button>
                <Button variant="outline" className="px-6 border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50">
                  <Share2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => onNavigateToJobDetails?.(selectedJob)}
                  className="px-6 border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Full Description
                </Button>
                <FlagFraudDialog
                  title="Flag job as fraudulent"
                  description="This will suspend the job post and notify the platform. Please add a brief reason."
                  onConfirm={(reason) => handleFlagJobFraud(selectedJob, reason)}
                  buttonSize="icon"
                  buttonVariant="outline"
                  buttonText=""
                  className="px-3 border-red-300 text-red-500 hover:bg-red-50"
                />
              </div>

              {/* Job Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">About this role</h4>
                <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
                <ul className="space-y-2">
                  {selectedJob.requirements.map((req) => (
                    <li key={req} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Benefits & Perks</h4>
                <ul className="space-y-2">
                  {selectedJob.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-gray-600">
                      <Star className="w-4 h-4 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Company Info */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Company Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Industry</p>
                    <p className="text-sm text-gray-900">{selectedJob.companyIndustry}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Company Size</p>
                    <p className="text-sm text-gray-900">{selectedJob.companySize}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Work Model</p>
                    <p className="text-sm text-gray-900">{selectedJob.workModel}</p>
                  </div>
                </div>
              </div>

              {/* Recruiter Info */}
              {selectedJob.recruiter && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200 p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recruiter Contact</h4>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white">
                      <ImageWithFallback
                        src={selectedJob.recruiter?.avatar || ''}
                        alt={`${selectedJob.recruiter?.name || 'Recruiter'} avatar`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{selectedJob.recruiter?.name}</h5>
                      <p className="text-sm text-gray-600 mb-1">{selectedJob.recruiter?.title}</p>
                      <p className="text-sm text-gray-500 mb-3">{selectedJob.recruiter?.yearsExperience} years experience</p>
                      {selectedJob.recruiter?.contactInfo && (
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">{selectedJob.recruiter.contactInfo.email}</p>
                          <p className="text-sm text-gray-600">{selectedJob.recruiter.contactInfo.phone}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showVideoModal && selectedJob && (
        <VideoApplicationModal
          jobId={Number(selectedJob.id)}
          submitLabel="Submit & Accept Interest"
          onComplete={handleCompleteConsiderationVideo}
          onCancel={() => {
            setShowVideoModal(false);
            setConsiderationVideoFlowId(null);
          }}
        />
      )}
    </div>
  );
}
