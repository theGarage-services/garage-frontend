import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Building2,
  ArrowUpRight,
  ChevronRight,
  Award,
  BarChart3,
  Shield,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AppHeader } from '../layout/AppHeader';
import { Progress } from '../ui/progress';
import { MiniCalendarWidget } from '../calendar/MiniCalendarWidget';
import { InterviewCalendar } from '../calendar/InterviewCalendar';

interface RecruiterHomepageProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
}

export function RecruiterHomepage({ onNavigate, onLogout, user }: Readonly<RecruiterHomepageProps>) {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  
  // Mock notification count - in a real app, this would come from props or API

  // Determine if user is admin (for admins we show different navigation and content)

  // Organization-wide admin stats
  const stats = [
    {
      title: 'Team Members',
      value: '24',
      change: '+3 this month',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Active Jobs',
      value: '47',
      change: '+8 this week',
      icon: Building2,
      trend: 'up'
    },
    {
      title: 'Total Candidates',
      value: '1,847',
      change: '+156 this week',
      icon: Activity,
      trend: 'up'
    },
    {
      title: 'This Month Hires',
      value: '18',
      change: '+5 vs last month',
      icon: Award,
      trend: 'up'
    }
  ];

  // Team activity data
  const teamActivity = [
    {
      id: '1',
      member: 'Sarah Johnson',
      action: 'Scheduled interview',
      candidate: 'Alex Martinez',
      position: 'Senior Engineer',
      time: '2 hours ago',
      avatar: 'SJ'
    },
    {
      id: '2',
      member: 'Michael Chen',
      action: 'Reviewed application',
      candidate: 'Emma Wilson',
      position: 'Product Manager',
      time: '4 hours ago',
      avatar: 'MC'
    },
    {
      id: '3',
      member: 'Jennifer Lee',
      action: 'Made an offer',
      candidate: 'David Brown',
      position: 'UX Designer',
      time: '1 day ago',
      avatar: 'JL'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="homepage"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl mb-2 text-gray-900">
            Admin Dashboard 👋
          </h1>
          <p className="text-gray-600">
            Manage your organization's recruiting system and team performance.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            const gradients = [
              'from-[#ff6b35] to-[#ff8c42]',
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600',
              'from-green-500 to-green-600'
            ];
            return (
              <Card key={stat.title} className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${gradients[index]} rounded-xl flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="text-3xl font-semibold mb-1 text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
                <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">{stat.change}</div>
              </Card>
            );
          })}
        </div>

        {/* Main Dashboard Content */}
        <div className="space-y-8">
          {/* Admin Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="group p-6 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => onNavigate('institution-profile')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Team Management</h3>
                <p className="text-sm opacity-90 leading-relaxed">Manage recruiters, roles, and permissions</p>
              </div>
            </Card>

            <Card className="group p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => onNavigate('institution-management')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Organization</h3>
                <p className="text-sm opacity-90 leading-relaxed">Configure company settings and branding</p>
              </div>
            </Card>

            <Card className="group p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => onNavigate('analytics')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                <p className="text-sm opacity-90 leading-relaxed">View organization-wide metrics and insights</p>
              </div>
            </Card>

            <Card className="group p-6 bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
                  onClick={() => onNavigate('access-management')}>
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Shield className="w-7 h-7" />
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Access Control</h3>
                <p className="text-sm opacity-90 leading-relaxed">Manage permissions and security settings</p>
              </div>
            </Card>
          </div>

          {/* Team Activity & Performance */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Team Activity Feed */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">Recent Team Activity</h3>
                  <p className="text-sm text-gray-600">Latest actions by your recruiting team</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#ff6b35] rounded-full animate-pulse"></div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    <Activity className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-4">
                {teamActivity.map((activity) => (
                  <div key={activity.id} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl hover:shadow-lg transition-all duration-300 border border-orange-100">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42]">
                        <AvatarFallback className="text-white text-sm">{activity.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <span className="font-medium text-gray-900">{activity.member}</span>
                            <span className="text-gray-600 text-sm"> {activity.action}</span>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{activity.candidate}</span> • {activity.position}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('institution-profile')}
                  className="w-full border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                >
                  <Users className="w-4 h-4 mr-2" />
                  View Full Team Activity
                </Button>
              </div>
            </Card>

            {/* System Health & Quick Stats */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900 mb-1">System Overview</h3>
                  <p className="text-sm text-gray-600">Organization performance metrics</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Healthy
                </Badge>
              </div>

              <div className="space-y-6">
                {/* Hiring Velocity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Hiring Velocity</span>
                    <span className="text-sm font-medium text-gray-900">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">15% faster than last month</p>
                </div>

                {/* Team Capacity */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Team Capacity</span>
                    <span className="text-sm font-medium text-gray-900">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">12 active roles, 24 team members</p>
                </div>

                {/* Candidate Response Rate */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Response Rate</span>
                    <span className="text-sm font-medium text-gray-900">92%</span>
                  </div>
                  <Progress value={92} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">Above industry average</p>
                </div>

                {/* System Performance Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                  <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <div className="text-2xl font-semibold text-blue-900">47</div>
                    <div className="text-xs text-blue-700 mt-1">Active Jobs</div>
                  </div>
                  <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-2xl font-semibold text-purple-900">1.8k</div>
                    <div className="text-xs text-purple-700 mt-1">Total Candidates</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('analytics')}
                  className="w-full border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </Card>
          </div>

          {/* Calendar Widget */}
          <div>
            <MiniCalendarWidget
              onScheduleInterview={() => {
                // In a real app, this would open the schedule modal
                console.log('Schedule interview clicked');
              }}
            />
          </div>
        </div>
      </div>

      {/* Full Screen Calendar Modal */}
      {showFullCalendar && (
        <div className="fixed inset-0 z-50 bg-white">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Interview Calendar</h2>
              <Button variant="ghost" onClick={() => setShowFullCalendar(false)}>
                ×
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <InterviewCalendar
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}