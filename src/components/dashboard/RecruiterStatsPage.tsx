import { useState } from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { AppHeader } from '../layout/AppHeader';
import { 
  Users, 
  Briefcase, 
  Calendar, 
  TrendingUp, 
  Target,
  UserCheck,
  ArrowUpRight,
  Clock,
  Coffee,
  Phone,
  Video,
  Star,
  Zap,
  ThumbsUp,
  DollarSign,
  Minus
} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';

interface RecruiterStatsPageProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
}

export function RecruiterStatsPage({ onNavigate, onLogout, user }: Readonly<RecruiterStatsPageProps>) {
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Comprehensive stats for the recruiter
  const stats = {
    overview: {
      totalJobPostings: 24,
      totalCandidates: 342,
      totalInterviews: 89,
      totalHires: 18,
      coffeeChats: 47,
      phoneScreens: 134,
      videoInterviews: 56,
      successRate: 87,
      avgTimeToHire: 14,
      responseRate: 92,
      candidateSatisfaction: 4.8,
      offerAcceptanceRate: 78
    },
    kpis: [
      {
        title: 'Hiring Velocity',
        value: '87%',
        target: '80%',
        status: 'above',
        icon: Zap,
        color: 'from-green-500 to-green-600'
      },
      {
        title: 'Quality of Hire',
        value: '4.6/5',
        target: '4.0/5',
        status: 'above',
        icon: Star,
        color: 'from-yellow-500 to-yellow-600'
      },
      {
        title: 'Time to Fill',
        value: '14 days',
        target: '21 days',
        status: 'above',
        icon: Clock,
        color: 'from-blue-500 to-blue-600'
      },
      {
        title: 'Cost per Hire',
        value: '$2,340',
        target: '$3,000',
        status: 'above',
        icon: DollarSign,
        color: 'from-purple-500 to-purple-600'
      },
      {
        title: 'Candidate Experience',
        value: '4.8/5',
        target: '4.5/5',
        status: 'above',
        icon: ThumbsUp,
        color: 'from-orange-500 to-orange-600'
      },
      {
        title: 'Source Quality',
        value: '92%',
        target: '85%',
        status: 'above',
        icon: Target,
        color: 'from-pink-500 to-pink-600'
      }
    ],
    monthlyTrends: {
      months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      hires: [2, 3, 4, 2, 3, 4],
      interviews: [8, 12, 15, 11, 14, 18],
      candidates: [34, 42, 48, 39, 52, 58],
      coffeeChats: [6, 8, 9, 7, 8, 9]
    },
    activities: {
      coffeeChats: {
        total: 47,
        thisWeek: 8,
        avgDuration: '32 min',
        conversionRate: 68,
        topLocations: ['Starbucks Downtown', 'Blue Bottle Coffee', 'Local Cafe']
      },
      phoneScreens: {
        total: 134,
        thisWeek: 12,
        avgDuration: '18 min',
        conversionRate: 42,
        passRate: 65
      },
      videoInterviews: {
        total: 56,
        thisWeek: 6,
        avgDuration: '45 min',
        conversionRate: 58,
        feedback: 4.6
      }
    },
    topPerformingJobs: [
      {
        id: '1',
        title: 'Senior Frontend Engineer',
        applications: 89,
        interviews: 23,
        hires: 4,
        avgTimeToHire: 12,
        quality: 4.8
      },
      {
        id: '2',
        title: 'Product Manager',
        applications: 67,
        interviews: 18,
        hires: 3,
        avgTimeToHire: 15,
        quality: 4.6
      },
      {
        id: '3',
        title: 'UX Designer',
        applications: 54,
        interviews: 14,
        hires: 2,
        avgTimeToHire: 16,
        quality: 4.5
      }
    ],
    recentHires: [
      {
        id: '1',
        name: 'Alex Chen',
        position: 'Senior Frontend Engineer',
        hireDate: '2025-01-15',
        timeToHire: 12,
        source: 'LinkedIn',
        satisfaction: 5
      },
      {
        id: '2',
        name: 'Maria Rodriguez',
        position: 'Backend Engineer',
        hireDate: '2025-01-10',
        timeToHire: 14,
        source: 'Coffee Chat',
        satisfaction: 5
      },
      {
        id: '3',
        name: 'James Wilson',
        position: 'Product Manager',
        hireDate: '2025-01-05',
        timeToHire: 16,
        source: 'Referral',
        satisfaction: 4
      }
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="homepage"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Page Title & Controls Section */}
      <div className="pt-20 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white pb-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold mb-2">My Performance Stats</h1>
              <p className="text-white/90">Track your recruiting metrics and KPIs</p>
            </div>

            <div className="flex items-center gap-4 self-start sm:self-auto">
              <Select value={selectedPeriod} onValueChange={(value: any) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-36 bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Key Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center shadow-lg">
                <Briefcase className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold mb-1 text-gray-900">{stats.overview.totalJobPostings}</div>
            <div className="text-sm text-gray-600 mb-2">Job Postings</div>
            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">+4 this month</div>
          </Card>

          <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold mb-1 text-gray-900">{stats.overview.totalCandidates}</div>
            <div className="text-sm text-gray-600 mb-2">Total Candidates</div>
            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">+58 this month</div>
          </Card>

          <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold mb-1 text-gray-900">{stats.overview.totalInterviews}</div>
            <div className="text-sm text-gray-600 mb-2">Interviews</div>
            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">+18 this month</div>
          </Card>

          <Card className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="text-3xl font-semibold mb-1 text-gray-900">{stats.overview.totalHires}</div>
            <div className="text-sm text-gray-600 mb-2">Successful Hires</div>
            <div className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full inline-block">+4 this month</div>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-white shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Success Metrics */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Success Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm text-gray-600">Success Rate</span>
                      <span className="text-sm font-medium text-gray-900">{stats.overview.successRate}%</span>
                    </div>
                    <Progress value={stats.overview.successRate} className="h-2" />
                    <p className="text-xs text-green-600 mt-1">Above target</p>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-medium text-gray-900">{stats.overview.responseRate}%</span>
                    </div>
                    <Progress value={stats.overview.responseRate} className="h-2" />
                    <p className="text-xs text-green-600 mt-1">Excellent performance</p>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm text-gray-600">Offer Acceptance Rate</span>
                      <span className="text-sm font-medium text-gray-900">{stats.overview.offerAcceptanceRate}%</span>
                    </div>
                    <Progress value={stats.overview.offerAcceptanceRate} className="h-2" />
                    <p className="text-xs text-blue-600 mt-1">Good performance</p>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm text-gray-600">Candidate Satisfaction</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{stats.overview.candidateSatisfaction}/5</span>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= Math.floor(stats.overview.candidateSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Monthly Trends */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-6">Monthly Trends</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                      <span className="text-sm text-gray-600">Hires Trend</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600">+23%</span>
                      </div>
                    </div>
                    <div className="h-24 bg-gray-50 rounded-lg flex items-end justify-between px-3 py-3">
                      {stats.monthlyTrends.months.map((month, index) => (
                        <div
                          key={month}
                          className="bg-gradient-to-t from-green-500 to-green-400 rounded-sm w-10"
                          style={{ height: `${(stats.monthlyTrends.hires[index] / Math.max(...stats.monthlyTrends.hires)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-3">
                      <span className="text-sm text-gray-600">Interviews Trend</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-blue-600">+18%</span>
                      </div>
                    </div>
                    <div className="h-24 bg-gray-50 rounded-lg flex items-end justify-between px-3 py-3">
                      {stats.monthlyTrends.months.map((month, index) => (
                        <div
                          key={month}
                          className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm w-10"
                          style={{ height: `${(stats.monthlyTrends.interviews[index] / Math.max(...stats.monthlyTrends.interviews)) * 100}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Hires */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Successful Hires</h3>
              <div className="grid gap-4">
                {stats.recentHires.map((hire) => (
                  <div key={hire.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100">
                    <div className="flex items-start sm:items-center gap-4 min-w-0">
                      <Avatar className="w-12 h-12 shrink-0">
                        <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
                          {hire.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900">{hire.name}</h4>
                        <p className="text-sm text-gray-600">{hire.position}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                          <span className="text-xs text-gray-500">{hire.timeToHire} days to hire</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">Source: {hire.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={`${hire.name}-${star}`}
                          className={`w-4 h-4 ${star <= hire.satisfaction ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* KPIs Tab */}
          <TabsContent value="kpis" className="space-y-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.kpis.map((kpi) => {
                const IconComponent = kpi.icon;
                return (
                  <Card key={kpi.title} className="p-6 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 bg-gradient-to-r ${kpi.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      {kpi.status === 'above' ? (
                        <Badge className="bg-green-100 text-green-800">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Above Target
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Minus className="w-3 h-3 mr-1" />
                          On Track
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-sm text-gray-600 mb-2">{kpi.title}</h4>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-semibold text-gray-900">{kpi.value}</span>
                      <span className="text-sm text-gray-500">/ {kpi.target}</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Coffee Chats */}
              <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Coffee className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-amber-100 text-amber-800">
                    +{stats.activities.coffeeChats.thisWeek} this week
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Coffee Chats</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Total Conducted</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.activities.coffeeChats.total}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Avg Duration</span>
                    <span className="text-sm font-medium text-gray-900">{stats.activities.coffeeChats.avgDuration}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Conversion Rate</span>
                    <span className="text-sm font-medium text-green-600">{stats.activities.coffeeChats.conversionRate}%</span>
                  </div>
                  <div className="pt-3 border-t border-amber-200">
                    <span className="text-xs text-gray-500 block mb-2">Top Locations</span>
                    {stats.activities.coffeeChats.topLocations.map((location, i) => (
                      <Badge key={`${location}-${i}`} variant="outline" className="mr-1 mb-1 text-xs">
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Phone Screens */}
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    +{stats.activities.phoneScreens.thisWeek} this week
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phone Screens</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Total Conducted</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.activities.phoneScreens.total}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Avg Duration</span>
                    <span className="text-sm font-medium text-gray-900">{stats.activities.phoneScreens.avgDuration}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Pass Rate</span>
                    <span className="text-sm font-medium text-green-600">{stats.activities.phoneScreens.passRate}%</span>
                  </div>
                  <div className="pt-3 border-t border-blue-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs text-gray-500">Conversion to Interview</span>
                      <span className="text-xs font-medium text-blue-600">{stats.activities.phoneScreens.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Video Interviews */}
              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Video className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">
                    +{stats.activities.videoInterviews.thisWeek} this week
                  </Badge>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Video Interviews</h3>
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Total Conducted</span>
                    <span className="text-lg font-semibold text-gray-900">{stats.activities.videoInterviews.total}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Avg Duration</span>
                    <span className="text-sm font-medium text-gray-900">{stats.activities.videoInterviews.avgDuration}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <span className="text-sm text-gray-600">Feedback Score</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-purple-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-xs text-gray-500">Conversion to Offer</span>
                      <span className="text-xs font-medium text-purple-600">{stats.activities.videoInterviews.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Activity Breakdown Chart */}
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">Activity Distribution (Last 30 Days)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center">
                    <Coffee className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.activities.coffeeChats.total}</div>
                  <div className="text-sm text-gray-600">Coffee Chats</div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                    <Phone className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.activities.phoneScreens.total}</div>
                  <div className="text-sm text-gray-600">Phone Screens</div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                    <Video className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.activities.videoInterviews.total}</div>
                  <div className="text-sm text-gray-600">Video Interviews</div>
                </div>
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">{stats.overview.totalHires}</div>
                  <div className="text-sm text-gray-600">Hires</div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Job Postings</h3>
              <div className="space-y-4">
                {stats.topPerformingJobs.map((job) => (
                  <div key={job.id} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-orange-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <h4 className="font-medium text-gray-900">{job.title}</h4>
                      <div className="flex items-center gap-1 self-start sm:self-auto">
                        <span className="text-sm font-medium text-gray-900">{job.quality}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-sm">
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="font-medium text-gray-900">{job.applications}</div>
                        <div className="text-xs text-gray-500">Applications</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="font-medium text-gray-900">{job.interviews}</div>
                        <div className="text-xs text-gray-500">Interviews</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="font-medium text-gray-900">{job.hires}</div>
                        <div className="text-xs text-gray-500">Hires</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="font-medium text-gray-900">{job.avgTimeToHire}</div>
                        <div className="text-xs text-gray-500">Days to Hire</div>
                      </div>
                      <div className="text-center p-2 bg-white rounded-lg">
                        <div className="font-medium text-green-600">{Math.round((job.hires / job.applications) * 100)}%</div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                      </div>
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
