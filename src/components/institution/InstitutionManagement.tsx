import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { AccessRestriction } from '../common/AccessRestriction';
import { companyService } from '../../api/companies';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Users,
  Shield,
  Mail,
  Phone,
  Save,
  Upload,
  Award,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Video,
  Palette,
  Heart,
  Home,
  Plus,
  Trash2,
  Camera,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2} from 'lucide-react';
import {
  AiFillFacebook,
  AiFillTwitterSquare,
  AiFillLinkedin,
  AiFillInstagram,
  AiFillGithub,
  AiFillYoutube
} from 'react-icons/ai';

interface InstitutionManagementProps {
  institution: any;
  user: any;
  onBack: () => void;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export function InstitutionManagement({ institution, user, onBack }: Readonly<InstitutionManagementProps>) {
  // Check if user is admin

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch company data on mount
  const fetchCompanyData = useCallback(async () => {
    if (!institution?.id) return;
    
    setIsLoadingData(true);
    setError(null);
    
    try {
      const company = await companyService.getCompany(institution.id);
      
      // Update form states with company data
      setCompanyInfo({
        name: company.name || '',
        description: company.description || '',
        website: company.website || '',
        industry: company.industry || '',
        size: company.company_size || '',
        founded: company.founded_year?.toString() || '',
        headquarters: `${company.city || ''}, ${company.state || ''}`,
        type: company.company_type || '',
        fundingStage: '',
        stockSymbol: '',
        revenue: ''
      });
      
      // Update contact info
      setContactInfo({
        mainEmail: '',
        supportEmail: '',
        hrEmail: '',
        mainPhone: company.phone || '',
        supportPhone: '',
        address: company.address || '',
        linkedIn: company.social_links?.linkedin || '',
        twitter: company.social_links?.twitter || '',
        facebook: company.social_links?.facebook || '',
        instagram: company.social_links?.instagram || '',
        github: company.social_links?.github || '',
        youtube: ''
      });

      // Update culture info if available
      if (company.mission || company.vision || company.values) {
        setCultureInfo(prev => ({
          ...prev,
          mission: company.mission || prev.mission,
          vision: company.vision || prev.vision,
          values: company.values || prev.values,
        }));
      }
      
      // Update branding settings
      setBrandingSettings(prev => ({
        ...prev,
        logoUrl: company.logo || '',
        bannerUrl: company.banner || ''
      }));
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load company data');
    } finally {
      setIsLoadingData(false);
    }
  }, [institution?.id]);

  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  // Form states - Company Info
  const [companyInfo, setCompanyInfo] = useState({
    name: institution?.name || '',
    description: institution?.description || '',
    website: institution?.website || '',
    industry: institution?.industry || '',
    size: institution?.size || '',
    founded: institution?.founded_year?.toString() || '',
    headquarters: '',
    type: institution?.company_type || '',
    fundingStage: '',
    stockSymbol: '',
    revenue: ''
  });

  // Branding & Media
  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: '#ff6b35',
    secondaryColor: '#e55a2b',
    logoUrl: institution?.logo || '',
    bannerUrl: institution?.banner || '',
    videoUrl: '',
    tagline: '',
    photoGallery: [] as string[]
  });

  // Culture & Values
  const [cultureInfo, setCultureInfo] = useState({
    mission: institution?.culture_values?.mission || '',
    vision: institution?.culture_values?.vision || '',
    values: institution?.culture_values?.values || [],
    workEnvironment: 'hybrid',
    benefits: institution?.culture_values?.benefits || [],
    perks: [],
    diversityStatement: institution?.culture_values?.diversity_statement || '',
    techStack: institution?.culture_values?.tech_stack || []
  });

  // Locations
  const [locations, setLocations] = useState<{ id: string; name: string; address: string; type: string; employees: number; isRemote: boolean }[]>([]);

  // Contact & Social
  const [contactInfo, setContactInfo] = useState({
    mainEmail: institution?.email || '',
    supportEmail: '',
    hrEmail: '',
    mainPhone: institution?.phone || '',
    supportPhone: '',
    address: institution?.address || '',
    linkedIn: institution?.social_links?.linkedin || '',
    twitter: institution?.social_links?.twitter || '',
    facebook: institution?.social_links?.facebook || '',
    instagram: institution?.social_links?.instagram || '',
    github: institution?.social_links?.github || '',
    youtube: ''
  });

  // Legal
  const [legalInfo, setLegalInfo] = useState({
    registrationNumber: '',
    taxId: institution?.tax_id || '',
    incorporationDate: '',
    registeredAddress: institution?.address || '',
    legalName: institution?.name || '',
    jurisdiction: '',
    businessLicense: ''
  });

  // Achievements & Awards
  const [achievements] = useState<{ id: string; title: string; date: string; organization: string }[]>([]);

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 7;
    
    if (companyInfo.name && companyInfo.description) completed++;
    if (brandingSettings.logoUrl || brandingSettings.tagline) completed++;
    if (cultureInfo.mission && cultureInfo.values.length > 0) completed++;
    if (locations.length > 0) completed++;
    if (contactInfo.mainEmail && contactInfo.mainPhone) completed++;
    if (legalInfo.registrationNumber) completed++;
    if (achievements.length > 0) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const handleSave = async (section: string) => {
    if (!institution?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Build update data based on section
      let updateData: any = {};
      
      switch (section) {
        case 'Company Info':
          updateData = {
            name: companyInfo.name,
            description: companyInfo.description,
            website: companyInfo.website,
            industry: companyInfo.industry,
            size: companyInfo.size,
          };
          break;
        case 'Branding & Media':
          updateData = {
            // Logo and banner are handled separately via upload
          };
          break;
        case 'Culture & Values':
          updateData = {
            culture_values: {
              mission: cultureInfo.mission,
              vision: cultureInfo.vision,
              values: cultureInfo.values,
              benefits: cultureInfo.benefits,
            }
          };
          break;
        case 'Contact Info':
          updateData = {
            email: contactInfo.mainEmail,
            phone: contactInfo.mainPhone,
            address: contactInfo.address,
            social_links: {
              linkedin: contactInfo.linkedIn,
              twitter: contactInfo.twitter,
              facebook: contactInfo.facebook,
              instagram: contactInfo.instagram,
              github: contactInfo.github,
            }
          };
          break;
      }
      
      await companyService.updateCompany(institution.id, updateData);
      
      setSuccessMessage(`${section} settings updated successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const addLocation = () => {
    setLocations([...locations, {
      id: Date.now().toString(),
      name: '',
      address: '',
      type: 'Office',
      employees: 0,
      isRemote: false
    }]);
  };

  const removeLocation = (id: string) => {
    setLocations(locations.filter(loc => loc.id !== id));
  };

  const addValue = () => {
    setCultureInfo({
      ...cultureInfo,
      values: [...cultureInfo.values, '']
    });
  };

  const updateValue = (index: number, value: string) => {
    const newValues = [...cultureInfo.values];
    newValues[index] = value;
    setCultureInfo({ ...cultureInfo, values: newValues });
  };

  const removeValue = (index: number) => {
    setCultureInfo({
      ...cultureInfo,
      values: cultureInfo.values.filter((_: string, i: number) => i !== index)
    });
  };

  const profileCompletion = calculateCompletion();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="p-2">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl text-gray-900">Organization Settings</h1>
                  <p className="text-sm text-gray-500">{institution?.name || 'Organization Settings'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <Badge variant="outline" className="border-[#ff6b35] text-[#ff6b35]">
                <Sparkles className="w-3 h-3 mr-1" />
                {profileCompletion}% Complete
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 bg-white/80 backdrop-blur-sm p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Home className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="company" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Building2 className="w-4 h-4 mr-2" />
              Company
            </TabsTrigger>
            <TabsTrigger value="branding" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="culture" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Heart className="w-4 h-4 mr-2" />
              Culture
            </TabsTrigger>
            <TabsTrigger value="locations" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <MapPin className="w-4 h-4 mr-2" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Mail className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="legal" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              <Shield className="w-4 h-4 mr-2" />
              Legal
            </TabsTrigger>
          </TabsList>

          {!isLoadingData && (
            <>
            {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Profile Completion */}
              <Card className="p-6 bg-gradient-to-br from-white to-orange-50 border-0 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-lg text-gray-900">Profile Completion</h3>
                  <Sparkles className="w-5 h-5 text-[#ff6b35]" />
                </div>
                <div className="space-y-2">
                  <Progress value={profileCompletion} className="h-3" />
                  <p className="text-sm text-gray-600">
                    {profileCompletion}% of your company profile is complete
                  </p>
                </div>
                <div className="mt-6 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Basic company information</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-gray-600">Contact details</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400">Upload company photos</span>
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4">Quick Stats</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl text-gray-900">{locations.reduce((sum, loc) => sum + loc.employees, 0)}</p>
                    <p className="text-sm text-gray-600">Total Employees</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-2xl text-gray-900">{locations.length}</p>
                    <p className="text-sm text-gray-600">Office Locations</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl text-gray-900">{achievements.length}</p>
                    <p className="text-sm text-gray-600">Achievements</p>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                    <Heart className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                    <p className="text-2xl text-gray-900">{cultureInfo.values.length}</p>
                    <p className="text-sm text-gray-600">Core Values</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Updates */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#ff6b35]" />
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg">
                    <div className="flex items-start gap-3 min-w-0">
                      <Award className="w-5 h-5 text-[#ff6b35] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-gray-900">{achievement.title}</p>
                        <p className="text-sm text-gray-500">{achievement.organization} • {achievement.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* COMPANY INFO TAB */}
          <TabsContent value="company" className="space-y-6">
            <AccessRestriction 
              user={user} 
              requiredRole="admin"
              fallback={
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span>
                        Access restricted. Only institution administrators can manage company information and settings.
                      </span>
                    </div>
                  </AlertDescription>
                </Alert>
              }
            >
              <Card className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div>
                    <h3 className="text-lg text-gray-900">Basic Company Information</h3>
                    <p className="text-sm text-gray-600">Manage your company's basic details and public information</p>
                  </div>
                  <Button 
                    onClick={() => handleSave('Company')}
                    disabled={isLoading}
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        value={companyInfo.name}
                        onChange={(e) => setCompanyInfo({...companyInfo, name: e.target.value})}
                        placeholder="Enter company name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry *</Label>
                      <Select value={companyInfo.industry} onValueChange={(value: any) => setCompanyInfo({...companyInfo, industry: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Healthcare">Healthcare</SelectItem>
                          <SelectItem value="Finance">Finance</SelectItem>
                          <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                          <SelectItem value="Retail">Retail</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Consulting">Consulting</SelectItem>
                          <SelectItem value="Real Estate">Real Estate</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="companySize">Company Size *</Label>
                      <Select value={companyInfo.size} onValueChange={(value: any) => setCompanyInfo({...companyInfo, size: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-10 employees">1-10 employees</SelectItem>
                          <SelectItem value="11-50 employees">11-50 employees</SelectItem>
                          <SelectItem value="51-200 employees">51-200 employees</SelectItem>
                          <SelectItem value="201-500 employees">201-500 employees</SelectItem>
                          <SelectItem value="501-1000 employees">501-1000 employees</SelectItem>
                          <SelectItem value="1000+ employees">1000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="founded">Founded Year *</Label>
                      <Input
                        id="founded"
                        value={companyInfo.founded}
                        onChange={(e) => setCompanyInfo({...companyInfo, founded: e.target.value})}
                        placeholder="2015"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fundingStage">Funding Stage</Label>
                      <Select value={companyInfo.fundingStage} onValueChange={(value: any) => setCompanyInfo({...companyInfo, fundingStage: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Seed">Seed</SelectItem>
                          <SelectItem value="Series A">Series A</SelectItem>
                          <SelectItem value="Series B">Series B</SelectItem>
                          <SelectItem value="Series C">Series C</SelectItem>
                          <SelectItem value="Series D+">Series D+</SelectItem>
                          <SelectItem value="Public">Public</SelectItem>
                          <SelectItem value="Bootstrapped">Bootstrapped</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="website">Website *</Label>
                      <Input
                        id="website"
                        type="url"
                        value={companyInfo.website}
                        onChange={(e) => setCompanyInfo({...companyInfo, website: e.target.value})}
                        placeholder="https://yourcompany.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="headquarters">Headquarters *</Label>
                      <Input
                        id="headquarters"
                        value={companyInfo.headquarters}
                        onChange={(e) => setCompanyInfo({...companyInfo, headquarters: e.target.value})}
                        placeholder="San Francisco, CA"
                      />
                    </div>

                    <div>
                      <Label htmlFor="companyType">Company Type *</Label>
                      <Select value={companyInfo.type} onValueChange={(value: any) => setCompanyInfo({...companyInfo, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Private Company">Private Company</SelectItem>
                          <SelectItem value="Public Company">Public Company</SelectItem>
                          <SelectItem value="Startup">Startup</SelectItem>
                          <SelectItem value="Non-profit">Non-profit</SelectItem>
                          <SelectItem value="Government">Government</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="revenue">Annual Revenue Range</Label>
                      <Select value={companyInfo.revenue} onValueChange={(value: any) => setCompanyInfo({...companyInfo, revenue: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Less than $1M">Less than $1M</SelectItem>
                          <SelectItem value="$1M - $10M">$1M - $10M</SelectItem>
                          <SelectItem value="$10M - $50M">$10M - $50M</SelectItem>
                          <SelectItem value="$50M - $100M">$50M - $100M</SelectItem>
                          <SelectItem value="$100M - $500M">$100M - $500M</SelectItem>
                          <SelectItem value="$500M+">$500M+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="stockSymbol">Stock Symbol (if public)</Label>
                      <Input
                        id="stockSymbol"
                        value={companyInfo.stockSymbol}
                        onChange={(e) => setCompanyInfo({...companyInfo, stockSymbol: e.target.value})}
                        placeholder="TECH"
                      />
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <Label htmlFor="description">Company Description *</Label>
                  <Textarea
                    id="description"
                    value={companyInfo.description}
                    onChange={(e) => setCompanyInfo({...companyInfo, description: e.target.value})}
                    rows={5}
                    placeholder="Tell candidates about your company, what you do, and what makes you unique..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {companyInfo.description.length} / 500 characters
                  </p>
                </div>
              </Card>
            </AccessRestriction>
          </TabsContent>

          {/* BRANDING & MEDIA TAB */}
          <TabsContent value="branding" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900">Brand Identity & Visual Assets</h3>
                  <p className="text-sm text-gray-600">Customize your company's visual identity and branding</p>
                </div>
                <Button 
                  onClick={() => handleSave('Branding')}
                  disabled={isLoading}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Logo & Banner */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-[#ff6b35]" />
                    Logo & Banner
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 border-dashed border-2 border-gray-300 hover:border-[#ff6b35] transition-colors cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-medium text-gray-700 mb-1">Upload Company Logo</p>
                        <p className="text-sm text-gray-500">PNG, JPG, SVG up to 2MB</p>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 400x400px</p>
                      </div>
                    </Card>

                    <Card className="p-6 border-dashed border-2 border-gray-300 hover:border-[#ff6b35] transition-colors cursor-pointer">
                      <div className="text-center">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="font-medium text-gray-700 mb-1">Upload Banner Image</p>
                        <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                        <p className="text-xs text-gray-400 mt-2">Recommended: 1920x400px</p>
                      </div>
                    </Card>
                  </div>
                </div>

                <Separator />

                {/* Brand Colors */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Palette className="w-5 h-5 text-[#ff6b35]" />
                    Brand Colors
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="primaryColor">Primary Brand Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={brandingSettings.primaryColor}
                          onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                          className="w-20"
                        />
                        <Input
                          value={brandingSettings.primaryColor}
                          onChange={(e) => setBrandingSettings({...brandingSettings, primaryColor: e.target.value})}
                          className="flex-1"
                          placeholder="#ff6b35"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="secondaryColor">Secondary Brand Color</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={brandingSettings.secondaryColor}
                          onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                          className="w-20"
                        />
                        <Input
                          value={brandingSettings.secondaryColor}
                          onChange={(e) => setBrandingSettings({...brandingSettings, secondaryColor: e.target.value})}
                          className="flex-1"
                          placeholder="#e55a2b"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tagline */}
                <div>
                  <Label htmlFor="tagline">Company Tagline</Label>
                  <Input
                    id="tagline"
                    value={brandingSettings.tagline}
                    onChange={(e) => setBrandingSettings({...brandingSettings, tagline: e.target.value})}
                    placeholder="Your inspiring tagline..."
                  />
                </div>

                <Separator />

                {/* Video */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Video className="w-5 h-5 text-[#ff6b35]" />
                    Company Video
                  </h4>
                  <Label htmlFor="videoUrl">Video URL (YouTube, Vimeo, etc.)</Label>
                  <Input
                    id="videoUrl"
                    value={brandingSettings.videoUrl}
                    onChange={(e) => setBrandingSettings({...brandingSettings, videoUrl: e.target.value})}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <Separator />

                {/* Photo Gallery */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Camera className="w-5 h-5 text-[#ff6b35]" />
                    Photo Gallery
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload photos of your office, team events, and workplace culture
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <Card key={i} className="aspect-square border-dashed border-2 border-gray-300 hover:border-[#ff6b35] transition-colors cursor-pointer flex items-center justify-center">
                        <div className="text-center">
                          <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">Add Photo</p>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* CULTURE & VALUES TAB */}
          <TabsContent value="culture" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900">Culture & Company Values</h3>
                  <p className="text-sm text-gray-600">Define what makes your company unique</p>
                </div>
                <Button 
                  onClick={() => handleSave('Culture')}
                  disabled={isLoading}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Mission */}
                <div>
                  <Label htmlFor="mission">Mission Statement</Label>
                  <Textarea
                    id="mission"
                    value={cultureInfo.mission}
                    onChange={(e) => setCultureInfo({...cultureInfo, mission: e.target.value})}
                    rows={3}
                    placeholder="What is your company's mission?"
                  />
                </div>

                {/* Vision */}
                <div>
                  <Label htmlFor="vision">Vision Statement</Label>
                  <Textarea
                    id="vision"
                    value={cultureInfo.vision}
                    onChange={(e) => setCultureInfo({...cultureInfo, vision: e.target.value})}
                    rows={3}
                    placeholder="What is your long-term vision?"
                  />
                </div>

                <Separator />

                {/* Core Values */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <Label>Core Values</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addValue}
                      className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Value
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {cultureInfo.values.map((value: string, index: number) => (
                      <div key={`value-${value}-${index}`} className="flex items-center gap-2">
                        <Input
                          value={value}
                          onChange={(e) => updateValue(index, e.target.value)}
                          placeholder="Enter a core value"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeValue(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Work Environment */}
                <div>
                  <Label>Work Environment</Label>
                  <Select value={cultureInfo.workEnvironment} onValueChange={(value: any) => setCultureInfo({...cultureInfo, workEnvironment: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Fully Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Diversity Statement */}
                <div>
                  <Label htmlFor="diversityStatement">Diversity & Inclusion Statement</Label>
                  <Textarea
                    id="diversityStatement"
                    value={cultureInfo.diversityStatement}
                    onChange={(e) => setCultureInfo({...cultureInfo, diversityStatement: e.target.value})}
                    rows={3}
                    placeholder="Describe your commitment to diversity and inclusion..."
                  />
                </div>

                <Separator />

                {/* Benefits & Perks */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="mb-3 block">Employee Benefits</Label>
                    <div className="space-y-2">
                      {cultureInfo.benefits.map((benefit: string, index: number) => (
                        <div key={`benefit-${benefit}-${index}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-700">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="mb-3 block">Office Perks</Label>
                    <div className="space-y-2">
                      {cultureInfo.perks.map((perk, index) => (
                        <div key={`perk-${perk}-${index}`} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-orange-500" />
                          <span className="text-sm text-gray-700">{perk}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tech Stack */}
                <div>
                  <Label className="mb-3 block">Tech Stack & Tools</Label>
                  <div className="flex flex-wrap gap-2">
                    {cultureInfo.techStack.map((tech: string, index: number) => (
                      <Badge key={`tech-${tech}-${index}`} variant="secondary" className="bg-blue-100 text-blue-800">
                        {tech}
                      </Badge>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-dashed border-[#ff6b35] text-[#ff6b35]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Tech
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* LOCATIONS TAB */}
          <TabsContent value="locations" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900">Office Locations</h3>
                  <p className="text-sm text-gray-600">Manage your company's physical locations</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={addLocation}
                    className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Location
                  </Button>
                  <Button 
                    onClick={() => handleSave('Locations')}
                    disabled={isLoading}
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {locations.map((location, index) => (
                  <Card key={location.id} className="p-4 bg-gradient-to-r from-gray-50 to-orange-50">
                    <div className="flex items-start justify-between mb-4">
                      <Badge variant={location.type === 'Headquarters' ? 'default' : 'secondary'} className={location.type === 'Headquarters' ? 'bg-[#ff6b35]' : ''}>
                        {location.type}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLocation(location.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor={`location-name-${location.id}`}>Location Name</Label>
                        <Input
                          id={`location-name-${location.id}`}
                          value={location.name}
                          onChange={(e) => {
                            const newLocations = [...locations];
                            newLocations[index].name = e.target.value;
                            setLocations(newLocations);
                          }}
                          placeholder="San Francisco HQ"
                        />
                      </div>

                      <div>
                        <Label htmlFor={`location-type-${location.id}`}>Type</Label>
                        <Select 
                          value={location.type} 
                          onValueChange={(value: string) => {
                            const newLocations = [...locations];
                            newLocations[index].type = value;
                            setLocations(newLocations);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Headquarters">Headquarters</SelectItem>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="Coworking">Coworking</SelectItem>
                            <SelectItem value="Remote">Remote Hub</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor={`location-employees-${location.id}`}>Employees</Label>
                        <Input
                          id={`location-employees-${location.id}`}
                          type="number"
                          value={location.employees}
                          onChange={(e) => {
                            const newLocations = [...locations];
                            newLocations[index].employees = Number.parseInt(e.target.value) || 0;
                            setLocations(newLocations);
                          }}
                          placeholder="50"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <Label htmlFor={`location-address-${location.id}`}>Full Address</Label>
                      <Textarea
                        id={`location-address-${location.id}`}
                        value={location.address}
                        onChange={(e) => {
                          const newLocations = [...locations];
                          newLocations[index].address = e.target.value;
                          setLocations(newLocations);
                        }}
                        rows={2}
                        placeholder="123 Main Street, City, State, ZIP"
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* CONTACT & SOCIAL TAB */}
          <TabsContent value="contact" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900">Contact Information & Social Media</h3>
                  <p className="text-sm text-gray-600">Manage how candidates and partners can reach your company</p>
                </div>
                <Button 
                  onClick={() => handleSave('Contact')}
                  disabled={isLoading}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className="space-y-6">
                {/* Email Addresses */}
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-[#ff6b35]" />
                    Email Addresses
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mainEmail">Main Contact Email</Label>
                      <Input
                        id="mainEmail"
                        type="email"
                        value={contactInfo.mainEmail}
                        onChange={(e) => setContactInfo({...contactInfo, mainEmail: e.target.value})}
                        placeholder="contact@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="hrEmail">HR/Recruitment Email</Label>
                      <Input
                        id="hrEmail"
                        type="email"
                        value={contactInfo.hrEmail}
                        onChange={(e) => setContactInfo({...contactInfo, hrEmail: e.target.value})}
                        placeholder="hr@company.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="supportEmail">Support Email</Label>
                      <Input
                        id="supportEmail"
                        type="email"
                        value={contactInfo.supportEmail}
                        onChange={(e) => setContactInfo({...contactInfo, supportEmail: e.target.value})}
                        placeholder="support@company.com"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Phone Numbers */}
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                    <Phone className="w-5 h-5 text-[#ff6b35]" />
                    Phone Numbers
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mainPhone">Main Phone</Label>
                      <Input
                        id="mainPhone"
                        type="tel"
                        value={contactInfo.mainPhone}
                        onChange={(e) => setContactInfo({...contactInfo, mainPhone: e.target.value})}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div>
                      <Label htmlFor="supportPhone">Support Phone</Label>
                      <Input
                        id="supportPhone"
                        type="tel"
                        value={contactInfo.supportPhone}
                        onChange={(e) => setContactInfo({...contactInfo, supportPhone: e.target.value})}
                        placeholder="+1 (555) 123-4568"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social Media */}
                <div>
                  <h4 className="font-medium text-gray-900 flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-[#ff6b35]" />
                    Social Media & Web Presence
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="linkedin" className="flex items-center gap-2">
                        <AiFillLinkedin className="w-4 h-4 text-blue-600" />
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={contactInfo.linkedIn}
                        onChange={(e) => setContactInfo({...contactInfo, linkedIn: e.target.value})}
                        placeholder="https://linkedin.com/company/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="twitter" className="flex items-center gap-2">
                        <AiFillTwitterSquare className="w-4 h-4 text-blue-400" />
                        Twitter/X
                      </Label>
                      <Input
                        id="twitter"
                        type="url"
                        value={contactInfo.twitter}
                        onChange={(e) => setContactInfo({...contactInfo, twitter: e.target.value})}
                        placeholder="https://twitter.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="facebook" className="flex items-center gap-2">
                        <AiFillFacebook className="w-4 h-4 text-blue-600" />
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        type="url"
                        value={contactInfo.facebook}
                        onChange={(e) => setContactInfo({...contactInfo, facebook: e.target.value})}
                        placeholder="https://facebook.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="instagram" className="flex items-center gap-2">
                        <AiFillInstagram className="w-4 h-4 text-pink-600" />
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        type="url"
                        value={contactInfo.instagram}
                        onChange={(e) => setContactInfo({...contactInfo, instagram: e.target.value})}
                        placeholder="https://instagram.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="github" className="flex items-center gap-2">
                        <AiFillGithub className="w-4 h-4 text-gray-800" />
                        GitHub
                      </Label>
                      <Input
                        id="github"
                        type="url"
                        value={contactInfo.github}
                        onChange={(e) => setContactInfo({...contactInfo, github: e.target.value})}
                        placeholder="https://github.com/yourcompany"
                      />
                    </div>

                    <div>
                      <Label htmlFor="youtube" className="flex items-center gap-2">
                        <AiFillYoutube className="w-4 h-4 text-red-600" />
                        YouTube
                      </Label>
                      <Input
                        id="youtube"
                        type="url"
                        value={contactInfo.youtube}
                        onChange={(e) => setContactInfo({...contactInfo, youtube: e.target.value})}
                        placeholder="https://youtube.com/@yourcompany"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* LEGAL & COMPLIANCE TAB */}
          <TabsContent value="legal" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg text-gray-900">Legal & Compliance Information</h3>
                  <p className="text-sm text-gray-600">Manage legal entity details and compliance information</p>
                </div>
                <Button 
                  onClick={() => handleSave('Legal')}
                  disabled={isLoading}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="legalName">Legal Entity Name</Label>
                    <Input
                      id="legalName"
                      value={legalInfo.legalName}
                      onChange={(e) => setLegalInfo({...legalInfo, legalName: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="registrationNumber">Business Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={legalInfo.registrationNumber}
                      onChange={(e) => setLegalInfo({...legalInfo, registrationNumber: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="taxId">Tax ID / EIN</Label>
                    <Input
                      id="taxId"
                      value={legalInfo.taxId}
                      onChange={(e) => setLegalInfo({...legalInfo, taxId: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="businessLicense">Business License Number</Label>
                    <Input
                      id="businessLicense"
                      value={legalInfo.businessLicense}
                      onChange={(e) => setLegalInfo({...legalInfo, businessLicense: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="jurisdiction">Jurisdiction of Incorporation</Label>
                    <Input
                      id="jurisdiction"
                      value={legalInfo.jurisdiction}
                      onChange={(e) => setLegalInfo({...legalInfo, jurisdiction: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="incorporationDate">Date of Incorporation</Label>
                    <Input
                      id="incorporationDate"
                      type="date"
                      value={legalInfo.incorporationDate}
                      onChange={(e) => setLegalInfo({...legalInfo, incorporationDate: e.target.value})}
                    />
                  </div>

                  <div>
                    <Label htmlFor="registeredAddress">Registered Address</Label>
                    <Textarea
                      id="registeredAddress"
                      value={legalInfo.registeredAddress}
                      onChange={(e) => setLegalInfo({...legalInfo, registeredAddress: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <Alert className="border-blue-200 bg-blue-50">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Privacy Notice:</strong> Legal information is securely stored and only visible to authorized administrators. 
                    This data is used for compliance purposes and is never shared publicly.
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </TabsContent>
            </>
          )}
        </Tabs>
        )}
      </div>
    </div>
  );
}
