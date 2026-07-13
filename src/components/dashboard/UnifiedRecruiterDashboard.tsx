import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  ArrowUpRight,
  ChevronRight,
  Activity,
  Briefcase
} from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { Progress } from '../ui/progress';
import { MiniCalendarWidget } from '../calendar/MiniCalendarWidget';
import { useDashboardData, type UserRole } from '../../hooks/useDashboardData';
import { usePermissions } from '../../hooks/usePermissions';
import { RoleBanner } from './RoleBanner';

interface UnifiedRecruiterDashboardProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
}

// Get color classes based on color name
const getColorClasses = (color: string) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-100 text-purple-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600'
  };
  return colors[color] || 'bg-gray-100 text-gray-600';
};

// Determine route based on stat title
const getStatRoute = (title: string) => {
  if (title.includes('Job')) return 'job-management';
  if (title.includes('Candidate') || title.includes('Review')) return 'candidate-management';
  if (title.includes('Interview')) return 'interview-calendar';
  if (title.includes('Team')) return 'team-management';
  return 'recruiter-stats';
};

// Get role display name
const getRoleDisplayName = (userRole: UserRole) => {
  const displayNames: Record<UserRole, string> = {
    'hiring-manager': 'Hiring Manager',
    lead: 'Lead Recruiter',
    manager: 'Manager',
    admin: 'Admin',
    recruiter: 'Recruiter'
  };
  return displayNames[userRole] || 'Recruiter';
};

export function UnifiedRecruiterDashboard({ onNavigate, onLogout, user }: Readonly<UnifiedRecruiterDashboardProps>) {
  const userRole = (user?.role || 'recruiter') as UserRole;

  // Use extracted hooks
  const permissions = usePermissions(userRole);
  const { stats, recentActivity, quickActions } = useDashboardData(userRole, onNavigate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole={userRole === 'admin' ? 'admin' : 'recruiter'}
        user={user}
        currentView="homepage"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl text-white mb-2">
                  Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-orange-100">
                  {user?.title || 'Recruiter'} • {user?.company || 'TechCorp Solutions'}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm text-orange-100 mb-1">Your Role</div>
                <Badge className="bg-white text-[#ff6b35] text-lg px-4 py-2">
                  {getRoleDisplayName(userRole)}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <button
                  key={stat.title}
                  onClick={() => onNavigate(getStatRoute(stat.title))}
                  className="text-left"
                >
                  <Card className="p-6 hover:shadow-lg transition-shadow h-full cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClasses(stat.color)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="text-3xl font-medium text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600 mb-2">{stat.title}</div>
                    <div className="flex items-center gap-1 text-sm text-green-600">
                      <ArrowUpRight className="w-4 h-4" />
                      {stat.change}
                    </div>
                  </Card>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Role-Specific Info Banner */}
              <RoleBanner userRole={userRole} canPostWithoutApproval={user?.canPostWithoutApproval} />

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={action.label}
                        variant="outline"
                        onClick={action.action}
                        className="h-auto py-4 flex flex-col items-center gap-2 hover:border-[#ff6b35] hover:text-[#ff6b35]"
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-xs text-center">{action.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('job-management')} className="self-start sm:self-auto">
                    View All
                  </Button>
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => {
                        // Route based on activity type
                        if (activity.type === 'candidate' || activity.type === 'review') {
                          onNavigate('candidate-management');
                        } else if (activity.type === 'interview') {
                          onNavigate('interview-calendar');
                        } else {
                          onNavigate('job-management');
                        }
                      }}
                      className="w-full flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 mb-1">{activity.title}</p>
                        <p className="text-sm text-gray-600">
                          {activity.candidate} • {activity.position}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </Card>

              {/* Conditional: Pending Approvals for Managers/Leads */}
              {permissions.canApproveJobs && (
                <Card className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
                    <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200 self-start sm:self-auto">
                      3 Pending
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {[
                      { title: 'Senior Engineer Position', submitter: 'John Doe', time: '2 hours ago' },
                      { title: 'Product Manager Role', submitter: 'Sarah Chen', time: '5 hours ago' },
                      { title: 'UX Designer Position', submitter: 'Mike Wilson', time: '1 day ago' }
                    ].map((approval) => (
                      <button
                        key={approval.title}
                        onClick={() => onNavigate('approval-queue')}
                        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Briefcase className="w-5 h-5 text-blue-600" />
                          <div className="text-left">
                            <p className="font-medium text-gray-900">{approval.title}</p>
                            <p className="text-sm text-gray-600">Submitted by {approval.submitter}</p>
                            <p className="text-xs text-gray-500 mt-1">{approval.time}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => onNavigate('approval-queue')}
                  >
                    View All Approvals
                  </Button>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Calendar Widget */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="font-medium text-gray-900">Upcoming Interviews</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="self-start sm:self-auto" 
                    onClick={() => onNavigate('interview-calendar')}
                  >
                    View All
                  </Button>
                </div>
                <MiniCalendarWidget />
              </Card>

              {/* Performance Widget - Not for Hiring Managers */}
              {userRole !== 'hiring-manager' && (
                <Card className="p-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {userRole === 'admin' || userRole === 'lead' ? 'Organization Performance' :
                     userRole === 'manager' ? 'Team Performance' : 'My Performance'}
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <span className="text-sm text-gray-600">Monthly Target</span>
                        <span className="text-sm font-medium text-gray-900">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <span className="text-sm text-gray-600">Time to Hire</span>
                        <span className="text-sm font-medium text-green-600">-15%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                        <span className="text-sm text-gray-600">Fill Rate</span>
                        <span className="text-sm font-medium text-gray-900">82%</span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
