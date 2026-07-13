import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import {
  ArrowLeft,
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Target,
  Phone,
  ExternalLink,
  Heart,
  Share2,
  Bookmark,
  Briefcase,
  Image as ImageIcon,
  CheckCircle2,
  Sparkles,
  Edit3,
  Loader2
} from 'lucide-react';
import { companyService, type Company } from '@/api/companies';
import { jobPostsApi, type JobPost } from '@/api/jobPosts';
import { buildProfileImageUrl } from '@/api/recruiterProfile';
import {
  AiFillLinkedin,
  AiFillTwitterCircle,
  AiFillFacebook,
  AiFillInstagram,
  AiFillGithub,
  AiFillYoutube,
} from 'react-icons/ai';

interface CompanyProfileProps {
  institution: any;
  user: any;
  onBack: () => void;
  onNavigate?: (view: string) => void;
  onJobApplication?: (job: any, method: string) => void;
  onNavigateToJobDetails?: (job: any) => void;
}

function useCompanyData(institution: any) {
  const [companyData, setCompanyData] = useState<Company | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);

  useEffect(() => {
    const fetchCompany = async () => {
      if (!institution?.id || institution.id === 'inst-1') return;
      setIsLoadingCompany(true);
      try {
        const data = await companyService.getCompany(institution.id);
        setCompanyData(data);
      } catch (error) {
        console.error('Failed to fetch company:', error);
      } finally {
        setIsLoadingCompany(false);
      }
    };
    fetchCompany();
  }, [institution?.id]);

  return { companyData, isLoadingCompany };
}

function buildCompanyInfo(companyData: Company | null, institution: any) {
  const d = companyData;
  return {
    name: d?.name || '',
    description: d?.description || '',
    website: d?.website || '',
    industry: d?.industry_display || d?.industry || '',
    size: d?.company_size || '',
    founded: d?.founded_year ? String(d.founded_year) : '',
    headquarters: d?.city
      ? `${d.city}${d.state ? ', ' + d.state : ''}${d.country && d.country !== d.city ? ', ' + d.country : ''}`
      : '',
    type: d?.company_type || '',
    mission: d?.mission || '',
    vision: d?.vision || '',
    values: d?.values || [],
    locations: d?.office_locations || [],
    socialLinks: {
      linkedIn: d?.social_links?.linkedin || '',
      twitter: d?.social_links?.twitter || '',
      facebook: d?.social_links?.facebook || '',
      instagram: d?.social_links?.instagram || '',
      github: d?.social_links?.github || '',
      youtube: '',
    },
    phone: d?.phone || '',
    logo: buildProfileImageUrl(d?.logo) || buildProfileImageUrl(d?.banner) || institution?.logo,
  };
}

export function CompanyProfile({ institution, user, onBack, onNavigate, onJobApplication: _onJobApplication, onNavigateToJobDetails: _onNavigateToJobDetails }: Readonly<CompanyProfileProps>) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [companyJobs, setCompanyJobs] = useState<JobPost[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const { companyData, isLoadingCompany } = useCompanyData(institution);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!institution?.id || institution.id === 'inst-1') return;
      setIsLoadingJobs(true);
      try {
        const jobs = await jobPostsApi.getCompanyJobs(institution.id);
        // Filter to only published jobs
        const published = jobs.filter((j) => j.status === 'published');
        setCompanyJobs(published);
      } catch (error) {
        console.error('Failed to fetch company jobs:', error);
      } finally {
        setIsLoadingJobs(false);
      }
    };
    fetchJobs();
  }, [institution?.id]);

  const isRecruiter = user?.role === 'recruiter';
  const companyInfo = buildCompanyInfo(companyData, institution);


  const stats = [
    {
      label: 'Company Size',
      value: companyInfo.size || 'Not specified',
      icon: Users,
      color: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Open Positions',
      value: companyData?.open_positions_count === undefined ? '0' : String(companyData.open_positions_count),
      icon: Briefcase,
      color: 'text-green-600 bg-green-50'
    },
    {
      label: 'Office Locations',
      value: companyInfo.locations.length.toString(),
      icon: MapPin,
      color: 'text-purple-600 bg-purple-50'
    },
    {
      label: 'Founded',
      value: companyInfo.founded || 'Not specified',
      icon: Calendar,
      color: 'text-orange-600 bg-orange-50'
    }
  ];

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: companyInfo.name,
        text: companyInfo.description || '',
        url: globalThis.location.href
      });
    }
  };

  return (
    <CompanyProfileLayout
      onBack={onBack}
      onNavigate={onNavigate}
      companyInfo={companyInfo}
      isLoadingCompany={isLoadingCompany}
      isRecruiter={isRecruiter}
      isFollowing={isFollowing}
      isSaved={isSaved}
      onFollow={handleFollow}
      onSave={handleSave}
      onShare={handleShare}
      onEdit={() => onNavigate?.('/company/edit')}
      stats={stats}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      companyJobs={companyJobs}
      isLoadingJobs={isLoadingJobs}
    />
  );
}

