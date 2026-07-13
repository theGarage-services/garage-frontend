import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../ui/avatar';
import { Separator } from '../../ui/separator';
import { Progress } from '../../ui/progress';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../ui/dialog';
import { ScheduleInterviewSheet } from '../../calendar/ScheduleInterviewSheet';
import { recruiterCandidatesApi, type CandidateDetail } from '../../../api/recruiterCandidates';
import { initChatFromJob, sendMessage } from '../../../api/chat';
import {
  MessageCircle,
  Calendar,
  Send,
  MapPin,
  Mail,
  Phone,
  Crown,
  Settings,
  BarChart3,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { AiFillLinkedin, AiFillGithub } from 'react-icons/ai';
import { formatMatchScore, getStatusColor, getStageDisplayName, normalizeUrl } from './utils';

export interface CandidateProfileSidebarProps {
  candidate: any;
  candidateDetails: CandidateDetail | null;
  currentJobId: string | undefined;
  routeId: string | undefined;
  availableJobs?: any[];
  setCandidateDetails: Dispatch<SetStateAction<CandidateDetail | null>>;
  onUpdateStatus?: (candidateId: string, status: string) => void;
  onSendMessage?: (candidate: any) => void;
  onScheduleInterview?: (candidate: any, interviewData: any) => void;
  setSelectedCandidate?: (candidate: any) => void;
  onNavigate?: (view: string) => void;
}

export function CandidateProfileSidebar({
  candidate,
  candidateDetails,
  currentJobId,
  routeId,
  availableJobs,
  setCandidateDetails,
  onUpdateStatus,
  onSendMessage,
  onScheduleInterview,
  setSelectedCandidate,
  onNavigate
}: Readonly<CandidateProfileSidebarProps>) {
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [showInterviewDialog, setShowInterviewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState(candidateDetails?.status || candidate?.applicationStatus || 'applied');
  const [statusJobId, setStatusJobId] = useState<string | undefined>(currentJobId);
  const [messageContent, setMessageContent] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (candidateDetails?.status) {
      setNewStatus(candidateDetails.status);
    }
  }, [candidateDetails?.status]);

  useEffect(() => {
    setStatusJobId(currentJobId);
  }, [currentJobId]);

  const handleStatusUpdate = async () => {
    if (!routeId || !statusJobId) {
      globalThis.alert('A specific job context is required to update status.');
      return;
    }
    setIsUpdatingStatus(true);
    try {
      await recruiterCandidatesApi.updateCandidateStatus(routeId, {
        job_id: statusJobId,
        status: newStatus,
      });
      if (candidateDetails) {
        setCandidateDetails({ ...candidateDetails, status: newStatus });
      }
      onUpdateStatus?.(candidate.id, newStatus);
      setShowStatusDialog(false);
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSendMessage = async () => {
    const content = messageContent.trim();
    if (!content || !routeId) return;

    const candidateId = Number(routeId);
    if (Number.isNaN(candidateId)) {
      globalThis.alert('Invalid candidate ID');
      return;
    }

    setIsSendingMessage(true);
    try {
      let conversationId: number;

      if (currentJobId) {
        const jobId = Number(currentJobId);
        const result = await initChatFromJob(jobId, candidateId);
        conversationId = result.conversation_id;
      } else {
        const { createConversation } = await import('../../../api/chat');
        const conv = await createConversation({
          conversation_type: 'general',
          participant_ids: [candidateId],
        });
        conversationId = conv.id;
      }

      await sendMessage({
        conversation: conversationId,
        content,
        message_type: 'text',
      });

      setShowMessageDialog(false);
      setMessageContent('');
      onSendMessage?.(candidate);
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="lg:col-span-1 space-y-6">
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="relative inline-block">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              {candidate.avatar && (
                <AvatarImage
                  src={candidate.avatar}
                  alt={candidate.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="bg-[#ff6b35] text-white text-xl">
                {candidate.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {candidate.isPremium && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                <Crown className="w-3 h-3 text-white" />
              </div>
            )}
          </div>

          <h2 className="text-xl text-gray-900 mb-1">{candidate.name}</h2>
          <p className="text-gray-600 mb-2">{candidate.title}</p>
          <p className="text-sm text-gray-500 mb-4">{candidate.currentCompany}</p>

          {candidate.isPremium && (
            <Badge className="bg-yellow-100 text-yellow-800 mb-4">
              <Crown className="w-3 h-3 mr-1" />
              {candidate.premiumTier}
            </Badge>
          )}

          <div className="flex items-center justify-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {candidate.location}
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-2xl font-semibold text-[#ff6b35] mb-1">
              {formatMatchScore(candidate.matchScore)}%
            </div>
            <div className="text-sm text-gray-500">Match Score</div>
            <Progress value={candidate.matchScore} className="w-full h-2 mt-2" />
          </div>

          {candidate.scoreBreakdown && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                Match Breakdown
              </div>
              <div className="space-y-2">
                {[
                  { key: 'semantic', label: 'Semantic Fit', color: 'bg-blue-500' },
                  { key: 'skill_jaccard', label: 'Skill Overlap', color: 'bg-purple-500' },
                  { key: 'education_score', label: 'Education', color: 'bg-green-500' },
                  { key: 'experience_score', label: 'Experience', color: 'bg-orange-500' },
                  { key: 'industry_alignment', label: 'Industry', color: 'bg-cyan-500' },
                  { key: 'level_alignment', label: 'Level', color: 'bg-pink-500' },
                ].map(({ key, label, color }) => {
                  const val = candidate.scoreBreakdown[key];
                  if (val === undefined || val === null) return null;
                  const pct = Math.round(val * 100);
                  return (
                    <div key={key} className="flex items-center gap-2">
                      <div className="w-20 text-xs text-gray-600 text-right">{label}</div>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="w-8 text-xs font-medium text-gray-900 text-right">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Dialog open={showMessageDialog} onOpenChange={setShowMessageDialog}>
            <DialogTrigger asChild>
              <Button className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                <MessageCircle className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Send Message to {candidate.name}</DialogTitle>
                <DialogDescription>
                  Send a direct message to this candidate.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                />
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowMessageDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                    disabled={!messageContent.trim() || isSendingMessage}
                  >
                    {isSendingMessage ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {isSendingMessage ? 'Sending...' : 'Send Message'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowInterviewDialog(true)}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>

          <ScheduleInterviewSheet
            open={showInterviewDialog}
            onOpenChange={setShowInterviewDialog}
            candidate={candidate}
            jobId={currentJobId}
            availableJobs={availableJobs}
            onScheduled={(interviewData) => {
              onScheduleInterview?.(candidate, interviewData);
            }}
            onExpandToFullscreen={(selectedCandidate) => {
              setShowInterviewDialog(false);
              if (setSelectedCandidate) {
                setSelectedCandidate(selectedCandidate);
              }
              onNavigate?.('interview-calendar');
            }}
          />

          <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full border-blue-500 text-blue-600 hover:bg-blue-50">
                <Settings className="w-4 h-4 mr-2" />
                Update Status
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Update Application Status</DialogTitle>
                <DialogDescription>
                  Update the hiring process status for {candidate.name}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Current Status</Label>
                  <Badge className={`mt-1 block w-fit ${getStatusColor(candidate.applicationStatus)}`}>
                    {getStageDisplayName(candidate.applicationStatus)}
                  </Badge>
                </div>

                <div>
                  <Label>New Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consider">Consider</SelectItem>
                      <SelectItem value="applied">Applied</SelectItem>
                      <SelectItem value="interviews">Interviews</SelectItem>
                      <SelectItem value="offers">Offers</SelectItem>
                      <SelectItem value="hired">Hired</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="withdrawn">Withdrawn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {candidateDetails?.jobsApplied && candidateDetails.jobsApplied.length > 1 && (
                  <div>
                    <Label>Job</Label>
                    <Select value={statusJobId} onValueChange={setStatusJobId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a job" />
                      </SelectTrigger>
                      <SelectContent>
                        {candidateDetails.jobsApplied.map((job: any) => (
                          <SelectItem key={job.jobId} value={job.jobId}>
                            {job.jobTitle}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Button
                  onClick={handleStatusUpdate}
                  disabled={isUpdatingStatus}
                  className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white disabled:opacity-60"
                >
                  {isUpdatingStatus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Status'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">Contact</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{candidate.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{candidate.phone}</span>
          </div>
          <Separator />
          <div className="space-y-2">
            {candidate.socialLinks.linkedin && (
              <div className="flex items-center gap-3">
                <AiFillLinkedin className="w-4 h-4 text-blue-600" />
                <a
                  href={normalizeUrl(candidate.socialLinks.linkedin)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {candidate.socialLinks.linkedin}
                </a>
              </div>
            )}
            {candidate.socialLinks.github && (
              <div className="flex items-center gap-3">
                <AiFillGithub className="w-4 h-4 text-gray-700" />
                <a
                  href={normalizeUrl(candidate.socialLinks.github)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:underline"
                >
                  {candidate.socialLinks.github}
                </a>
              </div>
            )}
            {candidate.socialLinks.portfolio && (
              <div className="flex items-center gap-3">
                <ExternalLink className="w-4 h-4 text-green-600" />
                <a
                  href={normalizeUrl(candidate.socialLinks.portfolio)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:underline"
                >
                  {candidate.socialLinks.portfolio}
                </a>
              </div>
            )}
          </div>
        </div>
      </Card>

      {candidate.queueMetrics && (
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#ff6b35]" />
            theGarage Metrics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-700">{candidate.queueMetrics.totalApplications}</div>
                <div className="text-xs text-blue-600">Applications</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-semibold text-green-700">{candidate.queueMetrics.responseRate}%</div>
                <div className="text-xs text-green-600">Response Rate</div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Interview Rate</span>
                <span className="text-sm font-medium">{candidate.queueMetrics.interviewRate}%</span>
              </div>
              <Progress value={candidate.queueMetrics.interviewRate} className="h-2" />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
