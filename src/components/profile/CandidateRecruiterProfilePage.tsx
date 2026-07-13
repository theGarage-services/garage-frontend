import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { recruiterProfileService, buildProfileImageUrl } from '../../api/recruiterProfile';
import { initChatFromProfile } from '../../api/chat';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import {
  ArrowLeft,
  MessageCircle,
  MapPin,
  Mail,
  Globe,
  Briefcase,
  Loader2,
  User,
  Building2,
} from 'lucide-react';
import { AiOutlineLinkedin } from 'react-icons/ai';

interface CandidateRecruiterProfilePageProps {
  recruiterId?: number;
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

interface RecruiterProfile {
  name: string;
  title: string;
  company: string | null;
  avatar: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  email: string | null;
}

function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4" />
          <h2 className="text-xl text-gray-900 mb-2">Loading recruiter profile</h2>
          <p className="text-gray-600">Fetching profile details from the backend.</p>
        </div>
      </div>
    </div>
  );
}

function ProfileError({ onBack, errorMessage }: Readonly<{ onBack: () => void; errorMessage: string | null }>) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-[#ff6b35]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <User className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl text-gray-900 mb-2">Unable to load recruiter profile</h2>
          <p className="text-gray-600 mb-4">
            {errorMessage || 'Recruiter profile not found or unavailable.'}
          </p>
          <Button onClick={() => globalThis.location.reload()} className="bg-[#ff6b35] text-white">
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CandidateRecruiterProfilePage({
  recruiterId: propRecruiterId,
  onBack,
  onNavigate,
}: Readonly<CandidateRecruiterProfilePageProps>) {
  const { id: routeId } = useParams<{ id: string }>();
  const recruiterId = propRecruiterId ?? (routeId ? Number(routeId) : undefined);

  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStartingChat, setIsStartingChat] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!recruiterId || Number.isNaN(recruiterId)) {
        setErrorMessage('Invalid recruiter ID');
        return;
      }
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const data = await recruiterProfileService.getPublicProfile(recruiterId);
        if (data) {
          setProfile(data);
        } else {
          setErrorMessage('Recruiter profile not found');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Failed to load recruiter profile');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchProfile();
  }, [recruiterId]);

  const handleStartChat = async () => {
    if (!recruiterId) return;
    setIsStartingChat(true);
    try {
      await initChatFromProfile(recruiterId);
      onNavigate?.('chat');
    } catch (err: any) {
      globalThis.alert(err?.message || 'Failed to start chat');
    } finally {
      setIsStartingChat(false);
    }
  };

  if (isLoading) {
    return <ProfileLoading />;
  }

  if (!profile) {
    return <ProfileError onBack={onBack} errorMessage={errorMessage} />;
  }

  const avatarUrl = buildProfileImageUrl(profile.avatar);
  const initials = profile.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <Button variant="ghost" onClick={onBack} className="text-gray-600 hover:text-[#ff6b35] self-start">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="h-6 w-px bg-gray-300 hidden sm:block" />
            <div>
              <h1 className="text-2xl text-gray-900">{profile.name}</h1>
              <p className="text-gray-600">
                {profile.title}
                {profile.company ? ` at ${profile.company}` : ''}
              </p>
            </div>
          </div>
          <Badge className="bg-orange-100 text-orange-800 self-start sm:self-auto">Recruiter</Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    {avatarUrl && (
                      <AvatarImage src={avatarUrl} alt={profile.name} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-[#ff6b35] text-white text-2xl">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-xl text-gray-900 mb-1">{profile.name}</h2>
                <p className="text-gray-600 mb-2">{profile.title}</p>
                {profile.company && (
                  <p className="text-sm text-gray-500 mb-4">{profile.company}</p>
                )}
                {profile.location && (
                  <div className="flex items-center justify-center gap-1 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  onClick={handleStartChat}
                  disabled={isStartingChat}
                >
                  {isStartingChat ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="w-4 h-4 mr-2" />
                  )}
                  {isStartingChat ? 'Starting Chat...' : 'Start Chat'}
                </Button>
              </div>
            </Card>

            {/* Contact Information */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {profile.email && (
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3 flex-wrap group">
                    <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-600 group-hover:text-[#ff6b35] break-all">{profile.email}</span>
                  </a>
                )}
                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-wrap group"
                  >
                    <AiOutlineLinkedin className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="text-sm text-blue-600 group-hover:underline break-all">LinkedIn Profile</span>
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 flex-wrap group"
                  >
                    <Globe className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm text-green-600 group-hover:underline break-all">Website</span>
                  </a>
                )}
              </div>
            </Card>

            {/* Company Info */}
            {profile.company && (
              <Card className="p-6">
                <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#ff6b35]" />
                  Company
                </h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-[#ff6b35]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{profile.company}</p>
                    {profile.location && (
                      <p className="text-sm text-gray-500">{profile.location}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* About / Bio */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">About</h3>
              {profile.bio ? (
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
              ) : (
                <p className="text-gray-400 italic">No bio available.</p>
              )}
            </Card>

            {/* Recruiter Overview */}
            <Card className="p-6">
              <h3 className="text-lg text-gray-900 mb-4">Recruiter Overview</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Role</div>
                  <div className="font-medium text-gray-900">{profile.title}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Company</div>
                  <div className="font-medium text-gray-900">{profile.company || 'Independent'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Location</div>
                  <div className="font-medium text-gray-900">{profile.location || 'Not specified'}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-500 mb-1">Email</div>
                  <div className="font-medium text-gray-900 truncate">{profile.email || 'Not shared'}</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
