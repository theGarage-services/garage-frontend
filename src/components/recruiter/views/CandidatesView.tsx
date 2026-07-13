/**
 * Candidates View Component
 */
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { UpdateJobStatusModal } from '../../jobs/UpdateJobStatusModal';
import { FlagFraudDialog } from '../../common/FlagFraudDialog';
import { flagCandidateProfileAsFraud } from '@/api/fraud';
import {
  ArrowLeft,
  Brain,
  Users,
  User,
  Zap,
  Loader2,
  MessageCircle,
  Calendar,
  ExternalLink,
  FileText,
  UserMinus} from 'lucide-react';
import type { QueueCandidateLocal, CandidateTab, CandidatesData } from '../types';
import { formatMatchScore, getStatusColor } from '../utils';

interface CandidatesViewProps {
  selectedJob: any;
  candidatesData: CandidatesData;
  queueCandidates: QueueCandidateLocal[];
  aiRecommendedCandidates: QueueCandidateLocal[];
  isLoadingCandidates: boolean;
  candidateTab: CandidateTab;
  setCandidateTab: (tab: CandidateTab) => void;
  handleBackToList: () => void;
  handleViewProfile: (candidate: any) => void;
  handleSendMessage: (candidate: any) => void;
  handleSendConsiderationRequest: (candidate: any) => Promise<void>;
  handleAcceptConsiderationRequest: (candidate: any) => Promise<void>;
  handleWithdrawConsiderationRequest: (candidate: any) => Promise<void>;
  handleRevokeApplication: (candidate: any) => Promise<void>;
  handleScheduleInterview: (candidate: any) => void;
  onFlagFraud: (candidate: any) => void;
  showJobStatusUpdate: boolean;
  jobStatusUpdateTarget: any;
  setShowJobStatusUpdate: (show: boolean) => void;
  setJobStatusUpdateTarget: (target: null) => void;
  handleJobStatusUpdate: (status: any) => Promise<void>;
}

// Small inline match-breakdown display
const MatchBreakdownBadge = ({ breakdown }: { breakdown?: Record<string, number> }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  const items = [
    { key: 'semantic', label: 'Semantic', color: 'bg-blue-500' },
    { key: 'skill_jaccard', label: 'Skill', color: 'bg-purple-500' },
    { key: 'education_score', label: 'Edu', color: 'bg-green-500' },
    { key: 'experience_score', label: 'Exp', color: 'bg-orange-500' },
    { key: 'industry_alignment', label: 'Industry', color: 'bg-cyan-500' },
    { key: 'level_alignment', label: 'Level', color: 'bg-pink-500' },
  ];
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {items.map(({ key, label, color }) => {
        const val = breakdown[key];
        if (val === undefined || val === null) return null;
        const pct = Math.round((val) * 100);
        return (
          <div key={key} className="flex items-center gap-1 text-xs bg-white border rounded px-1.5 py-0.5" title={`${label}: ${pct}%`}>
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-gray-600">{label}</span>
            <span className="font-medium text-gray-900">{pct}%</span>
          </div>
        );
      })}
    </div>
  );
};

