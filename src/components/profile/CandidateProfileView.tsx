import { Key, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import {
  ArrowLeft,
  MessageCircle,
  Calendar,
  Send,
  Download,
  MapPin,
  Clock,
  Mail,
  Phone,
  Globe,
  Award,
  Code,
  Crown,
  CheckCircle,
  ExternalLink,
  Zap,
  Loader2
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  fetchPublicCandidateProfile,
  startChatWithCandidate,
  scheduleCoffeeChat,
  sendJobConsideration,
  mapWorkHistory,
  mapEducation,
  mapProjects,
  mapCertifications,
  type ProfileExperience,
  type ProfileEducation,
  type ProfileProject,
  type ProfileCertification,
  type ProfileAchievement,
  type ProfileTechnology,
} from '../../api/candidatePublicProfile';

type Experience = ProfileExperience;
type Education = ProfileEducation;
type Project = ProfileProject;
type Certification = ProfileCertification;
type Achievement = ProfileAchievement;
type Technology = ProfileTechnology;

interface Skill {
  name: string;
  level: number;
}

interface CandidateProfileViewProps {
  user?: any;
  availableJobs?: any[];
}

function buildEnhancedCandidate(candidate: any) {
  const rawWorkHistory = candidate.work_history || [];
  const rawEducation = candidate.education || [];
  const rawProjects = candidate.projects || [];
  const rawCertifications = candidate.certifications || [];

  const avatar = (() => {
    const raw = candidate.avatar || candidate.profile_image || '';
    if (!raw) return '';
    return raw.startsWith('http') ? raw : `${import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '')}${raw}`;
  })();

  const skills = candidate.skills
    ? Array.isArray(candidate.skills)
      ? candidate.skills.map((skill: string) => ({ name: skill.trim(), level: 80 }))
      : candidate.skills.split(',').map((skill: string) => ({ name: skill.trim(), level: 80 }))
    : [];

  return {
    ...candidate,
    name: candidate.name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    title: candidate.job_title || candidate.title || '',
    company: candidate.current_company || candidate.company || '',
    location: candidate.address || candidate.location || '',
    avatar,
    experience: candidate.experience || candidate.exp_level || '',
    matchScore: candidate.matchScore ?? 0,
    linkedin: candidate.linkedin || '',
    github: candidate.github || '',
    portfolio: candidate.portfolio || '',
    website: candidate.website || '',
    resumeUrl: candidate.resume_url || '',
    summary: candidate.bio || candidate.summary || '',
    detailedExperience: Array.isArray(rawWorkHistory) && rawWorkHistory.length > 0 ? mapWorkHistory(rawWorkHistory) : [],
    education: Array.isArray(rawEducation) && rawEducation.length > 0 ? mapEducation(rawEducation) : [],
    projects: Array.isArray(rawProjects) && rawProjects.length > 0 ? mapProjects(rawProjects) : [],
    skillCategories: { Skills: skills },
    certifications: Array.isArray(rawCertifications) && rawCertifications.length > 0 ? mapCertifications(rawCertifications) : [],
    queueMetrics: candidate.queueMetrics || null,
    premiumStatus: candidate.premiumStatus || { isPremium: false }
  };
}

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ff6b35] rounded-full animate-spin mx-auto mb-4" />
        <h2 className="text-xl text-gray-900">Loading profile...</h2>
      </div>
    </div>
  );
}

function ErrorScreen({ error, onBack }: Readonly<{ error: string | null; onBack: () => void }>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl text-gray-900 mb-2">Profile Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'Unable to load candidate profile.'}</p>
        <button onClick={onBack} className="px-4 py-2 bg-[#ff6b35] text-white rounded-md hover:bg-[#e55a2b]">
          Go Back
        </button>
      </div>
    </div>
  );
}

