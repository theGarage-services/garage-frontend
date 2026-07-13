import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Alert, AlertDescription } from '../ui/alert';
import { DepartmentSelect } from '../common/DepartmentSelect';
import { sendWelcomeEmail, WelcomeEmailData } from '../landing/WelcomeEmailTemplate';
import { AccessRestriction, useAccessControl } from '../common/AccessRestriction';
import { 
  Edit2, 
  Trash2, 
  Mail, 
  Crown, 
  Shield, 
  Users, 
  CheckCircle,
  AlertCircle,
  UserPlus,
  Send,
  Save,
  MoreHorizontal,
  Settings,
  Key,
  ArrowLeft
} from 'lucide-react';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  title: string;
  department: string;
  role: 'admin' | 'recruiter' | 'member';
  accessLevel: 'full' | 'limited' | 'view-only';
  joinedAt: string;
  status: 'active' | 'pending' | 'suspended';
  permissions: {
    canPostJobs: boolean;
    canViewCandidates: boolean;
    canManageTeam: boolean;
    canAccessAnalytics: boolean;
  };
  phone?: string;
  location?: string;
}

interface TeamManagementProps {
  user: any;
  institution: any;
  teamMembers: TeamMember[];
  onUpdateTeamMembers: (members: TeamMember[]) => void;
  onNavigate?: (view: string) => void;
  onBack?: () => void;
}

