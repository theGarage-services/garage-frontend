import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  Briefcase,
  Target,
  CheckCircle,
  BarChart3,
  Video,
  Download,
  RefreshCw,
  Crown,
  Eye,
  AlertCircle} from 'lucide-react';
import { companyService, type CompanyAnalytics } from '../../api/companies';
import { Alert, AlertDescription } from '../ui/alert';

interface InstitutionAnalyticsDashboardProps {
  institution: any;
  user: any;
  onBack: () => void;
  onMemberClick: (member: any) => void;
}

export function InstitutionAnalyticsDashboard({ 
  institution, 
  onBack, 
  onMemberClick 
}: Readonly<InstitutionAnalyticsDashboardProps>) {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real analytics data from API
  const [analyticsData, setAnalyticsData] = useState<CompanyAnalytics>({
    total_jobs_posted: 0,
    active_jobs: 0,
    total_interviews: 0,
    total_applications: 0,
    total_hires: 0,
    success_rate: 0,
    department_breakdown: [],
    top_performers: []
  });

  // Fetch analytics on mount
  const fetchAnalytics = useCallback(async () => {
    if (!institution?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await companyService.getAnalytics(institution.id);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, [institution?.id]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Helper to transform API data to display format
  const displayData = {
    overview: {
      totalHires: analyticsData.total_hires || 0,
      totalInterviews: analyticsData.total_interviews || 0,
      totalJobPostings: analyticsData.total_jobs_posted || 0,
      activeJobs: analyticsData.active_jobs || 0,
      totalApplications: analyticsData.total_applications || 0,
      hiringSuccessRate: analyticsData.success_rate || 0
    },
    departments: analyticsData.department_breakdown?.map((dept: {department: string, count: number}) => ({
      name: dept.department,
      jobPostings: dept.count
    })) || [],
    topPerformers: analyticsData.top_performers?.map((performer: {user_id: number, name: string, interviews_conducted: number}) => ({
      id: String(performer.user_id),
      name: performer.name,
      interviews: performer.interviews_conducted,
      avatar: performer.name?.split(' ').map((n: string) => n[0]).join('') || 'R'
    })) || []
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-medium text-gray-900">Institution Analytics</h1>
                  <p className="text-sm text-gray-500">{institution?.name || 'Institution Analytics'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
              </AlertDescription>
            </Alert>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]" />
          </div>
        ) : (
          <>
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Hires</p>
                <p className="text-3xl font-medium text-gray-900">{displayData.overview.totalHires}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interviews</p>
                <p className="text-3xl font-medium text-gray-900">{displayData.overview.totalInterviews}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Jobs</p>
                <p className="text-3xl font-medium text-gray-900">{displayData.overview.activeJobs}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-medium text-gray-900">{displayData.overview.hiringSuccessRate}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performers</h3>
                <div className="space-y-4">
                  {displayData.topPerformers.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No performer data available</p>
                  ) : (
                    displayData.topPerformers.map((performer, index) => (
                      <button
                        key={performer.id}
                        type="button"
                        className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left border-0"
                        onClick={() => onMemberClick(performer)}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                              {performer.avatar}
                            </div>
                            {index === 0 && (
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                                <Crown className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{performer.name}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-900">{performer.interviews}</span>
                              <span className="text-gray-500"> interviews</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </Card>

              {/* Performance Metrics */}
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Hiring Success Rate</span>
                      <span className="text-sm font-medium text-gray-900">{displayData.overview.hiringSuccessRate}%</span>
                    </div>
                    <Progress value={displayData.overview.hiringSuccessRate} className="h-2" />
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-medium text-gray-900">{displayData.overview.totalJobPostings}</p>
                        <p className="text-sm text-gray-600">Total Job Postings</p>
                      </div>
                      <div>
                        <p className="text-2xl font-medium text-gray-900">{displayData.overview.totalApplications}</p>
                        <p className="text-sm text-gray-600">Total Applications</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Department Performance</h3>
              <div className="grid gap-4">
                {displayData.departments.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No department data available</p>
                ) : (
                  displayData.departments.map((dept) => (
                    <div key={dept.name} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{dept.name}</h4>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium text-purple-600">{dept.jobPostings}</p>
                        <p className="text-gray-600">Job Postings</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <h3 className="text-lg font-medium text-gray-900">Team Member Summary</h3>
              </div>
              
              <div className="grid gap-4">
                {displayData.topPerformers.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No member data available</p>
                ) : (
                  displayData.topPerformers.map((member) => (
                    <div
                      key={member.id}
                      className="p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                            {member.avatar}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-gray-900">{member.name}</h4>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm self-start sm:self-auto">
                          <div className="text-center">
                            <p className="font-medium text-blue-600">{member.interviews}</p>
                            <p className="text-gray-500">Interviews</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => onMemberClick(member)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
              <p className="text-gray-500 text-center py-4">Activity feed coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
          </>
        )}
      </div>
    </div>
  );
}