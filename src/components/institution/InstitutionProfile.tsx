import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Building2,
  Users,
  Briefcase,
  Settings,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { TeamManagement } from '../team/TeamManagement';
import { ProfileTab } from './tabs/ProfileTab';
import { PositionsTab } from './tabs/PositionsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { companyService, type CompanyMember } from '../../api/companies';
import jobPostsApi from '../../api/jobPosts';

interface InstitutionProfileProps {
  institution: any;
  user: any;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export function InstitutionProfile({ institution, user, onBack, onNavigate }: Readonly<InstitutionProfileProps>) {
  const [formData, setFormData] = useState({
    institutionName: institution?.institutionName || '',
    description: institution?.description || '',
    website: institution?.website || '',
    phone: institution?.phone || '',
    address: institution?.address || '',
    city: institution?.city || '',
    state: institution?.state || '',
    country: institution?.country || '',
    zipCode: institution?.zipCode || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Real data from APIs
  const [teamMembers, setTeamMembers] = useState<CompanyMember[]>([]);
  const [openPositions, setOpenPositions] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Map CompanyMember to TeamMember format expected by TeamManagement
  interface TeamMemberMapped {
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
    phone: string;
    location: string;
  }

  const mapToTeamMembers = (members: CompanyMember[]): TeamMemberMapped[] => {
    return members.map(member => ({
      id: member.id,
      firstName: member.user.first_name || '',
      lastName: member.user.last_name || '',
      email: member.user.email || '',
      title: member.job_title || '',
      department: member.department || '',
      role: member.role === 'owner' ? 'admin' : member.role === 'viewer' ? 'member' : member.role === 'team-lead' ? 'admin' : member.role,
      accessLevel: member.role === 'owner' || member.role === 'admin' || member.role === 'team-lead' ? 'full' : member.role === 'recruiter' ? 'limited' : 'view-only',
      joinedAt: member.joined_at,
      status: member.status === 'invited' ? 'pending' : member.status === 'removed' ? 'suspended' : 'active',
      permissions: {
        canPostJobs: member.permissions.can_post_jobs,
        canViewCandidates: member.permissions.can_view_candidates,
        canManageTeam: member.permissions.can_manage_team,
        canAccessAnalytics: member.permissions.can_access_analytics,
      },
      phone: '',
      location: '',
    }));
  };

  // Fetch team members and positions on mount
  const fetchData = useCallback(async () => {
    if (!institution?.id) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      // Fetch team members
      const members = await companyService.getMembers(institution.id);
      setTeamMembers(members);
      
      // Fetch job posts for this company
      const jobs = await jobPostsApi.getCompanyJobs(institution.id);
      setOpenPositions(jobs.map(job => ({
        id: job.id,
        title: job.title,
        department: job.department,
        type: job.employment_type,
        location: job.location,
        postedBy: job.recruiter && typeof job.recruiter === 'object'
          ? `${(job.recruiter as any).first_name || ''} ${(job.recruiter as any).last_name || ''}`.trim() || 'Unknown'
          : 'Unknown',
        postedDate: job.created_at?.split('T')[0] || '2024-01-01',
        applications: job.applications_count || 0,
        status: job.status
      })));
    } catch (err) {
      console.error('Error fetching institution data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setIsLoadingData(false);
    }
  }, [institution?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    if (!institution?.id) return;
    
    setIsLoading(true);
    setError(null);

    try {
      await companyService.updateCompany(institution.id, {
        name: formData.institutionName,
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip_code: formData.zipCode,
      });

      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating institution:', err);
      setError(err instanceof Error ? err.message : 'Failed to update institution');
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    setFormData({
      institutionName: institution?.institutionName || '',
      description: institution?.description || '',
      website: institution?.website || '',
      phone: institution?.phone || '',
      address: institution?.address || '',
      city: institution?.city || '',
      state: institution?.state || '',
      country: institution?.country || '',
      zipCode: institution?.zipCode || '',
    });
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
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-medium text-gray-900">
                    {institution?.institutionName || 'Institution Profile'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {institution?.institutionType} • {institution?.industry}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              {institution?.verificationStatus === 'verified' && (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Verified</span>
                </div>
              )}
              {institution?.verificationStatus === 'pending' && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Verification Pending</span>
                </div>
              )}
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
      {updateSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Institution profile updated successfully!
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
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team ({teamMembers.length})
            </TabsTrigger>
            <TabsTrigger value="positions" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Positions ({openPositions.length})
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <ProfileTab
              formData={formData}
              onFormDataChange={setFormData}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
              teamMembersCount={teamMembers.length}
              openPositionsCount={openPositions.length}
              totalApplications={openPositions.reduce((sum, pos) => sum + pos.applications, 0)}
            />
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <TeamManagement
              user={user}
              institution={institution}
              teamMembers={mapToTeamMembers(teamMembers)}
              onUpdateTeamMembers={() => {}}
              onNavigate={onNavigate}
            />
          </TabsContent>

          {/* Positions Tab */}
          <TabsContent value="positions" className="space-y-6">
            <PositionsTab openPositions={openPositions} onNavigate={onNavigate} />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <SettingsTab settings={institution?.settings} />
          </TabsContent>
        </Tabs>
        )}
      </div>
    </div>
  );
}