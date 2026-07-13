import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card } from '../ui/card';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Building2,
  Globe,
  Phone,
  MapPin,
  FileText,
  Heart,
  Save,
  X,
  Plus,
  Trash2,
  Loader2,
  Edit2,
  CheckCircle,
  AlertCircle,
  Camera,
  Link as LinkIcon,
  Briefcase
} from 'lucide-react';
import { AiFillLinkedin, AiFillGithub, AiFillTwitterCircle, AiFillFacebook, AiFillInstagram } from 'react-icons/ai';
import { companyService, type Company, type UpdateCompanyData } from '@/api/companies';
import { buildProfileImageUrl } from '@/api/recruiterProfile';
import { IndustrySelect, INDUSTRIES } from '../common/IndustrySelect';
import { ProfileImageUpload } from '../profile/ProfileImageUpload';
import { toast } from 'sonner';

interface SelectOption {
  value: string;
  label: string;
}

const TYPE_OPTIONS: SelectOption[] = [
  { value: 'solo', label: 'Solo Recruiter' },
  { value: 'corporation', label: 'Corporation' },
  { value: 'startup', label: 'Startup' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'government', label: 'Government' },
  { value: 'education', label: 'Education' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'agency', label: 'Recruiting Agency' },
  { value: 'other', label: 'Other' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
];

const SIZE_OPTIONS = [
  '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001+'
];

interface CompanyFieldProps {
  label: string;
  id: string;
  isEditing: boolean;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  type?: 'text' | 'textarea' | 'select' | 'number' | 'industry';
  selectOptions?: string[] | SelectOption[];
  placeholder?: string;
}

function CompanyField({
  label,
  id,
  isEditing,
  value,
  onChange,
  icon,
  type = 'text',
  selectOptions = [],
  placeholder
}: Readonly<CompanyFieldProps>) {
  const displayValue = (() => {
    if (!value) return null;
    if (type === 'industry') {
      const found = INDUSTRIES.find((opt) => opt.value === value);
      return found?.label || value;
    }
    if (type === 'select' && selectOptions && selectOptions.length > 0 && typeof selectOptions[0] !== 'string') {
      const found = (selectOptions as SelectOption[]).find(opt => opt.value === value);
      return found?.label || value;
    }
    return value;
  })();

  if (isEditing) {
    if (type === 'textarea') {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <Textarea
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
      );
    }
    if (type === 'industry') {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <IndustrySelect
            value={value || ''}
            onValueChange={onChange}
            triggerClassName="h-10"
          />
        </div>
      );
    }
    if (type === 'select') {
      return (
        <div className="space-y-2">
          <Label htmlFor={id}>{label}</Label>
          <select
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {selectOptions.map(opt => {
              if (typeof opt === 'string') {
                return <option key={opt} value={opt}>{opt}</option>;
              }
              return <option key={opt.value} value={opt.value}>{opt.label}</option>;
            })}
          </select>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Label htmlFor={id}>{label}</Label>
        <div className="relative">
          {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>}
          <Input
            id={id}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={icon ? 'pl-9' : ''}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-gray-500 text-sm">{label}</Label>
      <div className="h-12 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 flex items-center text-gray-900">
        {icon && <span className="mr-2">{icon}</span>}
        {displayValue || <span className="text-gray-400">Not specified</span>}
      </div>
    </div>
  );
}

interface CompanyEditPageProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  user?: any;
}

