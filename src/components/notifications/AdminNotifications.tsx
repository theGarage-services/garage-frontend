import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Bell, 
  Users, 
  Shield, 
  BarChart3, 
  AlertCircle, 
  CheckCircle, 
  Settings, 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  UserPlus, 
  Lock, 
  Unlock, 
  Search,
  Eye,
  Check,
  X,
  AlertTriangle,
  Target} from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { toast } from 'sonner';

interface AdminNotificationItem {
  id: string;
  type: 'team-management' | 'institution-ops' | 'analytics' | 'system-alert' | 'approval-needed';
  category: 'team-member' | 'access-control' | 'job-posting' | 'settings' | 'performance' | 'billing' | 'compliance' | 'security' | 'approval';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  actionRequired: boolean;
  metadata?: {
    memberName?: string;
    memberEmail?: string;
    memberRole?: string;
    jobTitle?: string;
    jobId?: string;
    department?: string;
    settingChanged?: string;
    metricName?: string;
    metricValue?: string;
    limitType?: string;
    limitUsage?: string;
    approvalType?: string;
    requestedBy?: string;
    amount?: string;
  };
}

interface AdminNotificationsProps {
  onNavigate: (view: string) => void;
  user?: any;
  onLogout?: () => void;
}

// Mock admin notification data
const mockAdminNotifications: AdminNotificationItem[] = [
  // TEAM MANAGEMENT
  {
    id: '1',
    type: 'team-management',
    category: 'team-member',
    title: 'New Team Member Joined',
    message: 'Jessica Martinez has joined your institution as a Recruiter.',
    timestamp: '10 minutes ago',
    isRead: false,
    priority: 'medium',
    actionRequired: false,
    metadata: {
      memberName: 'Jessica Martinez',
      memberEmail: 'jessica.martinez@techcorp.com',
      memberRole: 'Recruiter',
      department: 'Engineering'
    }
  },
  {
    id: '2',
    type: 'team-management',
    category: 'access-control',
    title: 'Access Level Change Requested',
    message: 'Mike Chen requested elevated permissions to post jobs and manage candidates.',
    timestamp: '1 hour ago',
    isRead: false,
    priority: 'high',
    actionRequired: true,
    metadata: {
      memberName: 'Mike Chen',
      memberEmail: 'mike.chen@techcorp.com',
      memberRole: 'Recruiter',
      requestedBy: 'Mike Chen'
    }
  },
  {
    id: '3',
    type: 'team-management',
    category: 'team-member',
    title: 'Team Member Inactive',
    message: 'Robert Taylor has been inactive for 30 days. Consider reviewing their account status.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'low',
    actionRequired: true,
    metadata: {
      memberName: 'Robert Taylor',
      memberEmail: 'robert.taylor@techcorp.com',
      memberRole: 'Recruiter'
    }
  },

  // INSTITUTION OPERATIONS
  {
    id: '4',
    type: 'approval-needed',
    category: 'job-posting',
    title: 'Job Posting Awaiting Approval',
    message: 'Senior Frontend Developer position submitted by Sarah Johnson requires approval.',
    timestamp: '30 minutes ago',
    isRead: false,
    priority: 'high',
    actionRequired: true,
    metadata: {
      jobTitle: 'Senior Frontend Developer',
      jobId: 'job-456',
      department: 'Engineering',
      requestedBy: 'Sarah Johnson'
    }
  },
  {
    id: '5',
    type: 'institution-ops',
    category: 'job-posting',
    title: 'Job Posting Published',
    message: 'Product Manager position has been successfully published and is now live.',
    timestamp: '3 hours ago',
    isRead: true,
    priority: 'medium',
    actionRequired: false,
    metadata: {
      jobTitle: 'Product Manager',
      jobId: 'job-457',
      department: 'Product'
    }
  },
  {
    id: '6',
    type: 'institution-ops',
    category: 'settings',
    title: 'Institution Settings Updated',
    message: 'Company profile information was updated by admin.',
    timestamp: '5 hours ago',
    isRead: true,
    priority: 'low',
    actionRequired: false,
    metadata: {
      settingChanged: 'Company Profile',
      requestedBy: 'Admin'
    }
  },

  // ANALYTICS & PERFORMANCE
  {
    id: '7',
    type: 'analytics',
    category: 'performance',
    title: 'Weekly Hiring Report Available',
    message: 'Your weekly hiring analytics report is ready to review. 15 new applications received.',
    timestamp: '1 day ago',
    isRead: true,
    priority: 'medium',
    actionRequired: false,
    metadata: {
      metricName: 'Applications',
      metricValue: '15'
    }
  },
  {
    id: '8',
    type: 'analytics',
    category: 'performance',
    title: 'Pipeline Milestone Reached',
    message: 'Congratulations! Your team has reviewed 100 candidates this month.',
    timestamp: '1 day ago',
    isRead: true,
    priority: 'low',
    actionRequired: false,
    metadata: {
      metricName: 'Candidates Reviewed',
      metricValue: '100'
    }
  },

  // SYSTEM ALERTS
  {
    id: '9',
    type: 'system-alert',
    category: 'billing',
    title: 'Subscription Renewal Upcoming',
    message: 'Your Premium plan will renew on January 30, 2025. $299/month will be charged.',
    timestamp: '2 days ago',
    isRead: false,
    priority: 'high',
    actionRequired: true,
    metadata: {
      amount: '$299/month'
    }
  },
  {
    id: '10',
    type: 'system-alert',
    category: 'compliance',
    title: 'Job Posting Limit Approaching',
    message: 'You have used 18 of 20 active job postings. Upgrade plan or remove inactive jobs.',
    timestamp: '3 days ago',
    isRead: false,
    priority: 'medium',
    actionRequired: true,
    metadata: {
      limitType: 'Active Job Postings',
      limitUsage: '18/20'
    }
  },
  {
    id: '11',
    type: 'system-alert',
    category: 'security',
    title: 'Security Alert',
    message: 'Multiple failed login attempts detected for admin account. Review security settings.',
    timestamp: '4 days ago',
    isRead: true,
    priority: 'high',
    actionRequired: true,
    metadata: {
      settingChanged: 'Security Settings'
    }
  },

  // APPROVALS
  {
    id: '12',
    type: 'approval-needed',
    category: 'approval',
    title: 'Budget Approval Required',
    message: 'Department head requested $5,000 budget increase for Q1 hiring campaign.',
    timestamp: '5 days ago',
    isRead: true,
    priority: 'high',
    actionRequired: true,
    metadata: {
      approvalType: 'Budget Increase',
      amount: '$5,000',
      requestedBy: 'Department Head',
      department: 'Marketing'
    }
  },
  {
    id: '13',
    type: 'approval-needed',
    category: 'approval',
    title: 'Department Creation Request',
    message: 'Request to create new "Data Science" department with 3 team members.',
    timestamp: '1 week ago',
    isRead: true,
    priority: 'medium',
    actionRequired: true,
    metadata: {
      approvalType: 'New Department',
      department: 'Data Science',
      requestedBy: 'HR Manager'
    }
  }
];