export function TeamManagement({ user, institution, teamMembers, onUpdateTeamMembers, onNavigate, onBack }: Readonly<TeamManagementProps>) {
  const { isAdmin } = useAccessControl(user);
  const [showCreateMember, setShowCreateMember] = useState(false);
  const [showEditMember, setShowEditMember] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // New member form data
  const [newMemberData, setNewMemberData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    department: '',
    role: 'recruiter' as TeamMember['role'],
    accessLevel: 'limited' as TeamMember['accessLevel'],
    phone: '',
    location: '',
    permissions: {
      canPostJobs: false,
      canViewCandidates: true,
      canManageTeam: false,
      canAccessAnalytics: false
    }
  });

  // Edit member form data
  const [editMemberData, setEditMemberData] = useState<Partial<TeamMember>>({});

  // Filter team members
  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleCreateMember = async () => {
    if (!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email) {
      return;
    }

    setIsLoading(true);
    try {
      // Create new member
      const newMember: TeamMember = {
        id: `member-${Date.now()}`,
        ...newMemberData,
        joinedAt: new Date().toISOString(),
        status: 'pending'
      };

      // Update team members
      const updatedMembers = [...teamMembers, newMember];
      onUpdateTeamMembers(updatedMembers);

      // Send welcome email
      const emailData: WelcomeEmailData = {
        memberName: `${newMemberData.firstName} ${newMemberData.lastName}`,
        institutionName: institution.institutionName,
        inviterName: `${user.firstName} ${user.lastName}`,
        resetPasswordLink: 'https://thegarage.app/reset-password',
        loginUrl: 'https://thegarage.app/login',
        supportEmail: 'support@thegarage.app'
      };

      await sendWelcomeEmail(emailData);

      // Reset form and close dialog
      setNewMemberData({
        firstName: '',
        lastName: '',
        email: '',
        title: '',
        department: '',
        role: 'recruiter',
        accessLevel: 'limited',
        phone: '',
        location: '',
        permissions: {
          canPostJobs: false,
          canViewCandidates: true,
          canManageTeam: false,
          canAccessAnalytics: false
        }
      });
      setShowCreateMember(false);
      showSuccessMessage(`Team member created successfully! Welcome email with password setup link sent to ${newMemberData.firstName} ${newMemberData.lastName}.`);
    } catch (error) {
      console.error('Error creating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMember = async () => {
    if (!selectedMember || !editMemberData) return;

    setIsLoading(true);
    try {
      const updatedMember = { ...selectedMember, ...editMemberData };
      const updatedMembers = teamMembers.map(member => 
        member.id === selectedMember.id ? updatedMember : member
      );
      
      onUpdateTeamMembers(updatedMembers);
      setShowEditMember(false);
      setSelectedMember(null);
      setEditMemberData({});
      showSuccessMessage('Team member updated successfully!');
    } catch (error) {
      console.error('Error updating member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    setIsLoading(true);
    try {
      const updatedMembers = teamMembers.filter(member => member.id !== selectedMember.id);
      onUpdateTeamMembers(updatedMembers);
      setShowDeleteConfirm(false);
      setSelectedMember(null);
      showSuccessMessage('Team member removed successfully!');
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resendWelcomeEmail = async (member: TeamMember) => {
    setIsLoading(true);
    try {
      const emailData: WelcomeEmailData = {
        memberName: `${member.firstName} ${member.lastName}`,
        institutionName: institution.institutionName,
        inviterName: `${user.firstName} ${user.lastName}`,
        resetPasswordLink: `${globalThis.location.origin}/reset-password`,
        loginUrl: `${globalThis.location.origin}/login`,
        supportEmail: 'support@thegarage.app'
      };

      await sendWelcomeEmail(emailData);
      showSuccessMessage(`Welcome email resent to ${member.firstName} ${member.lastName}!`);
    } catch (error) {
      console.error('Error resending welcome email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(null), 5000);
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
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Suspended</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getAccessLevelBadge = (accessLevel: string) => {
    switch (accessLevel) {
      case 'full':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Full Access</Badge>;
      case 'limited':
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Limited</Badge>;
      case 'view-only':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">View Only</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          {onBack && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="border-[#ff6b35] text-[#ff6b35] hover:bg-orange-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage your team members and their access permissions</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Admin Access Notice for Non-Admins */}
          {!isAdmin && (
            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                You have view-only access to team information. Contact an administrator to manage team members, roles, and permissions.
              </AlertDescription>
            </Alert>
          )}

          {/* Success Alert */}
          {actionSuccess && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                {actionSuccess}
              </AlertDescription>
            </Alert>
          )}

          {/* Header */}
          <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Team Management</h2>
            <p className="text-sm text-gray-600">
              Centralized team member management with roles, permissions, and access control
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Advanced Access Management Button */}
            <AccessRestriction user={user} requiredRole="admin" showAlert={false}>
              {onNavigate && (
                <Button
                  onClick={() => onNavigate('access-management')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  Advanced Settings
                </Button>
              )}
            </AccessRestriction>
            
            {/* Add Team Member Button */}
            <AccessRestriction user={user} requiredRole="admin" showAlert={false}>
              <Dialog open={showCreateMember} onOpenChange={setShowCreateMember}>
                <DialogTrigger asChild>
                  <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create New Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Team Member</DialogTitle>
                    <DialogDescription>
                      Create a new team member profile (passwords are managed automatically). 
                      The new member will receive a professional welcome email with a secure password reset link to activate their account.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={newMemberData.firstName}
                          onChange={(e) => setNewMemberData(prev => ({ ...prev, firstName: e.target.value }))}
                          placeholder="John"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={newMemberData.lastName}
                          onChange={(e) => setNewMemberData(prev => ({ ...prev, lastName: e.target.value }))}
                          placeholder="Smith"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMemberData.email}
                        onChange={(e) => setNewMemberData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="john.smith@company.com"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        A welcome email with password setup instructions will be sent to this address
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                          id="title"
                          value={newMemberData.title}
                          onChange={(e) => setNewMemberData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Senior Recruiter"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        <DepartmentSelect
                          value={newMemberData.department}
                          onValueChange={(value: string) => setNewMemberData(prev => ({ ...prev, department: value }))}
                          triggerClassName="mt-1 h-10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                          id="phone"
                          value={newMemberData.phone}
                          onChange={(e) => setNewMemberData(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location (Optional)</Label>
                        <Input
                          id="location"
                          value={newMemberData.location}
                          onChange={(e) => setNewMemberData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="San Francisco, CA"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    {/* Role and Access */}
                    <div className="space-y-4 border-t pt-4">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900">Role & Access Control</h4>
                        <Badge variant="outline" className="text-xs">
                          Admin can create non-admin roles only
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select
                            value={newMemberData.role}
                            onValueChange={(value: TeamMember['role']) => 
                              setNewMemberData(prev => ({ ...prev, role: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="recruiter">Recruiter</SelectItem>
                              <SelectItem value="member">Team Member</SelectItem>
                              <SelectItem value="admin" disabled>
                                Administrator (Contact Support)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="accessLevel">Access Level</Label>
                          <Select
                            value={newMemberData.accessLevel}
                            onValueChange={(value: TeamMember['accessLevel']) => 
                              setNewMemberData(prev => ({ ...prev, accessLevel: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full">Full Access</SelectItem>
                              <SelectItem value="limited">Limited Access</SelectItem>
                              <SelectItem value="view-only">View Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Permissions */}
                      <div>
                        <Label>Permissions</Label>
                        <div className="mt-2 space-y-2">
                          {[
                            { key: 'canPostJobs', label: 'Can post and manage job listings' },
                            { key: 'canViewCandidates', label: 'Can view candidate profiles' },
                            { key: 'canManageTeam', label: 'Can manage team members' },
                            { key: 'canAccessAnalytics', label: 'Can access analytics and reports' }
                          ].map((permission, index) => (
                            <label key={`new-permission-${permission.key}-${index}`} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={newMemberData.permissions[permission.key as keyof typeof newMemberData.permissions]}
                                onChange={(e) => 
                                  setNewMemberData(prev => ({
                                    ...prev,
                                    permissions: {
                                      ...prev.permissions,
                                      [permission.key]: e.target.checked
                                    }
                                  }))
                                }
                                className="rounded border-gray-300"
                              />
                              <span className="text-sm text-gray-700">{permission.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <Button 
                        variant="outline" 
                        onClick={() => setShowCreateMember(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateMember}
                        disabled={!newMemberData.firstName || !newMemberData.lastName || !newMemberData.email || isLoading}
                        className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                            Creating...
                          </div>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Create & Send Email
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </AccessRestriction>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="recruiter">Recruiter</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Management Info */}
        <AccessRestriction user={user} requiredRole="admin" showAlert={false}>
          <Card className="p-4 bg-gradient-to-r from-orange-50 to-blue-50 border-orange-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-blue-600 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Administrator Access</h3>
                  <p className="text-sm text-gray-700">
                    You have full administrative privileges. Create, edit, and manage team members with role-based access controls. Click on any member to edit their profile.
                  </p>
                </div>
              </div>
              {onNavigate && (
                <Button
                  onClick={() => onNavigate('access-management')}
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white self-start sm:self-auto"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Advanced Security
                </Button>
              )}
            </div>
          </Card>
        </AccessRestriction>

        {/* Team Members List */}
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={`team-member-${member.id}`}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <button
                type="button"
                className="flex items-start sm:items-center gap-4 flex-1 text-left bg-transparent border-none p-0 cursor-pointer disabled:cursor-default disabled:opacity-100 min-w-0"
                onClick={() => {
                  setSelectedMember(member);
                  setEditMemberData(member);
                  setShowEditMember(true);
                }}
                disabled={!(isAdmin && member.id !== user?.id)}
              >
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
                    {member.firstName[0]}{member.lastName[0]}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">
                      {member.firstName} {member.lastName}
                    </h3>
                    {getRoleIcon(member.role)}
                    {member.id === user?.id && (
                      <Badge className="bg-[#ff6b35] text-white text-xs">YOU</Badge>
                    )}
                    {isAdmin && member.id !== user?.id && (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                          Click to Edit
                        </Badge>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{member.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                    <span className="text-sm text-gray-500">{member.email}</span>
                    {member.phone && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{member.phone}</span>
                      </>
                    )}
                    {member.location && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{member.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </button>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 self-start lg:self-auto">
                <div className="flex flex-col items-start sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    {getStatusBadge(member.status)}
                    {getAccessLevelBadge(member.accessLevel)}
                  </div>
                  <span className="text-xs text-gray-500">
                    Joined {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>

                <AccessRestriction user={user} requiredRole="admin" showAlert={false}>
                  {member.id !== user?.id && (
                    <div className="flex items-center gap-2">
                      {member.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendWelcomeEmail(member)}
                          disabled={isLoading}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Mail className="w-4 h-4 mr-1" />
                          Resend Email
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setEditMemberData(member);
                              setShowEditMember(true);
                            }}
                          >
                            <Edit2 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setEditMemberData({
                                ...member,
                                accessLevel: member.accessLevel === 'full' ? 'limited' : 'full'
                              });
                              setShowEditMember(true);
                            }}
                          >
                            <Key className="w-4 h-4 mr-2" />
                            Manage Access
                          </DropdownMenuItem>
                          {member.status === 'pending' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => resendWelcomeEmail(member)}
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Resend Welcome Email
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedMember(member);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 focus:text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </AccessRestriction>
              </div>
            </div>
          ))}
          
          {filteredMembers.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No team members found matching your search criteria.</p>
              {isAdmin && (
                <p className="text-sm mt-2">Click "Create New Member" to add your first team member.</p>
              )}
            </div>
          )}
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Crown className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-medium text-gray-900">
                  {filteredMembers.filter(m => m.role === 'admin').length}
                </p>
                <p className="text-sm text-gray-500">Admins</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-medium text-gray-900">
                  {filteredMembers.filter(m => m.role === 'recruiter').length}
                </p>
                <p className="text-sm text-gray-500">Recruiters</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-medium text-gray-900">
                  {filteredMembers.filter(m => m.status === 'active').length}
                </p>
                <p className="text-sm text-gray-500">Active</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-medium text-gray-900">
                  {filteredMembers.filter(m => m.status === 'pending').length}
                </p>
                <p className="text-sm text-gray-500">Pending</p>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Edit Member Dialog */}
      {showEditMember && selectedMember && (
        <Dialog open={showEditMember} onOpenChange={setShowEditMember}>
          <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Team Member</DialogTitle>
              <DialogDescription>
                Update team member information and permissions.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFirstName">First Name</Label>
                  <Input
                    id="editFirstName"
                    value={editMemberData.firstName || ''}
                    onChange={(e) => setEditMemberData(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editLastName">Last Name</Label>
                  <Input
                    id="editLastName"
                    value={editMemberData.lastName || ''}
                    onChange={(e) => setEditMemberData(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="editEmail">Email Address</Label>
                <Input
                  id="editEmail"
                  type="email"
                  value={editMemberData.email || ''}
                  onChange={(e) => setEditMemberData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editTitle">Job Title</Label>
                  <Input
                    id="editTitle"
                    value={editMemberData.title || ''}
                    onChange={(e) => setEditMemberData(prev => ({ ...prev, title: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editDepartment">Department</Label>
                  <DepartmentSelect
                    value={editMemberData.department || ''}
                    onValueChange={(value: string) => setEditMemberData(prev => ({ ...prev, department: value }))}
                    triggerClassName="mt-1 h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editPhone">Phone</Label>
                  <Input
                    id="editPhone"
                    value={editMemberData.phone || ''}
                    onChange={(e) => setEditMemberData(prev => ({ ...prev, phone: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="editLocation">Location</Label>
                  <Input
                    id="editLocation"
                    value={editMemberData.location || ''}
                    onChange={(e) => setEditMemberData(prev => ({ ...prev, location: e.target.value }))}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Role and Access */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-gray-900">Role & Access</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="editRole">Role</Label>
                    <Select
                      value={editMemberData.role || selectedMember.role}
                      onValueChange={(value: TeamMember['role']) => 
                        setEditMemberData(prev => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrator</SelectItem>
                        <SelectItem value="recruiter">Recruiter</SelectItem>
                        <SelectItem value="member">Team Member</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="editAccessLevel">Access Level</Label>
                    <Select
                      value={editMemberData.accessLevel || selectedMember.accessLevel}
                      onValueChange={(value: TeamMember['accessLevel']) => 
                        setEditMemberData(prev => ({ ...prev, accessLevel: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Access</SelectItem>
                        <SelectItem value="limited">Limited Access</SelectItem>
                        <SelectItem value="view-only">View Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="editStatus">Status</Label>
                    <Select
                      value={editMemberData.status || selectedMember.status}
                      onValueChange={(value: TeamMember['status']) => 
                        setEditMemberData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <Label>Permissions</Label>
                  <div className="mt-2 space-y-2">
                    {[
                      { key: 'canPostJobs', label: 'Can post and manage job listings' },
                      { key: 'canViewCandidates', label: 'Can view candidate profiles' },
                      { key: 'canManageTeam', label: 'Can manage team members' },
                      { key: 'canAccessAnalytics', label: 'Can access analytics and reports' }
                    ].map((permission, index) => (
                      <label key={`edit-permission-${permission.key}-${index}`} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={editMemberData.permissions?.[permission.key as keyof TeamMember['permissions']] ?? 
                                   selectedMember.permissions[permission.key as keyof TeamMember['permissions']]}
                          onChange={(e) => 
                            setEditMemberData(prev => ({
                              ...prev,
                              permissions: {
                                ...selectedMember.permissions,
                                ...prev.permissions,
                                [permission.key]: e.target.checked
                              }
                            }))
                          }
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm text-gray-700">{permission.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowEditMember(false);
                    setEditMemberData({});
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleEditMember}
                  disabled={isLoading}
                  className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Updating...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Member
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && selectedMember && (
        <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Remove Team Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedMember.firstName} {selectedMember.lastName} from your team?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setSelectedMember(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleDeleteMember}
                disabled={isLoading}
                variant="destructive"
                className="flex-1"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    Removing...
                  </div>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove Member
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
        </div>
      </div>
    </div>
  );
}