import { Home, User, Bell, Briefcase, Users, Calendar, BarChart3, MessageSquare, Building2, FileText, List, Menu, X } from 'lucide-react';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';
import { EnterpriseProfileDropdown } from '../profile/EnterpriseProfileDropdown';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { getConversationStats } from '@/api/chat';
import { getUnreadNotificationCount } from '@/api/notifications';
import apiClient from '@/api/client';

interface AppHeaderProps {
  userRole: 'job-seeker' | 'recruiter' | 'admin';
  user: any;
  currentView?: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  // New props for page-specific features
  title?: string;
  subtitle?: string;
  viewMode?: 'day' | 'week' | 'month';
  onViewModeChange?: (mode: 'day' | 'week' | 'month') => void;
  currentDate?: Date;
  onPreviousPeriod?: () => void;
  onNextPeriod?: () => void;
  onNewAction?: () => void;
  newActionLabel?: string;
  hideNavigation?: boolean;
}

interface NavButtonProps {
  view: string;
  label: string;
  icon: React.ComponentType<any>;
  currentView?: string;
  onClick: () => void;
  count?: number;
}

function NavButton({ view, label, icon: Icon, currentView, onClick, count }: Readonly<NavButtonProps>) {
  const isActive = currentView === view;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        isActive ? 'text-[#ff6b35] font-medium' : 'text-gray-600 hover:text-[#ff6b35]'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
      {count !== undefined && count > 0 && (
        <Badge className="h-4 min-w-[16px] px-1 bg-[#ff6b35] text-white text-[10px] flex items-center justify-center">
          {count}
        </Badge>
      )}
    </button>
  );
}

interface NavigationSectionProps {
  currentView?: string;
  onNavigate: (view: string) => void;
  activeJobsCount?: number;
  pendingCandidatesCount?: number;
  upcomingInterviewsCount?: number;
}

function JobSeekerNavigation({ currentView, onNavigate }: Readonly<NavigationSectionProps>) {
  return (
    <>
      <NavButton
        view="dashboard"
        label="Home"
        icon={Home}
        currentView={currentView}
        onClick={() => onNavigate('dashboard')}
      />
      <NavButton
        view="profile"
        label="Profile"
        icon={User}
        currentView={currentView}
        onClick={() => onNavigate('profile')}
      />
      <NavButton
        view="queues"
        label="Queues"
        icon={List}
        currentView={currentView}
        onClick={() => onNavigate('queues')}
      />
      <NavButton
        view="jobs/tracker"
        label="Tracker"
        icon={BarChart3}
        currentView={currentView}
        onClick={() => onNavigate('jobs/tracker')}
      />
      <NavButton
        view="jobs/notes"
        label="My Notes"
        icon={FileText}
        currentView={currentView}
        onClick={() => onNavigate('jobs/notes')}
      />
    </>
  );
}

function AdminNavigation({ currentView, onNavigate }: Readonly<NavigationSectionProps>) {
  return (
    <>
      <NavButton
        view="homepage"
        label="Dashboard"
        icon={BarChart3}
        currentView={currentView}
        onClick={() => onNavigate('homepage')}
      />
      <NavButton
        view="team-management"
        label="Team"
        icon={Users}
        currentView={currentView}
        onClick={() => onNavigate('team-management')}
      />
      <NavButton
        view="institution-management"
        label="Company"
        icon={Building2}
        currentView={currentView}
        onClick={() => onNavigate('institution-management')}
      />
    </>
  );
}

function RecruiterNavigation({ currentView, onNavigate, activeJobsCount, pendingCandidatesCount, upcomingInterviewsCount }: Readonly<NavigationSectionProps>) {
  return (
    <>
      <NavButton
        view="homepage"
        label="Dashboard"
        icon={BarChart3}
        currentView={currentView}
        onClick={() => onNavigate('homepage')}
      />
      <NavButton
        view="job-management"
        label="Jobs"
        icon={Briefcase}
        currentView={currentView}
        onClick={() => onNavigate('job-management')}
        count={activeJobsCount}
      />
      <NavButton
        view="candidate-management"
        label="Candidates"
        icon={Users}
        currentView={currentView}
        onClick={() => onNavigate('candidate-management')}
        count={pendingCandidatesCount}
      />
      <NavButton
        view="interview-calendar"
        label="Calendar"
        icon={Calendar}
        currentView={currentView}
        onClick={() => onNavigate('interview-calendar')}
        count={upcomingInterviewsCount}
      />
    </>
  );
}

