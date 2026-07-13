import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Bell, UserCheck, Briefcase, MessageSquare, ChevronDown, Filter, 
  Eye, ThumbsUp, Target, ArrowRight, CheckCircle, Calendar, MapPin, DollarSign, Coffee,
} from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from './hooks/useNotifications';
import { JobDetailView } from './JobDetailView';
import { NotificationCard } from './NotificationCard';
import { VideoApplicationModal } from '../jobs/applications/VideoApplicationModal';
import type { NotificationsProps, NotificationItem, JobNotificationGroup } from './types';
import { getStatusColor } from './utils';

export function Notifications({
  onNavigate,
  user,
  onLogout,
  generalNotifications: generalProp = [],
  recruiterNotifications: recruiterProp = [],
  chatNotifications: chatProp = [],
  jobNotificationGroups = [],
}: Readonly<NotificationsProps>) {
  const navigate = useNavigate();

  // Derive userRole from user prop (matches App.tsx / AppHeader logic)
  const userRole = (() => {
    const role = user?.role;
    if (role === 'admin' || user?.isInstitutionAdmin) return 'admin' as const;
    if (['lead', 'manager', 'recruiter', 'hiring-manager'].includes(role)) return 'recruiter' as const;
    return 'job-seeker' as const;
  })();

  const [selectedTab, setSelectedTab] = useState('general');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const {
    isLoading,
    generalNotifications,
    recruiterNotifications,
    chatNotifications,
    handleMarkAsRead,
    handleDelete,
    handleAcceptConsideration,
    activeVideoFlow,
    completeVideoFlow,
    cancelVideoFlow,
  } = useNotifications(generalProp, recruiterProp, chatProp);

  const unreadGeneralCount = generalNotifications.filter((n) => !n.isRead).length;
  const unreadRecruiterCount = recruiterNotifications.filter((n) => !n.isRead).length;
  const unreadJobsCount = jobNotificationGroups.reduce((sum, job) => sum + job.unreadCount, 0);
  const unreadChatCount = chatNotifications.filter((n) => !n.isRead).length;

  // Sort notifications newest first
  const sortByDate = (a: { createdAt: string }, b: { createdAt: string }) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

  const sortedGeneral = [...generalNotifications].sort(sortByDate);
  const sortedRecruiter = [...recruiterNotifications].sort(sortByDate);
  const sortedChat = [...chatNotifications].sort(sortByDate);

  const sortedJobGroups = jobNotificationGroups.map((group) => ({
    ...group,
    notifications: [...group.notifications].sort(sortByDate),
  })).sort((a, b) => {
    const aLatest = a.notifications[0]?.createdAt ?? '0';
    const bLatest = b.notifications[0]?.createdAt ?? '0';
    return new Date(bLatest).getTime() - new Date(aLatest).getTime();
  });

  const selectedJob = sortedJobGroups.find((job) => job.jobId === selectedJobId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole={userRole}
        user={user}
        currentView="notifications"
        onNavigate={onNavigate}
        onLogout={onLogout || (() => {})}
      />

      <div className="container mx-auto px-6 py-8">
        <PageHeader
          selectedJobId={selectedJobId}
          selectedJob={selectedJob}
          onBack={() => setSelectedJobId(null)}
        />

        {!selectedJobId && (
          <StatsCards
            generalCount={generalNotifications.length}
            recruiterCount={recruiterNotifications.length}
            jobsCount={jobNotificationGroups.length}
            chatCount={chatNotifications.length}
            unreadGeneralCount={unreadGeneralCount}
            unreadRecruiterCount={unreadRecruiterCount}
            unreadJobsCount={unreadJobsCount}
            unreadChatCount={unreadChatCount}
          />
        )}

        <NotificationContent
          selectedJobId={selectedJobId}
          selectedJob={selectedJob}
          isLoading={isLoading}
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          showFilterDropdown={showFilterDropdown}
          onToggleFilter={() => setShowFilterDropdown((v) => !v)}
          selectedFilter={selectedFilter}
          onFilterChange={(f) => { setSelectedFilter(f); setShowFilterDropdown(false); }}
          unreadGeneralCount={unreadGeneralCount}
          unreadRecruiterCount={unreadRecruiterCount}
          unreadJobsCount={unreadJobsCount}
          unreadChatCount={unreadChatCount}
          generalNotifications={sortedGeneral}
          recruiterNotifications={sortedRecruiter}
          chatNotifications={sortedChat}
          jobNotificationGroups={sortedJobGroups}
          onMarkAsRead={handleMarkAsRead}
          onDelete={handleDelete}
          onAcceptConsideration={handleAcceptConsideration}
          onNavigate={onNavigate}
          onSelectJob={setSelectedJobId}
          onViewJob={(jobId) => navigate(`/jobs/${jobId}`)}
        />
      </div>

      {activeVideoFlow && activeVideoFlow.jobId > 0 && (
        <VideoApplicationModal
          jobId={activeVideoFlow.jobId}
          submitLabel="Submit & Accept Interest"
          onComplete={(responses) => completeVideoFlow(responses.map((r) => Number(r.id)).filter(Boolean))}
          onCancel={cancelVideoFlow}
        />
      )}
    </div>
  );
}

