import { Suspense, lazy } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

// Optimized loading component with spinner animation
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ff6b35] rounded-full animate-spin mx-auto mb-4"></div>
      <h1 className="text-2xl font-bold mb-2">
        <span className="text-slate-900">the</span>
        <span className="text-[#ff6b35]">Garage</span>
      </h1>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

// Group lazy imports by functionality
const JobSeekerComponents = {
  Homepage: lazy(() => import('../landing/Homepage').then(module => ({ default: module.Homepage }))),
  JobTracker: lazy(() => import('../jobs/JobTracker').then(module => ({ default: module.JobTracker }))),
  Profile: lazy(() => import('../profile/Profile').then(module => ({ default: module.Profile }))),
  JobDetailsPage: lazy(() => import('../jobs/JobDetailsPage').then(module => ({ default: module.JobDetailsPage }))),
  QueueDetailPage: lazy(() => import('../queue/QueueDetailPage').then(module => ({ default: module.QueueDetailPage }))),
  QueueSelector: lazy(() => import('../queue/QueueSelector').then(module => ({ default: module.QueueSelector }))),
  MyQueues: lazy(() => import('../queue/MyQueues').then(module => ({ default: module.MyQueues }))),
  JobSeekerChatSystem: lazy(() => import('../chat/JobSeekerChatSystem').then(module => ({ default: module.JobSeekerChatSystem }))),
};

const RecruiterComponents = {
  RecruiterHomepage: lazy(() => import('../landing/RecruiterHomepage').then(module => ({ default: module.RecruiterHomepage }))),
  RegularRecruiterDashboard: lazy(() => import('../dashboard/RegularRecruiterDashboard').then(module => ({ default: module.RegularRecruiterDashboard }))),
  IndividualMemberDashboard: lazy(() => import('../dashboard/IndividualMemberDashboard').then(module => ({ default: module.IndividualMemberDashboard }))),
  JobPostingPage: lazy(() => import('../jobs/JobPostingPage').then(module => ({ default: module.JobPostingPage }))),
  RecruiterProfile: lazy(() => import('../recruiter/RecruiterProfile').then(module => ({ default: module.RecruiterProfile }))),
  RecruiterJobManagement: lazy(() => import('../recruiter/RecruiterJobManagement').then(module => ({ default: module.RecruiterJobManagement }))),
  RecruiterCandidateManagement: lazy(() => import('../recruiter/RecruiterCandidateManagement')),
  RecruiterCandidateProfilePage: lazy(() => import('../recruiter/RecruiterCandidateProfilePage').then(module => ({ default: module.RecruiterCandidateProfilePage }))),
  QueueSourcingPage: lazy(() => import('../queue/QueueSourcingPage').then(module => ({ default: module.QueueSourcingPage }))),
  InterviewCalendar: lazy(() => import('../calendar/InterviewCalendar').then(module => ({ default: module.InterviewCalendar }))),
  InstitutionAdminPanel: lazy(() => import('../institution/InstitutionAdminPanel').then(module => ({ default: module.InstitutionAdminPanel }))),
  InstitutionManagement: lazy(() => import('../institution/InstitutionManagement').then(module => ({ default: module.InstitutionManagement }))),
  EnterpriseAdminDashboard: lazy(() => import('../dashboard/EnterpriseAdminDashboard').then(module => ({ default: module.EnterpriseAdminDashboard }))),
  InstitutionAnalyticsDashboard: lazy(() => import('../institution/InstitutionAnalyticsDashboard').then(module => ({ default: module.InstitutionAnalyticsDashboard }))),
  CompanyProfile: lazy(() => import('../company/CompanyProfile').then(module => ({ default: module.CompanyProfile }))),
  RecruiterChatSystem: lazy(() => import('../chat/RecruiterChatSystem').then(module => ({ default: module.RecruiterChatSystem }))),
  RecruiterStatsPage: lazy(() => import('../dashboard/RecruiterStatsPage').then(module => ({ default: module.RecruiterStatsPage }))),
  RecruiterNotifications: lazy(() => import('../notifications/RecruiterNotifications').then(module => ({ default: module.RecruiterNotifications }))),
  AdminNotifications: lazy(() => import('../notifications/AdminNotifications').then(module => ({ default: module.AdminNotifications }))),
  TeamManagement: lazy(() => import('../team/MyTeam').then(module => ({ default: module.MyTeam }))),
  TestSystemMain: lazy(() => import('../test/TestSystemMain').then(module => ({ default: module.TestSystemMain }))),
};

