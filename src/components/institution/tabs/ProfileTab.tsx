import { useState } from 'react';
import { Card } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Globe, Phone, MapPin, Users, Briefcase, UserCheck, Edit2, Save } from 'lucide-react';

interface FormData {
  institutionName: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface ProfileTabProps {
  formData: FormData;
  onFormDataChange: (data: FormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
  teamMembersCount: number;
  openPositionsCount: number;
  totalApplications: number;
}

function ProfileField({
  id,
  label,
  isEditing,
  value,
  onChange,
  placeholder,
  renderView
}: Readonly<{
  id: string;
  label: string;
  isEditing: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  renderView?: (val: string) => React.ReactNode;
}>) {
  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12"
          placeholder={placeholder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center">
        {renderView ? renderView(value) : (value || 'Not specified')}
      </div>
    </div>
  );
}

function DescriptionField({
  isEditing,
  value,
  onChange
}: Readonly<{
  isEditing: boolean;
  value: string;
  onChange: (val: string) => void;
}>) {
  if (isEditing) {
    return (
      <div className="mt-6 space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[100px]"
          maxLength={500}
        />
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-2">
      <Label htmlFor="description">Description</Label>
      <div className="min-h-[100px] p-3 border border-gray-200 rounded-md bg-gray-50">
        {value || 'No description provided'}
      </div>
    </div>
  );
}

export function ProfileTab({
  formData,
  onFormDataChange,
  onSave,
  onCancel,
  isLoading,
  teamMembersCount,
  openPositionsCount,
  totalApplications
}: Readonly<ProfileTabProps>) {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  const handleSave = () => {
    onSave();
    setIsEditing(false);
  };

  const handleCancel = () => {
    onCancel();
    setIsEditing(false);
  };

  const renderWebsiteView = (value: string) => {
    if (!value) return 'Not specified';
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="text-[#ff6b35] hover:underline flex items-center gap-2">
        <Globe className="w-4 h-4" />
        {value}
      </a>
    );
  };

  const renderPhoneView = (value: string) => {
    if (!value) return 'Not specified';
    return (
      <div className="flex items-center gap-2">
        <Phone className="w-4 h-4 text-gray-500" />
        {value}
      </div>
    );
  };

  const renderAddressView = (value: string) => {
    if (!value) return 'Not specified';
    return (
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-gray-500" />
        {value}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg font-medium text-gray-900">Institution Details</h2>
          {isEditing ? (
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCancel} variant="outline" size="sm">
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isLoading} size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b]">
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
            <Button onClick={() => setIsEditing(true)} variant="outline" className="flex items-center gap-2">
              <Edit2 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ProfileField
            id="institutionName"
            label="Institution Name"
            isEditing={isEditing}
            value={formData.institutionName}
            onChange={(val) => handleChange('institutionName', val)}
          />
          <ProfileField
            id="website"
            label="Website"
            isEditing={isEditing}
            value={formData.website}
            onChange={(val) => handleChange('website', val)}
            placeholder="https://company.com"
            renderView={renderWebsiteView}
          />
          <ProfileField
            id="phone"
            label="Phone"
            isEditing={isEditing}
            value={formData.phone}
            onChange={(val) => handleChange('phone', val)}
            renderView={renderPhoneView}
          />
          <ProfileField
            id="address"
            label="Address"
            isEditing={isEditing}
            value={formData.address}
            onChange={(val) => handleChange('address', val)}
            renderView={renderAddressView}
          />
          <ProfileField
            id="city"
            label="City"
            isEditing={isEditing}
            value={formData.city}
            onChange={(val) => handleChange('city', val)}
          />
          <ProfileField
            id="country"
            label="Country"
            isEditing={isEditing}
            value={formData.country}
            onChange={(val) => handleChange('country', val)}
          />
        </div>

        <DescriptionField
          isEditing={isEditing}
          value={formData.description}
          onChange={(val) => handleChange('description', val)}
        />
      </Card>

      {/* Institution Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{teamMembersCount}</p>
              <p className="text-sm text-gray-500">Team Members</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{openPositionsCount}</p>
              <p className="text-sm text-gray-500">Open Positions</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-gray-900">{totalApplications}</p>
              <p className="text-sm text-gray-500">Total Applications</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
