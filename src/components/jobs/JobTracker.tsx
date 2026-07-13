import { useState, useEffect } from 'react';
import { JobApplication } from '../../types/job';
import { KanbanColumn } from '../queue/KanbanColumn';
import { JobDialog } from './JobDialog';
import { ApplicationsList } from './ApplicationsList';
import { CalendarView } from '../calendar/CalendarView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { BarChart3, Lightbulb, Calendar, List, TrendingUp, Clock, Target } from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { jobPostsApi } from '../../api/jobPosts';

// Note: Initial mock data removed - now fetched from API

interface TrackedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  applicationMethod: 'manual' | 'quick-apply' | 'recruiter-consideration';
  dateApplied: string;
  status: 'consider' | 'applied' | 'interviews' | 'offers' | 'hired' | 'rejected' | 'withdrawn';
  notes?: string;
  recruiterNotes?: string;
  logo?: string;
  recruiter?: any;
  fullJobData?: any;
}

interface JobTrackerProps {
  onNavigate: (view: 'homepage' | 'job-tracker' | 'profile' | 'notifications' | 'settings' | 'support' | 'report-issue') => void;
  onNavigateToJobDetails?: (job: any) => void;
  trackedJobs: TrackedJob[];
  onUpdateTrackedJobs: (jobs: TrackedJob[]) => void;
  onBack?: () => void;
  user?: any;
  onLogout?: () => void;
}

