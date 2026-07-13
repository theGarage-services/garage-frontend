import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Switch } from '../ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { 
  Shield, 
  Users, 
  Crown,
  UserPlus,
  UserMinus,
  Mail,
  MoreHorizontal,
  Edit2,
  CheckCircle,
  XCircle,
  Clock,
  Key,
  X,
  Search,
  Filter,
  UserCheck,
  UserX,
  Send,
  Copy} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Textarea } from '../ui/textarea';

interface AccessManagementProps {
  user: any;
  institution: any;
  onBack: () => void;
}

export function AccessManagement({ user, institution, onBack }: Readonly<AccessManagementProps>) {
  const [activeTab, setActiveTab] = useState('team');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Invite form data
  const [inviteData, setInviteData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: 'recruiter',
    department: '',
    title: '',
    message: ''
  });

  // Team members with extended data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      title: 'Senior Talent Acquisition Manager',
      department: 'Human Resources',
      role: 'admin',
      status: 'active',
      joinedAt: '2024-01-15',
      lastActive: '2024-01-20 10:30',
      invitedBy: 'System',
      isCreator: true
    },
    {
      id: '2',
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      title: 'Senior Recruiter',
      department: 'Human Resources',
      role: 'recruiter',
      status: 'active',
      joinedAt: '2024-02-20',
      lastActive: '2024-01-20 09:15',
      invitedBy: 'John Smith'
    }
  ]);

  // Pending invitations
  const [pendingInvites, setPendingInvites] = useState([
    {
      id: 'inv-1',
      email: 'alex.brown@company.com',
      firstName: 'Alex',
      lastName: 'Brown',
      role: 'recruiter',
      invitedBy: 'John Smith',
      invitedAt: '2024-01-18',
      expiresAt: '2024-01-25',
      status: 'pending'
    }
  ]);

  const handleInviteMember = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newInvite = {
        id: `inv-${Date.now()}`,
        ...inviteData,
        invitedBy: `${user.firstName} ${user.lastName}`,
        invitedAt: new Date().toISOString().split('T')[0],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending'
      };
      
      setPendingInvites(prev => [...prev, newInvite]);
      setInviteData({
        email: '',
        firstName: '',
        lastName: '',
        role: 'recruiter',
        department: '',
        title: '',
        message: ''
      });
      setIsInviteDialogOpen(false);
      setActionSuccess('Invitation sent successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMember = async (memberId: string, updates: any) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTeamMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, ...updates } : member
      ));
      
      setActionSuccess('Member updated successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (globalThis.confirm('Are you sure you want to remove this team member?')) {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setTeamMembers(prev => prev.filter(member => member.id !== memberId));
        setActionSuccess('Team member removed successfully!');
        setTimeout(() => setActionSuccess(''), 3000);
      } catch (error) {
        console.error('Error removing member:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));
      setActionSuccess('Invitation cancelled successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error cancelling invitation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPendingInvites(prev => prev.map(invite => 
        invite.id === inviteId 
          ? { 
              ...invite, 
              invitedAt: new Date().toISOString().split('T')[0],
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            }
          : invite
      ));
      
      setActionSuccess('Invitation resent successfully!');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (error) {
      console.error('Error resending invitation:', error);
    } finally {
      setIsLoading(false);
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
      case 'inactive':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Inactive</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = filterRole === 'all' || member.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const isCurrentUserAdmin = user?.role === 'admin' || user?.isInstitutionCreator;
  
  // Default institution data
  const defaultInstitution = {
    id: 'inst-1',
    institutionName: 'TechCorp Solutions',
    institutionType: 'Technology Company',
    industry: 'Software Development'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-medium text-gray-900">Access Management</h1>
                  <p className="text-sm text-gray-500">
                    Manage team members and permissions for {institution?.institutionName || defaultInstitution.institutionName}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Crown className="w-3 h-3 mr-1" />
                Admin Access
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {actionSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {actionSuccess}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team Members ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value="invites" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Pending Invites ({pendingInvites.length})
            </TabsTrigger>
            <TabsTrigger value="permissions" className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              Permissions
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="team" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900">Team Members</h2>
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] flex items-center gap-2 self-start sm:self-auto">
                      <UserPlus className="w-4 h-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your institution as a team member.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            value={inviteData.firstName}
                            onChange={(e) => setInviteData(prev => ({ ...prev, firstName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            value={inviteData.lastName}
                            onChange={(e) => setInviteData(prev => ({ ...prev, lastName: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={inviteData.email}
                          onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="teammate@company.com"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Role</Label>
                          <Select value={inviteData.role} onValueChange={(value: any) => setInviteData(prev => ({ ...prev, role: value }))}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recruiter">Recruiter</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department</Label>
                          <DepartmentSelect
                            value={inviteData.department}
                            onValueChange={(value: string) => setInviteData(prev => ({ ...prev, department: value }))}
                            triggerClassName="h-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={inviteData.title}
                          onChange={(e) => setInviteData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Senior Recruiter"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Personal Message (Optional)</Label>
                        <Textarea
                          id="message"
                          value={inviteData.message}
                          onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                          placeholder="Welcome to our team! Looking forward to working with you."
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleInviteMember} disabled={isLoading} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                              Sending...
                            </div>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Send Invitation
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterRole} onValueChange={setFilterRole}>
                  <SelectTrigger className="w-full sm:w-40">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
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
                {filteredMembers.map((member) => (
                  <div key={member.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <Avatar className="w-12 h-12 shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                            {member.firstName[0]}{member.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {member.firstName} {member.lastName}
                            </h3>
                            {getRoleIcon(member.role)}
                            {member.isCreator && (
                              <Badge className="bg-purple-100 text-purple-800 text-xs">
                                <Crown className="w-3 h-3 mr-1" />
                                Creator
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.title}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                            <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                            {member.lastActive && (
                              <>
                                <span>•</span>
                                <span>Last active {new Date(member.lastActive).toLocaleDateString()}</span>
                              </>
                            )}
                            <span>•</span>
                            <span>Invited by {member.invitedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        {getStatusBadge(member.status)}
                        {!member.isCreator && isCurrentUserAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                              }}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleUpdateMember(member.id, { 
                                status: member.status === 'active' ? 'inactive' : 'active' 
                              })}>
                                {member.status === 'active' ? (
                                  <>
                                    <UserX className="w-4 h-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleRemoveMember(member.id)}
                                className="text-red-600"
                              >
                                <UserMinus className="w-4 h-4 mr-2" />
                                Remove Member
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredMembers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No team members found matching your criteria.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Pending Invites Tab */}
          <TabsContent value="invites" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h2 className="text-lg font-medium text-gray-900">Pending Invitations</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsInviteDialogOpen(true)}
                  className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Send New Invite
                </Button>
              </div>

              <div className="space-y-4">
                {pendingInvites.map((invite) => (
                  <div key={invite.id} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-medium">
                          {invite.firstName[0]}{invite.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h3 className="font-medium text-gray-900">
                              {invite.firstName} {invite.lastName}
                            </h3>
                            {getRoleIcon(invite.role)}
                          </div>
                          <p className="text-sm text-gray-600">{invite.email}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                            <span>Invited {new Date(invite.invitedAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Expires {new Date(invite.expiresAt).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>Invited by {invite.invitedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                        {isCurrentUserAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleResendInvite(invite.id)}>
                                <Send className="w-4 h-4 mr-2" />
                                Resend Invite
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                navigator.clipboard.writeText(`${globalThis.location.origin}/invite/${invite.id}`);
                                setActionSuccess('Invite link copied to clipboard!');
                                setTimeout(() => setActionSuccess(''), 3000);
                              }}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Invite Link
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleCancelInvite(invite.id)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Invite
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {pendingInvites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No pending invitations.</p>
                  <p className="text-sm">All team members have accepted their invitations.</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Role Permissions</h2>
              
              <div className="space-y-6">
                {/* Admin Role */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-medium text-gray-900">Admin</h3>
                    <Badge className="bg-yellow-100 text-yellow-800">Full Access</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Administrators have full access to all features and can manage team members and settings.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">View all candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Edit and delete all jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Manage team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">View analytics and reports</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Export data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">Manage institution settings</span>
                    </div>
                  </div>
                </div>

                {/* Recruiter Role */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Recruiter</h3>
                    <Badge className="bg-blue-100 text-blue-800">Limited Access</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Recruiters can manage their own job postings and view candidates assigned to them.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">View assigned candidates</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Edit other recruiters' jobs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Manage team members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm">View basic analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Export sensitive data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm">Manage institution settings</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Access Control Settings */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Access Control Settings</h2>
              
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Require Admin Approval</h3>
                    <p className="text-sm text-gray-500">New team members must be approved by an admin before gaining access</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Allow Team Invitations</h3>
                    <p className="text-sm text-gray-500">Allow non-admin team members to invite new members</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500">Require 2FA for all team members</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h3 className="font-medium text-gray-900">Session Timeout</h3>
                    <p className="text-sm text-gray-500">Automatically log out inactive users after a set time</p>
                  </div>
                  <Select defaultValue="8hours">
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1hour">1 Hour</SelectItem>
                      <SelectItem value="4hours">4 Hours</SelectItem>
                      <SelectItem value="8hours">8 Hours</SelectItem>
                      <SelectItem value="24hours">24 Hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}