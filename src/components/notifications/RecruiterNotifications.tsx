import { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Bell, UserCheck, MessageSquare, Calendar, Briefcase, Star, CheckCircle, Clock, X, Eye, Target, ChevronDown, Filter, UserPlus, UserMinus, TrendingUp, Send } from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useNotifications } from './hooks/useNotifications';

interface RecruiterNotificationItem {
  id: string;
  type: 'candidate-application' | 'candidate-message' | 'consideration-accepted' | 'consideration-declined' | 'interview-scheduled' | 'interview-rescheduled' | 'candidate-withdrew' | 'new-candidate-match' | 'queue-activity' | 'chat-request';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'high' | 'medium' | 'low';
  metadata?: {
    candidateName?: string;
    candidateEmail?: string;
    candidateAvatar?: string;
    jobTitle?: string;
    jobId?: string;
    department?: string;
    queueName?: string;
    interviewDate?: string;
    interviewTime?: string;
    interviewType?: string;
    messagePreview?: string;
    applicationCount?: number;
    matchScore?: number;
    oldDate?: string;
    newDate?: string;
  };
}

interface RecruiterNotificationsProps {
  onNavigate: (view: 'homepage' | 'job-management' | 'candidate-management' | 'notifications' | 'settings' | 'support' | 'report-issue' | 'recruiter-chat' | 'recruiter-messages' | 'job-candidates') => void;
  user?: any;
  onLogout?: () => void;
}

// Mock notification data for recruiters
const mockRecruiterNotifications: RecruiterNotificationItem[] = [
  {
    id: '1',
    type: 'candidate-application',
    title: 'New Application Received',
    message: 'Sarah Chen applied for Senior Software Engineer position via manual application.',
    timestamp: '15 minutes ago',
    isRead: false,
    priority: 'high',
    metadata: {
      candidateName: 'Sarah Chen',
      candidateEmail: 'sarah.chen@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Senior Software Engineer',
      jobId: 'job-1',
      department: 'Engineering'
    }
  },
  {
    id: '2',
    type: 'consideration-accepted',
    title: 'Consideration Request Accepted',
    message: 'Michael Rodriguez accepted your consideration request for Frontend Developer role.',
    timestamp: '1 hour ago',
    isRead: false,
    priority: 'high',
    metadata: {
      candidateName: 'Michael Rodriguez',
      candidateEmail: 'michael.r@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBhdmF0YXJ8ZW58MHx8fHwxNzAwODQ1ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Frontend Developer',
      jobId: 'job-2',
      department: 'Engineering'
    }
  },
  {
    id: '3',
    type: 'candidate-message',
    title: 'New Message from Candidate',
    message: 'Emily Watson sent you a message about the UX Designer position.',
    timestamp: '2 hours ago',
    isRead: false,
    priority: 'medium',
    metadata: {
      candidateName: 'Emily Watson',
      candidateEmail: 'emily.watson@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'UX Designer',
      jobId: 'job-3',
      department: 'Design',
      messagePreview: 'Hi! I wanted to ask about the timeline for the UX Designer role...'
    }
  },
  {
    id: '4',
    type: 'interview-scheduled',
    title: 'Interview Confirmed',
    message: 'David Park confirmed the interview for Product Manager position.',
    timestamp: '3 hours ago',
    isRead: true,
    priority: 'medium',
    metadata: {
      candidateName: 'David Park',
      candidateEmail: 'david.park@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Product Manager',
      jobId: 'job-4',
      department: 'Product',
      interviewDate: '2024-12-15',
      interviewTime: '14:00',
      interviewType: 'video'
    }
  },
  {
    id: '5',
    type: 'new-candidate-match',
    title: 'High Match Candidate Found',
    message: 'AI identified a 95% match candidate for your Data Scientist position.',
    timestamp: '4 hours ago',
    isRead: true,
    priority: 'high',
    metadata: {
      candidateName: 'Dr. Lisa Chang',
      candidateEmail: 'lisa.chang@phd.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Data Scientist',
      jobId: 'job-5',
      department: 'Analytics',
      matchScore: 95
    }
  },
  {
    id: '6',
    type: 'consideration-declined',
    title: 'Consideration Request Declined',
    message: 'Alex Johnson declined your consideration request for Backend Engineer position.',
    timestamp: '1 day ago',
    isRead: true,
    priority: 'low',
    metadata: {
      candidateName: 'Alex Johnson',
      candidateEmail: 'alex.johnson@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBhdmF0YXJ8ZW58MHx8fHwxNzAwODQ1ODAwfDA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Backend Engineer',
      jobId: 'job-6',
      department: 'Engineering'
    }
  },
  {
    id: '7',
    type: 'candidate-withdrew',
    title: 'Candidate Withdrew Application',
    message: 'Jessica Kim withdrew her application for Marketing Manager position.',
    timestamp: '2 days ago',
    isRead: true,
    priority: 'medium',
    metadata: {
      candidateName: 'Jessica Kim',
      candidateEmail: 'jessica.kim@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      jobTitle: 'Marketing Manager',
      jobId: 'job-7',
      department: 'Marketing'
    }
  },
  {
    id: '8',
    type: 'chat-request',
    title: 'Premium Chat Request',
    message: 'Tom Wilson (Premium) wants to chat about potential opportunities.',
    timestamp: '3 days ago',
    isRead: true,
    priority: 'medium',
    metadata: {
      candidateName: 'Tom Wilson',
      candidateEmail: 'tom.wilson@example.com',
      candidateAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGF2YXRhcnxlbnwwfHx8fDE3MDA4NDU4MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      messagePreview: 'Hi! I\'m interested in discussing software engineering opportunities at your company...'
    }
  }
];

