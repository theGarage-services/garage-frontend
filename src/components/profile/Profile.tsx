import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { 
  MapPin, Briefcase, Calendar, Edit3, Share2, Mail, 
  Plus, GraduationCap, Code, FileText, Eye, TrendingUp, 
  Users, ExternalLink, Clock, Activity, 
  Trash2, Save, Search, Award, Globe, FileUp, FileDown, FileCheck, X} from 'lucide-react';
import { AppHeader } from '../layout/AppHeader';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { CareerPathStory } from './ProfileView/CareerPathStory';
import { candidateProfileService } from '@/api/candidateProfile';
import { educationDocumentService } from '@/api/educationDocuments';
import { experienceDocumentService } from '@/api/experienceDocuments';
import { AiOutlineLinkedin, AiFillGithub } from 'react-icons/ai';
import img654553Fedbede7976B97Eaf5Professional5ReminiEnhanced from "figma:asset/5d47026abe4e77aa0174b98e6e5497be2b9b5962.png";
import { ProfileImageUpload } from './ProfileImageUpload';
import { PersonalityTab } from './ProfileView/PersonalityTab';
import { PersonalitySummary } from './ProfileView/PersonalitySummary';
import { safeOpenWindow } from '@/utils/safe-url';

interface ProfileProps {
  onNavigate: (view: string) => void;
  onBack?: () => void;
  user?: any;
  onLogout?: () => void;
}

interface QuickStat {
  label: string;
  count: string | number;
  trend: string;
  icon: typeof FileText;
  color: string;
}

// Helper functions to map backend data to frontend state
const mapWorkHistoryToExperiences = (workHistory: any[]): Experience[] => {
  return workHistory.map((job, index) => ({
    id: job.id || `exp-${index}`,
    experienceIndex: index,
    company: job.company || '',
    position: job.role || job.title || job.position || '',
    location: job.location || '',
    startDate: job.start_date || '',
    endDate: job.end_date || '',
    current: !job.end_date || job.end_date.toLowerCase() === 'present',
    description: job.responsibilities || job.description || '',
    logo: '🏢'
  }));
};

const mapEducationToFrontend = (education: any[]): Education[] => {
  return education.map((edu, index) => ({
    id: edu.id || `edu-${index}`,
    educationIndex: index,
    school: edu.institution || edu.school || '',
    degree: edu.degree || '',
    field: edu.field || edu.field_of_study || '',
    location: edu.location || '',
    startDate: edu.start_date || edu.start_year || '',
    endDate: edu.end_date || edu.end_year || '',
    current: !edu.end_date && !edu.end_year,
    gpa: edu.gpa || '',
    activities: edu.activities || ''
  }));
};

const mapSkillsToFrontend = (skillsString: string): Skill[] => {
  const skillsArray = skillsString.split(',').map(s => s.trim()).filter(s => s.length > 0);
  return skillsArray.map((skill, index) => ({
    id: `skill-${index}`,
    name: skill,
    category: 'Skills',
    proficiency: 50
  }));
};

const mapCertificationsToFrontend = (certifications: any[]): Certification[] => {
  return certifications.map((cert, index) => ({
    id: cert.id || `cert-${index}`,
    name: cert.name || '',
    issuer: cert.issuer || '',
    issueDate: cert.issue_date || cert.issueDate || '',
    expiryDate: cert.expiry_date || cert.expiryDate || '',
    credentialId: cert.credential_id || cert.credentialId || '',
    credentialUrl: cert.credential_url || cert.credentialUrl || ''
  }));
};

const mapProjectsToFrontend = (projects: any[]): Project[] => {
  return projects.map((proj, index) => ({
    id: proj.id || `proj-${index}`,
    name: proj.name || '',
    description: proj.description || '',
    url: proj.url || '',
    tags: proj.tags || []
  }));
};

interface Experience {
  id: string;
  experienceIndex: number;
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  logo?: string;
}

interface ExperienceDocument {
  id: number;
  work_history_index: number;
  document_type: 'employment_letter';
  file_url: string;
  uploaded_at: string;
}

interface Education {
  id: string;
  educationIndex: number;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  activities?: string;
}

interface EducationDocument {
  id: number;
  education_index: number;
  document_type: 'transcript' | 'degree_certificate';
  file_url: string;
  uploaded_at: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  url?: string;
  tags: string[];
}

