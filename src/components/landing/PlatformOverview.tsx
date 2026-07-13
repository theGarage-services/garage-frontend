import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  ArrowLeft,
  Users, 
  Briefcase, 
  Target,
  TrendingUp,
  Building2,
  Star,
  MessageCircle,
  Calendar,
  CheckCircle,
  Heart,
  Zap,
  Award,
  Activity,
  BarChart3,
  UserCheck,
  Rocket,
  Globe,
  RefreshCw,
  Plus
} from 'lucide-react';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';

interface PlatformOverviewProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export function PlatformOverview({ onBack, onNavigate, user, onLogout }: Readonly<PlatformOverviewProps>) {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('30d');

  // Platform-wide statistics
  const platformStats = {
    totalUsers: 125847,
    jobSeekers: 89234,
    recruiters: 8456,
    companies: 2847,
    jobsPosted: 45673,
    successfulHires: 12847,
    averageTimeToHire: 18,
    platformRating: 4.8,
    growth: {
      users: 23,
      jobs: 34,
      hires: 28,
      satisfaction: 12
    }
  };

  // Real-time activity data
  const realtimeActivity = [
    { type: 'application', user: 'Sarah Chen', action: 'applied to Senior Developer at TechCorp', time: '2 minutes ago', avatar: 'SC' },
    { type: 'hire', user: 'David Kim', action: 'hired for Product Manager role', time: '5 minutes ago', avatar: 'DK' },
    { type: 'interview', user: 'Maria Garcia', action: 'scheduled interview with DataFlow Inc', time: '8 minutes ago', avatar: 'MG' },
    { type: 'posting', user: 'Tech Solutions', action: 'posted new UX Designer position', time: '12 minutes ago', avatar: 'TS' },
    { type: 'connection', user: 'Alex Johnson', action: 'connected with recruiter at StartupXYZ', time: '15 minutes ago', avatar: 'AJ' }
  ];

  // Success metrics by category
  const successMetrics = [
    { category: 'Technology', jobs: 12847, hires: 3892, rate: 85, icon: Rocket, color: 'from-blue-500 to-blue-600' },
    { category: 'Finance', jobs: 8234, hires: 2156, rate: 78, icon: Building2, color: 'from-green-500 to-green-600' },
    { category: 'Healthcare', jobs: 6756, hires: 1934, rate: 82, icon: Heart, color: 'from-red-500 to-red-600' },
    { category: 'Marketing', jobs: 5432, hires: 1567, rate: 76, icon: Target, color: 'from-purple-500 to-purple-600' },
    { category: 'Design', jobs: 4234, hires: 1298, rate: 88, icon: Zap, color: 'from-orange-500 to-orange-600' }
  ];

  // Geographic distribution (simplified chart data)
  const geographicData = [
    { region: 'Ontario', percentage: 45, jobs: 20563, color: 'bg-blue-500' },
    { region: 'British Columbia', percentage: 23, jobs: 10509, color: 'bg-green-500' },
    { region: 'Quebec', percentage: 18, jobs: 8221, color: 'bg-purple-500' },
    { region: 'Alberta', percentage: 14, jobs: 6391, color: 'bg-orange-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="p-2 text-gray-600 hover:text-[#ff6b35] transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-medium text-gray-900">
                    <span className="text-black">the</span><span className="text-[#ff6b35]">Garage</span> Platform
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live Platform Data</span>
              </div>
              
              <RecruiterProfileDropdown 
                onNavigate={onNavigate}
                onLogout={onLogout}
                user={user}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-900 mb-2">Platform Overview</h1>
          <p className="text-gray-600">Real-time insights into theGarage dual-perspective job platform</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Live Activity
              </TabsTrigger>
              <TabsTrigger value="success" className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                Success Metrics
              </TabsTrigger>
              <TabsTrigger value="geographic" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Geographic
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {(['7d', '30d', '90d'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeRange === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(period)}
                  className={timeRange === period ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Platform Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-gray-900">{platformStats.totalUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Users</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{platformStats.growth.users}% this month</span>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-gray-900">{platformStats.jobsPosted.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Jobs Posted</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{platformStats.growth.jobs}% this month</span>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-gray-900">{platformStats.successfulHires.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Successful Hires</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{platformStats.growth.hires}% this month</span>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium text-gray-900">{platformStats.platformRating}</div>
                    <div className="text-sm text-gray-600">Platform Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+{platformStats.growth.satisfaction}% satisfaction</span>
                </div>
              </Card>
            </div>

            {/* User Breakdown */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Distribution</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Job Seekers</div>
                        <div className="text-sm text-gray-500">{((platformStats.jobSeekers / platformStats.totalUsers) * 100).toFixed(1)}% of users</div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-gray-900">{platformStats.jobSeekers.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Recruiters</div>
                        <div className="text-sm text-gray-500">{((platformStats.recruiters / platformStats.totalUsers) * 100).toFixed(1)}% of users</div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-gray-900">{platformStats.recruiters.toLocaleString()}</div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">Companies</div>
                        <div className="text-sm text-gray-500">Active organizations</div>
                      </div>
                    </div>
                    <div className="text-lg font-medium text-gray-900">{platformStats.companies.toLocaleString()}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Performance</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Average Time to Hire</span>
                      <span className="text-sm text-gray-900">{platformStats.averageTimeToHire} days</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">25% faster than industry average</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Application Success Rate</span>
                      <span className="text-sm text-gray-900">28.1%</span>
                    </div>
                    <Progress value={28} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">Higher than industry standard</div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
                      <span className="text-sm text-gray-900">{platformStats.platformRating}/5.0</span>
                    </div>
                    <Progress value={96} className="h-2" />
                    <div className="text-xs text-gray-500 mt-1">Based on {(platformStats.totalUsers * 0.73).toFixed(0)} reviews</div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Real-Time Platform Activity</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-600">Live Updates</span>
                </div>
              </div>

              <div className="space-y-4">
                {realtimeActivity.map((activity) => (
                  <div key={`${activity.user}-${activity.time}`} className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg">
                    <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {activity.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-gray-900">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      {activity.type === 'hire' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {activity.type === 'application' && <Briefcase className="w-4 h-4 text-blue-500" />}
                      {activity.type === 'interview' && <Calendar className="w-4 h-4 text-purple-500" />}
                      {activity.type === 'posting' && <Plus className="w-4 h-4 text-orange-500" />}
                      {activity.type === 'connection' && <MessageCircle className="w-4 h-4 text-green-500" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-6">
                <Button variant="outline" className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Load More Activity
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="success" className="space-y-6">
            <div className="grid gap-6">
              {successMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={metric.category} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{metric.category}</h3>
                          <p className="text-sm text-gray-600">{metric.jobs.toLocaleString()} jobs • {metric.hires.toLocaleString()} hires</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-medium text-gray-900">{metric.rate}%</div>
                        <div className="text-sm text-gray-600">Success Rate</div>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Progress value={metric.rate} className="h-2" />
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Job Distribution by Region</h3>
              
              <div className="space-y-4">
                {geographicData.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900">{region.region}</span>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{region.percentage}%</div>
                        <div className="text-sm text-gray-600">{region.jobs.toLocaleString()} jobs</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${region.color}`}
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}