export function RecruiterNotifications({ onNavigate, user, onLogout }: Readonly<RecruiterNotificationsProps>) {
  const { recruiterNotifications, generalNotifications: realGeneral, handleMarkAsRead: markRead } = useNotifications();
  const [selectedTab, setSelectedTab] = useState('role-specific');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Merge real backend notifications with mock data for types not yet wired
  const allNotifications = useMemo(() => {
    const toItem = (n: typeof recruiterNotifications[0]): RecruiterNotificationItem => {
      const type = (n.type === 'consideration-accepted' || n.type === 'consideration-declined'
        ? n.type
        : 'candidate-application') as RecruiterNotificationItem['type'];
      return {
        id: n.id,
        type,
        title: n.title,
        message: n.message,
        timestamp: n.timestamp,
        isRead: n.isRead,
        priority: n.priority,
        metadata: {
          jobTitle: n.metadata?.jobId ? `Job ${n.metadata.jobId}` : undefined,
        },
      };
    };

    const real = [...recruiterNotifications, ...realGeneral].map(toItem);
    const realIds = new Set(real.map((r) => r.id));
    const mockFiltered = mockRecruiterNotifications.filter((m) => !realIds.has(m.id));
    return [...real, ...mockFiltered];
  }, [recruiterNotifications, realGeneral]);

  const generalNotifications = allNotifications.filter((n) =>
    ['new-candidate-match', 'queue-activity', 'chat-request'].includes(n.type)
  );

  const roleSpecificNotifications = allNotifications.filter((n) =>
    ['candidate-application', 'candidate-message', 'consideration-accepted', 'consideration-declined', 'interview-scheduled', 'interview-rescheduled', 'candidate-withdrew'].includes(n.type)
  );

  const unreadRoleSpecificCount = roleSpecificNotifications.filter(n => !n.isRead).length;
  const unreadGeneralCount = generalNotifications.filter(n => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'candidate-application':
        return <UserPlus className="w-5 h-5 text-blue-600" />;
      case 'candidate-message':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'consideration-accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'consideration-declined':
        return <X className="w-5 h-5 text-red-600" />;
      case 'interview-scheduled':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'interview-rescheduled':
        return <Clock className="w-5 h-5 text-orange-600" />;
      case 'candidate-withdrew':
        return <UserMinus className="w-5 h-5 text-red-600" />;
      case 'new-candidate-match':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'queue-activity':
        return <TrendingUp className="w-5 h-5 text-purple-600" />;
      case 'chat-request':
        return <MessageSquare className="w-5 h-5 text-[#ff6b35]" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-300 bg-gray-50';
    }
  };

  const handleMarkAsRead = (id: string) => {
    markRead(id);
  };


  const handleViewCandidate = (metadata: any) => {
    if (metadata?.candidateName) {
      // Navigate to candidate management or specific candidate view
      onNavigate('candidate-management');
    }
  };

  const handleStartChat = (metadata: any) => {
    if (metadata?.candidateName) {
      // Navigate to recruiter chat system
      onNavigate('recruiter-messages');
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="notifications"
        onNavigate={onNavigate as (view: string) => void}
        onLogout={onLogout || (() => {})}
      />

      <div className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Recruiter Notifications</h1>
              <p className="text-gray-600">Stay updated with candidate activity and hiring progress</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Role-Specific</h3>
                  <p className="text-2xl font-bold text-blue-600">{roleSpecificNotifications.length}</p>
                  <p className="text-sm text-blue-700">{unreadRoleSpecificCount} unread</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">General Updates</h3>
                  <p className="text-2xl font-bold text-green-600">{generalNotifications.length}</p>
                  <p className="text-sm text-green-700">{unreadGeneralCount} unread</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#ff6b35] rounded-xl flex items-center justify-center">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">High Priority</h3>
                  <p className="text-2xl font-bold text-[#ff6b35]">
                    {mockRecruiterNotifications.filter(n => n.priority === 'high').length}
                  </p>
                  <p className="text-sm text-orange-700">Require attention</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Notifications Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <TabsList className="grid w-fit grid-cols-2 bg-white shadow-sm">
              <TabsTrigger 
                value="role-specific" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <Briefcase className="w-4 h-4" />
                <span>Role-Specific</span>
                {unreadRoleSpecificCount > 0 && (
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadRoleSpecificCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="general" 
                className="flex items-center gap-2 data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white"
              >
                <Bell className="w-4 h-4" />
                <span>General</span>
                {unreadGeneralCount > 0 && (
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 min-w-[16px] h-[16px] rounded-full">
                    {unreadGeneralCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Filter Dropdown */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filter</span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  <div className="p-2">
                    <button
                      onClick={() => { setSelectedFilter('all'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFilter === 'all' ? 'bg-orange-50 text-[#ff6b35]' : 'hover:bg-gray-50'
                      }`}
                    >
                      All Notifications
                    </button>
                    <button
                      onClick={() => { setSelectedFilter('unread'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFilter === 'unread' ? 'bg-orange-50 text-[#ff6b35]' : 'hover:bg-gray-50'
                      }`}
                    >
                      Unread Only
                    </button>
                    <button
                      onClick={() => { setSelectedFilter('high'); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                        selectedFilter === 'high' ? 'bg-orange-50 text-[#ff6b35]' : 'hover:bg-gray-50'
                      }`}
                    >
                      High Priority
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role-Specific Notifications Tab */}
          <TabsContent value="role-specific" className="space-y-4">
            {roleSpecificNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
                  notification.isRead ? 'bg-white' : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl flex items-center justify-center border border-blue-200">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    {notification.metadata && (
                      <div className="flex items-center gap-4 mt-4 p-4 bg-gray-50 rounded-xl">
                        {notification.metadata.candidateAvatar && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-white">
                            <ImageWithFallback
                              src={notification.metadata.candidateAvatar}
                              alt={`${notification.metadata.candidateName} avatar`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {notification.metadata.candidateName}
                          </p>
                          <p className="text-sm text-gray-600">{notification.metadata.candidateEmail}</p>
                          {notification.metadata.jobTitle && (
                            <p className="text-sm text-[#ff6b35] font-medium">
                              {notification.metadata.jobTitle} • {notification.metadata.department}
                            </p>
                          )}
                          {notification.metadata.messagePreview && (
                            <p className="text-sm text-gray-600 mt-1 italic">
                              "{notification.metadata.messagePreview}"
                            </p>
                          )}
                          {notification.metadata.interviewDate && (
                            <p className="text-sm text-purple-600 font-medium mt-1">
                              Interview: {notification.metadata.interviewDate} at {notification.metadata.interviewTime} ({notification.metadata.interviewType})
                            </p>
                          )}
                          {notification.metadata.matchScore && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-gray-600">Match Score:</span>
                              <Badge className="bg-green-100 text-green-800">{notification.metadata.matchScore}%</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-4">
                      {notification.type === 'candidate-application' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                            onClick={() => handleViewCandidate(notification.metadata)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            Consider
                          </Button>
                        </>
                      )}
                      
                      {notification.type === 'candidate-message' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                            onClick={() => handleStartChat(notification.metadata)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Reply
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewCandidate(notification.metadata)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </>
                      )}
                      
                      {notification.type === 'consideration-accepted' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                            onClick={() => handleStartChat(notification.metadata)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Start Chat
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-purple-500 text-purple-600 hover:bg-purple-50"
                          >
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule Interview
                          </Button>
                        </>
                      )}
                      
                      {notification.type === 'new-candidate-match' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                            onClick={() => handleViewCandidate(notification.metadata)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Candidate
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="border-green-500 text-green-600 hover:bg-green-50"
                          >
                            <Send className="w-4 h-4 mr-2" />
                            Send Consideration
                          </Button>
                        </>
                      )}
                      
                      {notification.type === 'chat-request' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                            onClick={() => handleStartChat(notification.metadata)}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Start Chat
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleViewCandidate(notification.metadata)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </>
                      )}
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Read
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* General Notifications Tab */}
          <TabsContent value="general" className="space-y-4">
            {generalNotifications.map((notification) => (
              <Card 
                key={notification.id}
                className={`p-6 border-l-4 transition-all duration-200 hover:shadow-lg ${
                  notification.isRead ? 'bg-white' : getPriorityColor(notification.priority)
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl flex items-center justify-center border border-gray-200">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">{notification.message}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-[#ff6b35] rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    {notification.metadata && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                        {notification.type === 'new-candidate-match' && (
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Position:</span>
                              <span className="font-medium text-gray-900">{notification.metadata.jobTitle}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="text-gray-600">Match Score:</span>
                              <Badge className="bg-green-100 text-green-800">{notification.metadata.matchScore}%</Badge>
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
                        
                        {notification.type === 'chat-request' && (
                          <div className="flex items-center gap-4">
                            {notification.metadata.candidateAvatar && (
                              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white">
                                <ImageWithFallback
                                  src={notification.metadata.candidateAvatar}
                                  alt={`${notification.metadata.candidateName} avatar`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{notification.metadata.candidateName}</p>
                              <p className="text-sm text-gray-600 italic">"{notification.metadata.messagePreview}"</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-4">
                      <Button 
                        size="sm" 
                        className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Read
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Empty State */}
        {((selectedTab === 'role-specific' && roleSpecificNotifications.length === 0) ||
          (selectedTab === 'general' && generalNotifications.length === 0)) && (
          <Card className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600 mb-6">
              {selectedTab === 'role-specific' 
                ? "You'll receive notifications here about candidate activity for your job postings."
                : "You'll receive general updates about new candidates and system activity here."
              }
            </p>
            <Button 
              onClick={() => onNavigate('job-management')}
              className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
            >
              Manage Jobs
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}