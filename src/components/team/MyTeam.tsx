import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Search, 
  Users, 
  Briefcase, 
  Calendar, 
  Star,
  Clock,
  MoreHorizontal,
  UserCheck,
  ArrowUpRight,
  BarChart3,
  CheckCircle,
  AlertCircle,
  Mail} from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { AppHeader } from '../layout/AppHeader';

interface MyTeamProps {
  onBack: () => void;
  onNavigate: (view: string) => void;
  onViewRecruiter: (recruiter: any) => void;
  onLogout: () => void;
  user: any;
}

export function MyTeam({ onNavigate, onViewRecruiter, onLogout, user }: Readonly<MyTeamProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Mock team members data (excluding other admins)
  const teamMembers = [
    {
      id: 'rec-1',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      role: 'recruiter',
      department: 'Engineering',
      joinDate: '2024-01-15',
      status: 'active',
      avatar: 'SJ',
      stats: {
        jobPostings: 8,
        totalCandidates: 156,
        interviews: 23,
        hires: 5,
        avgTimeToHire: 18,
        successRate: 85
      },
      currentMonth: {
        jobPostings: 2,
        interviews: 7,
        hires: 2
      }
    },
    {
      id: 'rec-2', 
      firstName: 'Michael',
      lastName: 'Chen',
      email: 'michael.chen@company.com',
      role: 'recruiter',
      department: 'Product',
      joinDate: '2023-11-20',
      status: 'active',
      avatar: 'MC',
      stats: {
        jobPostings: 12,
        totalCandidates: 203,
        interviews: 31,
        hires: 7,
        avgTimeToHire: 22,
        successRate: 78
      },
      currentMonth: {
        jobPostings: 3,
        interviews: 5,
        hires: 1
      }
    },
    {
      id: 'rec-3',
      firstName: 'Emily',
      lastName: 'Rodriguez',
      email: 'emily.rodriguez@company.com', 
      role: 'recruiter',
      department: 'Design',
      joinDate: '2024-03-01',
      status: 'active',
      avatar: 'ER',
      stats: {
        jobPostings: 5,
        totalCandidates: 89,
        interviews: 12,
        hires: 3,
        avgTimeToHire: 15,
        successRate: 92
      },
      currentMonth: {
        jobPostings: 1,
        interviews: 4,
        hires: 1
      }
    },
    {
      id: 'rec-4',
      firstName: 'David',
      lastName: 'Kim',
      email: 'david.kim@company.com',
      role: 'recruiter',
      department: 'Sales',
      joinDate: '2023-08-10',
      status: 'inactive',
      avatar: 'DK',
      stats: {
        jobPostings: 15,
        totalCandidates: 298,
        interviews: 42,
        hires: 9,
        avgTimeToHire: 28,
        successRate: 72
      },
      currentMonth: {
        jobPostings: 0,
        interviews: 1,
        hires: 0
      }
    }
  ];

  // Company-wide aggregated stats
  const companyStats = [
    {
      title: 'Total Team Members',
      value: teamMembers.length.toString(),
      change: '+1 this month',
      icon: Users,
      trend: 'up'
    },
    {
      title: 'Total Job Postings',
      value: teamMembers.reduce((sum, member) => sum + member.stats.jobPostings, 0).toString(),
      change: '+6 this month',
      icon: Briefcase,
      trend: 'up'
    },
    {
      title: 'Total Interviews',
      value: teamMembers.reduce((sum, member) => sum + member.stats.interviews, 0).toString(),
      change: '+17 this week',
      icon: Calendar,
      trend: 'up'
    },
    {
      title: 'Total Hires',
      value: teamMembers.reduce((sum, member) => sum + member.stats.hires, 0).toString(),
      change: '+4 this month',
      icon: UserCheck,
      trend: 'up'
    }
  ];

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = searchQuery === '' || 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || member.status === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="team-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-medium text-gray-900 mb-2">Team Management</h1>
              <p className="text-gray-600">Manage your recruiting team and monitor performance</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white">
                <Mail className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
              <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                <BarChart3 className="w-4 h-4 mr-2" />
                Company Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Company-wide Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {companyStats.map((stat, index) => {
            const IconComponent = stat.icon;
            const gradients = [
              'from-blue-500 to-blue-600',
              'from-purple-500 to-purple-600',
              'from-green-500 to-green-600',
              'from-orange-500 to-orange-600'
            ];
            return (
              <Card key={stat.title} className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 bg-gradient-to-br from-white to-gray-50 border-0 shadow-md">
                <div className="flex items-center justify-between mb-4">
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

        {/* Search and Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search team members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('all')}
              size="sm"
              className={selectedFilter === 'all' ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
            >
              All ({teamMembers.length})
            </Button>
            <Button
              variant={selectedFilter === 'active' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('active')}
              size="sm"
              className={selectedFilter === 'active' ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
            >
              Active ({teamMembers.filter(m => m.status === 'active').length})
            </Button>
            <Button
              variant={selectedFilter === 'inactive' ? 'default' : 'outline'}
              onClick={() => setSelectedFilter('inactive')}
              size="sm"
              className={selectedFilter === 'inactive' ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
            >
              Inactive ({teamMembers.filter(m => m.status === 'inactive').length})
            </Button>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer" 
                  onClick={() => onViewRecruiter(member)}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-[#ff6b35] text-white">
                      {member.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-gray-900">{member.firstName} {member.lastName}</h3>
                    <p className="text-sm text-gray-600">{member.department}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge
                    variant={member.status === 'active' ? 'default' : 'secondary'}
                    className={member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                  >
                    {member.status === 'active' ? (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <AlertCircle className="w-3 h-3 mr-1" />
                    )}
                    {member.status}
                  </Badge>
                  <Button variant="ghost" size="sm" className="p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                  <div className="text-lg font-semibold text-blue-700">{member.stats.jobPostings}</div>
                  <div className="text-xs text-blue-600">Job Postings</div>
                </div>
                <div className="text-center p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <div className="text-lg font-semibold text-green-700">{member.stats.hires}</div>
                  <div className="text-xs text-green-600">Total Hires</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span>{member.stats.successRate}% success</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span>{member.stats.avgTimeToHire} days avg</span>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-gray-500">
                  <span>This month: {member.currentMonth.interviews} interviews</span>
                  <span>Joined {new Date(member.joinDate).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No team members found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}