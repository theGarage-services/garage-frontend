import { Card } from '../../ui/card';

const formatMatchScore = (score: number | undefined | null): string => {
  if (score == null || Number.isNaN(score)) return '0';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Button } from '../../ui/button';
import { Calendar, Clock, Eye, Mail, Phone, Bookmark, Loader2, MessageSquare, FileDown } from 'lucide-react';
import { useCandidateActions } from '../../recruiter/CandidateProfile/useCandidateActions';
import { FlagFraudDialog } from '../../common/FlagFraudDialog';
import { flagCandidateProfileAsFraud } from '../../../api/fraud';

interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  avatar: string | null;
  status: string;
  appliedDate: string;
  lastUpdated: string;
  source: string;
  matchScore: number;
  email: string;
  phone: string;
}

interface CandidateCardProps {
  candidate: Candidate;
  getStatusBadge: (status: string) => React.ReactNode;
  getDaysAgo: (dateString: string) => string;
  onViewProfile?: (candidate: Candidate) => void;
  onSendMessage?: (candidate: Candidate) => void;
  onScheduleInterview?: (candidate: Candidate) => void;
  jobId?: string;
  initialIsSaved?: boolean;
}

export function CandidateCard({
  candidate,
  getStatusBadge,
  getDaysAgo,
  onViewProfile,
  onSendMessage,
  onScheduleInterview,
  jobId,
  initialIsSaved
}: Readonly<CandidateCardProps>) {
  const {
    isSaved,
    isTogglingSave,
    isDownloadingResume,
    handleToggleSave,
    handleDownloadResume
  } = useCandidateActions(candidate.id, candidate.name, jobId, initialIsSaved ?? false);

  const handleFlagFraud = async (reason: string) => {
    await flagCandidateProfileAsFraud(candidate.id, reason);
  };
  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback className="bg-orange-100 text-orange-700">
              {candidate.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-lg text-gray-900 mb-1">{candidate.name}</h3>
            <p className="text-gray-600 mb-2">{candidate.title}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                📍 {candidate.location}
              </span>
              <span className="flex items-center gap-1">
                💼 {candidate.experience}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Applied {getDaysAgo(candidate.appliedDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated {getDaysAgo(candidate.lastUpdated)}
              </span>
            </div>
          </div>
        </div>

        <div className="text-right">
          {getStatusBadge(candidate.status)}
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {candidate.source}
            </Badge>
          </div>
          {candidate.matchScore !== undefined && candidate.matchScore !== null && (
            <div className="mt-2 text-xs text-gray-500">
              Match: {formatMatchScore(candidate.matchScore)}%
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Mail className="w-4 h-4" />
            {candidate.email}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="w-4 h-4" />
            {candidate.phone}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSendMessage?.(candidate)}
            className="border-blue-300 text-blue-600 hover:bg-blue-50"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onScheduleInterview?.(candidate)}
            className="border-purple-300 text-purple-600 hover:bg-purple-50"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownloadResume}
            disabled={isDownloadingResume}
            className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-60"
          >
            {isDownloadingResume ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4 mr-2" />
            )}
            {isDownloadingResume ? 'Downloading...' : 'Resume'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleToggleSave}
            disabled={isTogglingSave}
            className={`disabled:opacity-60 ${
              isSaved
                ? 'bg-green-100 text-green-600 border-green-600 hover:bg-green-200'
                : 'border-green-600 text-green-600 hover:bg-green-50'
            }`}
          >
            {isTogglingSave ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Bookmark className="w-4 h-4 mr-2" />
            )}
            {isTogglingSave ? 'Saving...' : (isSaved ? 'Saved' : 'Save')}
          </Button>

          <FlagFraudDialog
            title="Flag candidate as fraudulent"
            description="This will report this candidate profile for fraud. If flagged 3 times, the account will be suspended."
            onConfirm={handleFlagFraud}
            buttonSize="sm"
            buttonVariant="outline"
            buttonText="Flag"
            className="border-red-300 text-red-600 hover:bg-red-50"
          />

          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewProfile?.(candidate)}
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Profile
          </Button>
        </div>
      </div>
    </Card>
  );
}
