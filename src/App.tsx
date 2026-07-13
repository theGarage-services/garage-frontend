import React, { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useSearchParams, useParams } from 'react-router-dom';
import '../styles/globals.css';

// Essential components for authentication flow
import { LandingPage } from './components/landing/LandingPage';
import { About } from './components/landing/About';
import { Pricing } from './components/landing/Pricing';
import { LegalPage } from './components/landing/LegalPage';
import { Jobseeker } from './components/landing/Jobseeker';
import { Recruiter } from './components/landing/Recruiter';
import { RoleSelector } from './components/auth/RoleSelector';
import { Login } from './components/auth/Login';
import { SignUp } from './components/auth/SignUp';
import { ForgotPassword } from './components/auth/ForgotPassword';
import { ResetPassword } from './components/auth/ResetPassword';
import { OAuthCallback } from './components/auth/OAuthCallback';
import { AdminLogin } from './components/auth/AdminLogin';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { ResumeUploadFlow } from './components/profile/ResumeUploadFlow';
import { EnterpriseAdminDashboard } from './components/dashboard/EnterpriseAdminDashboard';
import { ThemeProvider } from './theme/ThemeProvider';

// Enterprise system components
import { CompanySetupWizard } from './components/company/CompanySetupWizard';
import { CompanyEditPage } from './components/company/CompanyEdit';
import { CompanyProfile } from './components/company/CompanyProfile';
import { UserCreationWizard } from './components/team/UserCreationWizard';
import { TeamManagementDashboard } from './components/dashboard/TeamManagementDashboard';
import { ApprovalQueue } from './components/queue/ApprovalQueue';
import { DocumentManagementCenter } from './components/profile/DocumentManagementCenter';
import { RegularRecruiterDashboard } from './components/dashboard/RegularRecruiterDashboard';
import { IndividualMemberDashboard } from './components/dashboard/IndividualMemberDashboard';

// Job seeker specific components
import { Homepage } from './components/landing/Homepage';
import { JobDetailsPage } from './components/jobs/JobDetailsPage';
import { JobTracker } from './components/jobs/JobTracker';
import { JobNotesList } from './components/jobs/JobNotesList';
import { Profile } from './components/profile/Profile';
import { CandidateRecruiterProfilePage } from './components/profile/CandidateRecruiterProfilePage';
import { CandidateProfileView } from './components/profile/CandidateProfileView';
import { AccountSettings } from './components/common/AccountSettings';
import { Notifications } from './components/notifications/Notifications';
import { Support } from './components/common/Support';
import { Contact } from './components/common/Contact';
import { FAQ } from './components/common/FAQ';

// Recruiter specific components
import { RecruiterJobManagement } from './components/recruiter/RecruiterJobManagement';
import { RecruiterCandidateManagement } from './components/recruiter/RecruiterCandidateManagement';
import { RecruiterCandidateProfilePage } from './components/recruiter/RecruiterCandidateProfilePage';
import { InterviewCalendar } from './components/calendar/InterviewCalendar';
import { RecruiterChatSystem } from './components/chat/RecruiterChatSystem';
import { JobSeekerChatSystem } from './components/chat/JobSeekerChatSystem';
import { RecruiterStatsPage } from './components/dashboard/RecruiterStatsPage';
import { MetricsDashboard } from './components/dashboard/MetricsDashboard';
import { RecruiterProfile } from './components/recruiter/RecruiterProfile';
import { JobPostingPage } from './components/jobs/JobPostingPage';

// Queue management components
import { MyQueues } from './components/queue/MyQueues';
import { QueueSelector } from './components/queue/QueueSelector';
import { QueueDetailPage } from './components/queue/QueueDetailPage';
import { QueueSourcingPage } from './components/queue/QueueSourcingPage';
import { TrackedJob } from '@/types';

