import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { X, Upload, Save, AlertCircle, CheckCircle, User, Mail, Phone, MapPin, FileText, Camera, Building, GraduationCap, Plus, Trash2, Eye, Edit3, Award, Briefcase } from 'lucide-react';
import { candidateProfileService, type EducationItem } from '@/api/candidateProfile';
import { parseResume, mapParsedDataToFormFields } from '@/api/resumeParser';

interface EditProfileProps {
  onClose: () => void;
  onSave: (profileData: any) => void;
  initialData?: any;
}

interface Education {
  id?: string;
  degree: string;
  school: string;
  year?: string;
  gpa?: string;
  field?: string;
  location?: string;
  start_year?: string;
  end_year?: string;
  current?: boolean;
}

export function EditProfile({ onClose, onSave, initialData }: Readonly<EditProfileProps>) {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'resume' | 'preferences'>('personal');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [rawProfile, setRawProfile] = useState<any>(null);

  // Form state - initialized empty, populated from backend
  const [formData, setFormData] = useState({
    // Personal Information (from User model via profile)
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    
    // Professional Information (from CandidateProfile)
    currentTitle: '',
    industry: '',
    experience: '',
    
    // Preferences (from preferences JSON field)
    expectedSalary: '',
    workType: 'hybrid',
    
    // Profile Image
    profileImage: undefined as string | undefined,
    
    // Skills (array converted from backend comma-separated string)
    skills: [] as string[],
    
    // Education (from education JSON field)
    education: [] as EducationItem[],
    
    // Work History/Experience (from work_history JSON field)
    workHistory: [] as any[],
    
    // Optional social links and professional info (now stored in backend)
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
    currentCompany: '',
    
    // Optional JSON fields (now stored in backend)
    projects: [] as any[],
    certifications: [] as any[]
  });

  // Log when profile data is loaded (uses rawProfile)
  useEffect(() => {
    if (rawProfile) {
      console.log('EditProfile loaded:', rawProfile.id);
    }
  }, [rawProfile]);

  // Fetch profile data from backend
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await candidateProfileService.getProfile();
        if (response) {
          setRawProfile(response);
          // Convert new format to legacy format, then transform for frontend
          const legacyProfile = candidateProfileService.transformResponseToLegacyFormat(response);
          const transformed = legacyProfile 
            ? candidateProfileService.transformProfileForFrontend(legacyProfile)
            : {};
          
          setFormData({
            firstName: (transformed.firstName as string) || initialData?.firstName || '',
            lastName: (transformed.lastName as string) || initialData?.lastName || '',
            email: (transformed.email as string) || initialData?.email || '',
            phone: (transformed.phone as string) || '',
            location: (transformed.location as string) || '',
            bio: (transformed.bio as string) || '',
            currentTitle: (transformed.jobTitle as string) || '',
            industry: (transformed.industry as string) || '',
            experience: (transformed.experience as string) || '',
            expectedSalary: ((transformed.preferred_salary_ranges as string[])?.[0]) || '',
            workType: ((transformed.preferred_work_arrangements as string[])?.[0]) || 'hybrid',
            profileImage: (transformed.profileImage as string) || undefined,
            skills: (transformed.skills as string[]) || [],
            education: (transformed.education as EducationItem[]) || [],
            workHistory: (transformed.experiences as any[]) || (transformed.detailedExperience as any[]) || [],
            // Optional social links and professional info
            linkedin: (transformed.linkedin as string) || '',
            github: (transformed.github as string) || '',
            portfolio: (transformed.portfolio as string) || '',
            website: (transformed.website as string) || '',
            currentCompany: (transformed.currentCompany as string) || '',
            // Optional JSON fields
            projects: (transformed.projects as any[]) || [],
            certifications: (transformed.certifications as any[]) || []
          });
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [initialData]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.currentTitle.trim()) newErrors.currentTitle = 'Current title is required';
    // NOTE: currentCompany validation removed - not stored in backend
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
    
    // In a real app, you'd upload to your backend here
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange('profileImage', e.target?.result);
      };
      reader.readAsDataURL(file);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.location,
          bio: formData.bio,
          job_title: formData.currentTitle,
          industry: formData.industry,
          skills: formData.skills.join(', '),
          education: formData.education.map(edu => ({
            id: edu.id,
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            start_year: edu.start_year,
            end_year: edu.end_year,
            current: edu.current,
            gpa: edu.gpa,
          })),
          work_history: formData.workHistory.map(work => ({
            id: work.id,
            company: work.company,
            title: work.role,
            location: work.location,
            start_date: work.start_date,
            end_date: work.end_date,
            current: work.current,
            description: work.responsibilities,
          })),
          linkedin: formData.linkedin,
          github: formData.github,
          portfolio: formData.portfolio,
          website: formData.website,
          current_company: formData.currentCompany,
          projects: formData.projects,
          certifications: formData.certifications,
        });
        onSave(formData);
        onClose();
      } catch (error) {
        console.error('Failed to save profile:', error);
        setErrors({ submit: 'Failed to save profile. Please try again.' });
      }
    }
  };

  const addSkill = (skillInput: string) => {
    const trimmedInput = skillInput.trim();
    if (!trimmedInput) return;
    
    // Split by comma if multiple skills, otherwise single skill
    const skillNames = trimmedInput.includes(',')
      ? trimmedInput.split(',').map(s => s.trim()).filter(s => s.length > 0)
      : [trimmedInput];
    
    // Filter out duplicates and add new skills
    const existingSkills = new Set(formData.skills.map(s => s.toLowerCase()));
    const newSkills = skillNames.filter(name => !existingSkills.has(name.toLowerCase()));
    
    if (newSkills.length > 0) {
      handleInputChange('skills', [...formData.skills, ...newSkills]);
    }
  };

  const removeSkill = (skillToRemove: string) => {
    handleInputChange('skills', formData.skills.filter((skill: string) => skill !== skillToRemove));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: '',
      school: '',
      year: '',
      start_year: '',
      end_year: '',
      gpa: '',
      field: '',
      current: false
    };
    handleInputChange('education', [...formData.education, newEducation]);
  };

  const updateEducation = (id: string, field: string, value: string | boolean) => {
    const updatedEducation = formData.education.map((edu: EducationItem) => 
      edu.id === id ? { ...edu, [field]: value } : edu
    );
    handleInputChange('education', updatedEducation);
  };

  const removeEducation = (id: string) => {
    handleInputChange('education', formData.education.filter((edu: EducationItem) => edu.id !== id));
  };

  // Work History management functions
  const addWorkHistory = () => {
    const newWork = {
      id: Date.now().toString(),
      company: '',
      role: '',
      position: '',
      location: '',
      start_date: '',
      end_date: '',
      current: false,
      responsibilities: '',
      description: ''
    };
    handleInputChange('workHistory', [...formData.workHistory, newWork]);
  };

  const updateWorkHistory = (id: string, field: string, value: any) => {
    const updatedWorkHistory = formData.workHistory.map((work: any) => 
      work.id === id ? { ...work, [field]: value } : work
    );
    handleInputChange('workHistory', updatedWorkHistory);
  };

  const removeWorkHistory = (id: string) => {
    handleInputChange('workHistory', formData.workHistory.filter((work: any) => work.id !== id));
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Building },
    { id: 'resume', label: 'Resume & Skills', icon: FileText },
    { id: 'preferences', label: 'Preferences', icon: Award }
  ];

  // Show loading spinner while fetching profile
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="p-8 bg-white shadow-2xl">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
            <span className="ml-3 text-gray-600">Loading profile...</span>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-hidden bg-white shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-medium text-gray-900">Edit Profile</h2>
              <p className="text-gray-600 mt-1">Update your professional information and preferences</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="rounded-full w-10 h-10 p-0 self-start sm:self-auto"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50/50 max-h-[30vh] md:max-h-none overflow-y-auto md:overflow-visible">
            <div className="p-4 space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white shadow-lg'
                        : 'text-gray-600 hover:bg-white hover:text-[#ff6b35] hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto max-h-[50vh] md:max-h-[70vh]">
            <div className="p-6">
              {/* Personal Information Tab */}
              {activeTab === 'personal' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
                    
                    {/* Profile Picture */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                      <div className="relative">
                        <Avatar className="w-24 h-24">
                          <AvatarImage src={formData.profileImage} />
                          <AvatarFallback className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white text-xl">
                            {formData.firstName[0]}{formData.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <Button
                          size="sm"
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-white border-2 border-white shadow-lg hover:bg-gray-50"
                          onClick={() => document.getElementById('photo-upload')?.click()}
                        >
                          <Camera className="w-4 h-4 text-gray-600" />
                        </Button>
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                          }}
                        />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Profile Photo</h4>
                        <p className="text-sm text-gray-600 mb-3">Upload a professional headshot. JPG, PNG up to 5MB.</p>
                        {isUploading && (
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="w-32" />
                            <p className="text-xs text-gray-500">Uploading... {uploadProgress}%</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.firstName}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.lastName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`pl-10 ${errors.email ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location *</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className={`pl-10 ${errors.location ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.location && (
                        <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" />
                          {errors.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      placeholder="Write a brief professional summary..."
                      className="mt-1"
                    />
                    <p className="text-sm text-gray-500 mt-1">{formData.bio.length}/500 characters</p>
                  </div>

                  {/* Social Links */}
                  <div className="pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Social Links & Professional Info (Optional)</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentCompany">Current Company</Label>
                        <Input
                          id="currentCompany"
                          value={formData.currentCompany}
                          onChange={(e) => handleInputChange('currentCompany', e.target.value)}
                          placeholder="e.g. Google, Microsoft"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile</Label>
                        <Input
                          id="linkedin"
                          type="url"
                          value={formData.linkedin}
                          onChange={(e) => handleInputChange('linkedin', e.target.value)}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="github">GitHub Profile</Label>
                        <Input
                          id="github"
                          type="url"
                          value={formData.github}
                          onChange={(e) => handleInputChange('github', e.target.value)}
                          placeholder="https://github.com/yourusername"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="portfolio">Portfolio Website</Label>
                        <Input
                          id="portfolio"
                          type="url"
                          value={formData.portfolio}
                          onChange={(e) => handleInputChange('portfolio', e.target.value)}
                          placeholder="https://yourportfolio.com"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label htmlFor="website">Personal Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => handleInputChange('website', e.target.value)}
                          placeholder="https://yourwebsite.com"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Information Tab */}
              {activeTab === 'professional' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="currentTitle">Current Job Title *</Label>
                        <Input
                          id="currentTitle"
                          value={formData.currentTitle}
                          onChange={(e) => handleInputChange('currentTitle', e.target.value)}
                          className={errors.currentTitle ? 'border-red-500' : ''}
                        />
                        {errors.currentTitle && (
                          <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            {errors.currentTitle}
                          </p>
                        )}
                      </div>

                      {/* NOTE: Current Company removed - not stored in backend */}
                      <div>
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input
                          id="experience"
                          value={formData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expectedSalary">Expected Salary Range</Label>
                        <Input
                          id="expectedSalary"
                          value={formData.expectedSalary}
                          onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                          placeholder="$80,000 - $100,000"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* NOTE: Availability removed - not stored in backend */}
                        <div>
                          <Label htmlFor="workType">Preferred Work Type</Label>
                          <select
                            id="workType"
                            value={formData.workType}
                            onChange={(e) => handleInputChange('workType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent"
                          >
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                            <option value="onsite">On-site</option>
                            <option value="flexible">Flexible</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Experience */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4 className="font-medium text-gray-900">Work Experience</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addWorkHistory}
                        className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Experience
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.workHistory.map((work: any) => (
                        <div key={work.id} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <Briefcase className="w-5 h-5 text-[#ff6b35]" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeWorkHistory(work.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Job Title/Role"
                              value={work.role || work.position || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'role', e.target.value)}
                            />
                            <Input
                              placeholder="Company"
                              value={work.company || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'company', e.target.value)}
                            />
                            <Input
                              placeholder="Location"
                              value={work.location || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'location', e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`current-${work.id}`}
                                checked={work.current || false}
                                onChange={(e) => updateWorkHistory(work.id, 'current', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                              />
                              <label htmlFor={`current-${work.id}`} className="text-sm text-gray-700">Current Position</label>
                            </div>
                            <Input
                              type="month"
                              placeholder="Start Date"
                              value={work.start_date || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'start_date', e.target.value)}
                            />
                            <Input
                              type="month"
                              placeholder="End Date"
                              value={work.end_date || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'end_date', e.target.value)}
                              disabled={work.current}
                            />
                            <textarea
                              placeholder="Responsibilities/Description"
                              value={work.responsibilities || work.description || ''}
                              onChange={(e) => updateWorkHistory(work.id, 'responsibilities', e.target.value)}
                              className="md:col-span-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent min-h-[80px] resize-none"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                      <h4 className="font-medium text-gray-900">Education</h4>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={addEducation}
                        className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Education
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.education.map((edu: Education) => (
                        <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                            <GraduationCap className="w-5 h-5 text-[#ff6b35]" />
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeEducation(edu.id as string)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Input
                              placeholder="Degree/Program"
                              value={edu.degree}
                              onChange={(e) => updateEducation(edu.id as string, 'degree', e.target.value)}
                            />
                            <Input
                              placeholder="School/Institution"
                              value={edu.school}
                              onChange={(e) => updateEducation(edu.id as string, 'school', e.target.value)}
                            />
                            <div className="flex items-center gap-2 col-span-2">
                              <input
                                type="checkbox"
                                id={`current-edu-${edu.id}`}
                                checked={edu.current || false}
                                onChange={(e) => updateEducation(edu.id as string, 'current', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                              />
                              <label htmlFor={`current-edu-${edu.id}`} className="text-sm text-gray-700">Currently Studying</label>
                            </div>
                            <Input
                              type="month"
                              placeholder="Start Date"
                              value={edu.start_year || ''}
                              onChange={(e) => updateEducation(edu.id as string, 'start_year', e.target.value)}
                            />
                            <Input
                              type="month"
                              placeholder="End Date (or Graduation)"
                              value={edu.end_year || edu.year || ''}
                              onChange={(e) => updateEducation(edu.id as string, 'end_year', e.target.value)}
                              disabled={edu.current}
                            />
                            <Input
                              placeholder="GPA (optional)"
                              value={edu.gpa}
                              onChange={(e) => updateEducation(edu.id as string, 'gpa', e.target.value)}
                            />
                            <Input
                              placeholder="Field of Study"
                              value={edu.field || ''}
                              onChange={(e) => updateEducation(edu.id as string, 'field', e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resume & Skills Tab */}
              {activeTab === 'resume' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resume & Skills</h3>
                    
                    {/* Resume Management */}
                    <div className="p-6 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200 mb-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Resume Management</h4>
                          <p className="text-sm text-gray-600">Create and manage your resume with our comprehensive editor</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mb-4">
                        <Button
                          className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
                          onClick={() => console.log('Resume editor not available')}
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Resume
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
                          onClick={() => document.getElementById('resume-upload')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Resume
                        </Button>
                        <input
                          id="resume-upload"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setIsUploading(true);
                              setUploadProgress(25);
                              try {
                                // Parse resume using AI
                                const result = await parseResume(file);
                                setUploadProgress(75);

                                // Map parsed data to form fields
                                const mappedData = mapParsedDataToFormFields(result.parsed_data);

                                // Update form with extracted data
                                setFormData(prev => ({
                                  ...prev,
                                  firstName: mappedData.firstName || prev.firstName,
                                  lastName: mappedData.lastName || prev.lastName,
                                  email: mappedData.email || prev.email,
                                  phone: mappedData.phone || prev.phone,
                                  bio: mappedData.bio || prev.bio,
                                  // Convert comma-separated skills to array, merge with existing
                                  skills: mappedData.skills
                                    ? [...new Set([...prev.skills, ...mappedData.skills.split(',').map(s => s.trim()).filter(Boolean)])]
                                    : prev.skills,
                                  // Map experience level codes to years range
                                  experience: mappedData.experience
                                    ? {
                                        'L1': '0-2 years',
                                        'L2': '2-4 years',
                                        'L3': '4-7 years',
                                        'L4': '7-10 years',
                                        'L5': '10+ years'
                                      }[mappedData.experience] || mappedData.experience
                                    : prev.experience,
                                }));

                                setUploadProgress(100);
                                console.log('Resume parsed successfully:', result);
                              } catch (error) {
                                console.error('Failed to parse resume:', error);
                                setErrors(prev => ({
                                  ...prev,
                                  resume: 'Failed to parse resume. Please try again or enter details manually.'
                                }));
                              } finally {
                                setIsUploading(false);
                                setTimeout(() => setUploadProgress(0), 2000);
                              }
                            }
                          }}
                        />
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                      
                      <div className="p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center gap-3">
                          <FileText className="w-8 h-8 text-[#ff6b35]" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">Mike Perry - Resume.pdf</p>
                            <p className="text-sm text-gray-500">Last updated: November 15, 2024 • 2 pages</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Complete
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-700">
                          <strong>💡 Pro Tip:</strong> Use our resume editor to manually add experience, education, certifications, publications, projects, volunteer work, and skills with detailed formatting options.
                        </p>
                      </div>
                    </div>

                    {/* Skills */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Skills</h4>
                      
                      <div className="mb-4">
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Input
                            placeholder="Add skills (single or comma-separated: Python, SQL, React)"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addSkill(e.currentTarget.value);
                                e.currentTarget.value = '';
                              }
                            }}
                          />
                          <Button
                            variant="outline"
                            onClick={() => {
                              const input = document.querySelector('input[placeholder*="Add a skill"]') as HTMLInputElement;
                              if (input?.value) {
                                addSkill(input.value);
                                input.value = '';
                              }
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Press Enter or click + to add skills</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {formData.skills.map((skill: string) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="px-3 py-1 bg-orange-100 text-orange-800 hover:bg-orange-200 cursor-pointer group"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(skill)}
                              className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Job Preferences</h3>
                    
                    <div className="space-y-6">
                      {/* Job Alerts */}
                      <div className="p-4 bg-gradient-to-r from-green-50 to-green-100/50 rounded-xl border border-green-200">
                        <h4 className="font-medium text-gray-900 mb-3">Job Alerts & Notifications</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Email me about new jobs matching my queues</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Notify me when my queue ranking changes</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700">Send weekly job market insights</span>
                          </label>
                        </div>
                      </div>

                      {/* Privacy Settings */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                        <h4 className="font-medium text-gray-900 mb-3">Privacy & Visibility</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Make my profile visible to recruiters</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" className="rounded" />
                            <span className="text-sm text-gray-700">Allow companies to see my queue rankings</span>
                          </label>
                          <label className="flex items-center gap-3">
                            <input type="checkbox" defaultChecked className="rounded" />
                            <span className="text-sm text-gray-700">Include me in theGarage leaderboards</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>All changes are saved automatically</span>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </Card>

    </div>
  );
}