// Candidate card component for queue candidates
const CandidateQueueCard = ({ candidate, jobStatus, onViewProfile, onSendMessage, onSendConsideration, onWithdrawConsideration, onScheduleInterview, onFlagFraud }: any) => {
  const handleFlagFraud = async (reason: string) => {
    await flagCandidateProfileAsFraud(candidate.id, reason);
    onFlagFraud?.(candidate);
  };

  const getStatusBadgeClass = () => {
    switch (candidate.applicationStatus) {
      case 'consider': return 'bg-yellow-100 text-yellow-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviews': return 'bg-purple-100 text-purple-800';
      case 'offers': return 'bg-emerald-100 text-emerald-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = () => {
    switch (candidate.applicationStatus) {
      case 'consider': return 'Consider';
      case 'applied': return 'Applied';
      case 'interviews': return 'Interviews';
      case 'offers': return 'Offers';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      case 'withdrawn': return 'Withdrawn';
      default: return 'Available';
    }
  };

  const renderActionButtons = () => {
    switch (candidate.applicationStatus) {
      case 'consider':
      case 'applied':
      case 'interviews':
      case 'offers':
      case 'hired':
        return (
          <>
            <Button variant="outline" size="sm" onClick={() => onSendMessage(candidate)}>
              <MessageCircle className="w-4 h-4 mr-1" />
              Message
            </Button>
            <Button variant="outline" size="sm" onClick={() => onScheduleInterview(candidate)}>
              <Calendar className="w-4 h-4 mr-1" />
              Schedule Interview
            </Button>
            <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => onWithdrawConsideration(candidate)}>
              <UserMinus className="w-4 h-4 mr-1" />
              Withdraw Consideration
            </Button>
          </>
        );
      case 'rejected':
      case 'withdrawn':
        return (
          <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => onWithdrawConsideration(candidate)}>
            <UserMinus className="w-4 h-4 mr-1" />
            Withdraw Consideration
          </Button>
        );
      default:
        if (jobStatus !== 'published') {
          return (
            <Button size="sm" disabled title="Only published jobs can send consideration requests">
              Send Consideration
            </Button>
          );
        }
        return (
          <Button size="sm" onClick={() => onSendConsideration(candidate)}>
            Send Consideration
          </Button>
        );
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <Avatar className="w-12 h-12">
            <AvatarFallback>{(candidate.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h3 className="text-xl text-gray-900">{candidate.name}</h3>
              <Badge className="bg-green-100 text-green-800">#{candidate.queuePosition} in Queue</Badge>
              {candidate.isAIRecommended && (
                <Badge className="bg-blue-100 text-blue-800">{formatMatchScore(candidate.matchScore)}% Match</Badge>
              )}
            </div>
            {candidate.isAIRecommended && <MatchBreakdownBadge breakdown={candidate.scoreBreakdown} />}
            <p className="text-gray-600 mb-2">{candidate.title} at {candidate.currentCompany}</p>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
              ))}
            </div>
          </div>
        </div>
        <Badge className={getStatusBadgeClass()}>
          {getStatusLabel()}
        </Badge>
      </div>

      {candidate.aiRecommendation && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-blue-900">AI Recommendation</span>
          </div>
          <p className="text-sm text-gray-700">{candidate.aiRecommendation.reason}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-gray-500">
          Last activity: {candidate.lastLogin ? new Date(candidate.lastLogin).toLocaleDateString() : 'Never'}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => onViewProfile(candidate)}>
            <ExternalLink className="w-4 h-4 mr-1" />
            View Profile
          </Button>
          {renderActionButtons()}
          <FlagFraudDialog
            title="Flag candidate as fraudulent"
            description="This will report this candidate profile for fraud. If flagged 3 times, the account will be suspended."
            onConfirm={handleFlagFraud}
            buttonSize="sm"
            buttonVariant="outline"
            buttonText="Flag"
            className="border-red-300 text-red-600 hover:bg-red-50"
          />
        </div>
      </div>
    </Card>
  );
};

