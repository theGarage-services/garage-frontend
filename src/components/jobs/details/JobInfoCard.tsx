import { Building, Building2, MapPin, Clock, Users, Briefcase, Star, Share2, Heart, CheckCircle, X, UserMinus } from 'lucide-react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { JobStatusBadge } from '../JobStatusBadge';
import { FlagFraudDialog } from '../../common/FlagFraudDialog';
import { flagJobPostAsFraud } from '../../../api/fraud';

interface JobData {
  id: string | number;
  title: string;
  company: string;
  companyId?: number | null;
  location: string;
  salary: string;
  type: string;
  logo?: string;
  postedTime?: string;
  workModel?: string;
  vacancyType?: string;
  experienceLevel?: string;
  rank?: string;
  companySize?: string;
  companyIndustry?: string;
  companyRating?: number;
  hasApplied?: boolean;
  isApplied?: boolean;
  isSaved?: boolean;
  status?: string;
  hiringStatus?: {
    stage: string;
    isVisible: boolean;
    lastUpdated: string;
  };
}

interface JobInfoCardProps {
  jobData: JobData;
  isPremium: boolean;
  fromTracker: boolean;
  onNavigate?: (view: string) => void;
  considerationStatus?: string;
  onAcceptInterest?: () => void;
  onRejectInvitation?: () => void;
  onQuickApply?: () => void;
  onWithdrawApplication?: () => void;
  onToggleSave?: () => void;
}

function getStatusBadgeClass(status: string): string {
  const statusMap: Record<string, string> = {
    'consider': 'bg-yellow-100 text-yellow-800',
    'applied': 'bg-blue-100 text-blue-800',
    'interviews': 'bg-purple-100 text-purple-800',
    'offers': 'bg-emerald-100 text-emerald-800',
    'hired': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'withdrawn': 'bg-gray-100 text-gray-800'
  };
  return statusMap[status] || 'bg-gray-100 text-gray-800';
}

function formatStatusLabel(status: string): string {
  return status
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function JobInfoCard({
  jobData,
  isPremium,
  fromTracker,
  onNavigate,
  considerationStatus,
  onAcceptInterest,
  onRejectInvitation,
  onQuickApply,
  onWithdrawApplication,
  onToggleSave
}: Readonly<JobInfoCardProps>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {jobData.logo ? (
              <img
                src={jobData.logo}
                alt={jobData.company}
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Job Title and Company */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl font-semibold text-gray-900">{jobData.title}</h1>
                <JobStatusBadge job={jobData} isPremium={isPremium} size="lg" />
              </div>
              {/* Application Status from Tracker */}
              {fromTracker && jobData.status && (
                <div className="mb-3">
                  <Badge className={`text-sm px-3 py-1 ${getStatusBadgeClass(jobData.status)}`}>
                    Status: {formatStatusLabel(jobData.status)}
                  </Badge>
                </div>
              )}
              <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-3">
                <button
                  onClick={() => {
                    if (jobData.companyId) {
                      onNavigate?.(`company-profile/${jobData.companyId}`);
                    } else {
                      onNavigate?.('company-profile');
                    }
                  }}
                  className="flex items-center gap-1 hover:text-[#ff6b35] transition-colors"
                >
                  <Building className="w-4 h-4" />
                  <span className="font-medium underline decoration-dotted">{jobData.company}</span>
                </button>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{jobData.location}</span>
                </div>
                {jobData.postedTime && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{jobData.postedTime}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Details Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">{jobData.salary}</Badge>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">{jobData.type}</Badge>
              {jobData.workModel && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                  {jobData.workModel}
                </Badge>
              )}
              {jobData.vacancyType && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  {jobData.vacancyType}
                </Badge>
              )}
              {jobData.experienceLevel && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">
                  {jobData.experienceLevel}
                </Badge>
              )}
              {jobData.rank && (
                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">{jobData.rank}</Badge>
              )}
            </div>

            {/* Company Info */}
            {(jobData.companySize || jobData.companyIndustry || jobData.companyRating) && (
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                {jobData.companySize && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{jobData.companySize}</span>
                  </div>
                )}
                {jobData.companyIndustry && (
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{jobData.companyIndustry}</span>
                  </div>
                )}
                {jobData.companyRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{jobData.companyRating}/5.0</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {jobData.hasApplied || jobData.isApplied || considerationStatus === 'accepted' ? (
                <Button
                  variant="outline"
                  onClick={() => onWithdrawApplication?.()}
                  className="border-red-500 text-red-600 hover:bg-red-50 px-6"
                >
                  <UserMinus className="w-4 h-4 mr-2" />
                  Withdraw Application
                </Button>
              ) : considerationStatus === 'pending' ? (
                <>
                  <Button
                    onClick={() => onAcceptInterest?.()}
                    className="px-6 bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Accept Interest
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onRejectInvitation?.()}
                    className="border-red-500 text-red-600 hover:bg-red-50 px-6"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Reject Invitation
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => onQuickApply?.()}
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white px-6"
                >
                  Quick Apply
                </Button>
              )}
              <Button variant="outline" className="border-gray-300">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                variant="outline"
                onClick={() => onToggleSave?.()}
                className={`border-gray-300 transition-colors ${
                  jobData.isSaved
                    ? 'text-red-500 bg-red-50 hover:bg-red-100'
                    : 'hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <Heart className={`w-4 h-4 ${jobData.isSaved ? 'fill-current' : ''}`} />
              </Button>
              <FlagFraudDialog
                title="Flag job as fraudulent"
                description="This will suspend the job post and notify the platform. Please add a brief reason."
                onConfirm={async (reason) => {
                  await flagJobPostAsFraud(jobData.id, reason);
                }}
                buttonSize="icon"
                buttonVariant="outline"
                buttonText=""
                className="px-3 border-red-300 text-red-500 hover:bg-red-50"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