export function Profile({ onNavigate, user, onLogout }: Readonly<ProfileProps>) {
  const [activeTab, setActiveTab] = useState('overview');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rawProfile, setRawProfile] = useState<any>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  
  // Profile Data - populated from backend
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    title: '',
    company: '',
    industry: '',
    bio: '',
    joinedDate: '',
    // Social links - now stored in backend
    linkedin: '',
    github: '',
    portfolio: '',
    website: '',
    // Optional JSON fields - now stored in backend
    projects: [] as any[],
    certifications: [] as any[],
    // Backend-computed profile strength (0-100)
    profileStrength: 0
  });

  const [tempProfileData, setTempProfileData] = useState(profileData);

  // Log when profile data is loaded (uses rawProfile)
  useEffect(() => {
    if (rawProfile) {
      console.log('Profile loaded:', rawProfile.id);
    }
  }, [rawProfile]);

  // Fetch profile data from backend using new structured format
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const response = await candidateProfileService.getProfile();
        if (!response?.success || !response.candidate_profile_data) return;
        
        setRawProfile(response);
        const { user_data: userData, candidate_profile_data: candidateData } = response;
        
        // Map new structured format to profileData state
        setProfileData({
          firstName: userData.first_name || user?.firstName || '',
          lastName: userData.last_name || user?.lastName || '',
          email: userData.email || user?.email || '',
          phone: candidateData.phone || '',
          location: candidateData.address || '',
          title: candidateData.job_title || '',
          company: candidateData.current_company || '',
          industry: response.industry || candidateData.industry || '',
          bio: candidateData.bio || '',
          joinedDate: '',
          linkedin: candidateData.linkedin || '',
          github: candidateData.github || '',
          portfolio: candidateData.portfolio || '',
          website: '',
          projects: candidateData.projects || [],
          certifications: candidateData.certifications || [],
          profileStrength: candidateData.profile_strength ?? 0
        });
        
        // Set profile image from backend - prepend API base URL if relative path
        const rawImageUrl = candidateData.profile_image;
        if (rawImageUrl) {
          const fullImageUrl = rawImageUrl.startsWith('http')
            ? rawImageUrl
            : `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}${rawImageUrl}`;
          setProfileImage(fullImageUrl);
        } else {
          setProfileImage(undefined);
        }
        
        // Map arrays using helper functions
        if (candidateData.work_history?.length) setExperiences(mapWorkHistoryToExperiences(candidateData.work_history));
        if (candidateData.education?.length) setEducation(mapEducationToFrontend(candidateData.education));
        if (candidateData.skills) setSkills(mapSkillsToFrontend(candidateData.skills));
        if (candidateData.certifications?.length) setCertifications(mapCertificationsToFrontend(candidateData.certifications));
        if (candidateData.projects?.length) setProjects(mapProjectsToFrontend(candidateData.projects));

        // Fetch education documents for this candidate
        try {
          const docs = await educationDocumentService.getDocuments();
          setEducationDocuments(docs);
        } catch (docError) {
          console.error('Failed to fetch education documents:', docError);
        }

        // Fetch experience documents for this candidate
        try {
          const expDocs = await experienceDocumentService.getDocuments();
          setExperienceDocuments(expDocs);
        } catch (expDocError) {
          console.error('Failed to fetch experience documents:', expDocError);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [user]);

  const refreshProfileData = useCallback(async () => {
    try {
      const response = await candidateProfileService.getProfile();
      if (response?.success && response.candidate_profile_data) {
        const candidateData = response.candidate_profile_data;
        setProfileData((prev) => ({
          ...prev,
          profileStrength: candidateData.profile_strength ?? 0,
        }));
      }
    } catch (error) {
      console.error('Failed to refresh profile strength:', error);
    }
  }, []);

  // Experience from backend work_history
  const [experiences, setExperiences] = useState<Experience[]>([]);

  const [tempExperience, setTempExperience] = useState<Experience | null>(null);
  const [newExperience, setNewExperience] = useState<Experience>({
    id: '',
    experienceIndex: -1,
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    logo: '🏢'
  });

  // Education from backend education JSON
  const [education, setEducation] = useState<Education[]>([]);
  const [educationDocuments, setEducationDocuments] = useState<EducationDocument[]>([]);
  const [uploadingEducationIndex, setUploadingEducationIndex] = useState<number | null>(null);

  // Experience documents from backend
  const [experienceDocuments, setExperienceDocuments] = useState<ExperienceDocument[]>([]);
  const [uploadingExperienceIndex, setUploadingExperienceIndex] = useState<number | null>(null);

  const [tempEducation, setTempEducation] = useState<Education | null>(null);
  const [newEducation, setNewEducation] = useState<Education>({
    id: '',
    educationIndex: -1,
    school: '',
    degree: '',
    field: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    activities: ''
  });

  // Skills from backend skills (converted from comma-separated string)
  const [skills, setSkills] = useState<Skill[]>([]);

  const [newSkill, setNewSkill] = useState<Skill>({
    id: '',
    name: '',
    category: 'Skills',
    proficiency: 50
  });
  const [tempSkill, setTempSkill] = useState<Skill | null>(null);

  // NOTE: Certifications are not stored in backend - kept for UI structure but empty
  const [certifications, setCertifications] = useState<Certification[]>([]);

  const [tempCertification, setTempCertification] = useState<Certification | null>(null);
  const [newCertification, setNewCertification] = useState<Certification>({
    id: '',
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    credentialUrl: ''
  });

  // NOTE: Projects are not stored in backend - kept for UI structure but empty
  const [projects, setProjects] = useState<Project[]>([]);

  const [tempProject, setTempProject] = useState<Project | null>(null);
  const [newProject, setNewProject] = useState<Project>({
    id: '',
    name: '',
    description: '',
    url: '',
    tags: []
  });

  // Profile insights - fetched from API
  const [profileInsights, setProfileInsights] = useState({
    views: 0,
    searchAppearances: 0,
    recruiterEngagement: 0,
    profileStrength: 0
  });

  // Quick stats - fetched from API
  const DEFAULT_QUICK_STATS: QuickStat[] = [
    { label: 'Applications', count: 0, trend: '0%', icon: FileText, color: 'text-blue-600' },
    { label: 'Interviews', count: 0, trend: '0%', icon: Users, color: 'text-green-600' },
    { label: 'Response Rate', count: '0%', trend: '0%', icon: TrendingUp, color: 'text-[#ff6b35]' },
    { label: 'Avg. Response Time', count: '-', trend: '-', icon: Clock, color: 'text-purple-600' }
  ];

  const [quickStats, setQuickStats] = useState<QuickStat[]>(DEFAULT_QUICK_STATS);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await candidateProfileService.getAnalytics();
        if (data.success) {
          setProfileInsights(data.insights);
          setQuickStats(data.quickStats.map((stat, index) => ({
            label: stat.label,
            count: stat.count,
            trend: stat.trend,
            icon: DEFAULT_QUICK_STATS[index]?.icon || FileText,
            color: DEFAULT_QUICK_STATS[index]?.color || 'text-gray-600'
          })));
        }
      } catch (error) {
        console.error('Failed to fetch profile analytics:', error);
        // Keep default values on error
      }
    };
    
    void fetchAnalytics();
  }, []);

  const getProfileCompletion = () => {
    // Profile strength is computed and stored in the backend. Always use that
    // authoritative value rather than recalculating it in the frontend.
    return Math.round(profileData.profileStrength ?? 0);
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Sort experiences: current first, then by start date (most recent first)
  const sortExperiencesByDate = (exps: Experience[]) => {
    return [...exps].sort((a, b) => {
      // Current items come first
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      
      // Both current or both not current - sort by start date descending
      const dateA = new Date(a.startDate || '1970-01');
      const dateB = new Date(b.startDate || '1970-01');
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Sort education: current first, then by start date (most recent first)
  const sortEducationByDate = (edus: Education[]) => {
    return [...edus].sort((a, b) => {
      // Current items come first
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      
      // Both current or both not current - sort by start date descending
      const dateA = new Date(a.startDate || '1970-01');
      const dateB = new Date(b.startDate || '1970-01');
      return dateB.getTime() - dateA.getTime();
    });
  };

  // Edit handlers
  const handleEditHeader = () => {
    setTempProfileData(profileData);
    setEditingSection('header');
  };

  const handleSaveHeader = async () => {
    setProfileData(tempProfileData);
    setEditingSection(null);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        first_name: tempProfileData.firstName,
        last_name: tempProfileData.lastName,
        email: tempProfileData.email,
        phone: tempProfileData.phone,
        address: tempProfileData.location,
        bio: tempProfileData.bio,
        job_title: tempProfileData.title,
        current_company: tempProfileData.company,
        industry: tempProfileData.industry,
        linkedin: tempProfileData.linkedin,
        github: tempProfileData.github,
        portfolio: tempProfileData.portfolio,
      });
    } catch (error) {
      console.error('Failed to save header:', error);
    }
  };

  const handleCancelHeader = () => {
    setTempProfileData(profileData);
    setEditingSection(null);
  };

  // Experience handlers
  const handleAddExperience = () => {
    setIsAddingNew('experience');
    setNewExperience({
      id: '',
      experienceIndex: -1,
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      logo: '🏢'
    });
  };

  const handleSaveNewExperience = async () => {
    if (newExperience.company && newExperience.position && newExperience.startDate) {
      const newExperienceWithIndex = { ...newExperience, id: Date.now().toString(), experienceIndex: experiences.length };
      const updatedExperiences = [...experiences, newExperienceWithIndex];
      setExperiences(updatedExperiences);
      setIsAddingNew(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          work_history: updatedExperiences.map(exp => ({
            id: exp.id,
            company: exp.company,
            title: exp.position,
            location: exp.location,
            start_date: exp.startDate,
            end_date: exp.endDate,
            current: exp.current,
            description: exp.description,
          })),
        });
      } catch (error) {
        console.error('Failed to save experience:', error);
      }
    }
  };

  const handleCancelNewExperience = () => {
    setIsAddingNew(null);
  };

  const handleEditExperience = (exp: Experience) => {
    setTempExperience({ ...exp });
    setEditingItemId(exp.id);
  };

  const handleSaveExperience = async () => {
    if (tempExperience) {
      const updatedExperiences = experiences.map(exp => 
        exp.id === tempExperience.id ? tempExperience : exp
      );
      setExperiences(updatedExperiences);
      setTempExperience(null);
      setEditingItemId(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          work_history: updatedExperiences.map(exp => ({
            id: exp.id,
            company: exp.company,
            title: exp.position,
            location: exp.location,
            start_date: exp.startDate,
            end_date: exp.endDate,
            current: exp.current,
            description: exp.description,
          })),
        });
      } catch (error) {
        console.error('Failed to save experience:', error);
      }
    }
  };

  const handleCancelExperience = () => {
    setTempExperience(null);
    setEditingItemId(null);
  };

  const handleDeleteExperience = async (id: string) => {
    const updatedExperiences = experiences
      .filter(exp => exp.id !== id)
      .map((exp, index) => ({ ...exp, experienceIndex: index }));
    setExperiences(updatedExperiences);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        work_history: updatedExperiences.map(exp => ({
          id: exp.id,
          title: exp.position,
          company: exp.company,
          location: exp.location,
          start_date: exp.startDate,
          end_date: exp.endDate,
          current: exp.current,
          description: exp.description,
        })),
      });
    } catch (error) {
      console.error('Failed to delete experience:', error);
    }
  };

  // Education handlers
  const handleAddEducation = () => {
    setIsAddingNew('education');
    setNewEducation({
      id: '',
      educationIndex: -1,
      school: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      activities: ''
    });
  };

  const handleSaveNewEducation = async () => {
    if (newEducation.school && newEducation.degree && newEducation.field && newEducation.startDate) {
      const newEducationWithIndex = { ...newEducation, id: Date.now().toString(), educationIndex: education.length };
      const updatedEducation = [...education, newEducationWithIndex];
      setEducation(updatedEducation);
      setIsAddingNew(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          education: updatedEducation.map(edu => ({
            id: edu.id,
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            location: edu.location,
            start_year: edu.startDate,
            end_year: edu.endDate,
            current: edu.current,
            gpa: edu.gpa,
          })),
        });
      } catch (error) {
        console.error('Failed to save education:', error);
      }
    }
  };

  const handleCancelNewEducation = () => {
    setIsAddingNew(null);
  };

  const handleEditEducation = (edu: Education) => {
    setTempEducation({ ...edu });
    setEditingItemId(edu.id);
  };

  const handleSaveEducation = async () => {
    if (tempEducation) {
      const updatedEducation = education.map(edu => 
        edu.id === tempEducation.id ? tempEducation : edu
      );
      setEducation(updatedEducation);
      setTempEducation(null);
      setEditingItemId(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          education: updatedEducation.map(edu => ({
            id: edu.id,
            school: edu.school,
            degree: edu.degree,
            field: edu.field,
            location: edu.location,
            start_year: edu.startDate,
            end_year: edu.endDate,
            current: edu.current,
            gpa: edu.gpa,
          })),
        });
      } catch (error) {
        console.error('Failed to save education:', error);
      }
    }
  };

  const handleCancelEducation = () => {
    setTempEducation(null);
    setEditingItemId(null);
  };

  const handleDeleteEducation = async (id: string) => {
    const updatedEducation = education
      .filter(edu => edu.id !== id)
      .map((edu, index) => ({ ...edu, educationIndex: index }));
    setEducation(updatedEducation);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        education: updatedEducation.map(edu => ({
          id: edu.id,
          degree: edu.degree,
          school: edu.school,
          field: edu.field,
          location: edu.location,
          start_year: edu.startDate,
          end_year: edu.endDate,
          current: edu.current,
          gpa: edu.gpa,
        })),
      });
    } catch (error) {
      console.error('Failed to delete education:', error);
    }
  };

  // Education document handlers
  const getDocumentsForEducation = (index: number) => {
    return educationDocuments.filter(doc => doc.education_index === index);
  };

  const handleUploadDocument = async (educationIndex: number, documentType: 'transcript' | 'degree_certificate', file: File) => {
    setUploadingEducationIndex(educationIndex);
    try {
      const uploaded = await educationDocumentService.uploadDocument({
        education_index: educationIndex,
        document_type: documentType,
        file,
      });
      setEducationDocuments(prev => [...prev.filter(d => !(d.education_index === educationIndex && d.document_type === documentType)), uploaded]);
    } catch (error) {
      console.error('Failed to upload document:', error);
    } finally {
      setUploadingEducationIndex(null);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!globalThis.confirm('Are you sure you want to delete this document?')) return;
    try {
      await educationDocumentService.deleteDocument(documentId);
      setEducationDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handlePreviewDocument = (fileUrl: string) => {
    safeOpenWindow(fileUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadDocument = (fileUrl: string, documentType: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${documentType}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const renderEducationDocuments = (edu: Education, isEditing: boolean) => {
    if (edu.educationIndex < 0) return null;

    const docs = getDocumentsForEducation(edu.educationIndex);
    const transcript = docs.find(d => d.document_type === 'transcript');
    const degreeCertificate = docs.find(d => d.document_type === 'degree_certificate');
    const isUploading = uploadingEducationIndex === edu.educationIndex;
    const isOngoing = edu.current;

    const renderDocumentRow = (
      documentType: 'transcript' | 'degree_certificate',
      label: string,
      doc?: EducationDocument
    ) => (
      <div className="flex items-center gap-2 mt-2">
        {doc ? (
          <>
            <FileCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => handlePreviewDocument(doc.file_url)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownloadDocument(doc.file_url, label.replace(/\s+/g, '_').toLowerCase())}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="Download"
            >
              <FileDown className="w-4 h-4" />
            </button>
            {isEditing && (
              <button
                onClick={() => handleDeleteDocument(doc.id)}
                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          isEditing && (
            <>
              <FileUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{label}</span>
              <label className="cursor-pointer text-sm text-[#ff6b35] hover:text-[#e55a2b] font-medium">
                {isUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadDocument(edu.educationIndex, documentType, file);
                    e.target.value = '';
                  }}
                />
              </label>
            </>
          )
        )}
      </div>
    );

    const hasAnyDocument = transcript || degreeCertificate;
    if (!isEditing && !hasAnyDocument) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-1">Documents</p>
        {renderDocumentRow('transcript', 'Transcript', transcript)}
        {!isOngoing && renderDocumentRow('degree_certificate', 'Degree Certificate', degreeCertificate)}
      </div>
    );
  };

  // Experience document handlers
  const getDocumentsForExperience = (index: number) => {
    return experienceDocuments.filter(doc => doc.work_history_index === index);
  };

  const handleUploadExperienceDocument = async (workHistoryIndex: number, documentType: 'employment_letter', file: File) => {
    setUploadingExperienceIndex(workHistoryIndex);
    try {
      const uploaded = await experienceDocumentService.uploadDocument({
        work_history_index: workHistoryIndex,
        document_type: documentType,
        file,
      });
      setExperienceDocuments(prev => [...prev.filter(d => !(d.work_history_index === workHistoryIndex && d.document_type === documentType)), uploaded]);
    } catch (error) {
      console.error('Failed to upload experience document:', error);
    } finally {
      setUploadingExperienceIndex(null);
    }
  };

  const handleDeleteExperienceDocument = async (documentId: number) => {
    if (!globalThis.confirm('Are you sure you want to delete this document?')) return;
    try {
      await experienceDocumentService.deleteDocument(documentId);
      setExperienceDocuments(prev => prev.filter(d => d.id !== documentId));
    } catch (error) {
      console.error('Failed to delete experience document:', error);
    }
  };

  const renderExperienceDocuments = (exp: Experience, isEditing: boolean) => {
    if (exp.experienceIndex < 0) return null;

    const docs = getDocumentsForExperience(exp.experienceIndex);
    const employmentLetter = docs.find(d => d.document_type === 'employment_letter');
    const isUploading = uploadingExperienceIndex === exp.experienceIndex;

    const renderDocumentRow = (
      documentType: 'employment_letter',
      label: string,
      doc?: ExperienceDocument
    ) => (
      <div className="flex items-center gap-2 mt-2">
        {doc ? (
          <>
            <FileCheck className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-700">{label}</span>
            <button
              onClick={() => handlePreviewDocument(doc.file_url)}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="Preview"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownloadDocument(doc.file_url, label.replace(/\s+/g, '_').toLowerCase())}
              className="p-1 hover:bg-gray-100 rounded text-gray-500"
              title="Download"
            >
              <FileDown className="w-4 h-4" />
            </button>
            {isEditing && (
              <button
                onClick={() => handleDeleteExperienceDocument(doc.id)}
                className="p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500"
                title="Delete"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </>
        ) : (
          isEditing && (
            <>
              <FileUp className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-500">{label}</span>
              <label className="cursor-pointer text-sm text-[#ff6b35] hover:text-[#e55a2b] font-medium">
                {isUploading ? 'Uploading...' : 'Upload'}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  disabled={isUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadExperienceDocument(exp.experienceIndex, documentType, file);
                    e.target.value = '';
                  }}
                />
              </label>
            </>
          )
        )}
      </div>
    );

    const hasAnyDocument = employmentLetter;
    if (!isEditing && !hasAnyDocument) return null;

    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-500 mb-1">Documents</p>
        {renderDocumentRow('employment_letter', 'Employment Letter', employmentLetter)}
      </div>
    );
  };

  // Skill handlers
  const handleAddSkill = () => {
    setIsAddingNew('skill');
    setNewSkill({
      id: '',
      name: '',
      category: 'Skills',
      proficiency: 50
    });
  };

  const handleSaveNewSkill = async () => {
    if (newSkill.name) {
      // Split by comma if multiple skills, otherwise single skill
      const skillNames = newSkill.name.includes(',')
        ? newSkill.name.split(',').map(s => s.trim()).filter(s => s.length > 0)
        : [newSkill.name.trim()];
      
      // Filter out duplicates
      const existingSkillNames = new Set(skills.map(s => s.name.toLowerCase()));
      const newSkills = skillNames
        .filter(name => !existingSkillNames.has(name.toLowerCase()))
        .map((name, index) => ({
          ...newSkill,
          id: `${Date.now()}-${index}`,
          name: name
        }));
      
      const updatedSkills = [...skills, ...newSkills];
      setSkills(updatedSkills);
      setIsAddingNew(null);
      setNewSkill({ id: '', name: '', category: 'Skills', proficiency: 50 });
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          skills: updatedSkills.map(s => s.name).join(', '),
        });
      } catch (error) {
        console.error('Failed to save skills:', error);
      }
    }
  };

  const handleCancelNewSkill = () => {
    setIsAddingNew(null);
  };

  const handleDeleteSkill = async (id: string) => {
    const updatedSkills = skills.filter(skill => skill.id !== id);
    setSkills(updatedSkills);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        skills: updatedSkills.map(s => s.name).join(', '),
      });
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const handleEditSkill = (skill: Skill) => {
    setTempSkill({ ...skill });
    setEditingItemId(skill.id);
  };

  const handleSaveSkill = async () => {
    if (tempSkill) {
      const updatedSkills = skills.map(skill =>
        skill.id === tempSkill.id ? tempSkill : skill
      );
      setSkills(updatedSkills);
      setTempSkill(null);
      setEditingItemId(null);

      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          skills: updatedSkills.map(s => s.name).join(', '),
        });
      } catch (error) {
        console.error('Failed to save skill:', error);
      }
    }
  };

  const handleCancelSkill = () => {
    setTempSkill(null);
    setEditingItemId(null);
  };

  // Certification handlers
  const handleAddCertification = () => {
    setIsAddingNew('certification');
    setNewCertification({
      id: '',
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      credentialUrl: ''
    });
  };

  const handleSaveNewCertification = async () => {
    if (newCertification.name && newCertification.issuer && newCertification.issueDate) {
      const updatedCertifications = [...certifications, { ...newCertification, id: Date.now().toString() }];
      setCertifications(updatedCertifications);
      setIsAddingNew(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          certifications: updatedCertifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issue_date: cert.issueDate,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.credentialUrl,
          })),
        });
      } catch (error) {
        console.error('Failed to save certification:', error);
      }
    }
  };

  const handleCancelNewCertification = () => {
    setIsAddingNew(null);
  };

  const handleEditCertification = (cert: Certification) => {
    setTempCertification({ ...cert });
    setEditingItemId(cert.id);
  };

  const handleSaveCertification = async () => {
    if (tempCertification) {
      const updatedCertifications = certifications.map(cert => 
        cert.id === tempCertification.id ? tempCertification : cert
      );
      setCertifications(updatedCertifications);
      setTempCertification(null);
      setEditingItemId(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          certifications: updatedCertifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issue_date: cert.issueDate,
            expiry_date: cert.expiryDate,
            credential_id: cert.credentialId,
            credential_url: cert.credentialUrl,
          })),
        });
      } catch (error) {
        console.error('Failed to save certification:', error);
      }
    }
  };

  const handleCancelCertification = () => {
    setTempCertification(null);
    setEditingItemId(null);
  };

  const handleDeleteCertification = async (id: string) => {
    const updatedCertifications = certifications.filter(cert => cert.id !== id);
    setCertifications(updatedCertifications);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        certifications: updatedCertifications.map(cert => ({
          id: cert.id,
          name: cert.name,
          issuer: cert.issuer,
          issue_date: cert.issueDate,
          expiry_date: cert.expiryDate,
          credential_id: cert.credentialId,
          credential_url: cert.credentialUrl,
        })),
      });
    } catch (error) {
      console.error('Failed to delete certification:', error);
    }
  };

  // Project handlers
  const handleAddProject = () => {
    setIsAddingNew('project');
    setNewProject({
      id: '',
      name: '',
      description: '',
      url: '',
      tags: []
    });
  };

  const handleSaveNewProject = async () => {
    if (newProject.name && newProject.description) {
      const updatedProjects = [...projects, { ...newProject, id: Date.now().toString() }];
      setProjects(updatedProjects);
      setIsAddingNew(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          projects: updatedProjects.map(proj => ({
            id: proj.id,
            name: proj.name,
            description: proj.description,
            url: proj.url,
            tags: proj.tags,
          })),
        });
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    }
  };

  const handleCancelNewProject = () => {
    setIsAddingNew(null);
  };

  const handleEditProject = (proj: Project) => {
    setTempProject({ ...proj });
    setEditingItemId(proj.id);
  };

  const handleSaveProject = async () => {
    if (tempProject) {
      const updatedProjects = projects.map(proj => 
        proj.id === tempProject.id ? tempProject : proj
      );
      setProjects(updatedProjects);
      setTempProject(null);
      setEditingItemId(null);
      
      // Persist to backend
      try {
        await candidateProfileService.updateProfile({
          projects: updatedProjects.map(proj => ({
            id: proj.id,
            name: proj.name,
            description: proj.description,
            url: proj.url,
            tags: proj.tags,
          })),
        });
      } catch (error) {
        console.error('Failed to save project:', error);
      }
    }
  };

  const handleCancelProject = () => {
    setTempProject(null);
    setEditingItemId(null);
  };

  const handleDeleteProject = async (id: string) => {
    const updatedProjects = projects.filter(proj => proj.id !== id);
    setProjects(updatedProjects);
    
    // Persist to backend
    try {
      await candidateProfileService.updateProfile({
        projects: updatedProjects.map(proj => ({
          id: proj.id,
          title: proj.name,
          description: proj.description,
          technologies: proj.tags,
          link: proj.url,
        })),
      });
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <AppHeader
        userRole="job-seeker"
        user={user}
        currentView="profile"
        onNavigate={onNavigate}
        onLogout={onLogout || (() => {})}
      />

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
      )}

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Profile Header */}
        <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start gap-8">
            {/* Profile Image */}
            <div className="relative flex-shrink-0 mx-auto lg:mx-0">
              <div className="w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg ring-4 ring-white">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <ImageWithFallback
                    src={img654553Fedbede7976B97Eaf5Professional5ReminiEnhanced}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button 
                onClick={() => setShowImageUpload(true)}
                className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors border-2 border-orange-100"
              >
                <Edit3 className="w-4 h-4 text-[#ff6b35]" />
              </button>
              <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-green-500 rounded-full shadow-lg ring-4 ring-white flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div className="flex-1 min-w-0">
                  {editingSection === 'header' ? (
                    <div className="space-y-3 mb-4">
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Input 
                          value={tempProfileData.firstName}
                          onChange={(e) => setTempProfileData({ ...tempProfileData, firstName: e.target.value })}
                          placeholder="First Name"
                          className="flex-1"
                        />
                        <Input 
                          value={tempProfileData.lastName}
                          onChange={(e) => setTempProfileData({ ...tempProfileData, lastName: e.target.value })}
                          placeholder="Last Name"
                          className="flex-1"
                        />
                      </div>
                      <Input 
                        value={tempProfileData.title}
                        onChange={(e) => setTempProfileData({ ...tempProfileData, title: e.target.value })}
                        placeholder="Job Title"
                      />
                      <Input 
                        value={tempProfileData.company}
                        onChange={(e) => setTempProfileData({ ...tempProfileData, company: e.target.value })}
                        placeholder="Company"
                      />
                      <Input 
                        value={tempProfileData.location}
                        onChange={(e) => setTempProfileData({ ...tempProfileData, location: e.target.value })}
                        placeholder="Location"
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveHeader} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelHeader}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl text-gray-900">{profileData.firstName} {profileData.lastName}</h1>
                        <button 
                          onClick={handleEditHeader}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#ff6b35]" />
                        </button>
                      </div>
                      <p className="text-lg text-gray-600 mb-2">
                        {profileData.title} @ <span className="text-[#ff6b35]">{profileData.company}</span>
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {profileData.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Joined {profileData.joinedDate}
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Activity className="w-4 h-4" />
                          Active now
                        </span>
                      </div>
                    </>
                  )}
                </div>
                
                <Button size="sm" className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>

              {/* Profile Completion */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Profile Strength</span>
                  <span className="text-sm font-medium text-[#ff6b35]">{getProfileCompletion()}%</span>
                </div>
                <Progress value={getProfileCompletion()} className="h-2" />
              </div>

              {/* Contact Links */}
              <div className="flex items-center gap-3 flex-wrap">
                <a 
                  href={`mailto:${profileData.email}`}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Mail className="w-4 h-4" />
                  {profileData.email}
                </a>
                {profileData.linkedin && (
                  <a 
                    href={profileData.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors text-sm"
                  >
                    <AiOutlineLinkedin className="w-4 h-4" />
                    LinkedIn
                  </a>
                )}
                {profileData.github && (
                  <a 
                    href={profileData.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded-lg transition-colors text-sm"
                  >
                    <AiFillGithub className="w-4 h-4" />
                    GitHub
                  </a>
                )}
                {profileData.portfolio && (
                  <a 
                    href={profileData.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-600 rounded-lg transition-colors text-sm"
                  >
                    <Globe className="w-4 h-4" />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 border-orange-100 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-gray-500">Last 30 days</span>
            </div>
            <div className="text-2xl mb-1">{profileInsights.views}</div>
            <div className="text-sm text-gray-600">Profile Views</div>
          </Card>
          <Card className="p-4 border-orange-100 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Search className="w-5 h-5 text-green-500" />
              <span className="text-xs text-gray-500">This month</span>
            </div>
            <div className="text-2xl mb-1">{profileInsights.searchAppearances}</div>
            <div className="text-sm text-gray-600">Search Appearances</div>
          </Card>
          <Card className="p-4 border-orange-100 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-[#ff6b35]" />
              <span className="text-xs text-gray-500">This week</span>
            </div>
            <div className="text-2xl mb-1">{profileInsights.recruiterEngagement}</div>
            <div className="text-sm text-gray-600">Recruiter Engagement</div>
          </Card>
          <Card className="p-4 border-orange-100 bg-white/80">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-gray-500">Overall</span>
            </div>
            <div className="text-2xl mb-1">{profileInsights.profileStrength}%</div>
            <div className="text-sm text-gray-600">Profile Strength</div>
          </Card>
        </div>

        {/* Main Content Tabs - Compact Design */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-orange-100 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Overview
            </TabsTrigger>
            <TabsTrigger value="experience" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Experience
            </TabsTrigger>
            <TabsTrigger value="education" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Education
            </TabsTrigger>
            <TabsTrigger value="skills" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Skills
            </TabsTrigger>
            <TabsTrigger value="projects" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Projects
            </TabsTrigger>
            <TabsTrigger value="personality" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Personality
            </TabsTrigger>
            <TabsTrigger value="career" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
              Career Story
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - Read-Only Consolidated View */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {quickStats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <Card key={stat.label} className="p-4 bg-white/80 border-orange-100">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className={`w-5 h-5 ${stat.color}`} />
                      <Badge variant="outline" className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                    <div className="text-2xl mb-1">{stat.count}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </Card>
                );
              })}
            </div>

            {/* Personality Snapshot */}
            <PersonalitySummary onViewDetails={() => setActiveTab('personality')} />

            {/* Work Experience Overview */}
            <Card className="p-6 bg-white/80 border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg text-gray-900">Work Experience</h3>
                <Badge variant="outline" className="text-xs">{experiences.length} position{experiences.length === 1 ? '' : 's'}</Badge>
              </div>
              <div className="space-y-4">
                {sortExperiencesByDate(experiences).map((exp) => (
                  <div key={exp.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="text-3xl">{exp.logo}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{exp.position}</h4>
                      <p className="text-[#ff6b35]">{exp.company}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span>
                          {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate!)}
                        </span>
                        {exp.location && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {exp.location}
                            </span>
                          </>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mt-2 leading-relaxed">{exp.description}</p>
                      {renderExperienceDocuments(exp, false)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Education Overview */}
            <Card className="p-6 bg-white/80 border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg text-gray-900">Education</h3>
                <Badge variant="outline" className="text-xs">{education.length} degree{education.length === 1 ? '' : 's'}</Badge>
              </div>
              <div className="space-y-4">
                {sortEducationByDate(education).map((edu) => (
                  <div key={edu.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-900">{edu.degree} in {edu.field}</h4>
                    <p className="text-[#ff6b35]">{edu.school}</p>
                    {edu.location && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {edu.location}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                      <span>
                        {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate!)}
                      </span>
                      {edu.gpa && (
                        <>
                          <span>•</span>
                          <span>GPA: {edu.gpa}</span>
                        </>
                      )}
                    </div>
                    {edu.activities && (
                      <p className="text-sm text-gray-700 mt-2">{edu.activities}</p>
                    )}
                    {renderEducationDocuments(edu, false)}
                  </div>
                ))}
              </div>
            </Card>

            {/* Skills Overview */}
            <Card className="p-6 bg-white/80 border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg text-gray-900">Skills</h3>
                <Badge variant="outline" className="text-xs">{skills.length} skill{skills.length === 1 ? '' : 's'}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span 
                    key={skill.id} 
                    className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-full text-sm border border-gray-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
              {skills.length === 0 && (
                <p className="text-gray-500 text-sm">No skills added yet.</p>
              )}
            </Card>

            {/* Certifications Overview */}
            {certifications.length > 0 && (
              <Card className="p-6 bg-white/80 border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="w-5 h-5 text-[#ff6b35]" />
                  <h3 className="text-lg text-gray-900">Certifications</h3>
                  <Badge variant="outline" className="text-xs">{certifications.length} certification{certifications.length === 1 ? '' : 's'}</Badge>
                </div>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        <p className="text-sm text-gray-600">{cert.issuer}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>Issued {formatDate(cert.issueDate)}</span>
                          {cert.expiryDate && (
                            <>
                              <span>•</span>
                              <span>Expires {formatDate(cert.expiryDate)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Projects Overview */}
            {projects.length > 0 && (
              <Card className="p-6 bg-white/80 border-orange-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-[#ff6b35]" />
                  <h3 className="text-lg text-gray-900">Projects</h3>
                  <Badge variant="outline" className="text-xs">{projects.length} project{projects.length === 1 ? '' : 's'}</Badge>
                </div>
                <div className="space-y-4">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#ff6b35] hover:text-[#e55a2b]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Contact Information */}
            <Card className="p-6 bg-white/80 border-orange-100">
              <div className="flex items-center gap-2 mb-4">
                <Mail className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg text-gray-900">Contact & Links</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <a
                    href={`mailto:${profileData.email}`}
                    className="text-gray-900 hover:text-[#ff6b35] hover:underline"
                  >
                    {profileData.email}
                  </a>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phone</p>
                  <p className="text-gray-900">{profileData.phone}</p>
                </div>
                {profileData.linkedin && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">LinkedIn</p>
                    <a
                      href={profileData.linkedin.startsWith('http') ? profileData.linkedin : `https://${profileData.linkedin}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff6b35] hover:underline"
                    >
                      {profileData.linkedin}
                    </a>
                  </div>
                )}
                {profileData.github && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">GitHub</p>
                    <a
                      href={profileData.github.startsWith('http') ? profileData.github : `https://${profileData.github}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff6b35] hover:underline"
                    >
                      {profileData.github}
                    </a>
                  </div>
                )}
                {profileData.portfolio && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Portfolio</p>
                    <a
                      href={profileData.portfolio.startsWith('http') ? profileData.portfolio : `https://${profileData.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#ff6b35] hover:underline"
                    >
                      {profileData.portfolio}
                    </a>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Experience Tab */}
          <TabsContent value="experience" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg text-gray-900">Work Experience</h3>
              <Button size="sm" onClick={handleAddExperience} className="bg-[#ff6b35] hover:bg-[#e55a2b] self-start sm:self-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Experience
              </Button>
            </div>

            {/* Add New Experience Form */}
            {isAddingNew === 'experience' && (
              <Card className="p-6 bg-white/80 border-orange-200 border-2">
                <h4 className="font-medium text-gray-900 mb-4">Add New Experience</h4>
                <div className="space-y-3">
                  <Input
                    value={newExperience.position}
                    onChange={(e) => setNewExperience({ ...newExperience, position: e.target.value })}
                    placeholder="Position"
                  />
                  <Input
                    value={newExperience.company}
                    onChange={(e) => setNewExperience({ ...newExperience, company: e.target.value })}
                    placeholder="Company"
                  />
                  <Input
                    value={newExperience.location || ''}
                    onChange={(e) => setNewExperience({ ...newExperience, location: e.target.value })}
                    placeholder="Location (optional)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-exp-current"
                      checked={newExperience.current}
                      onChange={(e) => setNewExperience({ ...newExperience, current: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                    <label htmlFor="new-exp-current" className="text-sm text-gray-700">Current Position</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="month"
                      value={newExperience.startDate}
                      onChange={(e) => setNewExperience({ ...newExperience, startDate: e.target.value })}
                      placeholder="Start Date"
                    />
                    <Input
                      type="month"
                      value={newExperience.endDate || ''}
                      onChange={(e) => setNewExperience({ ...newExperience, endDate: e.target.value })}
                      placeholder="End Date"
                      disabled={newExperience.current}
                    />
                  </div>
                  <Textarea
                    value={newExperience.description}
                    onChange={(e) => setNewExperience({ ...newExperience, description: e.target.value })}
                    placeholder="Description"
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNewExperience} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelNewExperience}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {sortExperiencesByDate(experiences).map((exp) => (
              <Card key={exp.id} className="p-6 bg-white/80 border-orange-100">
                {editingItemId === exp.id && tempExperience ? (
                  <div className="space-y-3">
                    <Input
                      value={tempExperience.position}
                      onChange={(e) => setTempExperience({ ...tempExperience, position: e.target.value })}
                      placeholder="Position"
                    />
                    <Input
                      value={tempExperience.company}
                      onChange={(e) => setTempExperience({ ...tempExperience, company: e.target.value })}
                      placeholder="Company"
                    />
                    <Input
                      value={tempExperience.location || ''}
                      onChange={(e) => setTempExperience({ ...tempExperience, location: e.target.value })}
                      placeholder="Location"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-current-${exp.id}`}
                        checked={tempExperience.current}
                        onChange={(e) => setTempExperience({ ...tempExperience, current: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                      />
                      <label htmlFor={`edit-current-${exp.id}`} className="text-sm text-gray-700">Current Position</label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="month"
                        value={tempExperience.startDate}
                        onChange={(e) => setTempExperience({ ...tempExperience, startDate: e.target.value })}
                        placeholder="Start Date"
                      />
                      <Input
                        type="month"
                        value={tempExperience.endDate || ''}
                        onChange={(e) => setTempExperience({ ...tempExperience, endDate: e.target.value })}
                        placeholder="End Date"
                        disabled={tempExperience.current}
                      />
                    </div>
                    <Textarea
                      value={tempExperience.description}
                      onChange={(e) => setTempExperience({ ...tempExperience, description: e.target.value })}
                      placeholder="Description"
                      className="min-h-[100px]"
                    />
                    {renderExperienceDocuments(exp, true)}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveExperience} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelExperience}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="text-4xl">{exp.logo}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{exp.position}</h4>
                        <p className="text-[#ff6b35] mb-1">{exp.company}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-3">
                          <span>
                            {formatDate(exp.startDate)} - {exp.current ? 'Present' : formatDate(exp.endDate!)}
                          </span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {exp.location}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-gray-700 leading-relaxed">{exp.description}</p>
                        {renderExperienceDocuments(exp, false)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditExperience(exp)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#ff6b35]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-lg text-gray-900">Education</h3>
              <Button size="sm" onClick={handleAddEducation} className="bg-[#ff6b35] hover:bg-[#e55a2b] self-start sm:self-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Education
              </Button>
            </div>

            {/* Add New Education Form */}
            {isAddingNew === 'education' && (
              <Card className="p-6 bg-white/80 border-orange-200 border-2">
                <h4 className="font-medium text-gray-900 mb-4">Add New Education</h4>
                <div className="space-y-3">
                  <Input
                    value={newEducation.school}
                    onChange={(e) => setNewEducation({ ...newEducation, school: e.target.value })}
                    placeholder="School"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      value={newEducation.degree}
                      onChange={(e) => setNewEducation({ ...newEducation, degree: e.target.value })}
                      placeholder="Degree"
                    />
                    <Input
                      value={newEducation.field}
                      onChange={(e) => setNewEducation({ ...newEducation, field: e.target.value })}
                      placeholder="Field of Study"
                    />
                  </div>
                  <Input
                    value={newEducation.location}
                    onChange={(e) => setNewEducation({ ...newEducation, location: e.target.value })}
                    placeholder="Location (optional)"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="new-edu-current"
                      checked={newEducation.current}
                      onChange={(e) => setNewEducation({ ...newEducation, current: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                    />
                    <label htmlFor="new-edu-current" className="text-sm text-gray-700">Currently Studying</label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      type="month"
                      value={newEducation.startDate}
                      onChange={(e) => setNewEducation({ ...newEducation, startDate: e.target.value })}
                      placeholder="Start Date"
                    />
                    <Input
                      type="month"
                      value={newEducation.endDate || ''}
                      onChange={(e) => setNewEducation({ ...newEducation, endDate: e.target.value })}
                      placeholder="End Date"
                      disabled={newEducation.current}
                    />
                  </div>
                  <Input
                    value={newEducation.gpa || ''}
                    onChange={(e) => setNewEducation({ ...newEducation, gpa: e.target.value })}
                    placeholder="GPA (optional)"
                  />
                  <Textarea
                    value={newEducation.activities || ''}
                    onChange={(e) => setNewEducation({ ...newEducation, activities: e.target.value })}
                    placeholder="Activities (optional)"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNewEducation} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelNewEducation}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {sortEducationByDate(education).map((edu) => (
              <Card key={edu.id} className="p-6 bg-white/80 border-orange-100">
                {editingItemId === edu.id && tempEducation ? (
                  <div className="space-y-3">
                    <Input
                      value={tempEducation.school}
                      onChange={(e) => setTempEducation({ ...tempEducation, school: e.target.value })}
                      placeholder="School"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        value={tempEducation.degree}
                        onChange={(e) => setTempEducation({ ...tempEducation, degree: e.target.value })}
                        placeholder="Degree"
                      />
                      <Input
                        value={tempEducation.field}
                        onChange={(e) => setTempEducation({ ...tempEducation, field: e.target.value })}
                        placeholder="Field of Study"
                      />
                    </div>
                    <Input
                      value={tempEducation.location}
                      onChange={(e) => setTempEducation({ ...tempEducation, location: e.target.value })}
                      placeholder="Location (optional)"
                    />
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit-current-edu-${edu.id}`}
                        checked={tempEducation.current}
                        onChange={(e) => setTempEducation({ ...tempEducation, current: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-[#ff6b35] focus:ring-[#ff6b35]"
                      />
                      <label htmlFor={`edit-current-edu-${edu.id}`} className="text-sm text-gray-700">Currently Studying</label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="month"
                        value={tempEducation.startDate}
                        onChange={(e) => setTempEducation({ ...tempEducation, startDate: e.target.value })}
                        placeholder="Start Date"
                      />
                      <Input
                        type="month"
                        value={tempEducation.endDate || ''}
                        onChange={(e) => setTempEducation({ ...tempEducation, endDate: e.target.value })}
                        placeholder="End Date"
                        disabled={tempEducation.current}
                      />
                    </div>
                    <Input
                      value={tempEducation.gpa || ''}
                      onChange={(e) => setTempEducation({ ...tempEducation, gpa: e.target.value })}
                      placeholder="GPA (optional)"
                    />
                    <Textarea
                      value={tempEducation.activities || ''}
                      onChange={(e) => setTempEducation({ ...tempEducation, activities: e.target.value })}
                      placeholder="Activities (optional)"
                    />
                    {renderEducationDocuments(edu, true)}
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveEducation} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEducation}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex gap-4 flex-1 min-w-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 mb-1">{edu.degree} in {edu.field}</h4>
                        <p className="text-[#ff6b35] mb-1">{edu.school}</p>
                        {edu.location && (
                          <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {edu.location}
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-2">
                          <span>
                            {formatDate(edu.startDate)} - {edu.current ? 'Present' : formatDate(edu.endDate!)}
                          </span>
                          {edu.gpa && (
                            <>
                              <span>•</span>
                              <span>GPA: {edu.gpa}</span>
                            </>
                          )}
                        </div>
                        {edu.activities && (
                          <p className="text-sm text-gray-600">{edu.activities}</p>
                        )}
                        {renderEducationDocuments(edu, false)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditEducation(edu)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#ff6b35]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Skills Tab */}
          <TabsContent value="skills" className="space-y-6">
            {/* Skills Section */}
            <Card className="p-6 bg-white/80 border-orange-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-lg text-gray-900">Skills</h3>
                <Button size="sm" onClick={handleAddSkill} className="bg-[#ff6b35] hover:bg-[#e55a2b] self-start sm:self-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Skill
                </Button>
              </div>

              {/* Add New Skill Form */}
              {isAddingNew === 'skill' && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-gray-900 mb-3">Add New Skill(s)</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={newSkill.name}
                      onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                      placeholder="Skill Name (or comma-separated: Python, SQL, React)"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveNewSkill} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelNewSkill}>
                      Cancel
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Enter a single skill or multiple skills separated by commas</p>
                </div>
              )}

              {/* Edit Skill Form */}
              {editingItemId && tempSkill && (
                <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <h4 className="font-medium text-gray-900 mb-3">Edit Skill</h4>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      value={tempSkill.name}
                      onChange={(e) => setTempSkill({ ...tempSkill, name: e.target.value })}
                      placeholder="Skill Name"
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveSkill} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelSkill}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Skills List */}
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <div 
                    key={skill.id} 
                    className="group flex items-center gap-1 px-3 py-2 bg-gray-50 hover:bg-orange-50 rounded-lg border border-gray-200 hover:border-orange-200 transition-colors"
                  >
                    <span className="text-sm text-gray-900">{skill.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditSkill(skill)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Edit3 className="w-3 h-3 text-gray-400 hover:text-[#ff6b35]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSkill(skill.id)}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {skills.length === 0 && (
                <p className="text-gray-500 text-center py-8">No skills added yet. Click "Add Skill" to get started.</p>
              )}
            </Card>

            {/* Certifications Section */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <h3 className="text-lg text-gray-900">Certifications</h3>
                <Button size="sm" onClick={handleAddCertification} className="bg-[#ff6b35] hover:bg-[#e55a2b] self-start sm:self-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
              </div>

              {/* Add New Certification Form */}
              {isAddingNew === 'certification' && (
                <Card className="p-5 bg-white/80 border-orange-200 border-2 mb-4">
                  <h4 className="font-medium text-gray-900 mb-4">Add New Certification</h4>
                  <div className="space-y-3">
                    <Input
                      value={newCertification.name}
                      onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
                      placeholder="Certification Name"
                    />
                    <Input
                      value={newCertification.issuer}
                      onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
                      placeholder="Issuer"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input
                        type="month"
                        value={newCertification.issueDate}
                        onChange={(e) => setNewCertification({ ...newCertification, issueDate: e.target.value })}
                        placeholder="Issue Date"
                      />
                      <Input
                        type="month"
                        value={newCertification.expiryDate || ''}
                        onChange={(e) => setNewCertification({ ...newCertification, expiryDate: e.target.value })}
                        placeholder="Expiry Date (optional)"
                      />
                    </div>
                    <Input
                      value={newCertification.credentialId || ''}
                      onChange={(e) => setNewCertification({ ...newCertification, credentialId: e.target.value })}
                      placeholder="Credential ID (optional)"
                    />
                    <Input
                      value={newCertification.credentialUrl || ''}
                      onChange={(e) => setNewCertification({ ...newCertification, credentialUrl: e.target.value })}
                      placeholder="Credential URL (optional)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveNewCertification} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelNewCertification}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certifications.map((cert) => (
                  <Card key={cert.id} className="p-5 bg-white/80 border-orange-100 hover:border-orange-200 transition-colors group">
                    {editingItemId === cert.id && tempCertification ? (
                      <div className="space-y-3">
                        <Input
                          value={tempCertification.name}
                          onChange={(e) => setTempCertification({ ...tempCertification, name: e.target.value })}
                          placeholder="Certification Name"
                        />
                        <Input
                          value={tempCertification.issuer}
                          onChange={(e) => setTempCertification({ ...tempCertification, issuer: e.target.value })}
                          placeholder="Issuer"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <Input
                            type="month"
                            value={tempCertification.issueDate}
                            onChange={(e) => setTempCertification({ ...tempCertification, issueDate: e.target.value })}
                            placeholder="Issue Date"
                          />
                          <Input
                            type="month"
                            value={tempCertification.expiryDate || ''}
                            onChange={(e) => setTempCertification({ ...tempCertification, expiryDate: e.target.value })}
                            placeholder="Expiry Date (optional)"
                          />
                        </div>
                        <Input
                          value={tempCertification.credentialId || ''}
                          onChange={(e) => setTempCertification({ ...tempCertification, credentialId: e.target.value })}
                          placeholder="Credential ID (optional)"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveCertification} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelCertification}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Award className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 mb-1 truncate">{cert.name}</h4>
                            <p className="text-sm text-gray-600 mb-2">{cert.issuer}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                              <span>Issued {formatDate(cert.issueDate)}</span>
                              {cert.expiryDate && (
                                <>
                                  <span>•</span>
                                  <span>Expires {formatDate(cert.expiryDate)}</span>
                                </>
                              )}
                            </div>
                            {cert.credentialId && (
                              <Badge variant="outline" className="text-xs">
                                ID: {cert.credentialId}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleEditCertification(cert)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#ff6b35]" />
                            </button>
                            <button 
                              onClick={() => handleDeleteCertification(cert.id)}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                        {cert.credentialUrl && (
                          <a href={cert.credentialUrl} className="text-xs text-[#ff6b35] hover:underline mt-3 inline-flex items-center gap-1">
                            View Credential <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg text-gray-900">Portfolio & Projects</h3>
              <Button size="sm" onClick={handleAddProject} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            {/* Add New Project Form */}
            {isAddingNew === 'project' && (
              <Card className="p-6 bg-white/80 border-orange-200 border-2">
                <h4 className="font-medium text-gray-900 mb-4">Add New Project</h4>
                <div className="space-y-3">
                  <Input
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    placeholder="Project Name"
                  />
                  <Textarea
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    placeholder="Description"
                    className="min-h-[80px]"
                  />
                  <Input
                    value={newProject.url || ''}
                    onChange={(e) => setNewProject({ ...newProject, url: e.target.value })}
                    placeholder="Project URL (optional)"
                  />
                  <Input
                    placeholder="Tags (comma-separated)"
                    onChange={(e) => setNewProject({ ...newProject, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveNewProject} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleCancelNewProject}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}
            
            {projects.map((project) => (
              <Card key={project.id} className="p-6 bg-white/80 border-orange-100">
                {editingItemId === project.id && tempProject ? (
                  <div className="space-y-3">
                    <Input
                      value={tempProject.name}
                      onChange={(e) => setTempProject({ ...tempProject, name: e.target.value })}
                      placeholder="Project Name"
                    />
                    <Textarea
                      value={tempProject.description}
                      onChange={(e) => setTempProject({ ...tempProject, description: e.target.value })}
                      placeholder="Description"
                      className="min-h-[80px]"
                    />
                    <Input
                      value={tempProject.url || ''}
                      onChange={(e) => setTempProject({ ...tempProject, url: e.target.value })}
                      placeholder="Project URL (optional)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveProject} className="bg-[#ff6b35] hover:bg-[#e55a2b]">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelProject}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        {project.url && (
                          <a 
                            href={project.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#ff6b35] hover:text-[#e55a2b]"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-gray-700 mb-3">{project.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditProject(project)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4 text-gray-400 hover:text-[#ff6b35]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProject(project.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Personality Tab */}
          <TabsContent value="personality" className="space-y-6">
            <PersonalityTab onComplete={refreshProfileData} />
          </TabsContent>

          {/* Career Path Story Tab */}
          <TabsContent value="career" className="space-y-6">
            <CareerPathStory
              user={user}
              onNavigate={onNavigate}
              profileIndustry={profileData.industry}
              profileExpLevel={rawProfile?.candidate_profile_data?.exp_level || ''}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Profile Image Upload Modal */}
      {showImageUpload && (
        <ProfileImageUpload
          currentImage={profileImage}
          onUpload={async (file: File) => {
            const imageUrl = await candidateProfileService.uploadProfileImage(file);
            setProfileImage(imageUrl);
          }}
          onClose={() => setShowImageUpload(false)}
        />
      )}
    </div>
  );
}
