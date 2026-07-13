import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AppHeader } from '../layout/AppHeader';
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical,
  UserPlus,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Target,
  Clock,
  CheckCircle2} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface TeamManagementDashboardProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  teams?: any[];
  onCreateTeam?: () => void;
  onEditTeam?: (team: any) => void;
  onDeleteTeam?: (teamId: string) => void;
}

export function TeamManagementDashboard({
  user,
  onNavigate,
  onLogout,
  teams = [],
  onCreateTeam,
  onEditTeam,
  onDeleteTeam
}: Readonly<TeamManagementDashboardProps>) {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock teams data
  const mockTeams = teams.length > 0 ? teams : [
    {
      id: 'team-1',
      name: 'Engineering Recruiting',
      manager: { name: 'Sarah Johnson', email: 'sarah@company.com', avatar: null },
      members: [
        { id: 'u1', name: 'John Doe', role: 'regular', email: 'john@company.com', activeJobs: 5 },
        { id: 'u2', name: 'Jane Smith', role: 'regular', email: 'jane@company.com', activeJobs: 3 },
        { id: 'u3', name: 'Mike Wilson', role: 'regular', email: 'mike@company.com', activeJobs: 7 }
      ],
      metrics: {
        activeJobs: 15,
        totalHires: 23,
        avgTimeToHire: 28,
        fillRate: 78
      },
      targets: {
        monthlyHires: 10,
        currentHires: 7
      }
    },
    {
      id: 'team-2',
      name: 'Sales Recruiting',
      manager: { name: 'David Chen', email: 'david@company.com', avatar: null },
      members: [
        { id: 'u4', name: 'Lisa Brown', role: 'regular', email: 'lisa@company.com', activeJobs: 4 },
        { id: 'u5', name: 'Tom Anderson', role: 'regular', email: 'tom@company.com', activeJobs: 6 }
      ],
      metrics: {
        activeJobs: 10,
        totalHires: 18,
        avgTimeToHire: 32,
        fillRate: 72
      },
      targets: {
        monthlyHires: 8,
        currentHires: 5
      }
    },
    {
      id: 'team-3',
      name: 'Product & Design',
      manager: { name: 'Emily Davis', email: 'emily@company.com', avatar: null },
      members: [
        { id: 'u6', name: 'Alex Turner', role: 'regular', email: 'alex@company.com', activeJobs: 8 },
        { id: 'u7', name: 'Rachel Green', role: 'regular', email: 'rachel@company.com', activeJobs: 5 },
        { id: 'u8', name: 'Chris Martin', role: 'regular', email: 'chris@company.com', activeJobs: 4 },
        { id: 'u9', name: 'Nina Patel', role: 'regular', email: 'nina@company.com', activeJobs: 6 }
      ],
      metrics: {
        activeJobs: 23,
        totalHires: 31,
        avgTimeToHire: 25,
        fillRate: 85
      },
      targets: {
        monthlyHires: 12,
        currentHires: 10
      }
    }
  ];

  const filteredTeams = mockTeams.filter(team =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.manager.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole="admin"
        user={user}
        currentView="team-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-white mb-2">Team Management</h1>
                  <p className="text-purple-100">Organize and manage your recruiting teams</p>
                </div>
              </div>
              <Button
                onClick={onCreateTeam}
                className="bg-white text-purple-600 hover:bg-purple-50 self-start sm:self-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Team
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">{mockTeams.length}</div>
              </div>
              <div className="text-sm text-gray-600">Active Teams</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {mockTeams.reduce((acc, team) => acc + team.members.length, 0)}
                </div>
              </div>
              <div className="text-sm text-gray-600">Total Recruiters</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {mockTeams.reduce((acc, team) => acc + team.metrics.totalHires, 0)}
                </div>
              </div>
              <div className="text-sm text-gray-600">Total Hires</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-medium text-gray-900">
                  {Math.round(mockTeams.reduce((acc, team) => acc + team.metrics.fillRate, 0) / mockTeams.length)}%
                </div>
              </div>
              <div className="text-sm text-gray-600">Avg Fill Rate</div>
            </Card>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <Input
                placeholder="Search teams or managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTeams.map((team: { id: Key | null | undefined; name: string; manager: any; members: any[]; metrics: any; targets: any }) => (
              <Card key={team.id} className="p-6 hover:shadow-lg transition-shadow">
                {/* Team Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{team.name}</h3>
                      <p className="text-sm text-gray-600">{team.members.length} members</p>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEditTeam?.(team)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Team
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditTeam?.(team)}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Member
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDeleteTeam?.(team.id as string)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Team
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Manager */}
                <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={team.manager.avatar} />
                      <AvatarFallback className="bg-purple-600 text-white text-xs">
                        {team.manager.name.split(' ').map((n: any[]) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{team.manager.name}</span>
                        <Badge variant="secondary" className="text-xs">Manager</Badge>
                      </div>
                      <p className="text-xs text-gray-600">{team.manager.email}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">Active Jobs</span>
                    </div>
                    <div className="text-xl font-medium text-gray-900">{team.metrics.activeJobs}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">Total Hires</span>
                    </div>
                    <div className="text-xl font-medium text-gray-900">{team.metrics.totalHires}</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <span className="text-xs text-gray-600">Avg Time</span>
                    </div>
                    <div className="text-xl font-medium text-gray-900">{team.metrics.avgTimeToHire}d</div>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Fill Rate</span>
                    </div>
                    <div className="text-xl font-medium text-gray-900">{team.metrics.fillRate}%</div>
                  </div>
                </div>

                {/* Monthly Target Progress */}
                <div className="mb-4 p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-2">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-900">Monthly Target</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {team.targets.currentHires}/{team.targets.monthlyHires}
                    </span>
                  </div>
                  <div className="w-full bg-white rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all"
                      style={{ width: `${(team.targets.currentHires / team.targets.monthlyHires) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Team Members Preview */}
                <div>
                  <div className="text-sm font-medium text-gray-900 mb-2">Team Members</div>
                  <div className="space-y-2">
                    {team.members.slice(0, 3).map((member: { id: Key | null | undefined; name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined; activeJobs: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined; }) => (
                      <div key={member.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                              {(member.name as string)?.split(' ').map((n: string) => n[0]).join('') || ''}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-gray-900">{member.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs self-start sm:self-auto">
                          {member.activeJobs} jobs
                        </Badge>
                      </div>
                    ))}
                    {team.members.length > 3 && (
                      <button className="w-full text-sm text-[#ff6b35] hover:text-[#e55a2b] py-2">
                        View all {team.members.length} members →
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Empty State */}
          {filteredTeams.length === 0 && (
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first team'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={onCreateTeam}
                  className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Team
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