interface SocialLinkItem {
  key: string;
  url: string;
  label: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

function buildSocialLinks(socialLinks: { linkedIn: string; twitter: string; facebook: string; instagram: string; github: string; youtube: string }): SocialLinkItem[] {
  const links: SocialLinkItem[] = [];
  if (socialLinks.linkedIn) links.push({ key: 'linkedin', url: socialLinks.linkedIn, label: 'LinkedIn', color: 'text-[#0A66C2]', icon: AiFillLinkedin });
  if (socialLinks.twitter) links.push({ key: 'twitter', url: socialLinks.twitter, label: 'Twitter', color: 'text-[#1DA1F2]', icon: AiFillTwitterCircle });
  if (socialLinks.facebook) links.push({ key: 'facebook', url: socialLinks.facebook, label: 'Facebook', color: 'text-[#1877F2]', icon: AiFillFacebook });
  if (socialLinks.instagram) links.push({ key: 'instagram', url: socialLinks.instagram, label: 'Instagram', color: 'text-[#E1306C]', icon: AiFillInstagram });
  if (socialLinks.github) links.push({ key: 'github', url: socialLinks.github, label: 'GitHub', color: 'text-[#181717]', icon: AiFillGithub });
  if (socialLinks.youtube) links.push({ key: 'youtube', url: socialLinks.youtube, label: 'YouTube', color: 'text-red-600', icon: AiFillYoutube });
  return links;
}

function SocialLinksSection({ links }: Readonly<{ links: SocialLinkItem[] }>) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((link) => (
        <Button key={link.key} variant="outline" size="sm" asChild>
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <link.icon className={`w-4 h-4 mr-2 ${link.color}`} />
            {link.label}
          </a>
        </Button>
      ))}
    </div>
  );
}

interface CompanyProfileLayoutProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
  companyInfo: ReturnType<typeof buildCompanyInfo>;
  isLoadingCompany: boolean;
  isRecruiter: boolean;
  isFollowing: boolean;
  isSaved: boolean;
  onFollow: () => void;
  onSave: () => void;
  onShare: () => void;
  onEdit: () => void;
  stats: Array<{ label: string; value: string; icon: any; color: string }>;
  activeTab: string;
  onTabChange: (tab: string) => void;
  companyJobs: JobPost[];
  isLoadingJobs: boolean;
}