// Protected route wrapper component
const ProtectedRoute = ({ children, isAuthenticated, userRole, requiredRole = null }: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  userRole: string | null;
  requiredRole?: string | null;
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/role-select" replace />;
  }
  
  if (requiredRole && userRole !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Role-based route wrapper
const RoleBasedRoute = ({ children, isAuthenticated, user, userRole, allowedRoles = [] }: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  user: any;
  userRole: string | null;
  allowedRoles: string[];
}) => {
  if (!isAuthenticated) {
    return <Navigate to="/auth/role-select" replace />;
  }
  
  const userActualRole = user?.role || userRole;
  if (!allowedRoles.includes(userActualRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// Wrapper that reads company ID from URL params and renders CompanyProfile
const CompanyProfileRoute = ({ user, onBack, onNavigate }: {
  user: any;
  onBack: () => void;
  onNavigate: (view: string) => void;
}) => {
  const { id } = useParams<{ id: string }>();
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <ErrorBoundary>
          <CompanyProfile
            institution={{ id }}
            user={user}
            onBack={onBack}
            onNavigate={onNavigate}
          />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
};

// Helper function to create recruiter navigation handler
const createRecruiterNavigate = (navigate: (path: string) => void) => {
  return (view: string) => {
    if (view.startsWith('/')) {
      navigate(view);
      return;
    }

    const routeMap: Record<string, string> = {
      'homepage': '/recruiter/dashboard',
      'job-management': '/recruiter/jobs',
      'candidate-management': '/recruiter/candidates',
      'interview-calendar': '/calendar',
      'job-posting': '/recruiter/jobs/new',
      'recruiter-messages': '/chat',
      'messages': '/chat',
      'stats': '/stats',
      'metrics-dashboard': '/metrics-dashboard',
      'recruiter-profile': '/recruiter/profile',
      'settings': '/settings',
      'notifications': '/notifications',
      'support': '/support',
      'company-edit': '/company/edit',
      'queue-sourcing': '/queues/sourcing'
    };
    navigate(routeMap[view] || `/${view}`);

  };
};

// Auto-selects a role from URL search params and immediately proceeds
const AutoRoleSelect = ({ onRoleSelect, onBack, onSetIntent }: { onRoleSelect: (role: 'job-seeker' | 'recruiter' | 'admin') => void; onBack: () => void; onSetIntent: (intent: 'login' | 'signup') => void }) => {
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role') as 'job-seeker' | 'recruiter' | 'admin' | null;
  const intent = searchParams.get('intent') as 'login' | 'signup' | null;

  useEffect(() => {
    if (intent === 'login' || intent === 'signup') {
      onSetIntent(intent);
    }
    if (role === 'job-seeker' || role === 'recruiter' || role === 'admin') {
      onRoleSelect(role);
    }
  }, [role, intent, onRoleSelect, onSetIntent]);

  // Render the normal RoleSelector while the effect fires
  return <RoleSelector onRoleSelect={onRoleSelect} onBack={onBack} />;
};

// Authentication logic extracted to reduce complexity
const useAuthentication = () => {
  const navigate = useNavigate();
  
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'job-seeker' | 'recruiter' | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot-password' | 'role-select' | 'admin-login'>('role-select');
  const [authIntent, setAuthIntent] = useState<'login' | 'signup'>('signup');
  
  // Resume Upload Flow State
  const [showResumeUpload, setShowResumeUpload] = useState(false);
  const [newUserData, setNewUserData] = useState<any>(null);

  // OAuth signup state
  const [isOAuthUser, setIsOAuthUser] = useState(false);
  const [oauthUserData, setOauthUserData] = useState<any>(null);

  const createDefaultUser = useCallback((userData: any, role: 'job-seeker' | 'recruiter') => {
    // Handle both camelCase (frontend) and snake_case (API) field names
    const firstName = userData.firstName || userData.first_name || userData.name?.split(' ')[0] || '';
    const lastName = userData.lastName || userData.last_name || userData.name?.split(' ')[1] || '';
    
    return {
      ...userData,
      id: userData.id || '1',
      firstName,
      lastName,
      first_name: firstName, // Keep both formats for compatibility
      last_name: lastName,
      email: userData.email || 'test@example.com',
      role: userData.role || role,
      tier: userData.tier || 'basic',
      avatar: userData.avatar || null,
      isPremium: userData.isPremium || userData.tier === 'premium' || false,
      ...(role === 'job-seeker' && {
        preferred_locations: userData.preferred_locations || ['No Preference'],
        preferred_salary_ranges: userData.preferred_salary_ranges || ['No Preference'],
        preferred_job_types: userData.preferred_job_types || ['No Preference'],
        preferred_work_arrangements: userData.preferred_work_arrangements || ['No Preference']
      }),
      ...(role === 'recruiter' && {
        company: userData.company || 'Independent Recruiter',
        department: userData.department || '',
        title: userData.title || 'Recruiter'
      })
    };
  }, []);

  const handleLogin = useCallback((userData: any, role: 'job-seeker' | 'recruiter') => {
    // Use real user data from API, merged with defaults
    const user = createDefaultUser(userData, role);
    setUser(user);
    setUserRole(role);
    setIsAuthenticated(true);
  }, [createDefaultUser]);

  const handleSignUp = useCallback((userData: any, role: 'job-seeker' | 'recruiter') => {
    // Use real user data from API, merged with defaults
    const user = createDefaultUser(userData, role);
    setUser(user);
    setUserRole(role);
    setIsAuthenticated(true);
    setIsOAuthUser(false);
    setOauthUserData(null);
    navigate('/dashboard');
  }, [createDefaultUser, navigate]);

  const handleLogout = useCallback(() => {
    setUser(null);
    setUserRole(null);
    setIsAuthenticated(false);
    setShowResumeUpload(false);
    setNewUserData(null);
    setIsOAuthUser(false);
    setOauthUserData(null);
    navigate('/home');
  }, [navigate]);

  const handleResumeUploadComplete = useCallback((resumeData: any) => {
    if (!newUserData) return;
    
    const completeUserData = {
      ...newUserData,
      ...resumeData.profileData,
      resumeFile: resumeData.resumeFile,
      extractedData: resumeData.extractedData,
      profileComplete: true,
      isNewUser: false
    };

    const mockUser = createDefaultUser(completeUserData, newUserData.role);
    setUser(mockUser);
    setUserRole(newUserData.role);
    setIsAuthenticated(true);
    setShowResumeUpload(false);
    setNewUserData(null);
  }, [newUserData, createDefaultUser]);

  const handleResumeUploadSkip = useCallback(() => {
    if (!newUserData) return;
    
    const mockUser = createDefaultUser({
      ...newUserData,
      profileComplete: false, // Profile is not complete if resume was skipped
      isNewUser: false
    }, newUserData.role);
    
    setUser(mockUser);
    setUserRole(newUserData.role);
    setIsAuthenticated(true);
    setShowResumeUpload(false);
    setNewUserData(null);
  }, [newUserData, createDefaultUser]);

  return {
    isAuthenticated,
    user,
    userRole,
    authView,
    authIntent,
    showResumeUpload,
    newUserData,
    isOAuthUser,
    oauthUserData,
    setAuthView,
    setAuthIntent,
    setUserRole,
    setUser,
    setIsAuthenticated,
    setIsOAuthUser,
    setOauthUserData,
    handleLogin,
    handleSignUp,
    handleLogout,
    handleResumeUploadComplete,
    handleResumeUploadSkip
  };
};

// Job tracking logic extracted to reduce complexity
const useJobTracking = () => {
  const [trackedJobs, setTrackedJobs] = useState<TrackedJob[]>([]);
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [selectedQueue, setSelectedQueue] = useState<any>(null);

  const handleJobApplication = useCallback((job: any, method: 'manual' | 'quick-apply' | 'recruiter-consideration') => {
    const isAlreadyTracked = trackedJobs.some(trackedJob => trackedJob.id === job.id);
    if (!isAlreadyTracked) {
      setTrackedJobs(prev => [...prev, {
        ...job,
        status: 'Applied',
        dateApplied: new Date().toISOString(),
        method: method
      }]);
    }
  }, [trackedJobs]);

  const handleToggleAutoApply = useCallback((enabled: boolean) => {
    setAutoApplyEnabled(enabled);
  }, []);

  return {
    trackedJobs,
    setTrackedJobs,
    autoApplyEnabled,
    selectedQueue,
    setSelectedQueue,
    handleJobApplication,
    handleToggleAutoApply
  };
};

  // Route components extracted to reduce App complexity
const renderPublicRoutes = ({ auth, navigate }: { auth: any; navigate: any }) => (
  <>
    <Route path="/" element={<Navigate to="/home" replace />} />
    <Route path="/home" element={<LandingPage 
      onGetStarted={() => {
        auth.setAuthIntent('signup');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      onLogin={() => {
        auth.setAuthIntent('login');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      onViewAbout={() => navigate('/about')}
      isAuthenticated={auth.isAuthenticated}
      onBackToApp={auth.isAuthenticated ? () => navigate('/dashboard') : undefined}
    />} />
    
    <Route path="/about" element={<About
      onGetStarted={() => {
        auth.setAuthIntent('signup');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      onLogin={() => {
        auth.setAuthIntent('login');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      isAuthenticated={auth.isAuthenticated}
      onBackToApp={auth.isAuthenticated ? () => navigate('/dashboard') : undefined} 
      onNavigateToLanding={() => navigate('/home')} />}
    />
    <Route path="/Jobseeker" element={<Jobseeker
      onGetStarted={() => {
        auth.setAuthIntent('signup');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      isAuthenticated={auth.isAuthenticated} />}
    />
    <Route path="/Recruiter" element={<Recruiter
      onGetStarted={() => {
        auth.setAuthIntent('signup');
        auth.setAuthView('role-select');
        navigate('/auth/role-select');
      }}
      isAuthenticated={auth.isAuthenticated} />}
    />
    <Route path="/pricing" element={<Pricing />} />
    <Route path="/legal" element={<LegalPage />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/faq" element={<FAQ />} />
  </>
);

const renderAuthRoutes = ({ auth, navigate }: { auth: any; navigate: any }) => (
  <>
    <Route path="/auth/role-select" element={<AutoRoleSelect 
      onRoleSelect={(role) => {
        if (role === 'admin') {
          auth.setAuthView('admin-login');
          navigate('/auth/admin-login');
        } else {
          auth.setUserRole(role);
          auth.setAuthView(auth.authIntent);
          navigate(auth.authIntent === 'login' ? '/auth/login' : '/auth/signup');
        }
      }}
      onBack={() => navigate('/')}
      onSetIntent={(intent) => auth.setAuthIntent(intent)}
    />} />

    <Route path="/auth/admin-login" element={<AdminLogin 
      onLogin={(userData) => {
        auth.setUser(userData);
        auth.setUserRole('admin');
        auth.setIsAuthenticated(true);
        navigate('/dashboard');
      }}
      onBack={() => navigate('/auth/role-select')}
    />} />

    <Route path="/auth/login" element={auth.userRole ? <Login 
      userRole={auth.userRole}
      onLogin={(userData, role) => {
        auth.handleLogin(userData, role);
        navigate('/dashboard');
      }}
      onSwitchToSignUp={() => navigate('/auth/signup')}
      onForgotPassword={() => navigate('/auth/forgot-password')}
      onBack={() => navigate('/auth/role-select')}
    /> : <Navigate to="/auth/role-select" replace />} />

    <Route path="/auth/signup" element={auth.userRole ? <SignUp
      userRole={auth.userRole}
      isOAuthUser={auth.isOAuthUser}
      oauthUserData={auth.oauthUserData}
      onSignUp={(userData, role) => {
        auth.handleSignUp(userData, role);
      }}
      onSwitchToLogin={() => navigate('/auth/login')}
      onBack={() => navigate('/auth/role-select')}
    /> : <Navigate to="/auth/role-select" replace />} />

    <Route path="/auth/forgot-password" element={<ForgotPassword 
      onBack={() => navigate('/auth/login')}
    />} />

    <Route path="/reset-password" element={<ResetPassword 
      onBack={() => navigate('/auth/login')}
    />} />

    <Route path="/auth/oauth-callback" element={<OAuthCallback
      onOAuthSuccess={(userData) => {
        const role = userData.role as 'job-seeker' | 'recruiter';
        // Log the user in so the SignUp route has an authenticated user/role
        auth.handleLogin(userData, role);

        if (userData.created && !userData.profileComplete) {
          // New OAuth user - continue registration in the SignUp flow
          auth.setIsOAuthUser(true);
          auth.setOauthUserData(userData);
          navigate('/auth/signup');
        } else {
          // Existing user - go to dashboard
          navigate('/dashboard');
        }
      }}
      onOAuthError={(error) => {
        console.error('OAuth error:', error);
        navigate('/auth/login');
      }}
      role={sessionStorage.getItem('oauth_role') || 'job-seeker'}
    />} />

    <Route path="/resume-upload" element={auth.showResumeUpload && auth.newUserData ? <ResumeUploadFlow
      onComplete={auth.handleResumeUploadComplete}
      onSkip={auth.handleResumeUploadSkip}
      userEmail={auth.newUserData.email}
      userName={`${auth.newUserData.firstName} ${auth.newUserData.lastName}`}
    /> : <Navigate to="/dashboard" replace />} />
  </>
);

const DashboardContent = ({ auth, jobTracking, navigate }: {
  auth: any;
  jobTracking: any;
  navigate: any;
}) => {
  const userRole = auth.user?.role;
  const userTier = auth.user?.tier;

  // Admin role
  if (userRole === 'admin') {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <ErrorBoundary>
            <EnterpriseAdminDashboard
              user={auth.user}
              institution={{
                id: 'inst-1',
                name: auth.user?.company || 'Your Organization',
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
              onNavigate={(view) => navigate(`/${view}`)}
              onLogout={auth.handleLogout}
            />
          </ErrorBoundary>
        </div>
      </ThemeProvider>
    );
  }

  // Recruiter roles
  if (['lead', 'manager', 'recruiter', 'hiring-manager'].includes(userRole)) {
    const handleNavigate = createRecruiterNavigate(navigate);

    if (userRole === 'recruiter') {
      if (userTier === 'admin') {
        return (
          <ThemeProvider>
            <div className="min-h-screen bg-background">
              <ErrorBoundary>
                <EnterpriseAdminDashboard
                  user={auth.user}
                  institution={{
                    id: 'inst-1',
                    name: auth.user?.company || 'Your Organization',
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
                  onNavigate={handleNavigate}
                  onLogout={auth.handleLogout}
                />
              </ErrorBoundary>
            </div>
          </ThemeProvider>
        );
      }
      if (userTier === 'premium') {
        return (
          <ThemeProvider>
            <div className="min-h-screen bg-background">
              <ErrorBoundary>
                <RegularRecruiterDashboard
                  user={auth.user}
                  onNavigate={handleNavigate}
                  onLogout={auth.handleLogout}
                />
              </ErrorBoundary>
            </div>
          </ThemeProvider>
        );
      }
      return (
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <IndividualMemberDashboard
                user={auth.user}
                onNavigate={handleNavigate}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      );
    }

    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background">
          <ErrorBoundary>
            <RegularRecruiterDashboard
              user={auth.user}
              onNavigate={handleNavigate}
              onLogout={auth.handleLogout}
            />
          </ErrorBoundary>
        </div>
      </ThemeProvider>
    );
  }

  // Default: job-seeker / general user homepage
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <ErrorBoundary>
          <Homepage
            user={auth.user}
            onNavigate={(view) => {
              const routeMap: Record<string, string> = {
                'homepage': '/dashboard',
                'queues': '/queues',
                'queues/selector': '/queues/selector',
                'job-tracker': '/jobs/tracker',
                'jobs/notes': '/jobs/notes',
                'profile': '/profile',
                'notifications': '/notifications',
                'settings': '/settings',
                'support': '/support',
                'report-issue': '/support',
                'recruiter-chat': '/messages'
              };
              const route = routeMap[view] || `/${view}`;
              navigate(route);
            }}
            onLogout={auth.handleLogout}
            onJobApplication={jobTracking.handleJobApplication}
            trackedJobs={jobTracking.trackedJobs}
            autoMatchEnabled={jobTracking.autoApplyEnabled}
            onToggleautoMatch={jobTracking.handleToggleAutoApply}
            onNavigateToJobDetails={(job) => navigate(`/jobs/${job.id}`, { state: { job } })}
          />
        </ErrorBoundary>
      </div>
    </ThemeProvider>
  );
};

const renderProtectedRoutes = ({ auth, jobTracking, navigate, handleBack }: { 
  auth: any; 
  jobTracking: any; 
  navigate: any; 
  handleBack: any;
}) => (
  <>
    <Route path="/dashboard" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <DashboardContent auth={auth} jobTracking={jobTracking} navigate={navigate} />
      </ProtectedRoute>
    } />

    <Route path="/jobs/:id" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <JobDetailsPage
                user={auth.user}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
                onBack={handleBack}
                onJobApplication={jobTracking.handleJobApplication}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/jobs/tracker" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <JobTracker
                user={auth.user}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
                trackedJobs={jobTracking.trackedJobs}
                onUpdateTrackedJobs={jobTracking.setTrackedJobs}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/jobs/notes" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <JobNotesList
                user={auth.user}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/profile" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <Profile
                user={auth.user}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/candidate/:id" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <CandidateProfileView user={auth.user} />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/queues" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <MyQueues
                user={auth.user}
                showAsPage={true}
                onBack={() => navigate(-1)}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/queues/selector" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <QueueSelector
                user={auth.user}
                onNavigate={(view) => navigate(`/${view}`)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/recruiter-profile/:id" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <CandidateRecruiterProfilePage
                onNavigate={(view) => navigate(`/${view}`)}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/company-profile/:id" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <CompanyProfileRoute
          user={auth.user}
          onBack={handleBack}
          onNavigate={(view) => navigate(`/${view}`)}
        />
      </ProtectedRoute>
    } />

    <Route path="/settings" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <AccountSettings
                user={auth.user}
                onBack={() => navigate(-1)}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/company/edit" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <CompanyEditPage onBack={handleBack} />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/notifications" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <Notifications
                user={auth.user}
                onNavigate={(view) => {
                  if (view.startsWith('/')) {
                    navigate(view);
                    return;
                  }
                  const userRole = auth.user?.role;
                  const isRecruiter = ['lead', 'manager', 'recruiter', 'hiring-manager'].includes(userRole);
                  const isAdmin = userRole === 'admin' || auth.user?.isInstitutionAdmin;
                  if (isRecruiter || isAdmin) {
                    const routeMap: Record<string, string> = {
                      'homepage': '/dashboard',
                      'job-management': '/recruiter/jobs',
                      'candidate-management': '/recruiter/candidates',
                      'interview-calendar': '/calendar',
                      'job-posting': '/recruiter/jobs/new',
                      'recruiter-messages': '/chat',
                      'messages': '/chat',
                      'stats': '/stats',
                      'profile': '/recruiter/profile',
                      'settings': '/settings',
                      'notifications': '/notifications',
                      'support': '/support',
                      'company-settings': '/company/settings',
                      'company-edit': '/company/edit',
                    };
                    navigate(routeMap[view] || `/${view}`);
                    return;
                  }
                  const routeMap: Record<string, string> = {
                    'homepage': '/dashboard',
                    'profile': '/profile',
                    'messages': '/messages',
                    'notifications': '/notifications',
                    'settings': '/settings',
                    'job-search': '/jobs',
                    'saved-jobs': '/jobs/saved',
                    'my-applications': '/jobs/applications',
                    'resume': '/resume',
                    'company-edit': '/company/edit',
                  };
                  navigate(routeMap[view] || `/${view}`);
                }}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/support" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <Support
                onBack={() => navigate(-1)}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />
  </>
);

const renderRecruiterRoutes = ({ auth, navigate, handleBack }: { auth: any; navigate: any; handleBack: any }) => (
  <>
    <Route path="/recruiter/dashboard" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              {(() => {
                // Get user role and tier
                const userRole = auth.user?.role;
                const userTier = auth.user?.tier;

                // Create navigation handler using helper
                const handleNavigate = createRecruiterNavigate(navigate);

                // Route based on role and tier
                if (userRole === 'recruiter') {
                  if (userTier === 'admin') {
                    return (
                      <EnterpriseAdminDashboard
                        user={auth.user}
                        institution={{
                          id: 'inst-1',
                          name: auth.user?.company || 'Your Organization',
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
                        onNavigate={handleNavigate}
                        onLogout={auth.handleLogout}
                      />
                    );
                  }
                  if (userTier === 'premium') {
                    return (
                      <RegularRecruiterDashboard
                        user={auth.user}
                        onNavigate={handleNavigate}
                        onLogout={auth.handleLogout}
                      />
                    );
                  }
                  // tier === 'basic' or default
                  return (
                    <IndividualMemberDashboard
                      user={auth.user}
                      onNavigate={handleNavigate}
                      onLogout={auth.handleLogout}
                    />
                  );
                }

                // Fallback for other recruiter roles
                return (
                  <RegularRecruiterDashboard
                    user={auth.user}
                    onNavigate={handleNavigate}
                    onLogout={auth.handleLogout}
                  />
                );
              })()}
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/recruiter/jobs" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterJobManagement
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/recruiter/jobs/new" element={
      <RoleBasedRoute
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <JobPostingPage
                onBack={handleBack}
                user={auth.user}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/recruiter/candidates" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterCandidateManagement
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/recruiter/candidates/:id" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterCandidateProfilePage
                onNavigate={createRecruiterNavigate(navigate)}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/calendar" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <InterviewCalendar
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/chat" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterChatSystem
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/messages" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['job-seeker', 'candidate']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <JobSeekerChatSystem
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/stats" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterStatsPage
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/recruiter/profile" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <RecruiterProfile
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/metrics-dashboard" element={
      <RoleBasedRoute
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['recruiter', 'lead', 'manager', 'hiring-manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <MetricsDashboard
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onBack={handleBack}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />
  </>
);

const renderQueueRoutes = ({ auth, jobTracking, navigate, handleBack }: { 
  auth: any; 
  jobTracking: any; 
  navigate: any; 
  handleBack: any;
}) => (
  <>
    <Route path="/queues/:id" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <QueueDetailPage
                user={auth.user}
                queue={jobTracking.selectedQueue}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/queues/:industry/:level" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <QueueDetailPage
                user={auth.user}
                onNavigate={(view: string) => {
                  const routeMap: Record<string, string> = {
                    'homepage': '/dashboard',
                    'queues': '/queues',
                    'queues/selector': '/queues/selector',
                    'profile': '/profile',
                    'notifications': '/notifications',
                    'settings': '/settings',
                    'support': '/support',
                  };
                  navigate(routeMap[view] || `/${view}`);
                }}
                onLogout={auth.handleLogout}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />

    <Route path="/queues/sourcing" element={
      <ProtectedRoute isAuthenticated={auth.isAuthenticated} userRole={auth.userRole}>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <QueueSourcingPage
                user={auth.user}
                onBack={handleBack}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </ProtectedRoute>
    } />
  </>
);

const renderEnterpriseRoutes = ({ auth, navigate }: { auth: any; navigate: any }) => (
  <>
    <Route path="/team" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['admin', 'lead', 'manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <TeamManagementDashboard
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/approvals" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['admin', 'lead', 'manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <ApprovalQueue
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/documents" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['admin', 'lead', 'manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <DocumentManagementCenter
                user={auth.user}
                onNavigate={createRecruiterNavigate(navigate)}
                onLogout={auth.handleLogout}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/setup/company" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['admin', 'lead', 'manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <CompanySetupWizard
                onComplete={(data) => {
                  console.log('Company setup complete:', data);
                  navigate('/dashboard');
                }}
                onSkip={() => navigate('/dashboard')}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />

    <Route path="/users/create" element={
      <RoleBasedRoute 
        isAuthenticated={auth.isAuthenticated}
        user={auth.user}
        userRole={auth.userRole}
        allowedRoles={['admin', 'lead', 'manager']}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <ErrorBoundary>
              <UserCreationWizard
                onComplete={(userData) => {
                  console.log('User created:', userData);
                  navigate('/team');
                }}
                onCancel={() => navigate('/dashboard')}
                organizationId="org-1"
                availableTeams={[
                  { id: 'team-1', name: 'Engineering Recruiting', memberCount: 3 },
                  { id: 'team-2', name: 'Sales Recruiting', memberCount: 2 }
                ]}
              />
            </ErrorBoundary>
          </div>
        </ThemeProvider>
      </RoleBasedRoute>
    } />
  </>
);

// Main App component with reduced complexity
function App() {
  const navigate = useNavigate();
  
  // Use extracted hooks to reduce complexity
  const auth = useAuthentication();
  const jobTracking = useJobTracking();
  
  // Navigation handlers
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Clean routing structure with proper React Router
  return (
    <Routes>
      {renderPublicRoutes({ auth, navigate })}
      {renderAuthRoutes({ auth, navigate })}
      {renderProtectedRoutes({ auth, jobTracking, navigate, handleBack })}
      {renderRecruiterRoutes({ auth, navigate, handleBack })}
      {renderQueueRoutes({ auth, jobTracking, navigate, handleBack })}
      {renderEnterpriseRoutes({ auth, navigate })}
      
      {/* Catch-all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