export function JobTracker({ onNavigate, onNavigateToJobDetails, trackedJobs: trackedJobsProp, onUpdateTrackedJobs, user, onLogout }: Readonly<JobTrackerProps>) {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>(trackedJobsProp);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map backend JobApplication status values to frontend TrackedJob status values
  const mapApplicationStatus = (backendStatus: string): TrackedJob['status'] => {
    switch (backendStatus) {
      case 'consider':
        return 'consider';
      case 'applied':
        return 'applied';
      case 'interviews':
        return 'interviews';
      case 'offers':
        return 'offers';
      case 'hired':
        return 'hired';
      case 'rejected':
        return 'rejected';
      case 'withdrawn':
        return 'withdrawn';
      default:
        return 'applied';
    }
  };

  // Fetch applications from API
  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await jobPostsApi.getMyApplications();

      if (response.success && response.data) {
        // Transform API response to TrackedJob format
        const transformedJobs: TrackedJob[] = response.data.map((app: any) => ({
          id: String(app.id),
          title: app.title,
          company: app.company,
          location: app.location,
          salary: app.salary,
          type: app.employment_type || app.type || '',
          applicationMethod: 'manual' as const,
          dateApplied: app.date_applied,
          status: mapApplicationStatus(app.status),
          notes: app.notes,
          recruiterNotes: app.recruiter_notes,
          fullJobData: {
            interviewDate: app.interview_date,
            match_score: app.match_score,
            job_id: app.job_id,
            job_url: app.job_url
          }
        }));
        setTrackedJobs(transformedJobs);
        onUpdateTrackedJobs(transformedJobs);
      } else {
        setError('Failed to load applications');
      }
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Convert TrackedJob[] to JobApplication[] format for existing components
  const convertTrackedJobsToJobApplications = (tracked: TrackedJob[]): JobApplication[] => {
    return tracked.map(job => ({
      jobUrl: null,
      id: job.id,
      title: job.title,
      company: job.company,
      status: job.status,
      dateAdded: job.dateApplied,
      dateApplied: job.dateApplied,
      lastUpdated: job.dateApplied,
      location: job.location,
      salary: job.salary,
      notes: job.notes || `Applied via ${job.applicationMethod === 'quick-apply' ? 'Quick Apply' : job.applicationMethod === 'manual' ? 'Manual Application' : 'Recruiter Consideration'}`,
      recruiterNotes: job.recruiterNotes,
      // Additional fields
      applicationMethod: job.applicationMethod,
      logo: job.logo,
      recruiter: job.recruiter
    }));
  };

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);


  // Calculate kanban column counts dynamically
  const kanbanColumns = [
    { id: 'consider', title: 'Consider', color: 'bg-yellow-50' },
    { id: 'applied', title: 'Applied', color: 'bg-blue-50' },
    { id: 'interviews', title: 'Interviews', color: 'bg-purple-50' },
    { id: 'offers', title: 'Offers', color: 'bg-emerald-50' },
    { id: 'hired', title: 'Hired', color: 'bg-green-50' },
    { id: 'rejected', title: 'Rejected', color: 'bg-red-50' },
    { id: 'withdrawn', title: 'Withdrawn', color: 'bg-gray-50' }
  ];

  const handleEditJob = (job: JobApplication) => {
    setEditingJob(job);
    setDialogOpen(true);
  };


  const totalApplications = trackedJobs.length;
  const activeCount = trackedJobs.filter(job => 
    job.status === 'consider' || 
    job.status === 'applied' || 
    job.status === 'interviews' || 
    job.status === 'offers'
  ).length;
  const interviewCount = trackedJobs.filter(job => job.status === 'interviews').length;
  const offerCount = trackedJobs.filter(job => job.status === 'offers').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole="job-seeker"
        user={user}
        currentView="job-tracker"
        onNavigate={onNavigate as (view: string) => void}
        onLogout={onLogout || (() => {})}
      />

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 mb-8 border-2 border-orange-100/50 shadow-2xl shadow-orange-500/10 ring-1 ring-orange-100/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-medium text-gray-900 mb-3">Job Application Tracker</h1>
              <p className="text-lg sm:text-xl text-gray-600">Track and manage your job applications through every stage</p>
            </div>
            <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-6 py-3">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-blue-900">Jobs appear here automatically</p>
                <p className="text-sm text-blue-700">When you apply or recruiters select you</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-blue-100/50 shadow-blue-500/10 ring-1 ring-blue-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-medium text-gray-900">{totalApplications}</span>
              </div>
              <p className="text-gray-600 font-medium">Total Applications</p>
              <div className="mt-2 text-xs text-blue-600 font-medium">+2 this week</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-orange-100/50 shadow-orange-500/10 ring-1 ring-orange-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-medium text-gray-900">{activeCount}</span>
              </div>
              <p className="text-gray-600 font-medium">Active Applications</p>
              <div className="mt-2 text-xs text-[#ff6b35] font-medium">In progress</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-green-100/50 shadow-green-500/10 ring-1 ring-green-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-medium text-gray-900">{interviewCount}</span>
              </div>
              <p className="text-gray-600 font-medium">Interviews Scheduled</p>
              <div className="mt-2 text-xs text-green-600 font-medium">Coming up</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-purple-100/50 shadow-purple-500/10 ring-1 ring-purple-100/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-medium text-gray-900">{offerCount}</span>
              </div>
              <p className="text-gray-600 font-medium">Offers Received</p>
              <div className="mt-2 text-xs text-purple-600 font-medium">Awaiting</div>
            </div>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mb-8">
          <Alert className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200/50 rounded-2xl shadow-lg shadow-yellow-500/10 ring-1 ring-yellow-100/30">
            <Lightbulb className="h-5 w-5 text-[#ff6b35]" />
            <AlertDescription className="text-gray-700 font-medium">
              <strong className="text-[#ff6b35]">Pro Tip:</strong> Application statuses are updated by recruiters in real-time. Check the{' '}
              <span className="text-blue-600 font-medium">Applications</span>{' '}
              tab for detailed view or calendar for interview schedules.
            </AlertDescription>
          </Alert>
        </div>

        {/* Navigation Tabs */}
        <Tabs defaultValue="phase" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border-2 border-gray-100/50 ring-1 ring-gray-100/30">
            <TabsTrigger 
              value="phase" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff6b35] data-[state=active]:to-[#ff8c42] data-[state=active]:text-white data-[state=active]:shadow-lg font-medium"
            >
              <BarChart3 className="w-4 h-4" />
              Phase View
            </TabsTrigger>
            <TabsTrigger 
              value="applications" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff6b35] data-[state=active]:to-[#ff8c42] data-[state=active]:text-white data-[state=active]:shadow-lg font-medium"
            >
              <List className="w-4 h-4" />
              Applications
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="flex items-center gap-2 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#ff6b35] data-[state=active]:to-[#ff8c42] data-[state=active]:text-white data-[state=active]:shadow-lg font-medium"
            >
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="phase" className="mt-8">
            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-4 min-h-[600px]">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse text-gray-600">Loading applications...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                  <h3 className="text-lg text-red-600 mb-2">Error Loading Applications</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {kanbanColumns.map((column) => (
                    <KanbanColumn
                      key={column.id}
                      title={column.title}
                      status={column.id as JobApplication['status']}
                      jobs={convertTrackedJobsToJobApplications(trackedJobs.filter(job => job.status === column.id))}
                      onEditJob={handleEditJob}
                      onRefresh={fetchApplications}
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="applications" className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-pulse text-gray-600">Loading applications...</div>
                </div>
              ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
                  <h3 className="text-lg text-red-600 mb-2">Error Loading Applications</h3>
                  <p className="text-gray-600">{error}</p>
                </div>
              ) : (
                <ApplicationsList
                  jobs={trackedJobs.map(job => ({
                    id: job.id,
                    title: job.title,
                    company: job.company,
                    status: job.status,
                    dateAdded: job.dateApplied,
                    dateApplied: job.dateApplied,
                    lastUpdated: job.dateApplied,
                    location: job.location,
                    salary: job.salary,
                    notes: job.notes,
                    recruiterNotes: job.recruiterNotes,
                    jobUrl: job.fullJobData?.job_url,
                    interviewDate: job.fullJobData?.interviewDate,
                    interviewType: 'video'
                  }))}
                  onEditJob={handleEditJob}
                />
              )}
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-8">
            <div className="bg-white rounded-2xl shadow-lg border-0 overflow-hidden">
              <CalendarView jobs={convertTrackedJobsToJobApplications(trackedJobs)} onEditJob={handleEditJob} />
            </div>
          </TabsContent>
        </Tabs>

        {/* Job Dialog */}
        <JobDialog
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setEditingJob(null);
          }}
          job={editingJob}
          onNavigateToJobDetails={onNavigateToJobDetails}
          onNavigate={onNavigate as (view: string) => void}
        />
      </div>
    </div>
  );
}