export function AdminNotifications({ onNavigate, user, onLogout }: Readonly<AdminNotificationsProps>) {
  const [selectedTab, setSelectedTab] = useState<'team' | 'approvals' | 'system' | 'reports'>('approvals');
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockAdminNotifications);

  // Filter notifications by tab
  const teamNotifications = notifications.filter(n => n.type === 'team-management');
  const approvalNotifications = notifications.filter(n => n.type === 'approval-needed');
  const systemNotifications = notifications.filter(n => n.type === 'system-alert');
  const reportNotifications = notifications.filter(n => 
    n.type === 'analytics' || n.type === 'institution-ops'
  );

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const unreadTeamCount = teamNotifications.filter(n => !n.isRead).length;
  const unreadApprovalCount = approvalNotifications.filter(n => !n.isRead).length;
  const unreadSystemCount = systemNotifications.filter(n => !n.isRead).length;
  const unreadReportCount = reportNotifications.filter(n => !n.isRead).length;

  const actionRequiredCount = notifications.filter(n => n.actionRequired && !n.isRead).length;

  const getNotificationIcon = (category: string) => {
    switch (category) {
      case 'team-member':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'access-control':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'job-posting':
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case 'settings':
        return <Settings className="w-5 h-5 text-gray-600" />;
      case 'performance':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'billing':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'compliance':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'security':
        return <Lock className="w-5 h-5 text-red-600" />;
      case 'approval':
        return <CheckCircle className="w-5 h-5 text-purple-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50/50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50/50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50/50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const handleApprove = (id: string) => {
    toast.success('Request approved successfully');
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true, actionRequired: false } : n
    ));
  };

  const handleDeny = (id: string) => {
    toast.error('Request denied');
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true, actionRequired: false } : n
    ));
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    toast.success('All notifications marked as read');
  };

  const handleViewDetails = (notification: AdminNotificationItem) => {
    // Navigate to relevant admin section based on notification type
    if (notification.type === 'team-management') {
      onNavigate('team-management');
    } else if (notification.category === 'job-posting') {
      onNavigate('job-management');
    } else if (notification.category === 'settings') {
      onNavigate('institution-management');
    } else if (notification.type === 'analytics') {
      onNavigate('analytics');
    }
  };

  const renderNotificationCard = (notification: AdminNotificationItem) => (
    <Card 
      key={notification.id}
      className={`p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
        notification.isRead ? 'bg-white' : getPriorityColor(notification.priority)
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0">
          {getNotificationIcon(notification.category)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                {notification.actionRequired && !notification.isRead && (
                  <Badge className="bg-red-100 text-red-800 text-xs">Action Required</Badge>
                )}
                {notification.priority === 'high' && (
                  <Badge className="bg-orange-100 text-orange-800 text-xs">High Priority</Badge>
                )}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {!notification.isRead && (
                <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
              )}
              <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
            </div>
          </div>
          
          {notification.metadata && (
            <div className="p-4 bg-gray-50 rounded-xl mb-4 space-y-1">
              {notification.metadata.memberName && (
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <strong>{notification.metadata.memberName}</strong>
                    {notification.metadata.memberEmail && ` (${notification.metadata.memberEmail})`}
                  </span>
                </div>
              )}
              {notification.metadata.jobTitle && (
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">
                    <strong>{notification.metadata.jobTitle}</strong>
                    {notification.metadata.department && ` • ${notification.metadata.department}`}
                  </span>
                </div>
              )}
              {notification.metadata.requestedBy && (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">Requested by: {notification.metadata.requestedBy}</span>
                </div>
              )}
              {notification.metadata.amount && (
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700 font-medium">{notification.metadata.amount}</span>
                </div>
              )}
              {notification.metadata.limitUsage && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                  <span className="text-sm text-orange-700">
                    {notification.metadata.limitType}: <strong>{notification.metadata.limitUsage}</strong>
                  </span>
                </div>
              )}
              {notification.metadata.metricValue && (
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700">
                    {notification.metadata.metricName}: <strong>{notification.metadata.metricValue}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex items-center gap-3 flex-wrap">
            {notification.actionRequired && !notification.isRead && (
              <>
                {notification.type === 'approval-needed' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApprove(notification.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeny(notification.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Deny
                    </Button>
                  </>
                )}
                {notification.category === 'access-control' && (
                  <>
                    <Button 
                      size="sm" 
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                      onClick={() => handleApprove(notification.id)}
                    >
                      <Unlock className="w-4 h-4 mr-2" />
                      Grant Access
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeny(notification.id)}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Deny Request
                    </Button>
                  </>
                )}
              </>
            )}
            
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleViewDetails(notification)}
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            {!notification.isRead && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Read
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole="admin"
        user={user}
        currentView="notifications"
        onNavigate={onNavigate}
        onLogout={onLogout || (() => {})}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-medium text-gray-900">Admin Notifications</h1>
              <p className="text-gray-600">Manage institutional alerts, approvals, and system updates</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border-red-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Action Required</h3>
                  <p className="text-3xl font-medium text-red-600">{actionRequiredCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
                  <p className="text-3xl font-medium text-purple-600">{unreadApprovalCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Team Activity</h3>
                  <p className="text-3xl font-medium text-blue-600">{unreadTeamCount}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ff6b35] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">System Alerts</h3>
                  <p className="text-3xl font-medium text-[#ff6b35]">{unreadSystemCount}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Notifications Tabs */}
        <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 gap-4">
            <TabsList className="grid w-fit grid-cols-4 bg-white shadow-sm">
              <TabsTrigger 
                value="approvals" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approvals</span>
                {unreadApprovalCount > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadApprovalCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="team" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <Users className="w-4 h-4" />
                <span>Team Activity</span>
                {unreadTeamCount > 0 && (
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadTeamCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <Shield className="w-4 h-4" />
                <span>System Alerts</span>
                {unreadSystemCount > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadSystemCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="reports" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Reports</span>
                {unreadReportCount > 0 && (
                  <Badge className="bg-green-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadReportCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#ff6b35] w-64"
                />
              </div>
              
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark All Read
              </Button>
            </div>
          </div>

          {/* Approvals Tab */}
          <TabsContent value="approvals" className="space-y-4">
            {approvalNotifications.length > 0 ? (
              approvalNotifications.map(renderNotificationCard)
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-gray-600">No pending approvals at this time.</p>
              </Card>
            )}
          </TabsContent>

          {/* Team Activity Tab */}
          <TabsContent value="team" className="space-y-4">
            {teamNotifications.length > 0 ? (
              teamNotifications.map(renderNotificationCard)
            ) : (
              <Card className="p-12 text-center">
                <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No Team Activity</h3>
                <p className="text-gray-600">Your team notifications will appear here.</p>
              </Card>
            )}
          </TabsContent>

          {/* System Alerts Tab */}
          <TabsContent value="system" className="space-y-4">
            {systemNotifications.length > 0 ? (
              systemNotifications.map(renderNotificationCard)
            ) : (
              <Card className="p-12 text-center">
                <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">System Running Smoothly</h3>
                <p className="text-gray-600">No system alerts at this time.</p>
              </Card>
            )}
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            {reportNotifications.length > 0 ? (
              reportNotifications.map(renderNotificationCard)
            ) : (
              <Card className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">No Reports Available</h3>
                <p className="text-gray-600">Analytics and performance reports will appear here.</p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
