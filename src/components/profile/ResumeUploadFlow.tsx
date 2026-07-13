import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Upload, X, AlertCircle, CheckCircle, Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface ResumeUploadFlowProps {
  onComplete: (resumeData: any) => void;
  onSkip: () => void;
  userEmail: string;
  userName: string;
}

export function ResumeUploadFlow({ onComplete, onSkip, userName }: Readonly<ResumeUploadFlowProps>) {
  const [step, setStep] = useState<'upload' | 'review'>('upload');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [extractedData, setExtractedData] = useState<any>(null);

  // Mock parsed resume data structure
  const [profileData, setProfileData] = useState({
    jobTitle: '',
    experience: '',
    location: '',
    bio: '',
    skills: [] as string[],
    education: [] as Array<{
      degree: string;
      institution: string;
      year: string;
    }>,
    workExperience: [] as Array<{
      title: string;
      company: string;
      duration: string;
      description: string;
    }>
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setResumeFile(file);
    setError('');
    setIsProcessing(true);

    // Mock AI processing of resume
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock extracted data - in real app, this would come from AI parsing service
      const mockExtractedData = {
        jobTitle: 'Senior Software Engineer',
        experience: 'senior',
        location: 'San Francisco, CA',
        bio: 'Experienced software engineer with 8+ years in full-stack development. Passionate about building scalable applications and leading high-performing teams. Strong background in cloud architecture and agile methodologies.',
        skills: ['JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'PostgreSQL', 'Machine Learning'],
        education: [
          {
            degree: 'Master of Science in Computer Science',
            institution: 'Stanford University',
            year: '2016'
          },
          {
            degree: 'Bachelor of Science in Computer Engineering',
            institution: 'UC Berkeley',
            year: '2014'
          }
        ],
        workExperience: [
          {
            title: 'Senior Software Engineer',
            company: 'TechCorp Solutions',
            duration: '2020 - Present',
            description: 'Lead development of microservices architecture serving 1M+ users. Managed team of 5 engineers and improved system performance by 40%.'
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            duration: '2017 - 2020',
            description: 'Built full-stack web applications using React, Node.js, and PostgreSQL. Implemented CI/CD pipelines and reduced deployment time by 60%.'
          },
          {
            title: 'Junior Developer',
            company: 'DevCompany Inc',
            duration: '2016 - 2017',
            description: 'Developed responsive web interfaces and RESTful APIs. Collaborated with design team to implement pixel-perfect UIs.'
          }
        ]
      };

      setExtractedData(mockExtractedData);
      setProfileData(mockExtractedData);
      setStep('review');
    } catch (error) {
      console.error('Error processing resume:', error);
      setError('Failed to process resume. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDataChange = (field: string, value: any) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSkillsChange = (skillsString: string) => {
    const skillsArray = skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
    setProfileData(prev => ({
      ...prev,
      skills: skillsArray
    }));
  };

  const handleConfirm = () => {
    onComplete({
      resumeFile,
      extractedData,
      profileData
    });
  };

  if (step === 'upload') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-[95vw] sm:max-w-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">Welcome, {userName}!</h2>
            <p className="text-gray-500">
              Let's set up your profile with AI-powered resume parsing
            </p>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Your Resume</h3>
                <p className="text-gray-500">
                  Our AI will automatically extract and organize your professional information
                </p>
              </div>

              {/* Upload Area */}
              <div className="space-y-4">
                <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                  isProcessing 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300 hover:border-[#ff6b35] hover:bg-orange-50'
                }`}>
                  <input
                    type="file"
                    id="resume"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isProcessing}
                  />
                  
                  {isProcessing ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900">Processing your resume...</p>
                        <p className="text-sm text-blue-600">AI is extracting your professional information</p>
                      </div>
                    </div>
                  ) : resumeFile ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-green-900">{resumeFile.name}</p>
                        <p className="text-sm text-green-600">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB • Ready to process
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setResumeFile(null);
                          setError('');
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="resume" className="cursor-pointer" aria-label="Upload resume">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Upload className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Click to upload your resume</p>
                          <p className="text-sm text-gray-500">PDF, DOC, or DOCX (max 10MB)</p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Benefits */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium text-blue-900 mb-1">AI-Powered</h4>
                    <p className="text-xs text-blue-600">Smart extraction of key information</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium text-green-900 mb-1">Accurate</h4>
                    <p className="text-xs text-green-600">Review and edit before saving</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <ArrowRight className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium text-purple-900 mb-1">Fast Setup</h4>
                    <p className="text-xs text-purple-600">Get started in minutes</p>
                  </div>
                </div>

                {/* Skip Option */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Don't have a resume ready?{' '}
                    <button
                      onClick={onSkip}
                      className="text-[#ff6b35] hover:text-[#e55a2b] font-medium transition-colors"
                    >
                      Set up profile manually
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-medium">
                <span className="text-gray-900">the</span>
                <span className="text-[#ff6b35]">Garage</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">Review Your Profile</h2>
            <p className="text-gray-500">
              We've extracted this information from your resume. Review and edit as needed.
            </p>
          </div>

          <Card className="p-8 shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <div className="space-y-6">
              {/* Current Job Title */}
              <div className="space-y-2">
                <Label htmlFor="jobTitle">Current Job Title</Label>
                <Input
                  id="jobTitle"
                  placeholder="e.g. Senior Software Engineer"
                  value={profileData.jobTitle}
                  onChange={(e) => handleDataChange('jobTitle', e.target.value)}
                  className="h-12 border-2 border-gray-200"
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label>Experience Level</Label>
                <Select value={profileData.experience} onValueChange={(value: any) => handleDataChange('experience', value)}>
                  <SelectTrigger className="h-12 border-2 border-gray-200">
                    <SelectValue placeholder="Select experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                    <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g. San Francisco, CA"
                  value={profileData.location}
                  onChange={(e) => handleDataChange('location', e.target.value)}
                  className="h-12 border-2 border-gray-200"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Brief description of your professional background..."
                  value={profileData.bio}
                  onChange={(e) => handleDataChange('bio', e.target.value)}
                  className="border-2 border-gray-200 min-h-[120px]"
                  maxLength={500}
                />
                <div className="text-right text-sm text-gray-500">
                  {profileData.bio.length}/500 characters
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-2">
                <Label htmlFor="skills">Key Skills</Label>
                <Input
                  id="skills"
                  placeholder="e.g. Python, React, AWS, Machine Learning"
                  value={profileData.skills.join(', ')}
                  onChange={(e) => handleSkillsChange(e.target.value)}
                  className="h-12 border-2 border-gray-200"
                />
                <p className="text-sm text-gray-500">Separate skills with commas</p>
              </div>

              {/* Work Experience Preview */}
              {profileData.workExperience.length > 0 && (
                <div className="space-y-2">
                  <Label>Work Experience (Preview)</Label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {profileData.workExperience.map((exp) => (
                      <div key={`${exp.title}-${exp.company}`} className="mb-3 last:mb-0">
                        <h4 className="font-medium text-gray-900">{exp.title} at {exp.company}</h4>
                        <p className="text-sm text-gray-600">{exp.duration}</p>
                        <p className="text-sm text-gray-700 mt-1">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Preview */}
              {profileData.education.length > 0 && (
                <div className="space-y-2">
                  <Label>Education (Preview)</Label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {profileData.education.map((edu) => (
                      <div key={`${edu.degree}-${edu.institution}`} className="mb-2 last:mb-0">
                        <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                        <p className="text-sm text-gray-600">{edu.institution} • {edu.year}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-4 pt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('upload')}
                  className="px-6 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Upload
                </Button>

                <Button
                  onClick={handleConfirm}
                  className="px-8 w-full sm:w-auto bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
                >
                  Confirm & Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}