function CompanyProfileLayout({
  onBack,
  onNavigate,
  companyInfo,
  isLoadingCompany,
  isRecruiter,
  isFollowing,
  isSaved,
  onFollow,
  onSave,
  onShare,
  onEdit,
  stats,
  activeTab,
  onTabChange,
  companyJobs,
  isLoadingJobs,
}: Readonly<CompanyProfileLayoutProps>) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Minimal Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={onBack} 
              className="rounded-full w-10 h-10 p-0 hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <button 
              onClick={() => onNavigate?.('homepage')}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-xl">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </span>
            </button>

            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Company Header Card */}
        <Card className="p-8 mb-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Company Logo */}
            {companyInfo.logo ? (
              <img
                src={companyInfo.logo}
                alt={companyInfo.name}
                className="w-32 h-32 rounded-2xl object-cover shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0">
                <Building2 className="w-16 h-16" />
              </div>
            )}

            {/* Company Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-3">
                <div>
                  <h1 className="text-3xl text-gray-900 mb-2">{companyInfo.name}</h1>
                  {companyInfo.description && (
                    <p className="text-lg text-gray-600">{companyInfo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {isLoadingCompany && (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  )}
                  {isRecruiter && (
                    <Button
                      variant="outline"
                      onClick={onEdit}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  <Button
                    variant={isFollowing ? "default" : "outline"}
                    onClick={onFollow}
                    className={isFollowing ? "bg-[#ff6b35] hover:bg-[#e55a2b] text-white" : "border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onSave}
                    className={isSaved ? "border-[#ff6b35] text-[#ff6b35]" : ""}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onShare}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <Badge className="bg-[#ff6b35] text-white">{companyInfo.type}</Badge>
                <div className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  <span>{companyInfo.industry}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{companyInfo.headquarters}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Founded {companyInfo.founded}</span>
                </div>
                <a 
                  href={companyInfo.website} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1 text-[#ff6b35] hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  Website
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Card key={stat.label} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color} mb-3`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <p className="text-2xl text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="culture" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Culture & Values
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Contact
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Open Jobs
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {/* About Section */}
            <Card className="p-6">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#ff6b35]" />
                About {companyInfo.name}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                {companyInfo.description}
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#ff6b35]" />
                    Our Mission
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {companyInfo.mission}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#ff6b35]" />
                    Our Vision
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {companyInfo.vision}
                  </p>
                </div>
              </div>
            </Card>

            {/* Photo Gallery */}
            {companyInfo.logo && (
              <Card className="p-6">
                <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#ff6b35]" />
                  Gallery
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                    <img
                      src={companyInfo.logo}
                      alt={`${companyInfo.name} logo`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          {/* CULTURE & VALUES TAB */}
          <TabsContent value="culture" className="space-y-6">
            {/* Core Values */}
            <Card className="p-6">
              <h2 className="text-xl text-gray-900 mb-4 flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#ff6b35]" />
                Our Core Values
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyInfo.values.map((value: string) => (
                  <div key={value} className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-[#ff6b35] flex-shrink-0" />
                    <span className="font-medium text-gray-900">{value}</span>
                  </div>
                ))}
              </div>
            </Card>

          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contact" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {companyInfo.locations.map((location: any) => (
                <Card key={location.name} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg text-gray-900 mb-1">{location.name}</h3>
                      <Badge variant={location.type === 'Headquarters' ? 'default' : 'secondary'} 
                             className={location.type === 'Headquarters' ? 'bg-[#ff6b35]' : ''}>
                        {location.type}
                      </Badge>
                    </div>
                    <MapPin className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                      <span>{location.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{location.employees} employees</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Contact Information */}
            {companyInfo.phone && (
              <Card className="p-6">
                <h2 className="text-xl text-gray-900 mb-4">Contact Information</h2>
                <div className="space-y-3">
                  {companyInfo.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-[#ff6b35]" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <a href={`tel:${companyInfo.phone}`} className="text-[#ff6b35] hover:underline">
                          {companyInfo.phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <Separator className="my-6" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Follow Us</h3>
                  <SocialLinksSection links={buildSocialLinks(companyInfo.socialLinks)} />
                </div>
              </Card>
            )}
          </TabsContent>

          {/* OPEN JOBS TAB */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-2xl text-gray-900">Open Positions at {companyInfo.name}</h2>
                  <p className="text-gray-600 mt-1">
                    {isLoadingJobs
                      ? 'Loading...'
                      : `${companyJobs.length} job${companyJobs.length === 1 ? '' : 's'} available`}
                  </p>
                </div>
              </div>

              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
                </div>
              ) : companyJobs.length === 0 ? (
                <div className="p-12 text-center">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg text-gray-900 mb-2">No Open Positions</h3>
                  <p className="text-gray-600 max-w-[95vw] sm:max-w-md mx-auto">
                    There are currently no open positions at this company.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {companyJobs.map((job) => (
                    <Card
                      key={job.id}
                      className="p-5 hover:shadow-lg transition-shadow cursor-pointer border border-gray-100"
                      onClick={() => onNavigate?.(`jobs/${job.id}`)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg mb-1">{job.title}</h3>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                            {job.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {job.location}
                              </span>
                            )}
                            {job.employment_type && (
                              <Badge variant="secondary" className="text-xs">
                                {job.employment_type}
                              </Badge>
                            )}
                            {job.work_arrangement && (
                              <Badge variant="outline" className="text-xs">
                                {job.work_arrangement}
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {job.summary || job.description}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          {job.salary_min && job.salary_max ? (
                            <p className="text-sm font-medium text-[#ff6b35]">
                              ${Math.round(job.salary_min)}k - ${Math.round(job.salary_max)}k
                            </p>
                          ) : (
                            <p className="text-sm text-gray-400">Salary not specified</p>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-2 text-[#ff6b35] hover:text-[#e55a2b] hover:bg-orange-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              onNavigate?.(`jobs/${job.id}`);
                            }}
                          >
                            View Job
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