export function CompanyEditPage({ onBack }: Readonly<CompanyEditPageProps>) {
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UpdateCompanyData>({});
  const [values, setValues] = useState<string[]>([]);
  const [newValue, setNewValue] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showLogoUpload, setShowLogoUpload] = useState(false);

  const emptyFormData: UpdateCompanyData = {
    name: '',
    company_type: 'corporation',
    industry: '',
    company_size: '',
    description: '',
    website: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    founded_year: undefined,
    settings: {
      invitations_enabled: false,
      approval_required: false,
      job_posting_limit: 0
    },
    social_links: {},
    mission: '',
    vision: '',
    values: [],
    tax_id: '',
    status: 'draft',
  };

  useEffect(() => {
    const fetchCompany = async () => {
      setIsLoading(true);
      try {
        const data = await companyService.getMyCompany();
        setCompany(data);
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
          setIsCreating(true);
          setIsEditing(true);
          setFormData({ ...emptyFormData });
          setValues([]);
          setLogoPreview(null);
          setLogoFile(null);
        } else {
          setError(msg || 'Failed to load company data');
        }
      } finally {
        setIsLoading(false);
      }
    };
    void fetchCompany();
  }, []);

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        company_type: company.company_type,
        industry: company.industry,
        company_size: company.company_size,
        description: company.description,
        website: company.website,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country,
        zip_code: company.zip_code,
        founded_year: company.founded_year,
        settings: company.settings,
        social_links: company.social_links,
        mission: company.mission,
        vision: company.vision,
        values: company.values,
        tax_id: company.tax_id || '',
        status: company.status || 'draft',
      });
      setValues(company.values || []);
      setLogoPreview(company.logo ? buildProfileImageUrl(company.logo) : null);
      setLogoFile(null);
    }
  }, [company]);

  const handleChange = (field: keyof UpdateCompanyData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, url: string) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: url,
      },
    }));
  };

  const handleAddValue = () => {
    if (newValue.trim() && !values.includes(newValue.trim())) {
      setValues(prev => [...prev, newValue.trim()]);
      setNewValue('');
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    setValues(prev => prev.filter(v => v !== valueToRemove));
  };

  const handleLogoUpload = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const showSuccess = () => {
    setUpdateSuccess(true);
    setTimeout(() => setUpdateSuccess(false), 3000);
  };

  const handleCreateCompany = async () => {
    if (!formData.name || !formData.company_type) {
      setFetchError('Company name and type are required');
      return;
    }
    setIsSaving(true);
    setFetchError(null);
    try {
      const payload = {
        name: formData.name,
        company_type: formData.company_type,
        industry: formData.industry || '',
        company_size: formData.company_size || '',
        description: formData.description,
        website: formData.website,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zip_code: formData.zip_code,
        founded_year: formData.founded_year,
        tax_id: formData.tax_id,
      };
      const created = await companyService.createCompany(payload as any);
      if (logoFile && created.id) {
        try {
          const { logo_url } = await companyService.uploadLogo(created.id, logoFile);
          created.logo = logo_url;
        } catch (logoErr: any) {
          setFetchError(logoErr.message || 'Logo upload failed');
        }
      }
      setCompany(created);
      setIsCreating(false);
      setIsEditing(false);
      showSuccess();
      toast.success('Company created successfully');
    } catch (error: any) {
      setFetchError(error.message || 'Failed to create company');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!company?.id) return;
    setIsSaving(true);
    setFetchError(null);
    try {
      const payload: UpdateCompanyData = {
        ...formData,
        values,
      };
      const updated = await companyService.updateCompanyWithLogo(company.id, payload, logoFile);
      setCompany(updated);
      showSuccess();
      setIsEditing(false);
      toast.success('Company profile updated successfully');
    } catch (error: any) {
      if (error.partialUpdate && error.company) {
        setCompany(error.company);
        setFetchError(error.message || 'Logo upload failed, but profile was updated');
        showSuccess();
        setIsEditing(false);
      } else {
        setFetchError(error.message || 'Failed to update company profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (isCreating) {
      await handleCreateCompany();
      return;
    }
    await handleUpdateCompany();
  };

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
      setIsEditing(false);
      setFormData({ ...emptyFormData });
      setValues([]);
      setLogoPreview(null);
      setLogoFile(null);
      setFetchError(null);
      return;
    }
    if (company) {
      setFormData({
        name: company.name,
        company_type: company.company_type,
        industry: company.industry,
        company_size: company.company_size,
        description: company.description,
        website: company.website,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        country: company.country,
        zip_code: company.zip_code,
        founded_year: company.founded_year,
        settings: company.settings,
        social_links: company.social_links,
        mission: company.mission,
        vision: company.vision,
        values: company.values,
        tax_id: company.tax_id || '',
        status: company.status || 'draft',
      });
      setValues(company.values || []);
      setLogoPreview(company.logo ? buildProfileImageUrl(company.logo) : null);
      setLogoFile(null);
    }
    setIsEditing(false);
    setFetchError(null);
  };

  const handleDelete = async () => {
    if (!company?.id) return;
    if (!globalThis.confirm('Are you sure you want to delete this company? This action cannot be undone.')) return;
    setIsSaving(true);
    try {
      await companyService.deleteCompany(company.id);
      toast.success('Company deleted successfully');
      onBack();
    } catch (error: any) {
      setFetchError(error.message || 'Failed to delete company');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#ff6b35] mx-auto mb-4" />
          <p className="text-gray-600">Loading company data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={onBack} className="bg-[#ff6b35] text-white">Go Back</Button>
        </div>
      </div>
    );
  }

  const social = formData.social_links || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <X className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg ring-2 ring-white flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-5 h-5 text-white" />
                    )}
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-medium text-gray-900">
                    {isCreating ? 'Create Company' : (company?.name || 'Company Profile')}
                  </h1>
                  <div className="flex items-center gap-2">
                    {!isCreating && company?.is_verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    {!isCreating && (
                      <span className="text-sm text-gray-500">{(() => {
                        const industry = company?.industry;
                        if (!industry) return '';
                        const found = INDUSTRIES.find((o) => o.value === industry);
                        return found?.label || industry;
                      })()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isSaving} size="sm" className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                    {isSaving ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {isCreating ? 'Create' : 'Save'}
                      </>
                    )}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="flex items-center gap-2">
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </Button>
              )}
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
              Company profile updated successfully!
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
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </TabsTrigger>
            <TabsTrigger value="culture" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Culture
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <LinkIcon className="w-4 h-4" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100 shadow-xl">
              <div className="flex items-start gap-8">
                <div className="relative shrink-0">
                  <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg ring-4 ring-white flex items-center justify-center">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Company logo" className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {isEditing && (
                    <button
                        onClick={() => setShowLogoUpload(true)}
                        className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-orange-100"
                      >
                        <Camera className="w-4 h-4 text-[#ff6b35]" />
                      </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-semibold text-gray-900">{company?.name || 'New Company'}</h2>
                  <p className="text-lg text-gray-600 mt-1">
                    {(() => {
                      const industry = company?.industry;
                      if (!industry) return 'Select an industry';
                      const found = INDUSTRIES.find((o) => o.value === industry);
                      return found?.label || industry;
                    })()}
                    {company?.company_size ? (
                      <span className="text-[#ff6b35]"> • {company.company_size} employees</span>
                    ) : null}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                    {company?.website && (
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {company.website}
                      </span>
                    )}
                    {company?.founded_year && (
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        Founded {company.founded_year}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#ff6b35]" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CompanyField
                  label="Company Name"
                  id="name"
                  isEditing={isEditing}
                  value={formData.name || ''}
                  onChange={(v) => handleChange('name', v)}
                  icon={<Building2 className="w-4 h-4 text-gray-500" />}
                />
                <CompanyField
                  label="Company Type"
                  id="company_type"
                  isEditing={isEditing}
                  value={formData.company_type || ''}
                  onChange={(v) => handleChange('company_type', v)}
                  type="select"
                  selectOptions={TYPE_OPTIONS}
                />
                <CompanyField
                  label="Industry"
                  id="industry"
                  isEditing={isEditing}
                  value={formData.industry || ''}
                  onChange={(v) => handleChange('industry', v)}
                  type="industry"
                />
                <CompanyField
                  label="Company Size"
                  id="company_size"
                  isEditing={isEditing}
                  value={formData.company_size || ''}
                  onChange={(v) => handleChange('company_size', v)}
                  type="select"
                  selectOptions={SIZE_OPTIONS}
                />
                <CompanyField
                  label="Website"
                  id="website"
                  isEditing={isEditing}
                  value={formData.website || ''}
                  onChange={(v) => handleChange('website', v)}
                  icon={<Globe className="w-4 h-4 text-gray-500" />}
                  placeholder="https://acme.com"
                />
                <CompanyField
                  label="Phone"
                  id="phone"
                  isEditing={isEditing}
                  value={formData.phone || ''}
                  onChange={(v) => handleChange('phone', v)}
                  icon={<Phone className="w-4 h-4 text-gray-500" />}
                  placeholder="+1 (555) 123-4567"
                />
                <CompanyField
                  label="Founded Year"
                  id="founded_year"
                  isEditing={isEditing}
                  value={formData.founded_year?.toString() || ''}
                  onChange={(v) => handleChange('founded_year', v ? Number.parseInt(v, 10) : undefined)}
                  type="number"
                  placeholder="2015"
                />
                {!isCreating && (
                  <CompanyField
                    label="Status"
                    id="status"
                    isEditing={isEditing}
                    value={company?.status || 'draft'}
                    onChange={(v) => handleChange('status', v)}
                    type="select"
                    selectOptions={STATUS_OPTIONS}
                  />
                )}
                <CompanyField
                  label="Tax ID"
                  id="tax_id"
                  isEditing={isEditing}
                  value={formData.tax_id || ''}
                  onChange={(v) => handleChange('tax_id', v)}
                  placeholder="XX-XXXXXXX"
                />
              </div>
              <div className="mt-6">
                <CompanyField
                  label="Description"
                  id="description"
                  isEditing={isEditing}
                  value={formData.description || ''}
                  onChange={(v) => handleChange('description', v)}
                  type="textarea"
                  placeholder="Brief description of your company..."
                />
              </div>
            </Card>
          </TabsContent>

          {/* Location Tab */}
          <TabsContent value="location" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#ff6b35]" />
                Address
              </h2>
              <div className="space-y-6">
                <CompanyField
                  label="Street Address"
                  id="address"
                  isEditing={isEditing}
                  value={formData.address || ''}
                  onChange={(v) => handleChange('address', v)}
                  placeholder="123 Main Street"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CompanyField
                    label="City"
                    id="city"
                    isEditing={isEditing}
                    value={formData.city || ''}
                    onChange={(v) => handleChange('city', v)}
                    placeholder="San Francisco"
                  />
                  <CompanyField
                    label="State / Province"
                    id="state"
                    isEditing={isEditing}
                    value={formData.state || ''}
                    onChange={(v) => handleChange('state', v)}
                    placeholder="CA"
                  />
                  <CompanyField
                    label="Country"
                    id="country"
                    isEditing={isEditing}
                    value={formData.country || ''}
                    onChange={(v) => handleChange('country', v)}
                    placeholder="United States"
                  />
                  <CompanyField
                    label="ZIP / Postal Code"
                    id="zip_code"
                    isEditing={isEditing}
                    value={formData.zip_code || ''}
                    onChange={(v) => handleChange('zip_code', v)}
                    placeholder="94105"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Culture Tab */}
          <TabsContent value="culture" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#ff6b35]" />
                Culture & Values
              </h2>
              <div className="space-y-6">
                <CompanyField
                  label="Mission"
                  id="mission"
                  isEditing={isEditing}
                  value={formData.mission || ''}
                  onChange={(v) => handleChange('mission', v)}
                  type="textarea"
                  placeholder="Your company's mission statement..."
                />
                <CompanyField
                  label="Vision"
                  id="vision"
                  isEditing={isEditing}
                  value={formData.vision || ''}
                  onChange={(v) => handleChange('vision', v)}
                  type="textarea"
                  placeholder="Your company's vision..."
                />
                <div className="space-y-2">
                  <Label>Company Values</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {values.map((v) => (
                      <Badge key={v} variant="secondary" className="flex items-center gap-1">
                        {v}
                        {isEditing && (
                          <button onClick={() => handleRemoveValue(v)} className="hover:text-red-500">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        placeholder="Add a core value..."
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddValue())}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleAddValue}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Social Tab */}
          <TabsContent value="social" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#ff6b35]" />
                Social Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: 'linkedin', label: 'LinkedIn', icon: AiFillLinkedin, color: 'text-[#0A66C2]' },
                  { key: 'twitter', label: 'Twitter', icon: AiFillTwitterCircle, color: 'text-[#1DA1F2]' },
                  { key: 'facebook', label: 'Facebook', icon: AiFillFacebook, color: 'text-[#1877F2]' },
                  { key: 'instagram', label: 'Instagram', icon: AiFillInstagram, color: 'text-[#E1306C]' },
                  { key: 'github', label: 'GitHub', icon: AiFillGithub, color: 'text-[#181717]' },
                ].map(({ key, label, icon: Icon, color }) => (
                  <CompanyField
                    key={key}
                    label={label}
                    id={key}
                    isEditing={isEditing}
                    value={(social as any)[key] || ''}
                    onChange={(v) => handleSocialChange(key, v)}
                    icon={<Icon className={`w-4 h-4 ${color}`} />}
                    placeholder={`https://${key}.com/...`}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
        {!isCreating && company && (
          <Card className="p-6 mt-6 border-red-200">
            <h2 className="text-lg font-medium text-red-600 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Danger Zone
            </h2>
            <div className="space-y-4">
              <div className="flex items-start justify-between p-4 border border-red-200 rounded-lg bg-red-50">
                <div>
                  <h3 className="font-medium text-red-900">Delete Company</h3>
                  <p className="text-sm text-red-700">
                    Permanently delete this company and all associated data. This action cannot be undone.
                  </p>
                </div>
                <Button
                  onClick={handleDelete}
                  disabled={isSaving}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100 shrink-0"
                >
                  Delete Company
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Logo Upload Modal */}
      {showLogoUpload && (
        <ProfileImageUpload
          currentImage={logoPreview || undefined}
          onUpload={async (file: File) => {
            handleLogoUpload(file);
          }}
          onClose={() => setShowLogoUpload(false)}
        />
      )}
    </div>
  );
}
