import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AppHeader } from '../layout/AppHeader';
import { Progress } from '../ui/progress';
import { 
  Briefcase, 
  Users, 
  Calendar,
  Clock,
  Target,
  FileText,
  Send,
  Eye,
  MessageSquare,
  Star
} from 'lucide-react';

interface RegularRecruiterDashboardProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function RegularRecruiterDashboard({
  user,
  onNavigate,
  onLogout
}: Readonly<RegularRecruiterDashboardProps>) {
  // Mock data
  const stats = {
    activeJobs: 5,
    activeCandidates: 23,
    upcomingInterviews: 4,
    pendingSubmissions: 2,
    monthlyTarget: 3,
    currentHires: 1,
    avgResponseTime: '2.5 hours',
    candidateSatisfaction: 4.7
  };

  const myJobs = [
    {
      id: 'job-1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      status: 'active',
      candidates: 8,
      interviews: 2,
      offers: 0,
      deadline: '2024-02-15',
      priority: 'high'
    },
    {
      id: 'job-2',
      title: 'Product Manager',
      department: 'Product',
      status: 'active',
      candidates: 5,
      interviews: 1,
      offers: 1,
      deadline: '2024-02-28',
      priority: 'medium'
    },
    {
      id: 'job-3',
      title: 'UX Designer',
      department: 'Design',
      status: 'active',
      candidates: 10,
      interviews: 1,
      offers: 0,
      deadline: '2024-03-10',
      priority: 'low'
    }
  ];

  const upcomingInterviews = [
    {
      id: 'int-1',
      candidateName: 'Sarah Williams',
      position: 'Senior Software Engineer',
      time: 'Today, 2:00 PM',
      type: 'Technical Interview',
      duration: '1 hour'
    },
    {
      id: 'int-2',
      candidateName: 'Michael Chen',
      position: 'Product Manager',
      time: 'Tomorrow, 10:00 AM',
      type: 'Team Interview',
      duration: '45 min'
    },
    {
      id: 'int-3',
      candidateName: 'Emma Davis',
      position: 'UX Designer',
      time: 'Jan 18, 3:30 PM',
      type: 'Portfolio Review',
      duration: '30 min'
    }
  ];

  const recentActivity = [
    { id: 1, action: 'Candidate advanced to interview stage', candidate: 'Alex Johnson', time: '2 hours ago', job: 'Senior Software Engineer' },
    { id: 2, action: 'New candidate application', candidate: 'Lisa Brown', time: '4 hours ago', job: 'Product Manager' },
    { id: 3, action: 'Interview scheduled', candidate: 'Sarah Williams', time: '5 hours ago', job: 'Senior Software Engineer' },
    { id: 4, action: 'Offer submitted for approval', candidate: 'Michael Chen', time: '1 day ago', job: 'Product Manager' }
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

      <div className="pt-16">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl text-white mb-2">
                  Welcome back, {user?.firstName || 'Recruiter'}!
                </h1>
                <p className="text-blue-100">Here's your recruiting overview for today</p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm text-blue-100 mb-1">Monthly Progress</div>
                <div className="flex items-center gap-3">
                  <Progress value={(stats.currentHires / stats.monthlyTarget) * 100} className="w-40 h-2 bg-white/20" />
                  <span className="text-xl text-white font-medium">
                    {stats.currentHires}/{stats.monthlyTarget} Hires
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('job-management')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">{stats.activeJobs}</div>
              </div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('candidate-management')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">{stats.activeCandidates}</div>
              </div>
              <div className="text-sm text-gray-600">Active Candidates</div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onNavigate('interview-calendar')}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">{stats.upcomingInterviews}</div>
              </div>
              <div className="text-sm text-gray-600">Upcoming Interviews</div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">{stats.pendingSubmissions}</div>
              </div>
              <div className="text-sm text-gray-600">Pending Submissions</div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - My Jobs & Interviews */}
            <div className="lg:col-span-2 space-y-6">
              {/* My Active Jobs */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-900">My Active Jobs</h2>
                  <Button variant="outline" size="sm" onClick={() => onNavigate('job-management')} className="self-start sm:self-auto">
                    View All
                  </Button>
                </div>

                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div key={job.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">{job.title}</h3>
                            {job.priority === 'high' && (
                              <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">High Priority</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{job.department}</p>
                        </div>
                        <Badge variant="outline" className="text-xs self-start sm:self-auto">
                          Due {job.deadline}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xl font-medium text-blue-600">{job.candidates}</div>
                          <div className="text-xs text-gray-600">Candidates</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xl font-medium text-purple-600">{job.interviews}</div>
                          <div className="text-xs text-gray-600">Interviews</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xl font-medium text-green-600">{job.offers}</div>
                          <div className="text-xs text-gray-600">Offers</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col sm:flex-row gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                          <Users className="w-4 h-4 mr-2" />
                          View Candidates
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Activity */}
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Recent Activity</h2>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm font-medium text-gray-700">{activity.candidate}</span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-500">{activity.job}</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Column - Interviews & Performance */}
            <div className="space-y-6">
              {/* Upcoming Interviews */}
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Interviews</h2>
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('interview-calendar')} className="self-start sm:self-auto">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  {upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="p-3 border border-gray-200 rounded-lg hover:border-green-500 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{interview.candidateName}</p>
                          <p className="text-xs text-gray-600">{interview.position}</p>
                        </div>
                        <Badge variant="outline" className="text-xs self-start sm:self-auto">{interview.duration}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{interview.time}</span>
                      </div>
                      <div className="mt-2">
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                          {interview.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Performance Snapshot */}
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Performance Snapshot</h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                      <span className="text-sm text-gray-700">Monthly Target</span>
                      <Target className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="text-2xl font-medium text-gray-900 mb-2">
                      {stats.currentHires}/{stats.monthlyTarget}
                    </div>
                    <Progress value={(stats.currentHires / stats.monthlyTarget) * 100} className="h-2" />
                    <p className="text-xs text-gray-600 mt-2">
                      {Math.round((stats.currentHires / stats.monthlyTarget) * 100)}% complete
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-gray-600">Response Time</span>
                      </div>
                      <div className="text-lg font-medium text-gray-900">{stats.avgResponseTime}</div>
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="w-4 h-4 text-purple-600" />
                        <span className="text-xs text-gray-600">Satisfaction</span>
                      </div>
                      <div className="text-lg font-medium text-gray-900">{stats.candidateSatisfaction}/5.0</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Quick Actions */}
              <Card className="p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('job-posting')}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Submit Job for Approval
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('candidate-management')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add New Candidate
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('interview-calendar')}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Interview
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('recruiter-messages')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Candidates
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