export const CandidatesView = ({
  selectedJob,
  candidatesData,
  queueCandidates,
  aiRecommendedCandidates,
  isLoadingCandidates,
  candidateTab,
  setCandidateTab,
  handleBackToList,
  handleViewProfile,
  handleSendMessage,
  handleSendConsiderationRequest,
  handleAcceptConsiderationRequest,
  handleWithdrawConsiderationRequest,
  handleRevokeApplication,
  handleScheduleInterview,
  onFlagFraud,
  showJobStatusUpdate,
  jobStatusUpdateTarget,
  setShowJobStatusUpdate,
  setJobStatusUpdateTarget,
  handleJobStatusUpdate
}: CandidatesViewProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="mb-4 text-gray-900 hover:text-[#ff6b35] hover:border-[#ff6b35] border-2"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Job List</span>
          </Button>
          <h1 className="text-3xl text-gray-900 mb-2">{selectedJob.title}</h1>
          <p className="text-gray-600 mb-3">Candidates for this position</p>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="text-[#ff6b35] border-[#ff6b35]">
              Queue: {selectedJob.queue}
            </Badge>
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              {queueCandidates.length} total candidates
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-300">
              {aiRecommendedCandidates.length} AI recommended
            </Badge>
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              {queueCandidates.filter(c => c.applicationStatus === 'consider').length} requests sent
            </Badge>
            <Badge variant="outline" className="text-green-600 border-green-300">
              {queueCandidates.filter(c => c.applicationStatus === 'applied').length} requests accepted
            </Badge>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              {candidatesData['manually-applied'].length} direct applications
            </Badge>
          </div>
        </div>
        <Badge className={getStatusColor(selectedJob.status)}>
          {selectedJob.status}
        </Badge>
      </div>

      <Tabs value={candidateTab} onValueChange={(value: any) => setCandidateTab(value)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white border border-gray-200">
          <TabsTrigger value="ai-recommended" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            AI Recommended Candidates ({candidatesData['ai-recommended'].length})
          </TabsTrigger>
          <TabsTrigger value="all-queue" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Candidates ({candidatesData['all-queue'].length})
          </TabsTrigger>
          <TabsTrigger value="manually-applied" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Manually Applied Candidates ({candidatesData['manually-applied'].length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-recommended">
          <div className="space-y-4">
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg text-blue-900">AI-Powered Candidate Recommendations</h3>
              </div>
              <p className="text-blue-700 text-sm">
                Our AI has analyzed your job requirements and identified the top candidates from the queue who best match your criteria.
              </p>
            </Card>

            {isLoadingCandidates && (
              <Card className="p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <h3 className="text-lg text-gray-900 mb-2">Loading candidates...</h3>
              </Card>
            )}

            {!isLoadingCandidates && candidatesData['ai-recommended'].map((candidate) => (
              <CandidateQueueCard
                key={candidate.id}
                candidate={candidate}
                jobStatus={selectedJob.status}
                onViewProfile={handleViewProfile}
                onSendMessage={handleSendMessage}
                onSendConsideration={handleSendConsiderationRequest}
                onAcceptConsideration={handleAcceptConsiderationRequest}
                onWithdrawConsideration={handleWithdrawConsiderationRequest}
                onScheduleInterview={handleScheduleInterview}
                onFlagFraud={onFlagFraud}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="all-queue">
          <div className="space-y-4">
            {isLoadingCandidates && (
              <Card className="p-12 text-center">
                <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
                <h3 className="text-lg text-gray-900 mb-2">Loading candidates...</h3>
              </Card>
            )}

            {!isLoadingCandidates && candidatesData['all-queue'].map((candidate) => (
              <CandidateQueueCard
                key={candidate.id}
                candidate={candidate}
                jobStatus={selectedJob.status}
                onViewProfile={handleViewProfile}
                onSendMessage={handleSendMessage}
                onSendConsideration={handleSendConsiderationRequest}
                onAcceptConsideration={handleAcceptConsiderationRequest}
                onWithdrawConsideration={handleWithdrawConsiderationRequest}
                onScheduleInterview={handleScheduleInterview}
                onFlagFraud={onFlagFraud}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="manually-applied">
          <div className="space-y-4">
            <Card className="p-4 bg-orange-50 border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg text-orange-900">Direct Applications</h3>
              </div>
              <p className="text-orange-700 text-sm">
                Candidates who have directly applied to this position through the platform.
              </p>
            </Card>

            {candidatesData['manually-applied'].map((candidate: any) => (
              <Card key={candidate.id} className="p-6 hover:shadow-lg transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback>{(candidate.name || '').split(' ').filter(Boolean).map((n: string) => n[0]).join('') || '?'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl text-gray-900 mb-1">{candidate.name}</h3>
                      <p className="text-gray-600 mb-2">{candidate.title} at {candidate.currentCompany}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(candidate.applicationStatus)}>
                    {candidate.applicationStatus}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleViewProfile(candidate)}>
                    <FileText className="w-4 h-4 mr-1" />
                    View Application
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => handleRevokeApplication(candidate)}>
                    <UserMinus className="w-4 h-4 mr-1" />
                    Revoke Application
                  </Button>
                  <FlagFraudDialog
                    title="Flag candidate as fraudulent"
                    description="This will report this candidate profile for fraud. If flagged 3 times, the account will be suspended."
                    onConfirm={async (reason) => {
                      await flagCandidateProfileAsFraud(candidate.id, reason);
                      onFlagFraud?.(candidate);
                    }}
                    buttonSize="sm"
                    buttonVariant="outline"
                    buttonText="Flag"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>

    {/* Job Status Update Modal */}
    {showJobStatusUpdate && jobStatusUpdateTarget && (
      <UpdateJobStatusModal
        job={jobStatusUpdateTarget}
        onClose={() => {
          setShowJobStatusUpdate(false);
          setJobStatusUpdateTarget(null);
        }}
        onUpdate={handleJobStatusUpdate}
      />
    )}
  </div>
  );
};

export default CandidatesView;
