import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { 
  Users,
  UserPlus,
  UserMinus,
  Crown,
  Shield,
  CheckCircle,
  ArrowLeft,
  Search,
  Settings,
  AlertCircle} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { companyService, type CompanyMember } from '../../api/companies';

interface InstitutionAdminPanelProps {
  institution: any;
  user: any;
  onBack: () => void;
}

export function InstitutionAdminPanel({ institution, user, onBack }: Readonly<InstitutionAdminPanelProps>) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'recruiter',
    title: '',
    department: '',
    message: '',
    permissions: ['recruit', 'interview']
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Real data from API
  const [teamMembers, setTeamMembers] = useState<CompanyMember[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch team members on mount
  const fetchMembers = useCallback(async () => {
    if (!institution?.id) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      const members = await companyService.getMembers(institution.id);
      setTeamMembers(members);
    } catch (err) {
      console.error('Error fetching team members:', err);
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setIsLoadingData(false);
    }
  }, [institution?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Invite new member via API
  const handleCreateMember = async () => {
    if (!institution?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      await companyService.inviteMember(institution.id, {
        email: inviteForm.email,
        role: inviteForm.role,
        department: inviteForm.department,
        job_title: inviteForm.title,
        permissions: {
          can_post_jobs: inviteForm.permissions.includes('post_jobs'),
          can_view_candidates: inviteForm.permissions.includes('interview'),
          can_manage_team: inviteForm.permissions.includes('team_management'),
          can_access_analytics: inviteForm.permissions.includes('analytics'),
          can_manage_company: inviteForm.permissions.includes('company_settings'),
        }
      });
      
      // Refresh the members list
      await fetchMembers();
      
      setShowInviteDialog(false);
      setInviteForm({ email: '', role: 'recruiter', title: '', department: '', message: '', permissions: ['recruit', 'interview'] });
      setSuccessMessage('Team member invited successfully!');
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error inviting member:', err);
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove member via API
  const handleRemoveMember = async (memberId: string) => {
    if (!institution?.id) return;
    
    try {
      await companyService.removeMember(institution.id, memberId);
      
      // Refresh the members list
      await fetchMembers();
      
      setSuccessMessage('Team member removed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (!institution?.id) return;
    
    const isAdmin = newRole === 'admin' || newRole === 'owner';
    const permissions = {
      can_post_jobs: isAdmin,
      can_view_candidates: true,
      can_manage_team: isAdmin,
      can_access_analytics: isAdmin,
      can_manage_company: isAdmin,
    };
    
    try {
      await companyService.updateMemberRole(institution.id, memberId, newRole, permissions);
      await fetchMembers();
      setSuccessMessage('Member role updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating member role:', err);
      setError(err instanceof Error ? err.message : 'Failed to update member role');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'recruiter':
        return <Shield className="w-4 h-4 text-blue-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Draft</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };



  const filteredTeamMembers = teamMembers.filter(member => {
    const matchesSearch = `${member.user.first_name || ''} ${member.user.last_name || ''} ${member.user.email}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-medium text-gray-900">Institution Admin</h1>
                  <p className="text-sm text-gray-500">{institution?.name || 'Institution Admin'}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Badge className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Success Alert */}
      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {successMessage}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoadingData ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]" />
          </div>
        ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
              <Users className="w-4 h-4" />
              <span className="font-medium">Team Management</span>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] flex items-center gap-2 self-start sm:self-auto">
                      <UserPlus className="w-4 h-4" />
                      Create Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Create New Team Member</DialogTitle>
                      <DialogDescription>
                        Create a new team member profile (passwords are managed automatically). The new member will receive a professional welcome email with a secure password reset link to activate their account.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Select value={inviteForm.role} onValueChange={(value: string) => {
                          const permissions = value === 'admin' 
                            ? ['recruit', 'interview', 'post_jobs', 'sourcing', 'team_management', 'analytics', 'company_settings']
                            : ['recruit', 'interview'];
                          setInviteForm(prev => ({ ...prev, role: value, permissions }));
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          placeholder="e.g. Senior Recruiter"
                          value={inviteForm.title}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="department">Department</Label>
                        <DepartmentSelect
                          value={inviteForm.department}
                          onValueChange={(value: string) => setInviteForm(prev => ({ ...prev, department: value }))}
                          triggerClassName="h-10"
                        />
                      </div>

                      {/* Access Permissions */}
                      <div className="space-y-3 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <Shield className="w-4 h-4 text-gray-600" />
                          <Label className="text-gray-900 font-medium">Access Permissions</Label>
                        </div>
                        <p className="text-sm text-gray-700 mb-3">
                          Select which features this team member can access:
                        </p>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="perm-recruit"
                              checked={inviteForm.permissions.includes('recruit')}
                              onChange={(e) => {
                                const perms = e.target.checked 
                                  ? [...inviteForm.permissions, 'recruit']
                                  : inviteForm.permissions.filter(p => p !== 'recruit');
                                setInviteForm(prev => ({ ...prev, permissions: perms }));
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <label htmlFor="perm-recruit" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Candidate Management
                              </label>
                              <p className="text-xs text-gray-600">Review and manage job candidates</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="perm-interview"
                              checked={inviteForm.permissions.includes('interview')}
                              onChange={(e) => {
                                const perms = e.target.checked 
                                  ? [...inviteForm.permissions, 'interview']
                                  : inviteForm.permissions.filter(p => p !== 'interview');
                                setInviteForm(prev => ({ ...prev, permissions: perms }));
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <label htmlFor="perm-interview" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Interview Scheduling
                              </label>
                              <p className="text-xs text-gray-600">Schedule and conduct interviews</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="perm-post-jobs"
                              checked={inviteForm.permissions.includes('post_jobs')}
                              onChange={(e) => {
                                const perms = e.target.checked 
                                  ? [...inviteForm.permissions, 'post_jobs']
                                  : inviteForm.permissions.filter(p => p !== 'post_jobs');
                                setInviteForm(prev => ({ ...prev, permissions: perms }));
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <label htmlFor="perm-post-jobs" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Job Posting
                              </label>
                              <p className="text-xs text-gray-600">Create and manage job postings</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              id="perm-sourcing"
                              checked={inviteForm.permissions.includes('sourcing')}
                              onChange={(e) => {
                                const perms = e.target.checked 
                                  ? [...inviteForm.permissions, 'sourcing']
                                  : inviteForm.permissions.filter(p => p !== 'sourcing');
                                setInviteForm(prev => ({ ...prev, permissions: perms }));
                              }}
                              className="mt-0.5"
                            />
                            <div>
                              <label htmlFor="perm-sourcing" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Queue Sourcing
                              </label>
                              <p className="text-xs text-gray-600">Access queue sourcing and candidate search</p>
                            </div>
                          </div>

                          {inviteForm.role === 'admin' && (
                            <>
                              <div className="border-t border-gray-300 pt-3 mt-3">
                                <p className="text-xs text-purple-600 font-medium mb-2">Admin Permissions</p>
                              </div>
                              
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="perm-team-mgmt"
                                  checked={inviteForm.permissions.includes('team_management')}
                                  onChange={(e) => {
                                    const perms = e.target.checked 
                                      ? [...inviteForm.permissions, 'team_management']
                                      : inviteForm.permissions.filter(p => p !== 'team_management');
                                    setInviteForm(prev => ({ ...prev, permissions: perms }));
                                  }}
                                  className="mt-0.5"
                                />
                                <div>
                                  <label htmlFor="perm-team-mgmt" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Team Management
                                  </label>
                                  <p className="text-xs text-gray-600">Create and manage team members</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="perm-analytics"
                                  checked={inviteForm.permissions.includes('analytics')}
                                  onChange={(e) => {
                                    const perms = e.target.checked 
                                      ? [...inviteForm.permissions, 'analytics']
                                      : inviteForm.permissions.filter(p => p !== 'analytics');
                                    setInviteForm(prev => ({ ...prev, permissions: perms }));
                                  }}
                                  className="mt-0.5"
                                />
                                <div>
                                  <label htmlFor="perm-analytics" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Analytics Dashboard
                                  </label>
                                  <p className="text-xs text-gray-600">View performance analytics and team metrics</p>
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  id="perm-settings"
                                  checked={inviteForm.permissions.includes('company_settings')}
                                  onChange={(e) => {
                                    const perms = e.target.checked 
                                      ? [...inviteForm.permissions, 'company_settings']
                                      : inviteForm.permissions.filter(p => p !== 'company_settings');
                                    setInviteForm(prev => ({ ...prev, permissions: perms }));
                                  }}
                                  className="mt-0.5"
                                />
                                <div>
                                  <label htmlFor="perm-settings" className="text-sm font-medium text-gray-900 cursor-pointer">
                                    Company Settings
                                  </label>
                                  <p className="text-xs text-gray-600">Access company configuration and settings</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="message">Personal Message (Optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Welcome to the team..."
                          value={inviteForm.message}
                          onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                          rows={3}
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateMember}
                          disabled={isLoading || !inviteForm.email || !inviteForm.title}
                          className="bg-[#ff6b35] hover:bg-[#e55a2b]"
                        >
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              Creating...
                            </div>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Create Member
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filter */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search team members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="recruiter">Recruiter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Team Members List */}
              <div className="space-y-4">
                {filteredTeamMembers.map((member) => (
                  <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-3">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {member.user.first_name?.[0] || ''}{member.user.last_name?.[0] || member.user.email?.[0]?.toUpperCase() || ''}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {member.user.first_name} {member.user.last_name || member.user.email?.split('@')[0]}
                            </h3>
                            {getRoleIcon(member.role)}
                            {getStatusBadge(member.status)}
                          </div>
                          <p className="text-sm text-gray-600">{member.job_title}</p>
                          <p className="text-sm text-gray-500">{member.user.email}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                            <span>Joined {new Date(member.joined_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
                        <Select 
                          value={member.role} 
                          onValueChange={(newRole: string) => handleUpdateMemberRole(member.id, newRole)}
                          disabled={member.id === user.id} // Can't change own role
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="recruiter">Recruiter</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        {member.id !== user.id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <UserMinus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Permissions Display */}
                    <div className="pl-0 sm:pl-16">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="w-3 h-3 text-gray-500" />
                        <span className="text-xs font-medium text-gray-700">Access Permissions:</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {member.role === 'owner' || member.role === 'admin' ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Full Access</span>
                        ) : (
                          <>
                            {member.permissions.can_view_candidates && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Candidates</span>
                            )}
                            {member.permissions.can_post_jobs && (
                              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">Job Posting</span>
                            )}
                            {member.permissions.can_manage_team && (
                              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Team Mgmt</span>
                            )}
                            {member.permissions.can_access_analytics && (
                              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded-full">Analytics</span>
                            )}
                            {member.permissions.can_manage_company && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">Settings</span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}