import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Briefcase,
  Target,
  Clock,
  Star,
  Activity,
  Calendar,
  Zap,
  UserCheck,
  Globe,
  Download,
  Share2,
  RefreshCw,
  Play,
  Pause,
  Loader2
} from 'lucide-react';
import { RecruiterProfileDropdown } from '../recruiter/RecruiterProfileDropdown';
import { dashboardApi } from '../../api/dashboard';
import { jobPostsApi } from '../../api/jobPosts';

interface MetricsDashboardProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  user: any;
  onLogout: () => void;
}

export function MetricsDashboard({ onBack, onNavigate, user, onLogout }: Readonly<MetricsDashboardProps>) {
  const [activeTab, setActiveTab] = useState('real-time');
  const [timeRange, setTimeRange] = useState('30d');
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time metrics state
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    activeUsers: 0,
    onlineRecruiters: 0,
    activeJobs: 0,
    pendingApplications: 0,
    scheduledInterviews: 0,
    newSignups: 0,
    messagesExchanged: 0,
    successfulMatches: 0
  });

  // Performance metrics state
  const [performanceMetrics, setPerformanceMetrics] = useState([
    {
      title: 'Application Success Rate',
      value: '0%',
      icon: Target,
      color: 'from-green-500 to-green-600',
      description: 'Job seekers getting hired'
    },
    {
      title: 'Average Time to Hire',
      value: '0 days',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      description: 'From application to offer'
    },
    {
      title: 'Recruiter Efficiency',
      value: '0%',
      icon: Zap,
      color: 'from-purple-500 to-purple-600',
      description: 'Successful placements'
    },
    {
      title: 'Platform Satisfaction',
      value: '0/5.0',
      icon: Star,
      color: 'from-orange-500 to-orange-600',
      description: 'User ratings'
    }
  ]);

  // Activity chart state
  const [activityData, setActivityData] = useState([
    { hour: '00', applications: 0, views: 0, messages: 0 },
    { hour: '04', applications: 0, views: 0, messages: 0 },
    { hour: '08', applications: 0, views: 0, messages: 0 },
    { hour: '12', applications: 0, views: 0, messages: 0 },
    { hour: '16', applications: 0, views: 0, messages: 0 },
    { hour: '20', applications: 0, views: 0, messages: 0 }
  ]);

  // Queue metrics state
  const [queueMetrics, setQueueMetrics] = useState<any[]>([]);

  // Geographic metrics state
  const [geographicMetrics, setGeographicMetrics] = useState<any[]>([]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [platformRes, queueRes] = await Promise.all([
        dashboardApi.getPlatformStats(),
        jobPostsApi.getQueueStats()
      ]);

      if (platformRes.success && platformRes.data) {
        const data = platformRes.data;

        // Real-time
        setRealtimeMetrics({
          activeUsers: data.realtime.active_users,
          onlineRecruiters: data.realtime.online_recruiters,
          activeJobs: data.realtime.active_jobs,
          pendingApplications: data.realtime.pending_applications,
          scheduledInterviews: data.realtime.scheduled_interviews,
          newSignups: data.realtime.new_signups,
          messagesExchanged: data.realtime.messages_exchanged,
          successfulMatches: data.realtime.successful_matches
        });

        // Performance
        setPerformanceMetrics([
          {
            title: 'Application Success Rate',
            value: `${data.performance.application_success_rate}%`,
            icon: Target,
            color: 'from-green-500 to-green-600',
            description: 'Job seekers getting hired'
          },
          {
            title: 'Average Time to Hire',
            value: `${data.performance.avg_time_to_hire_days} days`,
            icon: Clock,
            color: 'from-blue-500 to-blue-600',
            description: 'From application to offer'
          },
          {
            title: 'Recruiter Efficiency',
            value: `${data.performance.recruiter_efficiency}%`,
            icon: Zap,
            color: 'from-purple-500 to-purple-600',
            description: 'Successful placements'
          },
          {
            title: 'Platform Satisfaction',
            value: `${data.performance.platform_satisfaction}/5.0`,
            icon: Star,
            color: 'from-orange-500 to-orange-600',
            description: 'User ratings'
          }
        ]);

        // Hourly activity
        setActivityData(
          data.hourly_activity.map((h) => ({
            hour: h.hour,
            applications: h.applications,
            views: h.views,
            messages: h.messages
          }))
        );

        // Geographic
        setGeographicMetrics(data.geographic);
      } else {
        setError(platformRes.error || 'Failed to load dashboard data');
      }

      // Queue stats
      if (queueRes.success && queueRes.data) {
        setQueueMetrics(
          queueRes.data.map((q) => ({
            name: q.name,
            candidates: q.members,
            fill_rate: Number.parseInt(q.response_rate?.replace('%', '') || '0', 10) || 70,
            hiring_trend: q.hiring_trend
          }))
        );
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err?.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

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
                  <span className="text-xl font-medium text-gray-900">Metrics Dashboard</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <span className="text-sm text-gray-600">{isLive ? 'Live Data' : 'Paused'}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsLive(!isLive)}
                  className="ml-2"
                >
                  {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium text-gray-900 mb-2">Platform Metrics</h1>
              <p className="text-gray-600">Real-time analytics and performance insights</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" disabled={isLoading}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={fetchData} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]" />
          </div>
        ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <TabsList className="grid w-full sm:w-fit grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="real-time" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Real-Time
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="queues" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Queues
              </TabsTrigger>
              <TabsTrigger value="geographic" className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Geographic
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              {(['24h', '7d', '30d'] as const).map((period) => (
                <Button
                  key={period}
                  variant={timeRange === period ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(period)}
                  className={timeRange === period ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
                >
                  {period === '24h' ? '24 Hours' : period === '7d' ? '7 Days' : '30 Days'}
                </Button>
              ))}
            </div>
          </div>

          <TabsContent value="real-time" className="space-y-6">
            {/* Real-time Activity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-medium text-gray-900">{realtimeMetrics.activeUsers.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Active Users</div>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-medium text-gray-900">{realtimeMetrics.onlineRecruiters}</div>
                    <div className="text-sm text-gray-600">Online Recruiters</div>
                  </div>
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-medium text-gray-900">{realtimeMetrics.activeJobs.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Active Jobs</div>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-medium text-gray-900">{realtimeMetrics.scheduledInterviews}</div>
                    <div className="text-sm text-gray-600">Interviews Today</div>
                  </div>
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-orange-600" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Compact Activity Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">24-Hour Activity</h3>
              <div className="h-24 flex items-end justify-between gap-2">
                {activityData.map((data) => (
                  <div key={data.hour} className="flex-1 flex flex-col items-center">
                    <div className="w-full flex gap-1 mb-2">
                      <div 
                        className="bg-blue-500 rounded-t flex-1"
                        style={{ height: `${(data.applications / 100) * 60}px` }}
                        title={`${data.applications} applications`}
                      ></div>
                      <div 
                        className="bg-green-500 rounded-t flex-1"
                        style={{ height: `${(data.views / 600) * 60}px` }}
                        title={`${data.views} job views`}
                      ></div>
                      <div 
                        className="bg-orange-500 rounded-t flex-1"
                        style={{ height: `${(data.messages / 200) * 60}px` }}
                        title={`${data.messages} messages`}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">{data.hour}:00</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-gray-600">Applications</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-gray-600">Job Views</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-orange-500 rounded"></div>
                  <span className="text-gray-600">Messages</span>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric) => {
                const IconComponent = metric.icon;
                return (
                  <Card key={metric.title} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${metric.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="text-2xl font-medium text-gray-900 mb-1">{metric.value}</div>
                    <div className="text-sm font-medium text-gray-900 mb-1">{metric.title}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="queues" className="space-y-6">
            {/* Queue Performance */}
            <div className="grid gap-4">
              {queueMetrics.map((queue) => (
                <Card key={queue.name} className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900">{queue.name}</h3>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-gray-600">{queue.candidates.toLocaleString()} candidates</span>
                          <span className="text-gray-600">{queue.hiring_trend}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm mb-1">
                            <span className="text-gray-600">Fill Rate</span>
                            <span className="font-medium">{queue.fill_rate}%</span>
                          </div>
                          <Progress value={queue.fill_rate} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="geographic" className="space-y-6">
            {/* Geographic Distribution */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Regional Performance</h3>
              <div className="space-y-4">
                {geographicMetrics.map((region) => (
                  <div key={region.region} className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="font-medium text-gray-900">{region.region}</span>
                      <div className="text-left sm:text-right">
                        <div className="font-medium text-gray-900">{region.fill_rate}% fill rate</div>
                        <div className="text-sm text-gray-600">{region.jobs.toLocaleString()} jobs</div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${region.color}`}
                        style={{ width: `${region.fill_rate}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}