function ScheduleChatDialog({
  open,
  onOpenChange,
  scheduleData,
  onScheduleDataChange,
  onSubmit,
  candidateName,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleData: any;
  onScheduleDataChange: (data: any) => void;
  onSubmit: () => void;
  candidateName: string;
}>) {
  const today = new Date().toISOString().split('T')[0];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Calendar className="w-4 h-4 mr-2" />
          Schedule Call
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Chat with {candidateName}</DialogTitle>
          <DialogDescription>Choose a date and time to schedule a chat with this candidate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <input type="date" value={scheduleData.date} onChange={(e) => onScheduleDataChange({ ...scheduleData, date: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" min={today} />
            </div>
            <div>
              <Label>Time</Label>
              <input type="time" value={scheduleData.time} onChange={(e) => onScheduleDataChange({ ...scheduleData, time: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Duration</Label>
              <Select value={scheduleData.duration} onValueChange={(value: any) => onScheduleDataChange({ ...scheduleData, duration: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={scheduleData.type} onValueChange={(value: any) => onScheduleDataChange({ ...scheduleData, type: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In Person</SelectItem>
                  <SelectItem value="chat">Text Chat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {scheduleData.type === 'in-person' && (
            <div>
              <Label>Location</Label>
              <Input placeholder="Enter meeting location..." value={scheduleData.location} onChange={(e) => onScheduleDataChange({ ...scheduleData, location: e.target.value })} />
            </div>
          )}
          {scheduleData.type === 'video' && (
            <div className="space-y-4">
              <div>
                <Label>Meeting Platform</Label>
                <Select value={scheduleData.meetingPlatform} onValueChange={(value: any) => onScheduleDataChange({ ...scheduleData, meetingPlatform: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zoom">Zoom</SelectItem>
                    <SelectItem value="teams">Microsoft Teams</SelectItem>
                    <SelectItem value="meet">Google Meet</SelectItem>
                    <SelectItem value="webex">Cisco Webex</SelectItem>
                    <SelectItem value="custom">Custom Link</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Meeting Link</Label>
                <Input placeholder="https://..." value={scheduleData.meetingLink} onChange={(e) => onScheduleDataChange({ ...scheduleData, meetingLink: e.target.value })} />
              </div>
            </div>
          )}
          <div>
            <Label>Message (Optional)</Label>
            <Textarea placeholder="Add a message about the chat purpose..." value={scheduleData.message} onChange={(e) => onScheduleDataChange({ ...scheduleData, message: e.target.value })} rows={3} />
          </div>
          <Button onClick={onSubmit} className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white" disabled={!scheduleData.date || !scheduleData.time}>
            Schedule Chat
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ConsiderationDialog({
  open,
  onOpenChange,
  selectedJob,
  onSelectedJobChange,
  considerationMessage,
  onConsiderationMessageChange,
  onSubmit,
  availableJobs,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedJob: string;
  onSelectedJobChange: (job: string) => void;
  considerationMessage: string;
  onConsiderationMessageChange: (msg: string) => void;
  onSubmit: () => void;
  availableJobs: any[];
}>) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
          <Send className="w-4 h-4 mr-2" />
          Send Consideration
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Job Consideration</DialogTitle>
          <DialogDescription>Send a personalized job consideration request to this candidate.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Select Job Position</Label>
            <Select value={selectedJob} onValueChange={onSelectedJobChange}>
              <SelectTrigger><SelectValue placeholder="Choose a job position..." /></SelectTrigger>
              <SelectContent>
                {availableJobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>{job.title} - {job.department}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Personal Message</Label>
            <Textarea
              placeholder="Hi [Name], I came across your profile and believe you'd be a great fit for our [Position] role. I'd love to discuss this opportunity with you..."
              value={considerationMessage}
              onChange={(e) => onConsiderationMessageChange(e.target.value)}
              rows={5}
            />
          </div>
          <Button onClick={onSubmit} className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white" disabled={!selectedJob || !considerationMessage.trim()}>
            Send Consideration Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ContactInfoCard({ email, phone, website, linkedin }: Readonly<{ email: string; phone: string; website: string; linkedin: string }>) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-medium mb-4">Contact Information</h3>
      <div className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Mail className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm break-all">{email}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Phone className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm break-all">{phone}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Globe className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-blue-600 break-all">{website}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ExternalLink className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="text-sm text-blue-600 break-all">{linkedin}</span>
        </div>
      </div>
    </Card>
  );
}

export function CandidateProfileView({
  user,
  availableJobs = []
}: Readonly<CandidateProfileViewProps>) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    candidate?: any;
    viewerRole?: 'job-seeker' | 'recruiter';
  } | undefined;

  const numericId = Number(id);
  const viewerRole = user?.role || state?.viewerRole || 'job-seeker';
  const canStartChat = viewerRole === 'recruiter' || (viewerRole === 'job-seeker' && !!user?.isPremium);

  const [candidate, setCandidate] = useState<any>(state?.candidate ?? null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  const [showConsiderationDialog, setShowConsiderationDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [considerationMessage, setConsiderationMessage] = useState('');
  const [selectedJob, setSelectedJob] = useState('');
  const [scheduleData, setScheduleData] = useState({
    date: '',
    time: '',
    duration: '30',
    type: 'video',
    message: '',
    location: '',
    meetingLink: '',
    meetingPlatform: 'zoom'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (Number.isNaN(numericId)) {
        setError('Invalid candidate ID');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchPublicCandidateProfile(numericId);
        if (result.success && result.data) {
          setCandidate(result.data);
        } else {
          setError(result.error || 'Candidate profile not found');
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load candidate profile');
      } finally {
        setIsLoading(false);
      }
    };

    void fetchProfile();
  }, [numericId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleStartChat = async () => {
    try {
      if (Number.isNaN(numericId)) {
        alert('Invalid user ID');
        return;
      }
      const result = await startChatWithCandidate(numericId);
      if (result.conversation_id) {
        navigate(`/messages?conversation=${result.conversation_id}`);
      } else {
        navigate('/messages');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to start chat');
    }
  };

  const handleDownloadResume = async () => {
    if (!enhancedCandidate.resumeUrl) return;
    setIsDownloadingResume(true);
    try {
      const response = await fetch(enhancedCandidate.resumeUrl);
      if (!response.ok) {
        throw new Error('Failed to download resume');
      }
      const blob = await response.blob();
      const url = globalThis.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${enhancedCandidate.name.replace(/\s+/g, '_')}_resume.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      globalThis.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err?.message || 'Failed to download resume');
    } finally {
      setIsDownloadingResume(false);
    }
  };

  const enhancedCandidate = buildEnhancedCandidate(candidate);

  const handleSendConsideration = async () => {
    if (selectedJob && considerationMessage.trim()) {
      try {
        const job = Number(selectedJob);
        if (Number.isNaN(numericId) || Number.isNaN(job)) {
          alert('Invalid candidate or job ID');
          return;
        }
        await sendJobConsideration({
          candidateId: numericId,
          jobId: job,
          message: considerationMessage,
        });
        alert('Consideration request sent!');
        setShowConsiderationDialog(false);
        setConsiderationMessage('');
        setSelectedJob('');
      } catch (err: any) {
        alert(err?.message || 'Failed to send consideration request');
      }
    }
  };

  const handleScheduleChat = async () => {
    if (scheduleData.date && scheduleData.time) {
      try {
        if (Number.isNaN(numericId)) {
          alert('Invalid recipient ID');
          return;
        }
        await scheduleCoffeeChat({
          recipientId: numericId,
          message: scheduleData.message || '',
          meeting_type: scheduleData.type === 'in-person' ? 'in-person' : 'virtual',
          preferred_date: scheduleData.date,
          preferred_time: scheduleData.time,
          duration: String(scheduleData.duration),
          location: scheduleData.type === 'in-person' ? scheduleData.location : undefined,
          meeting_platform: scheduleData.meetingPlatform || 'zoom',
          custom_platform_link: scheduleData.meetingLink || undefined,
        });
        alert('Chat request sent successfully!');
        setShowScheduleDialog(false);
        setScheduleData({
          date: '',
          time: '',
          duration: '30',
          type: 'video',
          message: '',
          location: '',
          meetingLink: '',
          meetingPlatform: 'zoom'
        });
      } catch (err: any) {
        alert(err?.message || 'Failed to send chat request');
      }
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (error || !candidate) return <ErrorScreen error={error} onBack={handleBack} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-gray-600 hover:text-[#ff6b35] self-start"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Candidates
          </Button>

          {viewerRole === 'recruiter' && (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white disabled:opacity-60"
                disabled={!enhancedCandidate.resumeUrl || isDownloadingResume}
                onClick={handleDownloadResume}
              >
                {isDownloadingResume ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isDownloadingResume ? 'Downloading...' : enhancedCandidate.resumeUrl ? 'Download Resume' : 'No Resume'}
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    {enhancedCandidate.avatar && (
                      <AvatarImage src={enhancedCandidate.avatar} alt={enhancedCandidate.name} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-[#ff6b35] text-white text-2xl">
                      {enhancedCandidate.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  {enhancedCandidate.premiumStatus?.isPremium && (
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <Crown className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl text-gray-900 mb-2">{enhancedCandidate.name}</h1>
                <p className="text-lg text-gray-600 mb-2">{enhancedCandidate.title}</p>
                <p className="text-gray-500 mb-4">{enhancedCandidate.company}</p>
                
                {enhancedCandidate.premiumStatus?.isPremium && (
                  <Badge className="bg-yellow-100 text-yellow-800 mb-4">
                    <Crown className="w-3 h-3 mr-1" />
                    {enhancedCandidate.premiumStatus.tier} Member
                  </Badge>
                )}
                
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {enhancedCandidate.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {enhancedCandidate.experience}
                  </div>
                </div>

                <div className="text-right mb-4">
                  <div className="text-3xl font-semibold text-[#ff6b35] mb-1">
                    {enhancedCandidate.matchScore}%
                  </div>
                  <div className="text-sm text-gray-500">Match Score</div>
                  <Progress value={enhancedCandidate.matchScore} className="w-full h-2 mt-2" />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                {canStartChat && (
                  <Button
                    onClick={handleStartChat}
                    className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat
                  </Button>
                )}

                <ScheduleChatDialog
                  open={showScheduleDialog}
                  onOpenChange={setShowScheduleDialog}
                  scheduleData={scheduleData}
                  onScheduleDataChange={setScheduleData}
                  onSubmit={handleScheduleChat}
                  candidateName={enhancedCandidate.name}
                />
                {viewerRole === 'recruiter' && (
                  <ConsiderationDialog
                    open={showConsiderationDialog}
                    onOpenChange={setShowConsiderationDialog}
                    selectedJob={selectedJob}
                    onSelectedJobChange={setSelectedJob}
                    considerationMessage={considerationMessage}
                    onConsiderationMessageChange={setConsiderationMessage}
                    onSubmit={handleSendConsideration}
                    availableJobs={availableJobs}
                  />
                )}
              </div>
            </Card>

            <ContactInfoCard
              email={enhancedCandidate.email}
              phone={enhancedCandidate.phone}
              website={enhancedCandidate.website}
              linkedin={enhancedCandidate.linkedin}
            />

            {enhancedCandidate.queueMetrics && (
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#ff6b35]" />
                  theGarage Metrics
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Response Rate</span>
                      <span className="text-sm font-medium">{enhancedCandidate.queueMetrics.responseRate}%</span>
                    </div>
                    <Progress value={enhancedCandidate.queueMetrics.responseRate} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Interview Rate</span>
                      <span className="text-sm font-medium">{enhancedCandidate.queueMetrics.interviewRate}%</span>
                    </div>
                    <Progress value={enhancedCandidate.queueMetrics.interviewRate} className="h-2" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <div className="text-lg font-medium text-blue-700">{enhancedCandidate.queueMetrics.totalApplications}</div>
                      <div className="text-xs text-blue-600">Applications</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <div className="text-lg font-medium text-green-700">{enhancedCandidate.queueMetrics.successfulPlacements}</div>
                      <div className="text-xs text-green-600">Placements</div>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Professional Summary */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Professional Summary</h3>
              {enhancedCandidate.summary ? (
                <p className="text-gray-700 leading-relaxed">{enhancedCandidate.summary}</p>
              ) : (
                <p className="text-gray-500 text-sm">No professional summary provided.</p>
              )}
            </Card>

            {/* Experience */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-6">Work Experience</h3>
              <div className="space-y-6">
                {Array.isArray(enhancedCandidate.detailedExperience) && enhancedCandidate.detailedExperience.filter((exp: any): exp is Experience => exp).map((exp: Experience, index: Key | null | undefined) => (
                  <div key={`${exp.company}-${exp.title}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="min-w-0">
                        <h4 className="font-medium text-gray-900">{exp.title}</h4>
                        <p className="text-[#ff6b35] font-medium">{exp.company}</p>
                        <p className="text-sm text-gray-600">{exp.location} • {exp.duration}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-3">{exp.description}</p>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Key Achievements:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {Array.isArray(exp.achievements) && exp.achievements.map((achievement: Achievement) => (
                          <li key={achievement.name} className="text-sm text-gray-700">{achievement.name}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(exp.technologies) && exp.technologies.map((tech: Technology) => (
                        <Badge key={tech.name} variant="secondary" className="text-xs">
                          {tech.name}
                        </Badge>
                      ))}
                    </div>
                    
                    {(index as number) < enhancedCandidate.detailedExperience.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
                {enhancedCandidate.detailedExperience.length === 0 && (
                  <p className="text-gray-500 text-sm">No work experience listed.</p>
                )}
              </div>
            </Card>

            {/* Skills */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Code className="w-5 h-5 text-[#ff6b35]" />
                <h3 className="text-lg font-medium text-gray-900">Technical Skills</h3>
                <Badge variant="outline" className="text-xs">
                  {enhancedCandidate.skillCategories['Skills']?.length ?? 0} skill{enhancedCandidate.skillCategories['Skills']?.length === 1 ? '' : 's'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {enhancedCandidate.skillCategories['Skills']?.map((skill: Skill) => (
                  <span
                    key={skill.name}
                    className="px-3 py-1.5 bg-gray-100 text-gray-900 rounded-full text-sm border border-gray-200"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
              {(!enhancedCandidate.skillCategories['Skills'] || enhancedCandidate.skillCategories['Skills'].length === 0) && (
                <p className="text-gray-500 text-sm">No skills listed.</p>
              )}
            </Card>

            {/* Education */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-6">Education</h3>
              {Array.isArray(enhancedCandidate.education) && enhancedCandidate.education.map((edu: Education) => (
                <div key={`${edu.degree}-${edu.school}`} className="mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-900">{edu.degree}</h4>
                      <p className="text-[#ff6b35] font-medium">{edu.school}</p>
                      <p className="text-sm text-gray-600">{edu.location} • {edu.graduation}</p>
                    </div>
                    <Badge variant="secondary" className="self-start">GPA: {edu.gpa}</Badge>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-600">Relevant Coursework: </span>
                    <span className="text-sm text-gray-700">{Array.isArray(edu.relevant) ? edu.relevant.join(', ') : edu.relevant}</span>
                  </div>
                </div>
              ))}
              {enhancedCandidate.education.length === 0 && (
                <p className="text-gray-500 text-sm">No education listed.</p>
              )}
            </Card>

            {/* Projects */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-6">Projects</h3>
              <div className="space-y-4">
                {Array.isArray(enhancedCandidate.projects) && enhancedCandidate.projects.map((project: Project) => (
                  <div key={project.name} className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 min-w-0">{project.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.github && (
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <Code className="w-3 h-3" />
                          </Button>
                        )}
                        {project.live && (
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{project.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(project.technologies) && project.technologies.map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
                {enhancedCandidate.projects.length === 0 && (
                  <p className="text-gray-500 text-sm">No projects listed.</p>
                )}
              </div>
            </Card>

            {/* Certifications */}
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-6">Certifications</h3>
              <div className="space-y-4">
                {Array.isArray(enhancedCandidate.certifications) && enhancedCandidate.certifications.map((cert: Certification) => (
                  <div key={cert.credentialId} className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                    <Award className="w-8 h-8 text-green-600" />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <p className="text-sm text-gray-600">{cert.issuer} • {cert.date}</p>
                      <p className="text-xs text-gray-500">ID: {cert.credentialId}</p>
                    </div>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                ))}
                {enhancedCandidate.certifications.length === 0 && (
                  <p className="text-gray-500 text-sm">No certifications listed.</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}