/* ---------- Sub-components ---------- */

function PageHeader({
  selectedJobId,
  selectedJob,
  onBack,
}: Readonly<{
  selectedJobId: string | null;
  selectedJob?: { jobTitle: string; companyName: string };
  onBack: () => void;
}>) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        {selectedJobId && (
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to My Jobs
          </Button>
        )}
        <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
          <Bell className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            {selectedJobId ? selectedJob?.jobTitle : 'Notifications'}
          </h1>
          <p className="text-gray-600">
            {selectedJobId
              ? `Application updates for ${selectedJob?.companyName}`
              : 'Stay updated with your job search activity'}
          </p>
        </div>
      </div>
    </div>
  );
}

function StatsCards({
  generalCount,
  recruiterCount,
  jobsCount,
  chatCount,
  unreadGeneralCount,
  unreadRecruiterCount,
  unreadJobsCount,
  unreadChatCount,
}: Readonly<{
  generalCount: number;
  recruiterCount: number;
  jobsCount: number;
  chatCount: number;
  unreadGeneralCount: number;
  unreadRecruiterCount: number;
  unreadJobsCount: number;
  unreadChatCount: number;
}>) {
  const cards = [
    {
      label: 'General',
      count: generalCount,
      unread: unreadGeneralCount,
      icon: <Bell className="w-6 h-6 text-white" />,
      bg: 'bg-blue-500',
      cardBg: 'from-blue-50 to-blue-100 border-blue-200',
      text: 'text-blue-600',
      subtext: 'text-blue-700',
    },
    {
      label: 'Recruiter Requests',
      count: recruiterCount,
      unread: unreadRecruiterCount,
      icon: <UserCheck className="w-6 h-6 text-white" />,
      bg: 'bg-green-500',
      cardBg: 'from-green-50 to-green-100 border-green-200',
      text: 'text-green-600',
      subtext: 'text-green-700',
    },
    {
      label: 'My Jobs',
      count: jobsCount,
      unread: unreadJobsCount,
      icon: <Briefcase className="w-6 h-6 text-white" />,
      bg: 'bg-[#ff6b35]',
      cardBg: 'from-orange-50 to-orange-100 border-orange-200',
      text: 'text-[#ff6b35]',
      subtext: 'text-orange-700',
    },
    {
      label: 'Chat',
      count: chatCount,
      unread: unreadChatCount,
      icon: <MessageSquare className="w-6 h-6 text-white" />,
      bg: 'bg-indigo-500',
      cardBg: 'from-indigo-50 to-indigo-100 border-indigo-200',
      text: 'text-indigo-600',
      subtext: 'text-indigo-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cards.map((c) => (
        <Card key={c.label} className={`p-6 bg-gradient-to-r ${c.cardBg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${c.bg} rounded-xl flex items-center justify-center`}>
              {c.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{c.label}</h3>
              <p className={`text-2xl font-bold ${c.text}`}>{c.count}</p>
              <p className={`text-sm ${c.subtext}`}>{c.unread} unread</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function NotificationContent(props: Readonly<{
  selectedJobId: string | null;
  selectedJob?: JobNotificationGroup;
  isLoading: boolean;
  selectedTab: string;
  onTabChange: (tab: string) => void;
  showFilterDropdown: boolean;
  onToggleFilter: () => void;
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  unreadGeneralCount: number;
  unreadRecruiterCount: number;
  unreadJobsCount: number;
  unreadChatCount: number;
  generalNotifications: NotificationItem[];
  recruiterNotifications: NotificationItem[];
  chatNotifications: NotificationItem[];
  jobNotificationGroups: NotificationsProps['jobNotificationGroups'];
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
  onAcceptConsideration: (notificationId: string, considerationId?: string, jobId?: string) => Promise<void>;
  onNavigate: NotificationsProps['onNavigate'];
  onSelectJob: (id: string) => void;
  onViewJob?: (jobId: string) => void;
}>) {
  const applyFilter = (items: NotificationItem[]) => {
    switch (props.selectedFilter) {
      case 'unread':
        return items.filter((n) => !n.isRead);
      case 'high':
        return items.filter((n) => n.priority === 'high');
      default:
        return items;
    }
  };

  if (props.selectedJobId && props.selectedJob) {
    return (
      <JobDetailView
        job={props.selectedJob}
        onBack={() => props.onSelectJob('')}
        onMarkAsRead={props.onMarkAsRead}
      />
    );
  }

  if (props.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]" />
        <span className="ml-3 text-gray-600">Loading notifications...</span>
      </div>
    );
  }

  return (
    <Tabs value={props.selectedTab} onValueChange={props.onTabChange} className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <TabsList className="grid w-fit grid-cols-4 bg-white shadow-sm">
          <TabTrigger value="general" icon={<Bell className="w-4 h-4" />} label="General" unread={props.unreadGeneralCount} />
          <TabTrigger value="recruiter-requests" icon={<UserCheck className="w-4 h-4" />} label="Recruiter" unread={props.unreadRecruiterCount} />
          <TabTrigger value="my-jobs" icon={<Briefcase className="w-4 h-4" />} label="My Jobs" unread={props.unreadJobsCount} />
          <TabTrigger value="chat" icon={<MessageSquare className="w-4 h-4" />} label="Chat" unread={props.unreadChatCount} />
        </TabsList>

        <FilterDropdown
          show={props.showFilterDropdown}
          onToggle={props.onToggleFilter}
          selected={props.selectedFilter}
          onSelect={props.onFilterChange}
        />
      </div>

      <TabsContent value="general" className="space-y-4">
        {applyFilter(props.generalNotifications).map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkAsRead={props.onMarkAsRead}
            onDelete={props.onDelete}
            renderMetadata={(n) => <GeneralMetadata notification={n} />}
            renderActions={() => (
              <Button size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            )}
          />
        ))}
        <EmptyState count={applyFilter(props.generalNotifications).length} icon={<Bell className="w-8 h-8 text-gray-400" />} title="No general notifications" message="You'll receive updates about your queue rankings and platform activity here." actionLabel="Browse Jobs" onAction={() => props.onNavigate('homepage')} />
      </TabsContent>

      <TabsContent value="recruiter-requests" className="space-y-4">
        {applyFilter(props.recruiterNotifications).map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkAsRead={props.onMarkAsRead}
            onDelete={props.onDelete}
            renderMetadata={(n) => <RecruiterMetadata notification={n} />}
            renderActions={(n) => {
              if (n.type === 'consideration-accepted') {
                return (
                  <Button
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => props.onNavigate('messages')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                );
              }
              if (n.type === 'consideration-declined') {
                return (
                  <Button size="sm" variant="outline" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Declined
                  </Button>
                );
              }
              return (
                <>
                  <Button
                    size="sm"
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    onClick={() => {
                      if (n.metadata?.jobId) {
                        props.onViewJob?.(n.metadata.jobId);
                      } else {
                        props.onNavigate('dashboard');
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => props.onAcceptConsideration(n.id, n.metadata?.considerationId, n.metadata?.jobId)}
                  >
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Accept Interest
                  </Button>
                </>
              );
            }}
            iconBgClass="from-blue-50 to-blue-100"
            iconBorderClass="border-blue-200"
          />
        ))}
        <EmptyState count={applyFilter(props.recruiterNotifications).length} icon={<UserCheck className="w-8 h-8 text-gray-400" />} title="No recruiter requests yet" message="Recruiter-related notifications and consideration responses will appear here." actionLabel="Browse Jobs" onAction={() => props.onNavigate('homepage')} />
      </TabsContent>

      <TabsContent value="my-jobs" className="space-y-4">
        {props.jobNotificationGroups?.map((group) => ({
          ...group,
          notifications: applyFilter(group.notifications),
        })).filter((group) => group.notifications.length > 0).map((job) => (
          <Card
            key={job.jobId}
            className="p-6 transition-all duration-200 hover:shadow-lg cursor-pointer border-l-4 border-l-[#ff6b35]"
            onClick={() => props.onSelectJob(job.jobId)}
          >
            <div className="flex items-start gap-4">
              {job.companyLogo && (
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-white border border-gray-200">
                  <ImageWithFallback src={job.companyLogo} alt={`${job.companyName} logo`} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.jobTitle}</h3>
                    <p className="text-gray-700">{job.companyName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {job.unreadCount > 0 && <Badge className="bg-red-500 text-white">{job.unreadCount} new</Badge>}
                    <Badge className={`${getStatusColor(job.currentStatus)} border px-3 py-1`}>{job.currentStatus}</Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</div>
                  <div className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{job.salary}</div>
                  <div className="flex items-center gap-1"><Calendar className="w-4 h-4" />Applied: {job.appliedDate}</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Bell className="w-4 h-4" />
                    <span>{job.notifications.length} notification{job.notifications.length === 1 ? '' : 's'}</span>
                  </div>
                  <Button size="sm" variant="ghost" className="text-[#ff6b35] hover:text-[#e55a2b] hover:bg-orange-50">
                    View Timeline
                    <ChevronDown className="w-4 h-4 ml-1 rotate-[-90deg]" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        <EmptyState count={props.jobNotificationGroups?.filter((g) => applyFilter(g.notifications).length > 0).length || 0} icon={<Briefcase className="w-8 h-8 text-gray-400" />} title="No job applications yet" message="Start applying to jobs and you'll see all your application updates here." actionLabel="Browse Jobs" onAction={() => props.onNavigate('homepage')} />
      </TabsContent>

      <TabsContent value="chat" className="space-y-4">
        {applyFilter(props.chatNotifications).map((n) => (
          <NotificationCard
            key={n.id}
            notification={n}
            onMarkAsRead={props.onMarkAsRead}
            onDelete={props.onDelete}
            renderMetadata={(n) => <ChatMetadata notification={n} />}
            renderActions={(n) => <ChatActions notification={n} onNavigate={props.onNavigate} />}
            iconBgClass="from-indigo-50 to-indigo-100"
            iconBorderClass="border-indigo-200"
          />
        ))}
        <EmptyState count={applyFilter(props.chatNotifications).length} icon={<MessageSquare className="w-8 h-8 text-gray-400" />} title="No chat notifications" message="You'll receive notifications about messages, coffee chat requests, and job considerations here." actionLabel="Browse Jobs" onAction={() => props.onNavigate('homepage')} />
      </TabsContent>
    </Tabs>
  );
}

function TabTrigger({ value, icon, label, unread }: Readonly<{ value: string; icon: React.ReactNode; label: string; unread: number }>) {
  return (
    <TabsTrigger value={value} className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
      {icon}
      <span>{label}</span>
      {unread > 0 && (
        <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">{unread}</Badge>
      )}
    </TabsTrigger>
  );
}

function FilterDropdown({ show, onToggle, selected, onSelect }: Readonly<{
  show: boolean;
  onToggle: () => void;
  selected: string;
  onSelect: (f: string) => void;
}>) {
  return (
    <div className="relative">
      <Button variant="outline" onClick={onToggle} className="flex items-center gap-2">
        <Filter className="w-4 h-4" />
        <span>Filter</span>
        <ChevronDown className="w-4 h-4" />
      </Button>
      {show && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-2">
            {['all', 'unread', 'high'].map((f) => (
              <button
                key={f}
                onClick={() => onSelect(f)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm ${selected === f ? 'bg-orange-50 text-[#ff6b35]' : 'hover:bg-gray-50'}`}
              >
                {({ all: 'All Notifications', unread: 'Unread Only', high: 'High Priority' } as const)[f as 'all' | 'unread' | 'high']}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function GeneralMetadata({ notification }: Readonly<{ notification: NotificationItem }>) {
  if (!notification.metadata) return null;
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      {notification.type === 'ranking-improvement' && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Queue:</span>
            <span className="font-medium text-gray-900">{notification.metadata.queueName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-red-600">#{notification.metadata.oldRank}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="text-green-600 font-medium">#{notification.metadata.newRank}</span>
          </div>
        </div>
      )}
      {notification.type === 'queue-activity' && (
        <div className="flex items-center gap-2 text-sm">
          <Target className="w-4 h-4 text-purple-600" />
          <span className="text-gray-600">Queue:</span>
          <span className="font-medium text-gray-900">{notification.metadata.queueName}</span>
        </div>
      )}
    </div>
  );
}

function RecruiterMetadata({ notification }: Readonly<{ notification: NotificationItem }>) {
  if (!notification.metadata) return null;

  // For consideration response notifications (accepted/declined by candidate)
  if (notification.type === 'consideration-accepted' || notification.type === 'consideration-declined') {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="flex-1">
          {notification.metadata.jobId && (
            <p className="text-sm text-[#ff6b35] font-medium">Job ID: {notification.metadata.jobId}</p>
          )}
          {notification.metadata.conversationId && (
            <p className="text-xs text-gray-500 mt-1">Conversation: {notification.metadata.conversationId}</p>
          )}
        </div>
      </div>
    );
  }

  // Default: recruiter-request (candidate receiving a request from recruiter)
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
      {notification.metadata.companyLogo && (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
          <ImageWithFallback src={notification.metadata.companyLogo} alt={`${notification.metadata.companyName} logo`} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="flex-1">
        <p className="font-medium text-gray-900">
          {notification.metadata.recruiterName}{notification.metadata.recruiterTitle ? ` • ${notification.metadata.recruiterTitle}` : ''}
        </p>
        <p className="text-sm text-gray-600">{notification.metadata.companyName}</p>
        {notification.metadata.jobTitle && <p className="text-sm text-[#ff6b35] font-medium">{notification.metadata.jobTitle}</p>}
      </div>
    </div>
  );
}

function ChatMetadata({ notification }: Readonly<{ notification: NotificationItem }>) {
  if (!notification.metadata) return null;
  return (
    <div className="p-4 bg-gray-50 rounded-xl">
      {notification.metadata.messagePreview && (
        <div className="mb-3 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500 italic">&ldquo;{notification.metadata.messagePreview}&rdquo;</p>
        </div>
      )}
      <div className="flex items-center gap-4">
        {(notification.metadata.senderAvatar || notification.metadata.requesterAvatar) && (
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
            <ImageWithFallback src={notification.metadata.senderAvatar || notification.metadata.requesterAvatar || ''} alt="avatar" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          {(notification.metadata.senderName || notification.metadata.requesterName) && (
            <p className="font-medium text-gray-900">{notification.metadata.senderName || notification.metadata.requesterName}</p>
          )}
          {notification.metadata.companyName && <p className="text-sm text-gray-600">{notification.metadata.companyName}</p>}
          {notification.metadata.jobTitle && <p className="text-sm text-[#ff6b35] font-medium">{notification.metadata.jobTitle}</p>}
          {(notification.metadata.conversationId || notification.metadata.coffeeChatId || notification.metadata.considerationId) && (
            <p className="text-xs text-gray-400 mt-1">
              {notification.metadata.conversationId && `Conversation: ${notification.metadata.conversationId}`}
              {notification.metadata.coffeeChatId && `Coffee Chat: ${notification.metadata.coffeeChatId}`}
              {notification.metadata.considerationId && `Consideration: ${notification.metadata.considerationId}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ChatActions({ notification, onNavigate }: Readonly<{ notification: NotificationItem; onNavigate: (v: string) => void }>) {
  if (notification.type === 'chat-request' || notification.type === 'candidate-message' || notification.type === 'new-message') {
    return (
      <Button size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white" onClick={() => onNavigate('messages')}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Open Chat
      </Button>
    );
  }
  if (notification.type === 'consideration-accepted') {
    return (
      <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white" onClick={() => onNavigate('messages')}>
        <MessageSquare className="w-4 h-4 mr-2" />
        Start Conversation
      </Button>
    );
  }
  if (notification.type === 'coffee-chat-accepted') {
    return (
      <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white" onClick={() => onNavigate('messages')}>
        <Coffee className="w-4 h-4 mr-2" />
        Start Chat
      </Button>
    );
  }
  if (notification.type === 'consideration-declined' || notification.type === 'coffee-chat-declined') {
    return (
      <Button size="sm" variant="outline" disabled>
        <CheckCircle className="w-4 h-4 mr-2" />
        Acknowledged
      </Button>
    );
  }
  return null;
}

function EmptyState({ count, icon, title, message, actionLabel, onAction }: Readonly<{
  count: number;
  icon: React.ReactNode;
  title: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}>) {
  if (count > 0) return null;
  return (
    <Card className="p-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">{icon}</div>
      <h3 className="font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{message}</p>
      <Button onClick={onAction} className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">{actionLabel}</Button>
    </Card>
  );
}