export function AppHeader({ 
  userRole, 
  user, 
  currentView, 
  onNavigate, 
  onLogout,
  hideNavigation = false
}: Readonly<AppHeaderProps>) {
  // User role checks
  const isAdmin = ['admin', 'master'].includes(userRole) || user?.isInstitutionCreator || user?.isInstitutionAdmin;
  const isEnterpriseRecruiter = ['lead', 'manager', 'recruiter', 'hiring-manager'].includes(user?.role);
  const canCreateJobs = user?.role === 'recruiter';

  // Safety wrapper for navigation
  const handleNavigate = (view: string) => {
    if (typeof onNavigate === 'function') {
      onNavigate(view);
    }
  };

  const handleMobileNavigate = (view: string) => {
    setMobileMenuOpen(false);
    handleNavigate(view);
  };

  // Real unread counts from APIs
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [pendingCandidatesCount, setPendingCandidatesCount] = useState(0);
  const [upcomingInterviewsCount, setUpcomingInterviewsCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch unread counts on mount (only when authenticated)
  useEffect(() => {
    if (!user) return;

    const fetchUnreadCounts = async () => {
      try {
        // Fetch notification count
        const notifResponse = await getUnreadNotificationCount();
        setUnreadNotifications(notifResponse.unread_count);
      } catch (err) {
        console.error('Failed to fetch notification count:', err);
      }

      try {
        // Fetch chat message count
        const chatStats = await getConversationStats();
        setUnreadMessages(chatStats.unread_messages);
      } catch (err) {
        console.error('Failed to fetch chat stats:', err);
      }

      // Only fetch recruiter-specific counts if user is a recruiter
      if (userRole === 'recruiter') {
        try {
          // Fetch active jobs count
          const jobsResponse = await apiClient.request('/jobposts/?my_jobs=true&status=published', {
            method: 'GET',
          });
          if (jobsResponse.ok) {
            const jobsData = await jobsResponse.json();
            setActiveJobsCount(jobsData.count || 0);
          }
        } catch (err) {
          console.error('Failed to fetch active jobs count:', err);
        }

        try {
          // Fetch pending candidates (applications needing review)
          const applicationsResponse = await apiClient.request('/jobposts/applications/?status=pending', {
            method: 'GET',
          });
          if (applicationsResponse.ok) {
            const applicationsData = await applicationsResponse.json();
            setPendingCandidatesCount(applicationsData.count || 0);
          }
        } catch (err) {
          console.error('Failed to fetch pending candidates count:', err);
        }

        try {
          // Fetch upcoming interviews
          const interviewsResponse = await apiClient.request('/interviews/?upcoming=true', {
            method: 'GET',
          });
          if (interviewsResponse.ok) {
            const interviewsData = await interviewsResponse.json();
            setUpcomingInterviewsCount(interviewsData.count || interviewsData.length || 0);
          }
        } catch (err) {
          console.error('Failed to fetch upcoming interviews count:', err);
        }
      }
    };

    void fetchUnreadCounts();

    // Set up polling every 30 seconds
    const interval = setInterval(() => {
      void fetchUnreadCounts();
    }, 30000);

    return () => clearInterval(interval);
  }, [userRole, user]);

  // Get navigation component based on role
  const getNavigationComponent = () => {
    if (userRole === 'job-seeker') {
      return <JobSeekerNavigation currentView={currentView} onNavigate={handleNavigate} />;
    }
    if (isAdmin) {
      return <AdminNavigation currentView={currentView} onNavigate={handleNavigate} />;
    }
    return <RecruiterNavigation 
      currentView={currentView} 
      onNavigate={handleNavigate}
      activeJobsCount={activeJobsCount}
      pendingCandidatesCount={pendingCandidatesCount}
      upcomingInterviewsCount={upcomingInterviewsCount}
    />;
  };

  // Get profile dropdown based on role
  // AppHeader.tsx (excerpt)
  const getProfileDropdown = () => {
    // compute a safe userName once, outside JSX
    // Matches RecruiterProfile.__str__: uses first_name, then username as fallback
    const userName = (() => {
      if (!user) return "User";
      const first = (user.first_name || user.firstName || "").trim();
      const last = (user.last_name || user.lastName || "").trim();
      const full = `${first} ${last}`.trim();
      // Fallback to username if name is empty (matches RecruiterProfile behavior)
      return full || user.username || "User";
    })();

    if (userRole === "job-seeker") {
      return (
        <ProfileDropdown
          onNavigate={handleNavigate}
          onLogout={onLogout}
          isPremium={!!(user?.isPremium)}
          userName={userName}
          userEmail={user?.email}
          userAvatar={user?.avatar}
        />
      );
    }

    if (userRole === "recruiter") {
      return (
        <RecruiterProfileDropdown
          onNavigate={handleNavigate}
          onLogout={onLogout}
          user={user}
        />
      );
    }

    return (
      <EnterpriseProfileDropdown
        onNavigate={handleNavigate}
        onLogout={onLogout}
        user={user}
      />
    );
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 fixed top-0 left-0 right-0 z-[100] shadow-sm">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Toggle */}
            {!hideNavigation && (
              <button
                onClick={() => setMobileMenuOpen(open => !open)}
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-[#ff6b35] hover:bg-gray-100 rounded-md"
                aria-label="Toggle navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Logo - Left Side */}
            <button 
              onClick={() => handleNavigate('dashboard')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-lg font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </span>
            </button>
          </div>

          {/* Center Navigation */}
          {!hideNavigation && (
            <nav className="hidden lg:flex items-center gap-6">
              {getNavigationComponent()}
            </nav>
          )}

          {/* Right Side - Post Job (Recruiters only, NOT admins), Messages, Notifications, Profile */}
          <div className="flex flex-wrap items-center justify-end gap-4">
            {/* Post Job Button - ONLY for Regular Recruiter (strict enforcement) */}
            {canCreateJobs && (
              <button
                onClick={() => handleNavigate('job-posting')}
                className="px-4 py-2 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-2 text-sm font-medium"
              >
                <Briefcase className="w-4 h-4" />
                Post Job
              </button>
            )}

            {/* Messages Icon - Hidden for admin users, shown for enterprise recruiters */}
            {!isAdmin || isEnterpriseRecruiter ? (
              <button 
                onClick={() => handleNavigate(userRole === 'job-seeker' ? '/messages' : '/chat')}
                className="relative text-gray-600 hover:text-[#ff6b35] transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-5 h-5" />
                {unreadMessages > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-[#ff6b35] text-white text-[10px] flex items-center justify-center">
                    {unreadMessages}
                  </Badge>
                )}
              </button>
            ) : null}

            {/* Notifications Icon */}
            <button 
              onClick={() => handleNavigate('notifications')}
              className="relative text-gray-600 hover:text-[#ff6b35] transition-colors"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 bg-[#ff6b35] text-white text-[10px] flex items-center justify-center">
                  {unreadNotifications}
                </Badge>
              )}
            </button>

            {/* Profile Dropdown */}
            {getProfileDropdown()}
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {!hideNavigation && mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-6 py-4 shadow-md">
            <nav className="flex flex-col gap-3">
              {userRole === 'job-seeker' && (
                <JobSeekerNavigation currentView={currentView} onNavigate={handleMobileNavigate} />
              )}
              {userRole === 'recruiter' && (
                <RecruiterNavigation
                  currentView={currentView}
                  onNavigate={handleMobileNavigate}
                  activeJobsCount={activeJobsCount}
                  pendingCandidatesCount={pendingCandidatesCount}
                  upcomingInterviewsCount={upcomingInterviewsCount}
                />
              )}
              {userRole === 'admin' && (
                <AdminNavigation currentView={currentView} onNavigate={handleMobileNavigate} />
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}