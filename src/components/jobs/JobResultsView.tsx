import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../ui/dialog';
import { CandidateCard } from './results/CandidateCard';
import { KanbanColumn } from './results/JobsKanban';
import { ScheduleInterviewSheet } from '../calendar/ScheduleInterviewSheet';
import { createConversation, sendMessage } from '../../api/chat';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Search,
  Download,
  List,
  Columns,
  User,
  TrendingUp,
  Users,
  CheckCircle,
  BarChart3} from 'lucide-react';
import { jobPostsApi } from '../../api/jobPosts';

interface JobResultsViewProps {
  job: any;
  onBack: () => void;
  onViewProfile?: (candidate: any) => void;
}

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
  isSaved?: boolean;
}

export function JobResultsView({ job, onBack, onViewProfile }: Readonly<JobResultsViewProps>) {
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [interviewCandidate, setInterviewCandidate] = useState<Candidate | null>(null);
  const [showInterviewSheet, setShowInterviewSheet] = useState(false);

  const [messageCandidate, setMessageCandidate] = useState<Candidate | null>(null);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Fetch candidates from API
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!job?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await jobPostsApi.getJobApplications(job.id);

        if (response.success && response.data) {
          // Map backend JobApplication status to frontend Kanban status
          const mapApplicationStatus = (backendStatus: string, _source: string): string => {
            return backendStatus;
          };

          // Transform API response to Candidate format
          const transformedCandidates: Candidate[] = response.data.map((app: any) => {
            const source = app.source || 'Direct Apply';
            return {
              id: app.candidate_id || app.id,
              name: app.candidate_name || app.name || 'Unknown',
              title: app.candidate_title || app.title || 'Candidate',
              location: app.location || 'Unknown',
              experience: app.years_experience ? `${app.years_experience} years` : 'N/A',
              avatar: app.profile_image || null,
              status: mapApplicationStatus(app.status, source),
              appliedDate: app.date_applied || app.dateApplied || new Date().toISOString(),
              lastUpdated: app.last_updated || app.lastUpdated || new Date().toISOString(),
              source,
              matchScore: app.match_score || app.matchScore || 0,
              email: app.candidate_email || app.email || '',
              phone: app.candidate_phone || app.phone || '',
              isSaved: app.is_saved || app.isSaved || false,
            };
          });
          setCandidates(transformedCandidates);
        } else {
          setError('Failed to load candidates');
        }
      } catch (err: any) {
        console.error('Error fetching candidates:', err);
        setError(err.message || 'Failed to load candidates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCandidates();
  }, [job?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-gray-600">Loading candidates...</div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="p-8 sm:p-12 text-center">
            <h3 className="text-lg text-red-600 mb-2">Error Loading Candidates</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Filter candidates by status
  const getFilteredCandidates = (tab: string) => {
    let filtered;

    switch (tab) {
      case 'consider':
        filtered = candidates.filter(c => c.status === 'consider');
        break;
      case 'applied':
        filtered = candidates.filter(c => c.status === 'applied');
        break;
      case 'interviewing':
        filtered = candidates.filter(c => c.status === 'interviews');
        break;
      case 'offers':
        filtered = candidates.filter(c => c.status === 'offers');
        break;
      case 'hired':
        filtered = candidates.filter(c => c.status === 'hired');
        break;
      case 'not-considered':
        filtered = candidates.filter(c => c.status === 'rejected');
        break;
      case 'withdrawn':
        filtered = candidates.filter(c => c.status === 'withdrawn');
        break;
      default:
        filtered = candidates;
    }

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const displayedCandidates = getFilteredCandidates(activeTab);

  // Calculate summary metrics
  const totalCandidates = candidates.length;
  const considerCount = candidates.filter(c => c.status === 'consider').length;
  const appliedCount = candidates.filter(c => c.status === 'applied').length;
  const interviewingCount = candidates.filter(c => c.status === 'interviews').length;
  const offersCount = candidates.filter(c => c.status === 'offers').length;
  const hiredCount = candidates.filter(c => c.status === 'hired').length;
  const notConsideredCount = candidates.filter(c => c.status === 'rejected').length;
  const withdrawnCount = candidates.filter(c => c.status === 'withdrawn').length;

  // Conversion rate (Applied -> Hired)
  const conversionRate = appliedCount > 0 ? ((hiredCount / appliedCount) * 100).toFixed(1) : '0.0';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'consider':
        return <Badge className="bg-yellow-100 text-yellow-800">Consider</Badge>;
      case 'applied':
        return <Badge className="bg-blue-100 text-blue-800">Applied</Badge>;
      case 'interviews':
        return <Badge className="bg-purple-100 text-purple-800">Interviews</Badge>;
      case 'offers':
        return <Badge className="bg-emerald-100 text-emerald-800">Offers</Badge>;
      case 'hired':
        return <Badge className="bg-green-100 text-green-800">Hired</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Not Considered</Badge>;
      case 'withdrawn':
        return <Badge className="bg-gray-100 text-gray-800">Withdrawn</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getDaysAgo = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'Today' : `${diffDays}d ago`;
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setInterviewCandidate(candidate);
    setShowInterviewSheet(true);
  };

  const handleSendMessage = (candidate: Candidate) => {
    setMessageCandidate(candidate);
    setMessageText('');
    setMessageDialogOpen(true);
  };

  const handleMessageSubmit = async () => {
    if (!messageCandidate || !messageText.trim()) return;
    if (!job?.id) {
      toast.error('No job selected for this conversation');
      return;
    }

    setIsSendingMessage(true);
    try {
      const conversation = await createConversation({
        conversation_type: 'job',
        participant_ids: [Number.parseInt(messageCandidate.id, 10)],
        job: Number(job.id),
      });

      await sendMessage({
        conversation: conversation.id,
        content: messageText.trim(),
        message_type: 'text',
      });

      toast.success(`Message sent to ${messageCandidate.name}`);
      setMessageDialogOpen(false);
      setMessageCandidate(null);
      setMessageText('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="mb-4 text-gray-900 hover:text-[#ff6b35] hover:border-[#ff6b35] border-2"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Job List</span>
            </Button>
            <h1 className="text-3xl text-gray-900 mb-2">Job Results</h1>
            <p className="text-gray-600">{job.title} - {job.location}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Results
            </Button>
            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 p-1">
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                onClick={() => setViewMode('list')}
                className={viewMode === 'list' ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                onClick={() => setViewMode('kanban')}
                className={viewMode === 'kanban' ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
              >
                <Columns className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Candidates</p>
                <p className="text-2xl text-gray-900">{totalCandidates}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">In Pipeline</p>
                <p className="text-2xl text-gray-900">{appliedCount + interviewingCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Hired</p>
                <p className="text-2xl text-green-600">{hiredCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Conversion Rate</p>
                <p className="text-2xl text-orange-600">{conversionRate}%</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card className="p-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search candidates by name or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 bg-white border border-gray-200">
            <TabsTrigger value="all">All ({totalCandidates})</TabsTrigger>
            <TabsTrigger value="consider">Consider ({considerCount})</TabsTrigger>
            <TabsTrigger value="applied">Applied ({appliedCount})</TabsTrigger>
            <TabsTrigger value="interviewing">Interviewing ({interviewingCount})</TabsTrigger>
            <TabsTrigger value="offers">Offers ({offersCount})</TabsTrigger>
            <TabsTrigger value="hired">Hired ({hiredCount})</TabsTrigger>
            <TabsTrigger value="not-considered">Not Considered ({notConsideredCount})</TabsTrigger>
            <TabsTrigger value="withdrawn">Withdrawn ({withdrawnCount})</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {viewMode === 'list' ? (
              /* List View */
              <div className="space-y-4">
                {displayedCandidates.length === 0 ? (
                  <Card className="p-12 text-center">
                    <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg text-gray-900 mb-2">No candidates found</h3>
                    <p className="text-gray-600">
                      {searchQuery ? 'Try adjusting your search query' : 'No candidates in this category yet'}
                    </p>
                  </Card>
                ) : (
                  displayedCandidates.map((candidate) => (
                    <CandidateCard
                      key={candidate.id}
                      candidate={candidate}
                      getStatusBadge={getStatusBadge}
                      getDaysAgo={getDaysAgo}
                      onViewProfile={onViewProfile}
                      onSendMessage={handleSendMessage}
                      onScheduleInterview={handleScheduleInterview}
                      jobId={job?.id}
                      initialIsSaved={candidate.isSaved}
                    />
                  ))
                )}
              </div>
            ) : (
              /* Kanban View */
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-4">
                  <KanbanColumn
                    title="Consider"
                    candidates={candidates.filter(c => c.status === 'consider')}
                    count={considerCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Applied"
                    candidates={candidates.filter(c => c.status === 'applied')}
                    count={appliedCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Interviewing"
                    candidates={candidates.filter(c => c.status === 'interviews')}
                    count={interviewingCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Offers"
                    candidates={candidates.filter(c => c.status === 'offers')}
                    count={offersCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Hired"
                    candidates={candidates.filter(c => c.status === 'hired')}
                    count={hiredCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Not Considered"
                    candidates={candidates.filter(c => c.status === 'rejected')}
                    count={notConsideredCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                  <KanbanColumn
                    title="Withdrawn"
                    candidates={candidates.filter(c => c.status === 'withdrawn')}
                    count={withdrawnCount}
                    getStatusBadge={getStatusBadge}
                    getDaysAgo={getDaysAgo}
                  />
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {interviewCandidate && (
        <ScheduleInterviewSheet
          open={showInterviewSheet}
          onOpenChange={setShowInterviewSheet}
          candidate={{
            ...interviewCandidate,
            position: interviewCandidate.title
          }}
          jobId={job?.id}
        />
      )}

      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Message {messageCandidate?.name}</DialogTitle>
            <DialogDescription>
              Send a message to {messageCandidate?.name} about {job?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="candidate-message">Message</Label>
            <Textarea
              id="candidate-message"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMessageDialogOpen(false)}
              disabled={isSendingMessage}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMessageSubmit}
              disabled={isSendingMessage || !messageText.trim()}
            >
              {isSendingMessage ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
