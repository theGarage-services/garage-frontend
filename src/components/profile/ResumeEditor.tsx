import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { X, ChevronDown, ChevronUp, Plus, Edit3, Save, Upload, Download, Eye } from 'lucide-react';

interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  logo: string;
  description: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  location: string;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

interface Publication {
  id: string;
  title: string;
  journal: string;
  date: string;
  authors: string;
  doi?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
  startDate: string;
  endDate?: string;
  url?: string;
}

interface VolunteerWork {
  id: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  description: string;
  location: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: number;
}

interface ResumeData {
  contactInfo: ContactInfo;
  workExperience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  publications: Publication[];
  projects: Project[];
  volunteerWork: VolunteerWork[];
  skills: Skill[];
}

interface ResumeEditorProps {
  onClose: () => void;
  onSave: (data: ResumeData) => void;
  initialData?: Partial<ResumeData>;
}

export function ResumeEditor({ onClose, onSave, initialData }: Readonly<ResumeEditorProps>) {
  const [resumeData, setResumeData] = useState<ResumeData>({
    contactInfo: {
      name: 'Mike Perry',
      email: 'mike.perry@email.com',
      phone: '+1 (416) 555-0123',
      location: 'Toronto, ON',
      summary: 'Passionate about data-driven risk strategies and fostering collaboration across teams.',
      ...initialData?.contactInfo
    },
    workExperience: initialData?.workExperience || [
      {
        id: '1',
        company: 'Google',
        position: 'Sr. Software Developer',
        location: 'Toronto, Canada',
        startDate: 'July 2024',
        endDate: 'Present',
        current: true,
        logo: '🔍',
        description: 'Led development of machine learning algorithms for search optimization, improving query response time by 40%.'
      },
      {
        id: '2',
        company: 'Facebook',
        position: 'Data Engineer',
        location: 'Nairobi, Kenya',
        startDate: 'Jan 2024',
        endDate: 'Jul 2024',
        current: false,
        logo: '📘',
        description: 'Designed and implemented data pipelines processing 500M+ daily events using Apache Spark and Kafka.'
      }
    ],
    education: initialData?.education || [],
    certifications: initialData?.certifications || [],
    publications: initialData?.publications || [],
    projects: initialData?.projects || [],
    volunteerWork: initialData?.volunteerWork || [],
    skills: initialData?.skills || []
  });

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    contact: true,
    experience: true,
    education: false,
    certifications: false,
    publications: false,
    projects: false,
    volunteer: false,
    skills: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const addWorkExperience = () => {
    const newExp: WorkExperience = {
      id: Date.now().toString(),
      company: '',
      position: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      logo: '🏢',
      description: ''
    };
    setResumeData(prev => ({
      ...prev,
      workExperience: [...prev.workExperience, newExp]
    }));
  };

  const updateWorkExperience = (id: string, updates: Partial<WorkExperience>) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.map(exp => 
        exp.id === id ? { ...exp, ...updates } : exp
      )
    }));
  };

  const removeWorkExperience = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      workExperience: prev.workExperience.filter(exp => exp.id !== id)
    }));
  };

  // Education functions
  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: '',
      location: ''
    };
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, ...updates } : edu
      )
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // Certification functions
  const addCertification = () => {
    const newCert: Certification = {
      id: Date.now().toString(),
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: ''
    };
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const updateCertification = (id: string, updates: Partial<Certification>) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, ...updates } : cert
      )
    }));
  };

  const removeCertification = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  // Publication functions
  const addPublication = () => {
    const newPub: Publication = {
      id: Date.now().toString(),
      title: '',
      journal: '',
      date: '',
      authors: '',
      doi: ''
    };
    setResumeData(prev => ({
      ...prev,
      publications: [...prev.publications, newPub]
    }));
  };

  const updatePublication = (id: string, updates: Partial<Publication>) => {
    setResumeData(prev => ({
      ...prev,
      publications: prev.publications.map(pub => 
        pub.id === id ? { ...pub, ...updates } : pub
      )
    }));
  };

  const removePublication = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      publications: prev.publications.filter(pub => pub.id !== id)
    }));
  };

  // Project functions
  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: '',
      startDate: '',
      endDate: '',
      url: ''
    };
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, newProject]
    }));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => 
        proj.id === id ? { ...proj, ...updates } : proj
      )
    }));
  };

  const removeProject = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  // Volunteer Work functions
  const addVolunteerWork = () => {
    const newVolunteer: VolunteerWork = {
      id: Date.now().toString(),
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      description: '',
      location: ''
    };
    setResumeData(prev => ({
      ...prev,
      volunteerWork: [...prev.volunteerWork, newVolunteer]
    }));
  };

  const updateVolunteerWork = (id: string, updates: Partial<VolunteerWork>) => {
    setResumeData(prev => ({
      ...prev,
      volunteerWork: prev.volunteerWork.map(vol => 
        vol.id === id ? { ...vol, ...updates } : vol
      )
    }));
  };

  const removeVolunteerWork = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      volunteerWork: prev.volunteerWork.filter(vol => vol.id !== id)
    }));
  };

  // Skills functions
  const addSkill = () => {
    const newSkill: Skill = {
      id: Date.now().toString(),
      name: '',
      category: 'Technical',
      level: 3
    };
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, ...updates } : skill
      )
    }));
  };

  const removeSkill = (id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const calculateDuration = (startDate: string, endDate: string, current: boolean) => {
    if (!startDate) return '';
    const end = current ? new Date() : new Date(endDate);
    const start = new Date(startDate);
    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    
    if (years === 0) return `${remainingMonths} Month${remainingMonths === 1 ? '' : 's'}`;
    if (remainingMonths === 0) return `${years} Year${years === 1 ? '' : 's'}`;
    return `${years} Year${years === 1 ? '' : 's'}, ${remainingMonths} Month${remainingMonths === 1 ? '' : 's'}`;
  };

  const handleSave = () => {
    onSave(resumeData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#e2ddd9] w-full max-w-7xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[rgba(15,9,12,0.56)] backdrop-blur-[80px] px-8 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-medium text-white">
                <span className="text-white">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
            <div className="h-8 w-px bg-white/20 mx-4"></div>
            <h2 className="text-xl text-white font-medium">Resume Editor</h2>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Resume
            </Button>
            <Button variant="outline" onClick={onClose} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex">
          {/* Main Editor */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              
              {/* Contact Information & Summary */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('contact')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Contact Information & Summary</h3>
                  {expandedSections.contact ? 
                    <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                    <ChevronDown className="w-6 h-6 text-gray-600" />
                  }
                </button>
                
                {expandedSections.contact && (
                  <div className="px-6 pb-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <Input
                          id="contact-name"
                          value={resumeData.contactInfo.name}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, name: e.target.value }
                          }))}
                          className="bg-white border-gray-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input
                          id="contact-email"
                          value={resumeData.contactInfo.email}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, email: e.target.value }
                          }))}
                          className="bg-white border-gray-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <Input
                          id="contact-phone"
                          value={resumeData.contactInfo.phone}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, phone: e.target.value }
                          }))}
                          className="bg-white border-gray-200"
                        />
                      </div>
                      <div>
                        <label htmlFor="contact-location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                        <Input
                          id="contact-location"
                          value={resumeData.contactInfo.location}
                          onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            contactInfo: { ...prev.contactInfo, location: e.target.value }
                          }))}
                          className="bg-white border-gray-200"
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="contact-summary" className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                      <Textarea
                        id="contact-summary"
                        value={resumeData.contactInfo.summary}
                        onChange={(e) => setResumeData(prev => ({
                          ...prev,
                          contactInfo: { ...prev.contactInfo, summary: e.target.value }
                        }))}
                        className="bg-white border-gray-200 min-h-[100px]"
                        placeholder="Write a brief professional summary..."
                      />
                    </div>
                  </div>
                )}
              </Card>

              {/* Work Experience */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('experience')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Work Experience</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addWorkExperience();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.experience ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.experience && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.workExperience.map((exp, index) => (
                      <div key={exp.id} className="relative border-l-2 border-[#ff6b35] pl-8 pb-6">
                        <div className="absolute -left-2 top-0 w-4 h-4 bg-[#ff6b35] rounded-full"></div>
                        
                        <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Input
                                value={exp.logo}
                                onChange={(e) => updateWorkExperience(exp.id, { logo: e.target.value })}
                                className="w-12 text-center bg-white"
                                placeholder="🏢"
                              />
                              <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeWorkExperience(exp.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label htmlFor={`exp-company-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                              <Input
                                id={`exp-company-${exp.id}`}
                                value={exp.company}
                                onChange={(e) => updateWorkExperience(exp.id, { company: e.target.value })}
                                className="bg-white"
                                placeholder="Company name"
                              />
                            </div>
                            <div>
                              <label htmlFor={`exp-position-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                              <Input
                                id={`exp-position-${exp.id}`}
                                value={exp.position}
                                onChange={(e) => updateWorkExperience(exp.id, { position: e.target.value })}
                                className="bg-white"
                                placeholder="Job title"
                              />
                            </div>
                            <div>
                              <label htmlFor={`exp-location-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                              <Input
                                id={`exp-location-${exp.id}`}
                                value={exp.location}
                                onChange={(e) => updateWorkExperience(exp.id, { location: e.target.value })}
                                className="bg-white"
                                placeholder="City, Country"
                              />
                            </div>
                            <div>
                              <label htmlFor={`exp-start-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                  id={`exp-start-${exp.id}`}
                                  value={exp.startDate}
                                  onChange={(e) => updateWorkExperience(exp.id, { startDate: e.target.value })}
                                  className="bg-white flex-1"
                                  placeholder="Jul 2024"
                                />
                                <span className="flex items-center text-gray-500">to</span>
                                <Input
                                  id={`exp-end-${exp.id}`}
                                  value={exp.current ? 'Present' : exp.endDate}
                                  onChange={(e) => updateWorkExperience(exp.id, { endDate: e.target.value, current: e.target.value === 'Present' })}
                                  className="bg-white flex-1"
                                  placeholder="Present"
                                />
                              </div>
                              {exp.startDate && (
                                <p className="text-xs text-gray-500 mt-1 italic">
                                  {calculateDuration(exp.startDate, exp.endDate, exp.current)}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor={`exp-description-${exp.id}`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <Textarea
                              id={`exp-description-${exp.id}`}
                              value={exp.description}
                              onChange={(e) => updateWorkExperience(exp.id, { description: e.target.value })}
                              className="bg-white min-h-[80px]"
                              placeholder="Describe your role and achievements..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              {/* Education */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('education')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Education</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addEducation();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.education ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.education && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.education.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No education added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      resumeData.education.map((edu, index) => (
                        <div key={edu.id} className="relative border-l-2 border-blue-500 pl-8 pb-6">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeEducation(edu.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`edu-institution-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                <Input
                                  id={`edu-institution-${edu.id}`}
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(edu.id, { institution: e.target.value })}
                                  className="bg-white"
                                  placeholder="University/School name"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edu-degree-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                <Input
                                  id={`edu-degree-${edu.id}`}
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(edu.id, { degree: e.target.value })}
                                  className="bg-white"
                                  placeholder="Bachelor of Science"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edu-field-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                                <Input
                                  id={`edu-field-${edu.id}`}
                                  value={edu.field}
                                  onChange={(e) => updateEducation(edu.id, { field: e.target.value })}
                                  className="bg-white"
                                  placeholder="Computer Science"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edu-location-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <Input
                                  id={`edu-location-${edu.id}`}
                                  value={edu.location}
                                  onChange={(e) => updateEducation(edu.id, { location: e.target.value })}
                                  className="bg-white"
                                  placeholder="City, Country"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edu-start-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <Input
                                  id={`edu-start-${edu.id}`}
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, { startDate: e.target.value })}
                                  className="bg-white"
                                  placeholder="Sep 2015"
                                />
                              </div>
                              <div>
                                <label htmlFor={`edu-end-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <Input
                                  id={`edu-end-${edu.id}`}
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, { endDate: e.target.value })}
                                  className="bg-white"
                                  placeholder="May 2019"
                                />
                              </div>
                              <div className="col-span-2">
                                <label htmlFor={`edu-gpa-${edu.id}`} className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                                <Input
                                  id={`edu-gpa-${edu.id}`}
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(edu.id, { gpa: e.target.value })}
                                  className="bg-white"
                                  placeholder="3.8/4.0"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Certifications */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('certifications')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Certifications</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addCertification();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.certifications ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.certifications && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.certifications.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No certifications added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      resumeData.certifications.map((cert, index) => (
                        <div key={cert.id} className="relative border-l-2 border-green-500 pl-8 pb-6">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-green-500 rounded-full"></div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Certification {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeCertification(cert.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`cert-name-${cert.id}`} className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
                                <Input
                                  id={`cert-name-${cert.id}`}
                                  value={cert.name}
                                  onChange={(e) => updateCertification(cert.id, { name: e.target.value })}
                                  className="bg-white"
                                  placeholder="AWS Certified Solutions Architect"
                                />
                              </div>
                              <div>
                                <label htmlFor={`cert-issuer-${cert.id}`} className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                                <Input
                                  id={`cert-issuer-${cert.id}`}
                                  value={cert.issuer}
                                  onChange={(e) => updateCertification(cert.id, { issuer: e.target.value })}
                                  className="bg-white"
                                  placeholder="Amazon Web Services"
                                />
                              </div>
                              <div>
                                <label htmlFor={`cert-date-${cert.id}`} className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <Input
                                  id={`cert-date-${cert.id}`}
                                  value={cert.date}
                                  onChange={(e) => updateCertification(cert.id, { date: e.target.value })}
                                  className="bg-white"
                                  placeholder="Mar 2024"
                                />
                              </div>
                              <div>
                                <label htmlFor={`cert-expiry-${cert.id}`} className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                                <Input
                                  id={`cert-expiry-${cert.id}`}
                                  value={cert.expiryDate}
                                  onChange={(e) => updateCertification(cert.id, { expiryDate: e.target.value })}
                                  className="bg-white"
                                  placeholder="Mar 2027"
                                />
                              </div>
                              <div className="col-span-2">
                                <label htmlFor={`cert-credential-${cert.id}`} className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                                <Input
                                  id={`cert-credential-${cert.id}`}
                                  value={cert.credentialId}
                                  onChange={(e) => updateCertification(cert.id, { credentialId: e.target.value })}
                                  className="bg-white"
                                  placeholder="ABC123DEF456"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Publications */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('publications')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Publications</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addPublication();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.publications ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.publications && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.publications.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No publications added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      resumeData.publications.map((pub, index) => (
                        <div key={pub.id} className="relative border-l-2 border-purple-500 pl-8 pb-6">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-purple-500 rounded-full"></div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Publication {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removePublication(pub.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label htmlFor={`pub-title-${pub.id}`} className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <Input
                                  id={`pub-title-${pub.id}`}
                                  value={pub.title}
                                  onChange={(e) => updatePublication(pub.id, { title: e.target.value })}
                                  className="bg-white"
                                  placeholder="Machine Learning Applications in Data Analysis"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor={`pub-journal-${pub.id}`} className="block text-sm font-medium text-gray-700 mb-1">Journal/Conference</label>
                                  <Input
                                    id={`pub-journal-${pub.id}`}
                                    value={pub.journal}
                                    onChange={(e) => updatePublication(pub.id, { journal: e.target.value })}
                                    className="bg-white"
                                    placeholder="Journal of Data Science"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`pub-date-${pub.id}`} className="block text-sm font-medium text-gray-700 mb-1">Publication Date</label>
                                  <Input
                                    id={`pub-date-${pub.id}`}
                                    value={pub.date}
                                    onChange={(e) => updatePublication(pub.id, { date: e.target.value })}
                                    className="bg-white"
                                    placeholder="Dec 2023"
                                  />
                                </div>
                              </div>
                              <div>
                                <label htmlFor={`pub-authors-${pub.id}`} className="block text-sm font-medium text-gray-700 mb-1">Authors</label>
                                <Input
                                  id={`pub-authors-${pub.id}`}
                                  value={pub.authors}
                                  onChange={(e) => updatePublication(pub.id, { authors: e.target.value })}
                                  className="bg-white"
                                  placeholder="Smith, J., Doe, M., Perry, M."
                                />
                              </div>
                              <div>
                                <label htmlFor={`pub-doi-${pub.id}`} className="block text-sm font-medium text-gray-700 mb-1">DOI (Optional)</label>
                                <Input
                                  id={`pub-doi-${pub.id}`}
                                  value={pub.doi}
                                  onChange={(e) => updatePublication(pub.id, { doi: e.target.value })}
                                  className="bg-white"
                                  placeholder="10.1000/xyz123"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Projects */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('projects')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Projects</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addProject();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.projects ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.projects && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.projects.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No projects added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      resumeData.projects.map((project, index) => (
                        <div key={project.id} className="relative border-l-2 border-indigo-500 pl-8 pb-6">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-indigo-500 rounded-full"></div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeProject(project.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label htmlFor={`project-name-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <Input
                                  id={`project-name-${project.id}`}
                                  value={project.name}
                                  onChange={(e) => updateProject(project.id, { name: e.target.value })}
                                  className="bg-white"
                                  placeholder="E-commerce Analytics Dashboard"
                                />
                              </div>
                              <div>
                                <label htmlFor={`project-description-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <Textarea
                                  id={`project-description-${project.id}`}
                                  value={project.description}
                                  onChange={(e) => updateProject(project.id, { description: e.target.value })}
                                  className="bg-white min-h-[80px]"
                                  placeholder="Built a real-time analytics dashboard for e-commerce data..."
                                />
                              </div>
                              <div>
                                <label htmlFor={`project-tech-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                                <Input
                                  id={`project-tech-${project.id}`}
                                  value={project.technologies}
                                  onChange={(e) => updateProject(project.id, { technologies: e.target.value })}
                                  className="bg-white"
                                  placeholder="React, Node.js, MongoDB, D3.js"
                                />
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label htmlFor={`project-start-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                  <Input
                                    id={`project-start-${project.id}`}
                                    value={project.startDate}
                                    onChange={(e) => updateProject(project.id, { startDate: e.target.value })}
                                    className="bg-white"
                                    placeholder="Jan 2024"
                                  />
                                </div>
                                <div>
                                  <label htmlFor={`project-end-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                  <Input
                                    id={`project-end-${project.id}`}
                                    value={project.endDate}
                                    onChange={(e) => updateProject(project.id, { endDate: e.target.value })}
                                    className="bg-white"
                                    placeholder="Mar 2024"
                                  />
                                </div>
                              </div>
                              <div>
                                <label htmlFor={`project-url-${project.id}`} className="block text-sm font-medium text-gray-700 mb-1">Project URL (Optional)</label>
                                <Input
                                  id={`project-url-${project.id}`}
                                  value={project.url}
                                  onChange={(e) => updateProject(project.id, { url: e.target.value })}
                                  className="bg-white"
                                  placeholder="https://github.com/username/project"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Volunteer Work */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('volunteer')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Volunteer Work</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addVolunteerWork();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.volunteer ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.volunteer && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.volunteerWork.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No volunteer work added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      resumeData.volunteerWork.map((volunteer, index) => (
                        <div key={volunteer.id} className="relative border-l-2 border-rose-500 pl-8 pb-6">
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-rose-500 rounded-full"></div>
                          
                          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Volunteer Work {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeVolunteerWork(volunteer.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label htmlFor={`volunteer-org-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
                                <Input
                                  id={`volunteer-org-${volunteer.id}`}
                                  value={volunteer.organization}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { organization: e.target.value })}
                                  className="bg-white"
                                  placeholder="Local Food Bank"
                                />
                              </div>
                              <div>
                                <label htmlFor={`volunteer-role-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <Input
                                  id={`volunteer-role-${volunteer.id}`}
                                  value={volunteer.role}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { role: e.target.value })}
                                  className="bg-white"
                                  placeholder="Data Coordinator"
                                />
                              </div>
                              <div>
                                <label htmlFor={`volunteer-start-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <Input
                                  id={`volunteer-start-${volunteer.id}`}
                                  value={volunteer.startDate}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { startDate: e.target.value })}
                                  className="bg-white"
                                  placeholder="Jan 2023"
                                />
                              </div>
                              <div>
                                <label htmlFor={`volunteer-end-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                <Input
                                  id={`volunteer-end-${volunteer.id}`}
                                  value={volunteer.endDate}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { endDate: e.target.value })}
                                  className="bg-white"
                                  placeholder="Present"
                                />
                              </div>
                              <div className="col-span-2">
                                <label htmlFor={`volunteer-location-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <Input
                                  id={`volunteer-location-${volunteer.id}`}
                                  value={volunteer.location}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { location: e.target.value })}
                                  className="bg-white"
                                  placeholder="Toronto, ON"
                                />
                              </div>
                              <div className="col-span-2">
                                <label htmlFor={`volunteer-description-${volunteer.id}`} className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <Textarea
                                  id={`volunteer-description-${volunteer.id}`}
                                  value={volunteer.description}
                                  onChange={(e) => updateVolunteerWork(volunteer.id, { description: e.target.value })}
                                  className="bg-white min-h-[80px]"
                                  placeholder="Managed inventory database and coordinated food distribution..."
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </Card>

              {/* Skills */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-[30px] overflow-hidden">
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50/50 transition-colors text-left"
                  onClick={() => toggleSection('skills')}
                >
                  <h3 className="text-2xl font-medium text-[#061a48]">Skills</h3>
                  <div className="flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        addSkill();
                      }}
                      className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                    {expandedSections.skills ? 
                      <ChevronUp className="w-6 h-6 text-gray-600" /> : 
                      <ChevronDown className="w-6 h-6 text-gray-600" />
                    }
                  </div>
                </button>
                
                {expandedSections.skills && (
                  <div className="px-6 pb-6 space-y-6">
                    {resumeData.skills.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        No skills added yet. Click "Add" to get started.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumeData.skills.map((skill, index) => (
                          <div key={skill.id} className="bg-gray-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">Skill {index + 1}</h4>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => removeSkill(skill.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              <div>
                                <label htmlFor={`skill-name-${skill.id}`} className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
                                <Input
                                  id={`skill-name-${skill.id}`}
                                  value={skill.name}
                                  onChange={(e) => updateSkill(skill.id, { name: e.target.value })}
                                  className="bg-white"
                                  placeholder="Python"
                                />
                              </div>
                              <div>
                                <label htmlFor={`skill-category-${skill.id}`} className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                  id={`skill-category-${skill.id}`}
                                  value={skill.category}
                                  onChange={(e) => updateSkill(skill.id, { category: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] focus:border-transparent bg-white"
                                >
                                  <option value="Technical">Technical</option>
                                  <option value="Programming">Programming</option>
                                  <option value="Data Analysis">Data Analysis</option>
                                  <option value="Soft Skills">Soft Skills</option>
                                  <option value="Languages">Languages</option>
                                  <option value="Tools">Tools</option>
                                  <option value="Other">Other</option>
                                </select>
                              </div>
                              <div>
                                <label htmlFor={`skill-level-${skill.id}`} className="block text-sm font-medium text-gray-700 mb-1">Proficiency Level</label>
                                <div className="space-y-2">
                                  <input
                                    id={`skill-level-${skill.id}`}
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={skill.level}
                                    onChange={(e) => updateSkill(skill.id, { level: Number.parseInt(e.target.value) })}
                                    className="w-full"
                                  />
                                  <div className="flex justify-between text-xs text-gray-500">
                                    <span>Beginner</span>
                                    <span>Intermediate</span>
                                    <span>Expert</span>
                                  </div>
                                  <p className="text-sm text-gray-600 text-center">
                                    Level: {skill.level}/5
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Right Sidebar - Import/Upload Panel */}
          <div className="w-full sm:w-96 bg-white/50 backdrop-blur-sm border-l border-gray-200 p-6">
            <div className="bg-white/80 rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-medium text-gray-900 mb-4">Upload/Import Resume</h3>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#ff6b35] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Drag & drop your resume here</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 10MB</p>
                </div>
                
                <div className="flex gap-2">
                  <Button className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload File
                  </Button>
                  <Button variant="outline" className="px-3">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Download as PDF
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Eye className="w-4 h-4 mr-2" />
                      Preview Resume
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Edit3 className="w-4 h-4 mr-2" />
                      AI Optimize
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}