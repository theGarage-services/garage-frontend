import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Save, 
  X, 
  Edit2,
  CheckCircle,
  Globe,
  Calendar,
  Crown,
  Building2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { recruiterProfileService, COMPANY_SIZES, buildProfileImageUrl } from '@/api/recruiterProfile';
import { IndustrySelect, INDUSTRIES } from '../common/IndustrySelect';
import { DepartmentSelect, DEPARTMENTS } from '../common/DepartmentSelect';
import { ProfileImageUpload } from '../profile/ProfileImageUpload';

interface RecruiterProfileProps {
  user: any;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

// Extracted Role Badge Component
function RoleBadge({ role }: Readonly<{ role: string }>) {
  if (role === 'admin') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Crown className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    );
  }
  if (role === 'recruiter') {
    return (
      <Badge className="bg-blue-100 text-blue-800 border-blue-200">
        <Shield className="w-3 h-3 mr-1" />
        Recruiter
      </Badge>
    );
  }
  return <Badge variant="secondary">Member</Badge>;
}

// Extracted Profile Field Component
interface ProfileFieldProps {
  label: string;
  id: string;
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  type?: 'text' | 'textarea' | 'select' | 'industry' | 'department';
  selectOptions?: { value: string; label: string }[];
}

function ProfileField({
  label,
  id,
  isEditing,
  value,
  onChange,
  icon,
  type = 'text',
  selectOptions = []
}: Readonly<ProfileFieldProps>) {
  const displayValue = (() => {
    if (!value) return null;
    if (type === 'industry') {
      const found = INDUSTRIES.find((opt) => opt.value === value);
      return found?.label || value;
    }
    if (type === 'department') {
      const found = DEPARTMENTS.find((opt) => opt.value === value);
      return found?.label || value;
    }
    if (type === 'select' && selectOptions && selectOptions.length > 0) {
      const found = selectOptions.find((opt) => opt.value === value);
      return found?.label || value;
    }
    return value;
  })();

  const renderEditingInput = () => {
    if (type === 'textarea') {
      return (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[120px]"
          maxLength={500}
        />
      );
    }
    if (type === 'industry') {
      return (
        <IndustrySelect
          value={value}
          onValueChange={onChange}
          triggerClassName="h-12"
        />
      );
    }
    if (type === 'department') {
      return (
        <DepartmentSelect
          value={value}
          onValueChange={onChange}
          triggerClassName="h-12"
        />
      );
    }
    if (type === 'select') {
      return (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger className="h-12">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return (
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-12"
      />
    );
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {isEditing ? renderEditingInput() : (
        <div className="min-h-12 h-auto px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center gap-2 min-w-0">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="break-words min-w-0">{displayValue || 'Not specified'}</span>
        </div>
      )}
    </div>
  );
}

interface ProfileHeaderCardProps {
  profileData: any;
  isEditing: boolean;
  isLoading: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  onEditImage: () => void;
}

function ProfileHeaderCard({
  profileData,
  isEditing,
  isLoading,
  onEdit,
  onCancel,
  onSave,
  onEditImage
}: Readonly<ProfileHeaderCardProps>) {
  return (
    <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100 shadow-xl">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
        <div className="relative shrink-0 self-center sm:self-auto">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg ring-4 ring-white">
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] text-white text-4xl font-bold">
                {(profileData.firstName?.[0] || '')}{(profileData.lastName?.[0] || '')}
              </div>
            )}
          </div>
          <button
            onClick={onEditImage}
            className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-orange-100"
          >
            <Camera className="w-4 h-4 text-[#ff6b35]" />
          </button>
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-2">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold text-gray-900 break-words">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-lg text-gray-600 mt-1 break-words">
                {profileData.title || profileData.company || 'Recruiter'}
                {profileData.company && profileData.title !== profileData.company ? (
                  <span className="text-[#ff6b35]"> @ {profileData.company}</span>
                ) : null}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                {profileData.location && (
                  <span className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="break-words">{profileData.location}</span>
                  </span>
                )}
                {profileData.timezone && (
                  <span className="flex items-center gap-1 min-w-0">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span className="break-words">{profileData.timezone}</span>
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={onCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={onSave} disabled={isLoading} size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function RecruiterProfile({ user, onBack, onNavigate }: Readonly<RecruiterProfileProps>) {
  const [isEditing, setIsEditing] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  // Profile form data - matches backend RecruiterProfile fields
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '', // Maps to RecruiterProfile.phone
    title: '', // Alias for company (UI uses 'Job Title' label)
    company: '', // Maps to RecruiterProfile.company
    companySize: '', // Maps to RecruiterProfile.company_size
    industry: '', // Maps to RecruiterProfile.industry
    department: '', // Maps to RecruiterProfile.department
    bio: '', // Maps to RecruiterProfile.bio
    location: '', // Maps to RecruiterProfile.location
    timezone: 'America/Los_Angeles', // Client-side only
    linkedin: '', // Maps to RecruiterProfile.linkedin
    website: '', // Maps to RecruiterProfile.website
    profileImage: '', // Maps to RecruiterProfile.profile_image
    institution: {
      institutionName: undefined,
      institutionType: undefined,
      industry: undefined,
      description: undefined,
      website: undefined,
      city: undefined,
      country: undefined,
      verificationStatus: undefined,
    }, // Maps to RecruiterProfile.institution
  });

  const [fetchError, setFetchError] = useState<string | null>(null);

  // Fetch profile data on mount
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await recruiterProfileService.getProfile();
        if (profile) {
          const transformed = recruiterProfileService.transformProfileForFrontend(profile);
          const fullImageUrl = buildProfileImageUrl(transformed.profileImage as string);
          setProfileData(prev => ({
            ...prev,
            ...transformed,
            profileImage: fullImageUrl,
          }));
        }

      } catch (error) {
        console.error('Failed to load recruiter profile:', error);
        setFetchError('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };

    void loadProfile();
  }, []);

  // User role and permissions info
  const userRole = user?.role || 'recruiter';
  // Institution data comes from profileData.institution (via API)
  const institution = profileData.institution?.institutionName ? profileData.institution : null;

  const handleProfileSave = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Transform and send to backend
      const backendData = recruiterProfileService.transformDataForBackend(profileData);
      const updatedProfile = await recruiterProfileService.updateProfile(backendData);
      if (updatedProfile) {
        const transformed = recruiterProfileService.transformProfileForFrontend(updatedProfile);
        const fullImageUrl = buildProfileImageUrl(transformed.profileImage as string);
        setProfileData(prev => ({ ...prev, ...transformed, profileImage: fullImageUrl }));
      }
      setIsEditing(false);
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setFetchError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const imageUrl = await recruiterProfileService.uploadProfileImage(file);
      const fullImageUrl = buildProfileImageUrl(imageUrl);
      setProfileData(prev => ({ ...prev, profileImage: fullImageUrl }));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error uploading profile image:', error);
      setFetchError(error.message || 'Failed to upload profile image');
    } finally {
      setIsLoading(false);
    }
  };





  const handleCancel = async () => {
    // Reload original data from API to discard changes
    setIsLoading(true);
    try {
      const profile = await recruiterProfileService.getProfile();
      if (profile) {
        const transformed = recruiterProfileService.transformProfileForFrontend(profile);
        const fullImageUrl = buildProfileImageUrl(transformed.profileImage as string);
        setProfileData(prev => ({
          ...prev,
          ...transformed,
          profileImage: fullImageUrl,
        }));
      }
    } catch (error) {
      console.error('Failed to reload profile:', error);
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 h-auto min-h-16 py-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2 shrink-0">
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <Avatar className="w-10 h-10">
                    {profileData.profileImage ? (
                      <AvatarImage src={profileData.profileImage} alt="Profile" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
                      {(profileData.firstName?.[0] || '')}{(profileData.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl font-medium text-gray-900 truncate">
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {<RoleBadge role={userRole} />}
                    {institution && (
                      <span className="text-sm text-gray-500 truncate">
                        at {institution.institutionName}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Verified Account</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {updateSuccess && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Settings updated successfully!
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Error Alert */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {fetchError}
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">

            <ProfileHeaderCard
              profileData={profileData}
              isEditing={isEditing}
              isLoading={isLoading}
              onEdit={() => setIsEditing(true)}
              onCancel={handleCancel}
              onSave={handleProfileSave}
              onEditImage={() => setShowImageUpload(true)}
            />

            {/* Personal Information */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#ff6b35]" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="First Name"
                  id="firstName"
                  isEditing={isEditing}
                  value={profileData.firstName}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, firstName: v }))}
                />
                <ProfileField
                  label="Last Name"
                  id="lastName"
                  isEditing={isEditing}
                  value={profileData.lastName}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, lastName: v }))}
                />
                <ProfileField
                  label="Email Address"
                  id="email"
                  isEditing={isEditing}
                  value={profileData.email}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, email: v }))}
                  icon={<Mail className="w-4 h-4 text-gray-500" />}
                />
                <ProfileField
                  label="Phone Number"
                  id="phone"
                  isEditing={isEditing}
                  value={profileData.phone}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, phone: v }))}
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                />
              </div>
            </Card>

            {/* Company Information */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ff6b35]" />
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Company Name"
                  id="company"
                  isEditing={isEditing}
                  value={profileData.company || profileData.title}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, company: v, title: v }))}
                  icon={<Building2 className="w-4 h-4 text-gray-500" />}
                />
                <ProfileField
                  label="Company Size"
                  id="companySize"
                  isEditing={isEditing}
                  value={profileData.companySize}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, companySize: v }))}
                  type="select"
                  selectOptions={COMPANY_SIZES}
                />
                <ProfileField
                  label="Industry"
                  id="industry"
                  isEditing={isEditing}
                  value={profileData.industry}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, industry: v }))}
                  type="industry"
                />
                <ProfileField
                  label="Department"
                  id="department"
                  isEditing={isEditing}
                  value={profileData.department}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, department: v }))}
                  type="department"
                />
              </div>
            </Card>

            {/* Location & Timezone */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ff6b35]" />
                Location & Timezone
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="Location"
                  id="location"
                  isEditing={isEditing}
                  value={profileData.location}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, location: v }))}
                  icon={<MapPin className="w-4 h-4 text-gray-500" />}
                />
                <ProfileField
                  label="Timezone"
                  id="timezone"
                  isEditing={isEditing}
                  value={profileData.timezone}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, timezone: v }))}
                  type="select"
                  selectOptions={[
                    { value: 'Pacific/Midway', label: 'Midway (SST)' },
                    { value: 'Pacific/Honolulu', label: 'Hawaii (HST)' },
                    { value: 'America/Anchorage', label: 'Alaska (AKST/AKDT)' },
                    { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
                    { value: 'America/Vancouver', label: 'Vancouver (PST/PDT)' },
                    { value: 'America/Tijuana', label: 'Tijuana (PST/PDT)' },
                    { value: 'America/Phoenix', label: 'Arizona (MST)' },
                    { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
                    { value: 'America/Edmonton', label: 'Edmonton (MST/MDT)' },
                    { value: 'America/Mazatlan', label: 'Mazatlan (MST/MDT)' },
                    { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
                    { value: 'America/Winnipeg', label: 'Winnipeg (CST/CDT)' },
                    { value: 'America/Mexico_City', label: 'Mexico City (CST/CDT)' },
                    { value: 'America/Guatemala', label: 'Guatemala (CST)' },
                    { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
                    { value: 'America/Toronto', label: 'Toronto (EST/EDT)' },
                    { value: 'America/Montreal', label: 'Montreal (EST/EDT)' },
                    { value: 'America/Bogota', label: 'Bogota (COT)' },
                    { value: 'America/Lima', label: 'Lima (PET)' },
                    { value: 'America/Havana', label: 'Havana (CST/CDT)' },
                    { value: 'America/Caracas', label: 'Caracas (VET)' },
                    { value: 'America/Puerto_Rico', label: 'Puerto Rico (AST)' },
                    { value: 'America/Santiago', label: 'Santiago (CLT/CLST)' },
                    { value: 'America/Buenos_Aires', label: 'Buenos Aires (ART)' },
                    { value: 'America/Sao_Paulo', label: 'Sao Paulo (BRT/BRST)' },
                    { value: 'America/Montevideo', label: 'Montevideo (UYT)' },
                    { value: 'Atlantic/Reykjavik', label: 'Reykjavik (GMT)' },
                    { value: 'Europe/Dublin', label: 'Dublin (GMT/IST)' },
                    { value: 'Europe/London', label: 'London (GMT/BST)' },
                    { value: 'Europe/Lisbon', label: 'Lisbon (WET/WEST)' },
                    { value: 'Africa/Casablanca', label: 'Casablanca (WET)' },
                    { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
                    { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
                    { value: 'Europe/Amsterdam', label: 'Amsterdam (CET/CEST)' },
                    { value: 'Europe/Rome', label: 'Rome (CET/CEST)' },
                    { value: 'Europe/Madrid', label: 'Madrid (CET/CEST)' },
                    { value: 'Europe/Stockholm', label: 'Stockholm (CET/CEST)' },
                    { value: 'Europe/Vienna', label: 'Vienna (CET/CEST)' },
                    { value: 'Europe/Warsaw', label: 'Warsaw (CET/CEST)' },
                    { value: 'Europe/Zurich', label: 'Zurich (CET/CEST)' },
                    { value: 'Africa/Lagos', label: 'Lagos (WAT)' },
                    { value: 'Europe/Athens', label: 'Athens (EET/EEST)' },
                    { value: 'Europe/Helsinki', label: 'Helsinki (EET/EEST)' },
                    { value: 'Europe/Istanbul', label: 'Istanbul (TRT)' },
                    { value: 'Africa/Cairo', label: 'Cairo (EET/EEST)' },
                    { value: 'Africa/Johannesburg', label: 'Johannesburg (SAST)' },
                    { value: 'Europe/Moscow', label: 'Moscow (MSK)' },
                    { value: 'Europe/Kyiv', label: 'Kyiv (EET/EEST)' },
                    { value: 'Asia/Jerusalem', label: 'Jerusalem (IST/IDT)' },
                    { value: 'Asia/Riyadh', label: 'Riyadh (AST)' },
                    { value: 'Asia/Kuwait', label: 'Kuwait (AST)' },
                    { value: 'Asia/Baghdad', label: 'Baghdad (AST)' },
                    { value: 'Asia/Dubai', label: 'Dubai (GST)' },
                    { value: 'Asia/Tehran', label: 'Tehran (IRST/IRST)' },
                    { value: 'Asia/Karachi', label: 'Karachi (PKT)' },
                    { value: 'Asia/Tashkent', label: 'Tashkent (UZT)' },
                    { value: 'Asia/Kolkata', label: 'India (IST)' },
                    { value: 'Asia/Colombo', label: 'Colombo (IST)' },
                    { value: 'Asia/Dhaka', label: 'Dhaka (BST)' },
                    { value: 'Asia/Almaty', label: 'Almaty (ALMT)' },
                    { value: 'Asia/Bangkok', label: 'Bangkok (ICT)' },
                    { value: 'Asia/Jakarta', label: 'Jakarta (WIB)' },
                    { value: 'Asia/Ho_Chi_Minh', label: 'Ho Chi Minh (ICT)' },
                    { value: 'Asia/Singapore', label: 'Singapore (SGT)' },
                    { value: 'Asia/Kuala_Lumpur', label: 'Kuala Lumpur (MYT)' },
                    { value: 'Asia/Hong_Kong', label: 'Hong Kong (HKT)' },
                    { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
                    { value: 'Asia/Taipei', label: 'Taipei (CST)' },
                    { value: 'Asia/Manila', label: 'Manila (PHT)' },
                    { value: 'Australia/Perth', label: 'Perth (AWST)' },
                    { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
                    { value: 'Asia/Seoul', label: 'Seoul (KST)' },
                    { value: 'Asia/Pyongyang', label: 'Pyongyang (KST)' },
                    { value: 'Australia/Adelaide', label: 'Adelaide (ACST/ACDT)' },
                    { value: 'Australia/Darwin', label: 'Darwin (ACST)' },
                    { value: 'Australia/Brisbane', label: 'Brisbane (AEST)' },
                    { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
                    { value: 'Australia/Melbourne', label: 'Melbourne (AEST/AEDT)' },
                    { value: 'Pacific/Guam', label: 'Guam (ChST)' },
                    { value: 'Pacific/Auckland', label: 'Auckland (NZST/NZDT)' },
                    { value: 'Pacific/Fiji', label: 'Fiji (FJT)' },
                    { value: 'Pacific/Noumea', label: 'Noumea (NCT)' },
                  ]}
                  icon={<Calendar className="w-4 h-4 text-gray-500" />}
                />
              </div>
            </Card>

            {/* Online Presence */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Globe className="w-5 h-5 text-[#ff6b35]" />
                Online Presence
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfileField
                  label="LinkedIn Profile"
                  id="linkedin"
                  isEditing={isEditing}
                  value={profileData.linkedin}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, linkedin: v }))}
                  icon={profileData.linkedin ? <Globe className="w-4 h-4 text-gray-500" /> : undefined}
                />
                <ProfileField
                  label="Personal Website"
                  id="website"
                  isEditing={isEditing}
                  value={profileData.website}
                  onChange={(v) => setProfileData((prev) => ({ ...prev, website: v }))}
                  icon={profileData.website ? <Globe className="w-4 h-4 text-gray-500" /> : undefined}
                />
              </div>
            </Card>

            {/* Professional Bio */}
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#ff6b35]" />
                Professional Bio
              </h2>
              <ProfileField
                label="Bio"
                id="bio"
                isEditing={isEditing}
                value={profileData.bio}
                onChange={(v) => setProfileData((prev) => ({ ...prev, bio: v }))}
                type="textarea"
              />
            </Card>

            {/* Institution Info Card */}
            {institution && (
              <Card className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Institution Information</h3>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{institution.institutionName}</h4>
                      {institution.verificationStatus === 'verified' && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{institution.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{institution.industry}</span>
                      <span>•</span>
                      <span>{institution.city}, {institution.country}</span>
                      <span>•</span>
                      <span>Joined {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => onNavigate('institution-profile')}
                    variant="outline"
                    size="sm"
                  >
                    View Institution
                  </Button>
                </div>
              </Card>
            )}
        </div>
      </div>
      {/* Profile Image Upload Modal */}
      {showImageUpload && (
        <ProfileImageUpload
          currentImage={profileData.profileImage}
          onUpload={handleImageUpload}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
}