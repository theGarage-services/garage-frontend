import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  UserPlus, 
  Shield, 
  Users, 
  User,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Briefcase,
  ArrowRight,
  X
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { DepartmentSelect } from '../common/DepartmentSelect';

interface UserCreationWizardProps {
  onComplete: (userData: any) => void;
  onCancel: () => void;
  organizationId: string;
  availableTeams?: any[];
}

export function UserCreationWizard({ onComplete, onCancel, organizationId, availableTeams = [] }: Readonly<UserCreationWizardProps>) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '' as 'recruiter' | 'manager' | 'lead' | 'hiring-manager' | '',
    title: '',
    department: '',
    teamId: '',
    permissions: [] as string[],
    notes: '',
    sendInvite: true,
    canPostWithoutApproval: false // NEW: For Regular Recruiter only
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const roles = [
    {
      id: 'recruiter',
      name: 'Regular Recruiter',
      icon: User,
      description: 'Execution: Create jobs, search candidates, schedule interviews',
      color: 'from-blue-500 to-blue-600',
      permissions: [
        'Create job postings',
        'AI candidate search',
        'Contact candidates',
        'Schedule interviews',
        'Track candidate progress',
        'Update application status',
        'View placement reports'
      ],
      restrictions: [
        'Job postings require approval (unless granted bypass)',
        'Cannot approve jobs',
        'Cannot manage team',
        'Limited analytics access'
      ]
    },
    {
      id: 'manager',
      name: 'Manager Recruiter',
      icon: Users,
      description: 'Team management: Approve jobs, assign work, monitor performance',
      color: 'from-purple-500 to-purple-600',
      permissions: [
        'Approve job postings',
        'Assign jobs to team',
        'Monitor team performance',
        'Review candidate shortlists',
        'View team reports',
        'Handle escalations',
        'View my team'
      ],
      restrictions: [
        'Cannot create jobs',
        'Cannot search candidates',
        'Cannot create accounts',
        'Limited to assigned teams'
      ]
    },
    {
      id: 'lead',
      name: 'Lead Recruiter',
      icon: Shield,
      description: 'Strategic oversight: Analytics, quotas, team structure, decisions',
      color: 'from-orange-500 to-orange-600',
      permissions: [
        'View all teams',
        'Team performance analytics',
        'Set team quotas',
        'View hiring metrics',
        'Generate executive reports',
        'Adjust team structure',
        'Market trend analysis',
        'Strategic decisions'
      ],
      restrictions: [
        'Cannot create jobs',
        'Cannot approve jobs',
        'Cannot search candidates',
        'Cannot create accounts',
        'No execution tasks'
      ]
    },
    {
      id: 'hiring-manager',
      name: 'Hiring Manager',
      icon: CheckCircle2,
      description: 'Review & decide: Evaluate candidates, make hiring decisions',
      color: 'from-green-500 to-green-600',
      permissions: [
        'View assigned jobs',
        'Review candidate profiles',
        'Shortlist candidates',
        'Reject candidates',
        'Schedule interviews',
        'Provide interview feedback',
        'Make hiring decisions',
        'View candidates'
      ],
      restrictions: [
        'Cannot create jobs',
        'Cannot search candidates',
        'Cannot approve jobs',
        'Cannot access team analytics',
        'Cannot create accounts',
        'Only assigned positions'
      ]
    }
  ];

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.role) newErrors.role = 'Please select a role';
    if (!formData.title.trim()) newErrors.title = 'Job title is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const selectedRole = roles.find(r => r.id === formData.role);
      
      onComplete({
        ...formData,
        id: `user-${Date.now()}`,
        organizationId,
        createdAt: new Date().toISOString(),
        status: 'pending-invite',
        roleName: selectedRole?.name,
        rolePermissions: selectedRole?.permissions
      });
    }
  };

  const handleRoleSelect = (roleId: 'recruiter' | 'manager' | 'lead' | 'hiring-manager') => {
    setFormData(prev => ({ 
      ...prev, 
      role: roleId,
      // Reset approval bypass if switching away from recruiter role
      canPostWithoutApproval: roleId === 'recruiter' ? prev.canPostWithoutApproval : false
    }));
    setErrors(prev => ({ ...prev, role: '' }));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900">Create New User</h2>
                <p className="text-gray-600">Add a team member to your organization (4 user types available)</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors self-start sm:self-auto"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <Label className="text-lg mb-4 block">Select Role * (4 User Types Available)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              const isSelected = formData.role === role.id;

              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => handleRoleSelect(role.id as any)}
                  className={`text-left p-6 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-[#ff6b35] bg-orange-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${role.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-2">{role.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{role.description}</p>
                  
                  {isSelected && (
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">Permissions</span>
                        </div>
                        <ul className="space-y-1">
                          {role.permissions.slice(0, 3).map((perm) => (
                            <li key={perm} className="text-xs text-gray-600 pl-6">• {perm}</li>
                          ))}
                          {role.permissions.length > 3 && (
                            <li className="text-xs text-gray-500 pl-6">
                              + {role.permissions.length - 3} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {errors.role && (
            <p className="text-sm text-red-500 mt-2">{errors.role}</p>
          )}
        </div>

        {/* Posting Permissions - Only for Regular Recruiter */}
        {formData.role === 'recruiter' && (
          <div className="mb-8">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-900 mb-2">⚡ Posting Permissions</h3>
                  <p className="text-sm text-blue-700 mb-4">
                    By default, Regular Recruiters must submit job postings for Manager approval before publishing. 
                    Enable the option below to allow this recruiter to publish jobs directly without approval.
                  </p>
                  
                  <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-blue-200">
                    <input
                      type="checkbox"
                      id="canPostWithoutApproval"
                      checked={formData.canPostWithoutApproval}
                      onChange={(e) => setFormData(prev => ({ ...prev, canPostWithoutApproval: e.target.checked }))}
                      className="w-5 h-5 text-[#ff6b35] rounded focus:ring-[#ff6b35] cursor-pointer"
                    />
                    <label htmlFor="canPostWithoutApproval" className="flex-1 cursor-pointer">
                      <p className="font-medium text-gray-900">Allow posting without approval</p>
                      <p className="text-sm text-gray-600">
                        {formData.canPostWithoutApproval 
                          ? '✅ This recruiter can publish jobs immediately'
                          : '⏳ This recruiter must submit jobs for Manager approval (recommended)'}
                      </p>
                    </label>
                  </div>

                  <Alert className="mt-4 bg-yellow-50 border-yellow-200">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm text-yellow-800">
                      <strong>Recommendation:</strong> Only enable direct publishing for experienced, trusted recruiters. 
                      The approval workflow helps maintain quality control and alignment with hiring strategies.
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Personal Information */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                placeholder="John"
                className={errors.firstName ? 'border-red-500' : ''}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                placeholder="Smith"
                className={errors.lastName ? 'border-red-500' : ''}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email Address *</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.smith@company.com"
                  className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Position Details */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Position Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Senior Technical Recruiter"
                  className={`pl-10 ${errors.title ? 'border-red-500' : ''}`}
                />
              </div>
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <DepartmentSelect
                value={formData.department}
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
                triggerClassName="h-10"
              />
            </div>

            {availableTeams.length > 0 && (
              <div className="col-span-2">
                <Label htmlFor="teamId">Assign to Team</Label>
                <select
                  id="teamId"
                  value={formData.teamId}
                  onChange={(e) => setFormData(prev => ({ ...prev, teamId: e.target.value }))}
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                >
                  <option value="">No team assignment</option>
                  {availableTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} - {team.memberCount || 0} members
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Additional Notes */}
        <div className="mb-8">
          <Label htmlFor="notes">Additional Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Any additional information about this user..."
            rows={3}
          />
        </div>

        {/* Permissions Summary */}
        {formData.role && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Shield className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>{roles.find(r => r.id === formData.role)?.name}</strong> will have the following permissions:
              <ul className="mt-2 space-y-1">
                {roles.find(r => r.id === formData.role)?.permissions.map((perm) => (
                  <li key={perm} className="text-sm">• {perm}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Send Invite Option */}
        <div className="mb-6">
          <div className="flex items-start gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              id="sendInvite"
              type="checkbox"
              checked={formData.sendInvite}
              onChange={(e) => setFormData(prev => ({ ...prev, sendInvite: e.target.checked }))}
              className="w-4 h-4 text-[#ff6b35] rounded focus:ring-[#ff6b35] mt-1"
            />
            <label htmlFor="sendInvite">
              <span className="font-medium text-gray-900 block">Send invitation email</span>
              <span className="text-sm text-gray-600 block">
                User will receive an email with login instructions and account setup link
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSubmit}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