const SharedComponents = {
  Notifications: lazy(() => import('../notifications/Notifications').then(module => ({ default: module.Notifications }))),
  Support: lazy(() => import('../common/Support').then(module => ({ default: module.Support }))),
  AccountSettings: lazy(() => import('../common/AccountSettings').then(module => ({ default: module.AccountSettings }))),
  ReportIssue: lazy(() => import('../common/ReportIssue').then(module => ({ default: module.ReportIssue }))),
  PlatformOverview: lazy(() => import('../landing/PlatformOverview').then(module => ({ default: module.PlatformOverview }))),
  MetricsDashboard: lazy(() => import('../dashboard/MetricsDashboard').then(module => ({ default: module.MetricsDashboard }))),
};

interface ViewRendererProps {
  currentView: string;
  userRole: 'job-seeker' | 'recruiter' | 'admin';
  user: any;
  selectedJob: any;
  selectedQueue: any;
  selectedCandidate: any;
  trackedJobs: any[];
  userQueues: string[];
  queueStatuses: Record<string, boolean>;
  autoApplyEnabled: boolean;
  navigationHistory: string[];
  onNavigate: (view: string) => void;
  onBack: () => void;
  onLogout: () => void;
  onJobApplication: (job: any, method: string) => void;
  onNavigateToJobDetails: (job: any) => void;
  onNavigateToQueueDetail: (queue: any) => void;
  onUpdateTrackedJobs: (jobs: any[]) => void;
  onUpdateQueues: (queues: string[]) => void;
  onUpdateQueueStatuses: (statuses: Record<string, boolean>) => void;
  onToggleAutoApply: (enabled: boolean) => void;
  setSelectedJob: (job: any) => void;
  setSelectedCandidate: (candidate: any) => void;
}

