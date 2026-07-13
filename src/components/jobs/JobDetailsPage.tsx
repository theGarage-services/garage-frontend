import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, FileText, Briefcase, Layers, Zap, GraduationCap, Users } from 'lucide-react';
import { JobHeader } from './details/JobHeader';
import { JobInfoCard } from './details/JobInfoCard';
import { RequirementsSection } from './details/RequirementsSection';
import { BenefitsSection } from './details/BenefitsSection';
import { JobDescriptionTabs } from './details/JobDescriptionTabs';
import { RecruiterContactCard } from './details/RecruiterContactCard';
import { ApplicationStatusCard } from './details/ApplicationStatusCard';
import { InterviewCard } from './details/InterviewCard';
import { RecruiterChat } from './details/RecruiterChat';
import { PremiumChatTeaser } from './details/PremiumChatTeaser';
import { NotesSection } from './details/NotesSection';
import { VideoPromptsSection } from './details/VideoPromptsSection';
import { useJobDetails } from './details/useJobDetails';
import { useState, useEffect } from 'react';
import { candidateProfileService, type SystemicRejectionSummary } from '../../api/candidateProfile';
import { VideoApplicationModal } from './applications/VideoApplicationModal';
import { useVideoApplication } from './applications/useVideoApplication';

const GREENZONE_STYLES: Record<string, { label: string; className: string }> = {
  confirmed_in: { label: 'Strong Match', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  contested: { label: 'Competitive', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  confirmed_out: { label: 'Lower Fit', className: 'bg-slate-100 text-slate-700 border-slate-200' },
};

interface JobDetailsPageProps {
  onBack: () => void;
  user?: any;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
  onJobApplication?: (job: any, method: string) => void;
  onNavigateToQueueDetail?: (queue: any) => void;
  fromTracker?: boolean; // Track if navigated from tracker
  job?: {
    id: string;
    title: string;
    company: string;
    companyId?: number | null;
    location: string;
    salary: string;
    type: string;
    rank?: string;
    postedTime?: string;
    logo?: string;
    description: string;
    requirements?: string[];
    benefits?: string[];
    skills?: string[];
    companySize?: string;
    companyIndustry?: string;
    workModel?: string;
    vacancyType?: string;
    experienceLevel?: string;
    companyRating?: number;
    totalEmployees?: string;
    status?: 'consider' | 'applied' | 'interviews' | 'offers' | 'hired' | 'rejected' | 'withdrawn'; // Application status from tracker
    recruiter?: {
      id: string;
      name: string;
      title: string;
      company: string;
      avatar: string;
      yearsExperience: number;
      contactInfo?: {
        email: string;
        phone: string;
      };
    };
    applicationMethod?: 'manual' | 'quick-apply' | 'recruiter-consideration';
    isApplied?: boolean;
    isSaved?: boolean;
    hasApplied?: boolean;
    applied?: boolean;
    matchPercentage?: number;
    scoreBreakdown?: Record<string, any>;
    greenzoneStatus?: string | null;
    greenzoneReason?: string | null;
  };
}

export function JobDetailsPage({ onBack, user, onNavigate, onLogout, fromTracker = false, job: jobProp, onJobApplication }: Readonly<JobDetailsPageProps>) {
  const isPremium = user?.isPremium || false;
  const {
    jobData,
    setJobData,
    isLoading,
    error,
    jobNotes,
    isSavingNotes,
    pendingConsideration,
    setPendingConsideration,
    scheduledInterviews,
    videoResponses,
    handleSaveNotes,
    handleJoinCall,
    handleAcceptInterest,
    handleRejectInvitation,
    handleQuickApply
  } = useJobDetails(jobProp, onJobApplication);

  const [showVideoFlow, setShowVideoFlow] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  const [considerationFlowId, setConsiderationFlowId] = useState<number | null>(null);
  const [systemicSummary, setSystemicSummary] = useState<SystemicRejectionSummary | null>(null);
  const {
    setUploadError,
    reset: resetVideoFlow,
  } = useVideoApplication();

  useEffect(() => {
    candidateProfileService.getSystemicRejectionSummary().then((res) => {
      if (res.success) setSystemicSummary(res.summary);
    });
  }, []);

  const startVideoFlow = () => {
    resetVideoFlow();
    setShowVideoFlow(true);
  };

  const handleStartApply = async () => {
    if (!jobData?.id) return;
    if (jobData.hasApplied || jobData.isApplied || pendingConsideration?.status === 'accepted') {
      alert('You have already applied to this job.');
      return;
    }
    if (pendingConsideration?.status === 'pending') {
      const result = await handleAcceptInterest();
      if (result && 'requiresVideoPrompts' in result && result.requiresVideoPrompts) {
        setConsiderationFlowId(pendingConsideration.id);
        startVideoFlow();
      }
      return;
    }
    const requiredPrompts = (jobData.videoPrompts || []).filter((p: any) => (p.questionText || p.question_text || '').trim().length > 0);
    if (requiredPrompts.length === 0) {
      handleQuickApply();
      return;
    }
    setConsiderationFlowId(null);
    startVideoFlow();
  };

  const handleWithdrawApplication = () => {
    if (!jobData) return;
    setJobData((prev: any) => ({
      ...prev,
      hasApplied: false,
      isApplied: false,
      applied: false,
      status: 'withdrawn',
      applicationMethod: undefined,
      hasPendingConsideration: false,
      pendingConsiderationId: null,
      pendingConsiderationMessage: null
    }));
    setPendingConsideration(null);
    alert('Application withdrawn.');
  };

  const handleToggleSave = async () => {
    if (!jobData?.id) return;
    const jobId = Number(jobData.id);
    const nextSaved = !jobData.isSaved;
    setJobData((prev: any) => ({ ...prev, isSaved: nextSaved }));
    try {
      if (nextSaved) {
        await candidateProfileService.saveJob(jobId);
      } else {
        await candidateProfileService.unsaveJob(jobId);
      }
    } catch (error) {
      console.error('Failed to toggle save status:', error);
      setJobData((prev: any) => ({ ...prev, isSaved: !nextSaved }));
      alert('Failed to update saved status. Please try again.');
    }
  };

  const handleFinalizeApply = async (uploadedResponses: any[]) => {
    if (!jobData?.id) return;
    setApplyLoading(true);
    setUploadError(null);
    try {
      let result;
      if (considerationFlowId) {
        const responseIds = uploadedResponses.map((r) => Number(r.id)).filter(Boolean);
        result = await handleAcceptInterest(responseIds);
      } else {
        result = await candidateProfileService.quickApplyToJob(Number(jobData.id), `Video application for ${jobData.title}`);
      }
      if (result && 'success' in result && result.success) {
        const method = considerationFlowId ? 'recruiter-consideration' : 'video-apply';
        setJobData((prev: any) => ({ ...prev, hasApplied: true, isApplied: true, applicationMethod: method }));
        onJobApplication?.(jobData, method);
        setShowVideoFlow(false);
        setConsiderationFlowId(null);
        alert('Application submitted successfully!');
      } else if (result && 'error' in result && result.error) {
        setUploadError(result.error || 'Failed to submit application.');
      } else {
        setUploadError('Failed to submit application.');
      }
    } catch (err: any) {
      console.error('Error applying:', err);
      setUploadError(err.message || 'Failed to submit application.');
    } finally {
      setApplyLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <JobHeader
          onBack={onBack}
          onNavigate={onNavigate}
          onLogout={onLogout}
          fromTracker={fromTracker}
          isPremium={isPremium}
          user={user}
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-600">Loading job details...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        <JobHeader
          onBack={onBack}
          onNavigate={onNavigate}
          onLogout={onLogout}
          fromTracker={fromTracker}
          isPremium={isPremium}
          user={user}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 sm:p-8 text-center">
            <h3 className="text-lg text-red-600 mb-2">Error Loading Job</h3>
            <p className="text-gray-600 mb-4">{error || 'Job not found'}</p>
            <Button onClick={onBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      <JobHeader
        onBack={onBack}
        onNavigate={onNavigate}
        onLogout={onLogout}
        fromTracker={fromTracker}
        isPremium={isPremium}
        user={user}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="font-medium text-blue-900 mb-1">AI-Assisted Review</p>
          <p className="text-sm text-blue-700">
            AI is utilised to help evaluate this application.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <JobInfoCard
              jobData={jobData}
              isPremium={isPremium}
              fromTracker={fromTracker}
              onNavigate={onNavigate}
              considerationStatus={pendingConsideration?.status || undefined}
              onAcceptInterest={handleAcceptInterest}
              onRejectInvitation={handleRejectInvitation}
              onQuickApply={handleStartApply}
              onWithdrawApplication={handleWithdrawApplication}
              onToggleSave={handleToggleSave}
            />

            <JobMetadataSection jobData={jobData} />

            <JobDescriptionTabs
              description={jobData.description}
              summary={jobData.summary}
              responsibilities={jobData.responsibilities}
              company={jobData.company}
              companyIndustry={jobData.companyIndustry}
            />

            <RequirementsSection requirements={jobData.requirements} />
            <NiceToHaveSection items={jobData.niceToHave} />
            <BenefitsSection benefits={jobData.benefits} />
            <ApplicationRequirementsSection jobData={jobData} />
            <VideoPromptsSection prompts={jobData.videoPrompts} responses={videoResponses} />
            <InterviewRoundsSection rounds={jobData.interviewRounds} />
            <ImportantDatesSection jobData={jobData} />
            <HiringManagerSection name={jobData.hiringManager} />
            <TargetQueuesSection queues={jobData.selectedQueues} />
            <RecruiterContactCard
              recruiter={jobData.recruiter}
              onViewProfile={(recruiterId) => onNavigate?.(`recruiter-profile/${recruiterId}`)}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            <ApplicationStatusCard
              hasApplied={jobData.hasApplied || jobData.isApplied || false}
              considerationStatus={pendingConsideration?.status || undefined}
              applicationMethod={jobData.applicationMethod}
              isPremium={isPremium}
            />

            {scheduledInterviews.map((interview) => (
              <InterviewCard
                key={interview.id}
                interview={interview}
                onJoinCall={handleJoinCall}
              />
            ))}

            <ChatSection
              isPremium={isPremium}
              jobData={jobData}
              pendingConsideration={pendingConsideration}
              user={user}
            />

            {jobData.matchPercentage !== undefined && (
              <MatchScoreCard
                matchPercentage={jobData.matchPercentage}
                scoreBreakdown={jobData.scoreBreakdown}
                greenzoneStatus={jobData.greenzoneStatus}
                greenzoneReason={jobData.greenzoneReason}
              />
            )}
            <CrossJobComparisonStrip
              summary={systemicSummary}
              currentStatus={jobData.greenzoneStatus}
            />
            <NotesSection initialNotes={jobNotes} onSave={handleSaveNotes} isSaving={isSavingNotes} />
          </div>
        </div>
      </div>

      {showVideoFlow && jobData?.id && (
        <VideoApplicationModal
          jobId={Number(jobData.id)}
          onComplete={handleFinalizeApply}
          onCancel={() => {
            setShowVideoFlow(false);
            setConsiderationFlowId(null);
          }}
          submitLoading={applyLoading}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components extracted to keep JobDetailsPage cognitive          */
/*  complexity under the SonarQube threshold of 15.                   */
/* ------------------------------------------------------------------ */

function JobMetadataSection({ jobData }: Readonly<{ jobData: any }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">Job Details</h3>
        <div className="flex flex-wrap gap-2">
          <OptionalBadge value={jobData.department} fallback="Department: Not specified" />
          <OptionalBadge value={jobData.industry} fallback="Industry: Not specified" />
          <OptionalBadge value={jobData.employmentType} fallback="Type: Not specified" />
          <OptionalBadge value={jobData.workArrangement} fallback="Work model: Not specified" />
          <OptionalBadge value={jobData.vacancyType} fallback="Vacancy type: Not specified" />
          <OptionalBadge value={jobData.experienceLevel} fallback="Experience: Not specified" />
          {jobData.educationLevel ? (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              <GraduationCap className="w-3 h-3" />
              {jobData.educationLevel}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-gray-400">Education: Not specified</Badge>
          )}
          <OptionalBadge value={jobData.currency} fallback="Currency: Not specified" prefix="Currency: " />
          {jobData.isUrgent ? (
            <Badge className="bg-red-100 text-red-800 text-xs flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Urgent
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs text-gray-400">Priority: Standard</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function OptionalBadge({ value, fallback, prefix = '' }: { value?: string; fallback: string; prefix?: string }) {
  return value ? (
    <Badge variant="outline" className="text-xs">{prefix}{value}</Badge>
  ) : (
    <Badge variant="outline" className="text-xs text-gray-400">{fallback}</Badge>
  );
}

function NiceToHaveSection({ items }: Readonly<{ items?: string[] }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Nice-to-Have</h3>
        {items && items.length > 0 ? (
          <div className="space-y-2">
            {items.map((item: string) => (
              <div key={`nice-to-have-${item}`} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">No nice-to-have items specified.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ApplicationRequirementsSection({ jobData }: Readonly<{ jobData: any }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Requirements</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <ReqItem icon={FileText} required={jobData.requiresCoverLetter} label="Cover letter required" />
          {jobData.requiresPortfolio ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#ff6b35]" />
                <span>Portfolio required ({jobData.portfolioSubmissionType})</span>
              </div>
              {jobData.portfolioDescription && (
                <p className="text-gray-500 ml-6">{jobData.portfolioDescription}</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Briefcase className="w-4 h-4" />
              <span>Portfolio: Not required</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ReqItem({ icon: Icon, required, label }: { icon: any; required?: boolean; label: string }) {
  return required ? (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-[#ff6b35]" />
      <span>{label}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-400">
      <Icon className="w-4 h-4" />
      <span>{label.replace('required', 'Not required').replace('Required', 'Not required')}</span>
    </div>
  );
}

function InterviewRoundsSection({ rounds }: Readonly<{ rounds?: Record<string, number> }>) {
  const entries = rounds ? Object.entries(rounds) : [];
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Interview Process</h3>
        {entries.length > 0 ? (
          <div className="space-y-3">
            {entries.map(([stage, count]: [string, any]) => (
              <div key={stage} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#ff6b35]" />
                  <span className="text-gray-700 font-medium capitalize">{stage.replaceAll('-', ' ')}</span>
                </div>
                <Badge variant="outline" className="text-xs">{count} round{Number(count) === 1 ? '' : 's'}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">Interview rounds not specified.</p>
        )}
      </CardContent>
    </Card>
  );
}

function ImportantDatesSection({ jobData }: Readonly<{ jobData: any }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Dates</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <DateItem date={jobData.applicationDeadline} label="Application deadline" />
          <DateItem date={jobData.startDate} label="Expected start" />
        </div>
      </CardContent>
    </Card>
  );
}

function DateItem({ date, label }: { date?: string; label: string }) {
  return date ? (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-[#ff6b35]" />
      <span>{label}: {new Date(date).toLocaleDateString()}</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-gray-400">
      <Calendar className="w-4 h-4" />
      <span>{label}: Not specified</span>
    </div>
  );
}

function HiringManagerSection({ name }: Readonly<{ name?: string }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Hiring Manager</h3>
        {name ? <p className="text-gray-700">{name}</p> : <p className="text-gray-500 italic text-sm">Not specified.</p>}
      </CardContent>
    </Card>
  );
}

function TargetQueuesSection({ queues }: Readonly<{ queues?: string[] }>) {
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Target Queues</h3>
        {queues && queues.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {queues.map((queue: string) => (
              <Badge key={queue} variant="outline" className="text-xs flex items-center gap-1">
                <Users className="w-3 h-3" />
                {queue}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-sm">No target queues specified.</p>
        )}
      </CardContent>
    </Card>
  );
}

function MatchScoreCard({ matchPercentage, scoreBreakdown, greenzoneStatus, greenzoneReason }: Readonly<{ matchPercentage: number; scoreBreakdown?: Record<string, any>; greenzoneStatus?: string | null; greenzoneReason?: string | null }>) {
  const gz = greenzoneStatus && GREENZONE_STYLES[greenzoneStatus];
  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Match</h3>
        {gz && (
          <div className="mb-4">
            <Badge
              title={greenzoneReason || undefined}
              className={`text-xs px-2 py-1 border ${gz.className}`}
            >
              {gz.label}
            </Badge>
            {greenzoneReason && (
              <p className="mt-2 text-sm text-gray-600">{greenzoneReason}</p>
            )}
          </div>
        )}
        <div className="text-center mb-4">
          <div className="text-3xl font-semibold text-[#ff6b35] mb-1">{matchPercentage}%</div>
          <div className="text-sm text-gray-500">Match Score</div>
        </div>
        {scoreBreakdown && (
          <div className="space-y-2">
            {[
              { key: 'semantic', label: 'Semantic Fit', color: 'bg-blue-500' },
              { key: 'skill_jaccard', label: 'Skill Overlap', color: 'bg-purple-500' },
              { key: 'education_score', label: 'Education', color: 'bg-green-500' },
              { key: 'experience_score', label: 'Experience', color: 'bg-orange-500' },
              { key: 'industry_alignment', label: 'Industry', color: 'bg-cyan-500' },
              { key: 'level_alignment', label: 'Level', color: 'bg-pink-500' },
            ].map(({ key, label, color }) => {
              const val = scoreBreakdown[key];
              if (val === undefined || val === null) return null;
              const pct = Math.round(val * 100);
              return (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-24 text-xs text-gray-600 text-right">{label}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="w-8 text-xs font-medium text-gray-900 text-right">{pct}%</div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CrossJobComparisonStrip({ summary, currentStatus }: Readonly<{ summary: SystemicRejectionSummary | null; currentStatus?: string | null }>) {
  if (!summary || summary.total_decisions === 0) return null;
  const currentLabel = currentStatus && GREENZONE_STYLES[currentStatus]?.label;
  return (
    <Card className="bg-white border border-gray-200 shadow-sm mt-4">
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">How this compares to your other roles</h4>
        <div className="flex flex-wrap gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">{summary.confirmed_in_count} Strong Match</Badge>
          <Badge className="bg-amber-100 text-amber-800 border-amber-200">{summary.contested_count} Competitive</Badge>
          <Badge className="bg-slate-100 text-slate-700 border-slate-200">{summary.confirmed_out_count} Lower Fit</Badge>
        </div>
        {currentLabel && (
          <p className="mt-2 text-sm text-gray-600">
            This role is marked <strong>{currentLabel}</strong> across {summary.total_decisions} reviewed roles.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ChatSection({ isPremium, jobData, pendingConsideration, user }: { isPremium: boolean; jobData: any; pendingConsideration?: any; user?: any }) {
  const showChat = jobData.hasApplied || jobData.isApplied || pendingConsideration?.status === 'accepted';
  return showChat ? (
    <RecruiterChat
      isPremium={isPremium}
      hasApplied={jobData.hasApplied}
      isApplied={jobData.isApplied}
      considerationStatus={pendingConsideration?.status || undefined}
      applicationMethod={jobData.applicationMethod}
      recruiter={jobData.recruiter}
      user={user}
      jobId={Number(jobData.id)}
    />
  ) : (
    <PremiumChatTeaser />
  );
}