export function ViewRenderer({ 
  currentView, 
  userRole, 
  user,
  selectedJob,
  selectedQueue,
  selectedCandidate,
  trackedJobs,
  userQueues,
  queueStatuses,
  autoApplyEnabled,
  navigationHistory,
  onNavigate,
  onBack,
  onLogout,
  onJobApplication,
  onNavigateToJobDetails,
  onNavigateToQueueDetail,
  onUpdateTrackedJobs,
  onUpdateQueues,
  onUpdateQueueStatuses,
  onToggleAutoApply,
  setSelectedJob,
  setSelectedCandidate
}: Readonly<ViewRendererProps>) {
  // Helper to check if user is an admin
  const isAdmin = () => user?.role === 'admin' || user?.isInstitutionCreator || user?.isInstitutionAdmin;

  // Helper to wrap component with Suspense
  const withSuspense = (component: React.ReactNode) => (
    <Suspense fallback={<LoadingSpinner />}>{component}</Suspense>
  );

  // Job Seeker view renderer
  const renderJobSeekerView = () => {
    switch (currentView) {
      case 'homepage':
        return withSuspense(
          <JobSeekerComponents.Homepage 
            onNavigate={onNavigate}
            onNavigateToJobDetails={onNavigateToJobDetails}
            onNavigateToQueueDetail={onNavigateToQueueDetail}
            onJobApplication={onJobApplication}
            trackedJobs={trackedJobs}
            user={user}
            onLogout={onLogout}
            autoMatchEnabled={autoApplyEnabled}
            onToggleautoMatch={onToggleAutoApply}
          />
        );
      
      case 'job-tracker':
        return withSuspense(
          <JobSeekerComponents.JobTracker 
            trackedJobs={trackedJobs}
            onUpdateTrackedJobs={onUpdateTrackedJobs}
            onNavigateToJobDetails={onNavigateToJobDetails}
            onNavigate={onNavigate}
            onBack={onBack}
            user={user}
            onLogout={onLogout}
          />
        );
      
      case 'profile':
        return withSuspense(
          <JobSeekerComponents.Profile 
            onBack={onBack}
            onNavigate={onNavigate}
            user={user}
            onLogout={onLogout}
          />
        );
      
      case 'job-details':
        return withSuspense(
          <JobSeekerComponents.JobDetailsPage 
            job={selectedJob}
            onBack={onBack}
            onNavigate={onNavigate}
            onLogout={onLogout}
            onJobApplication={onJobApplication}
            onNavigateToQueueDetail={onNavigateToQueueDetail}
            user={user}
            fromTracker={navigationHistory.at(-2) === 'job-tracker'}
          />
        );
      
      case 'queue-detail':
        return withSuspense(
          <JobSeekerComponents.QueueDetailPage 
            queue={selectedQueue}
            onBack={onBack}
            onNavigate={onNavigate}
            user={user}
            onLogout={onLogout}
          />
        );
      
      case 'queue-selector':
        return withSuspense(
          <JobSeekerComponents.QueueSelector 
            onClose={onBack}
            currentQueues={userQueues}
            onUpdateQueues={onUpdateQueues}
            queueStatuses={queueStatuses}
            onUpdateQueueStatuses={onUpdateQueueStatuses}
            user={user}
          />
        );
      
      case 'my-queues':
        return withSuspense(
          <JobSeekerComponents.MyQueues 
            onNavigate={onNavigate}
            onQueueClick={onNavigateToQueueDetail}
            onBack={onBack}
            showAsPage={true}
            user={user}
          />
        );
      
      case 'job-seeker-messages':
        return withSuspense(
          <JobSeekerComponents.JobSeekerChatSystem onBack={onBack} user={user} />
        );
      
      case 'company-profile':
        return withSuspense(
          <RecruiterComponents.CompanyProfile 
            institution={{
              id: 'inst-1',
              name: selectedJob?.company || 'Company',
              logo: null,
              description: 'Leading company focused on innovation'
            }}
            user={user}
            onBack={onBack}
            onNavigate={onNavigate}
            onJobApplication={onJobApplication}
            onNavigateToJobDetails={onNavigateToJobDetails}
          />
        );
      
      default:
        return null;
    }
  };

  // Recruiter homepage view with role-based routing
  const renderRecruiterHomepage = () => {
    // Check role and tier from UserProfile
    const userRole = user?.role;
    const userTier = user?.tier;

    // Only apply tier-based routing for recruiters
    if (userRole === 'recruiter') {
      if (userTier === 'admin') {
        return withSuspense(
          <RecruiterComponents.EnterpriseAdminDashboard
            user={user}
            institution={{
              id: 'inst-1',
              name: user?.company || 'Your Organization',
              logo: null,
              description: 'Enterprise organization with full administrative capabilities',
              profileComplete: false,
              billingSetup: false,
              securitySetup: false,
              brandingSetup: false,
              teamMembers: [],
              registered: true,
              settingsConfigured: false,
              activeJobs: 0,
              totalHires: 0,
              growthRate: '+0'
            }}
            onLogout={onLogout}
            onNavigate={onNavigate}
          />
        );
      }
      if (userTier === 'premium') {
        return withSuspense(
          <RecruiterComponents.RegularRecruiterDashboard user={user} onLogout={onLogout} onNavigate={onNavigate} />
        );
      }
      // tier === 'basic' or default
      return withSuspense(
        <RecruiterComponents.IndividualMemberDashboard user={user} onLogout={onLogout} onNavigate={onNavigate} />
      );
    }

    // Admin role (not tier) gets RecruiterHomepage
    if (isAdmin()) {
      return withSuspense(
        <RecruiterComponents.RecruiterHomepage user={user} onLogout={onLogout} onNavigate={onNavigate} />
      );
    }

    // Fallback for other roles
    return withSuspense(
      <RecruiterComponents.RegularRecruiterDashboard user={user} onLogout={onLogout} onNavigate={onNavigate} />
    );
  };

  // Recruiter view renderer
  const renderRecruiterView = () => {
    switch (currentView) {
      case 'homepage':
        return renderRecruiterHomepage();
      
      case 'job-posting':
        return withSuspense(<RecruiterComponents.JobPostingPage onBack={onBack} user={user} />);
      
      case 'recruiter-profile':
        return withSuspense(
          <RecruiterComponents.RecruiterProfile onBack={onBack} onNavigate={onNavigate} user={user} />
        );
      
      case 'job-management':
        return withSuspense(
          <RecruiterComponents.RecruiterJobManagement 
            onNavigate={onNavigate}
            onLogout={onLogout}
            user={user}
            setGlobalSelectedCandidate={setSelectedCandidate}
            onNavigateToCandidates={(job) => {
              setSelectedJob(job);
              onNavigate('candidate-management');
            }}
          />
        );
      
      case 'candidate-management':
        return withSuspense(
          <RecruiterComponents.RecruiterCandidateManagement 
            onNavigate={onNavigate}
            onLogout={onLogout}
            user={user}
            setSelectedCandidate={setSelectedCandidate}
          />
        );
      
      case 'institution-profile':
        return withSuspense(
          <RecruiterComponents.InstitutionAnalyticsDashboard 
            institution={{
              id: 'inst-1',
              name: user?.company || 'TechCorp Solutions',
              logo: null,
              description: 'Leading technology company focused on innovation'
            }}
            user={user}
            onBack={onBack}
            onMemberClick={(member) => {
              setSelectedCandidate(member);
              onNavigate('member-dashboard');
            }}
          />
        );

      case 'institution-management':
        return withSuspense(
          <RecruiterComponents.EnterpriseAdminDashboard 
            onNavigate={onNavigate}
            onLogout={onLogout}
            user={user}
            institution={{
              id: 'inst-1',
              name: user?.company || 'TechCorp Solutions',
              logo: null,
              description: 'Leading technology company focused on innovation',
              profileComplete: true,
              billingSetup: true,
              securitySetup: false,
              brandingSetup: true,
              teamMembers: [],
              registered: true,
              settingsConfigured: true,
              activeJobs: 12,
              totalHires: 45,
              growthRate: '+15'
            }}
          />
        );
      
      case 'institution-admin':
        return withSuspense(
          <RecruiterComponents.InstitutionAdminPanel 
            onBack={onBack}
            user={user}
            institution={{
              id: 'inst-1',
              name: user?.company || 'TechCorp Solutions',
              logo: null,
              description: 'Leading technology company focused on innovation'
            }}
          />
        );
      
      case 'queue-sourcing':
        return withSuspense(
          <RecruiterComponents.QueueSourcingPage 
            onBack={onBack}
            user={user}
            onViewCandidate={(candidate) => {
              setSelectedCandidate(candidate);
              onNavigate('candidate-profile');
            }}
            onMessageCandidate={() => onNavigate('recruiter-chat')}
          />
        );
      
      case 'interview-calendar':
        return withSuspense(
          <RecruiterComponents.InterviewCalendar onNavigate={onNavigate} onLogout={onLogout} user={user} />
        );
      
      case 'team-management':
        return withSuspense(
          <RecruiterComponents.TeamManagement 
            onBack={onBack}
            user={user}
            onNavigate={onNavigate}
            onLogout={onLogout}
            onViewRecruiter={(recruiter) => {
              setSelectedCandidate(recruiter);
              onNavigate('recruiter-profile');
            }}
          />
        );
      
      case 'member-dashboard':
        return withSuspense(
          <RecruiterComponents.IndividualMemberDashboard user={user} onLogout={onLogout} onNavigate={onNavigate} />
        );
      
      case 'recruiter-chat':
      case 'recruiter-messages':
        return withSuspense(<RecruiterComponents.RecruiterChatSystem onBack={onBack} />);
      
      case 'recruiter-stats':
        return withSuspense(
          <RecruiterComponents.RecruiterStatsPage 
            onNavigate={onNavigate}
            onLogout={onLogout}
            user={user}
          />
        );
      
      case 'candidate-profile':
        return withSuspense(
          <RecruiterComponents.RecruiterCandidateProfilePage 
            candidate={selectedCandidate}
            onBack={onBack}
            onNavigate={onNavigate}
            onUpdateStatus={(candidateId, status) => console.log('Updating status:', candidateId, status)}
            onScheduleInterview={(candidate, interviewData) => console.log('Scheduling interview:', candidate, interviewData)}
            onSendMessage={(candidate) => console.log('Sending message to:', candidate)}
            onSaveNotes={(candidateId, notes) => console.log('Saving notes:', candidateId, notes)}
            availableJobs={[]}
            setSelectedCandidate={setSelectedCandidate}
          />
        );
      
      case 'test-system':
        return withSuspense(<RecruiterComponents.TestSystemMain onExitTest={() => onNavigate('homepage')} />);
      
      default:
        return null;
    }
  };

  // Notifications view with role-based routing
  const renderNotificationsView = () => {
    if (userRole === 'job-seeker') {
      return withSuspense(
        <SharedComponents.Notifications onNavigate={onNavigate} user={user} onLogout={onLogout} />
      );
    }
    // For recruiters, check if they're admin or regular member
    if (isAdmin()) {
      return withSuspense(
        <RecruiterComponents.AdminNotifications onNavigate={onNavigate} user={user} onLogout={onLogout} />
      );
    }
    return withSuspense(
      <RecruiterComponents.RecruiterNotifications onNavigate={onNavigate} user={user} onLogout={onLogout} />
    );
  };

  // Default view renderer
  const renderDefaultView = () => {
    if (userRole === 'job-seeker') {
      return withSuspense(
        <JobSeekerComponents.Homepage 
          onNavigate={onNavigate}
          onNavigateToJobDetails={onNavigateToJobDetails}
          onNavigateToQueueDetail={onNavigateToQueueDetail}
          onJobApplication={onJobApplication}
          trackedJobs={trackedJobs}
          user={user}
          onLogout={onLogout}
          autoMatchEnabled={autoApplyEnabled}
          onToggleautoMatch={onToggleAutoApply}
        />
      );
    }
    return withSuspense(
      <RecruiterComponents.RecruiterHomepage user={user} onLogout={onLogout} onNavigate={onNavigate} />
    );
  };

  const renderView = () => {
    // Job Seeker view renderer
    if (userRole === 'job-seeker') {
      const view = renderJobSeekerView();
      if (view) return view;
    }

    // Recruiter view renderer
    if (userRole === 'recruiter') {
      const view = renderRecruiterView();
      if (view) return view;
    }

    // Shared views (notifications, settings, etc.)
    switch (currentView) {
      case 'notifications':
        return renderNotificationsView();
      
      case 'support':
        return withSuspense(<SharedComponents.Support onBack={onBack} />);
      
      case 'settings':
        return withSuspense(<SharedComponents.AccountSettings onBack={onBack} user={user} userRole={userRole} />);
      
      case 'report-issue':
        return withSuspense(<SharedComponents.ReportIssue onBack={onBack} />);
      
      case 'platform-overview':
        return withSuspense(
          <SharedComponents.PlatformOverview onBack={onBack} onNavigate={onNavigate} user={user} onLogout={onLogout} />
        );
      
      case 'metrics-dashboard':
        return withSuspense(
          <SharedComponents.MetricsDashboard onBack={onBack} onNavigate={onNavigate} user={user} onLogout={onLogout} />
        );
      
      default:
        return renderDefaultView();
    }
  };

  return (
    <ErrorBoundary>
      {renderView()}
    </ErrorBoundary>
  );
}