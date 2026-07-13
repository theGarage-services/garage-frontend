import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { 
  ArrowLeft,
  Search,
  Star,
  ThumbsUp,
  MessageCircle,
  Download,
  Eye,
  MapPin,
  Clock,
  GraduationCap,
  Briefcase,
  Target,
  Zap,
  Crown,
  Users,
  CheckCircle,
  Send,
  Grid3X3,
  List,
  Table} from 'lucide-react';

interface JobCandidateRankingProps {
  job: any;
  onBack: () => void;
  onViewProfile?: (candidate: any) => void;
  onStartChat?: (candidate: any) => void;
  onUpdateCandidateStatus?: (candidateId: string, status: string) => void;
}

export function JobCandidateRanking({ job, onBack, onViewProfile, onStartChat, onUpdateCandidateStatus }: Readonly<JobCandidateRankingProps>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('recommended');
  const [viewMode, setViewMode] = useState<'cards' | 'list' | 'table'>('cards');
  const [recommendedCandidates, setRecommendedCandidates] = useState<any[]>([]);
  const [manualApplicants, setManualApplicants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch ranked candidates from API with filtering
  useEffect(() => {
    const fetchRankedCandidates = async () => {
      if (!job?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const { jobPostsApi } = await import('../../api/jobPosts');

        // Fetch manual applicants first
        const applicationsResponse = await jobPostsApi.getJobApplications(job.id);

        if (applicationsResponse.success) {
          setManualApplicants(applicationsResponse.data || []);
        }

        // Get all applicants as candidates for filtering and ranking
        // Transform applicants to candidate format expected by API
        const candidatesForFiltering = applicationsResponse.data?.map((app: any) => ({
          id: app.candidate_id || app.id,
          name: app.candidate_name || app.name,
          title: app.candidate_title || app.title,
          skills: app.skills || [],
          experience: app.experience || app.years_experience || 0,
          education: app.education || [],
          location: app.location,
          salary_expectation: app.salary_expectation,
          availability: app.availability,
          profile_image: app.profile_image,
        })) || [];

        // Only call filtered ranking if we have candidates
        if (candidatesForFiltering.length > 0) {
          const filteredResponse = await jobPostsApi.rankFilteredCandidates(
            job.id,
            candidatesForFiltering,
            { top_n: 20 }
          );

          if (filteredResponse.success) {
            setRecommendedCandidates(filteredResponse.data.ranked_candidates || []);
          } else {
            setError(filteredResponse.error || 'Failed to load filtered candidates');
          }
        } else {
          setRecommendedCandidates([]);
        }
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankedCandidates();
  }, [job?.id]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-600">Loading candidates...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600">{error}</div>
        <Button onClick={() => globalThis.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'interviewing': return 'bg-yellow-100 text-yellow-800';
      case 'pending-review': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRecommended = recommendedCandidates.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'premium') return matchesSearch && candidate.premium;
    if (selectedFilter === 'available') return matchesSearch && candidate.status === 'available';
    if (selectedFilter === 'high-match') return matchesSearch && candidate.matchScore >= 90;
    
    return matchesSearch;
  });

  const filteredManual = manualApplicants.filter(candidate => {
    const matchesSearch = candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         candidate.skills.some((skill: string) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'pending') return matchesSearch && candidate.status === 'pending-review';
    if (selectedFilter === 'reviewed') return matchesSearch && candidate.status === 'reviewed';
    
    return matchesSearch;
  });

  // Render functions for different view modes
  const renderCardView = (candidates: any[], isRecommended = true) => (
    <div className="space-y-4">
      {candidates.map((candidate) => (
        <Card key={candidate.id} className="p-4 sm:p-6 hover:shadow-lg transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className={isRecommended ? "bg-[#ff6b35] text-white text-lg" : "bg-blue-500 text-white text-lg"}>
                    {candidate.avatar}
                  </AvatarFallback>
                </Avatar>
                {candidate.premium && (
                  <Crown className="w-5 h-5 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl text-gray-900">{candidate.name}</h3>
                  {isRecommended ? (
                    <>
                      <Badge className="bg-blue-100 text-blue-800">
                        #{candidate.queueRank} in queue
                      </Badge>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                      {candidate.premium && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Premium
                        </Badge>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge className={getStatusColor(candidate.status)}>
                        {candidate.status}
                      </Badge>
                      {candidate.coverLetter && (
                        <Badge className="bg-green-100 text-green-800">
                          Cover Letter
                        </Badge>
                      )}
                    </>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {candidate.title} at {candidate.company}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {candidate.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {candidate.experience}
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  <GraduationCap className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{candidate.education}</span>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {candidate.skills.slice(0, 5).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 5 && (
                    <Badge variant="secondary" className="text-xs">
                      +{candidate.skills.length - 5} more
                    </Badge>
                  )}
                </div>

                {isRecommended ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Key Strengths</p>
                      <div className="text-sm text-gray-900">
                        {candidate.keyStrengths.slice(0, 2).map((strength: string) => (
                          <div key={strength} className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            {strength}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Salary Expectation</p>
                      <p className="text-sm font-medium text-gray-900">{candidate.salaryExpectation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Availability</p>
                      <p className="text-sm font-medium text-gray-900">{candidate.availability}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Application Source</p>
                      <p className="text-sm font-medium text-gray-900">{candidate.source}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Salary Expectation</p>
                      <p className="text-sm font-medium text-gray-900">{candidate.salaryExpectation}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Applied Date</p>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(candidate.appliedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {isRecommended && (
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl font-medium text-[#ff6b35]">
                    {candidate.matchScore}%
                  </span>
                  <span className="text-sm text-gray-500">match</span>
                </div>
                <Progress value={candidate.matchScore} className="w-24 h-2 mb-3" />
                <div className="text-xs text-gray-500">
                  Last active: {candidate.lastActive}
                </div>
              </div>
            )}
          </div>

          {isRecommended && (
            <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">{candidate.projects}</div>
                <div className="text-xs text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">{candidate.recommendations}</div>
                <div className="text-xs text-gray-600">Recommendations</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-gray-900">{candidate.interviews}</div>
                <div className="text-xs text-gray-600">Interviews</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-medium text-green-600">{candidate.successRate}</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
            </div>
          )}

          {candidate.notes && !isRecommended && (
            <div className="bg-blue-50 p-3 rounded-lg mb-4">
              <p className="text-xs text-blue-600 mb-1">Notes</p>
              <p className="text-sm text-blue-800">{candidate.notes}</p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {isRecommended ? (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Star className="w-4 h-4 text-yellow-500" />
                <span>Response rate: {candidate.responseRate}</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">
                Applied {new Date(candidate.appliedDate).toLocaleDateString()}
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewProfile?.(candidate)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isRecommended ? 'View Profile' : 'View Application'}
              </Button>
              <Button size="sm" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Resume
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStartChat?.(candidate)}
                disabled={!candidate.premium}
                title={candidate.premium ? "Start chat" : "Premium feature - Candidate must have premium account"}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {candidate.premium ? 'Message' : 'Message (Premium)'}
              </Button>
              <Button 
                size="sm" 
                className={isRecommended ? "bg-[#ff6b35] hover:bg-[#e55a2b] text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}
                onClick={() => {
                  const newStatus = 'applied';
                  onUpdateCandidateStatus?.(candidate.id, newStatus);
                }}
              >
                {isRecommended ? (
                  <>
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    Shortlist
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Review
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderListView = (candidates: any[], isRecommended = true) => (
    <div className="space-y-3">
      {candidates.map((candidate) => (
        <Card key={candidate.id} className="p-4 hover:shadow-md transition-all duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className={isRecommended ? "bg-[#ff6b35] text-white" : "bg-blue-500 text-white"}>
                    {candidate.avatar}
                  </AvatarFallback>
                </Avatar>
                {candidate.premium && (
                  <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900 truncate">{candidate.name}</h3>
                  {isRecommended && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      #{candidate.queueRank}
                    </Badge>
                  )}
                  <Badge className={`${getStatusColor(candidate.status)} text-xs`}>
                    {candidate.status}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                  <span className="truncate">{candidate.title} at {candidate.company}</span>
                  <span>•</span>
                  <span>{candidate.location}</span>
                  <span>•</span>
                  <span>{candidate.experience}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {candidate.skills.slice(0, 3).map((skill: string) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {candidate.skills.length > 3 && (
                    <span className="text-xs text-gray-500">+{candidate.skills.length - 3}</span>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                {isRecommended && (
                  <div className="text-2xl font-medium text-[#ff6b35] mb-1">
                    {candidate.matchScore}%
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  {candidate.salaryExpectation}
                </div>
                {isRecommended ? (
                  <div className="text-xs text-gray-500">
                    {candidate.availability}
                  </div>
                ) : (
                  <div className="text-xs text-gray-500">
                    {new Date(candidate.appliedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 ml-4">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onViewProfile?.(candidate)}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStartChat?.(candidate)}
                disabled={!candidate.premium}
                title={candidate.premium ? "Start chat" : "Premium feature"}
              >
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                className={isRecommended ? "bg-[#ff6b35] hover:bg-[#e55a2b] text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}
                onClick={() => {
                  const newStatus = 'applied';
                  onUpdateCandidateStatus?.(candidate.id, newStatus);
                }}
              >
                {isRecommended ? <ThumbsUp className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderTableView = (candidates: any[], isRecommended = true) => (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-medium text-gray-900">Candidate</th>
              <th className="text-left p-4 font-medium text-gray-900">Position</th>
              <th className="text-left p-4 font-medium text-gray-900">Location</th>
              <th className="text-left p-4 font-medium text-gray-900">Experience</th>
              {isRecommended && <th className="text-left p-4 font-medium text-gray-900">Match</th>}
              <th className="text-left p-4 font-medium text-gray-900">Salary</th>
              <th className="text-left p-4 font-medium text-gray-900">Status</th>
              <th className="text-left p-4 font-medium text-gray-900">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className={isRecommended ? "bg-[#ff6b35] text-white" : "bg-blue-500 text-white"}>
                          {candidate.avatar}
                        </AvatarFallback>
                      </Avatar>
                      {candidate.premium && (
                        <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{candidate.name}</div>
                      {isRecommended && (
                        <div className="text-xs text-blue-600">#{candidate.queueRank} in queue</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-gray-900">{candidate.title}</div>
                  <div className="text-xs text-gray-500">{candidate.company}</div>
                </td>
                <td className="p-4 text-sm text-gray-600">{candidate.location}</td>
                <td className="p-4 text-sm text-gray-600">{candidate.experience}</td>
                {isRecommended && (
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-medium text-[#ff6b35]">{candidate.matchScore}%</span>
                      <Progress value={candidate.matchScore} className="w-16 h-1" />
                    </div>
                  </td>
                )}
                <td className="p-4 text-sm text-gray-600">{candidate.salaryExpectation}</td>
                <td className="p-4">
                  <Badge className={`${getStatusColor(candidate.status)} text-xs`}>
                    {candidate.status}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => onViewProfile?.(candidate)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 w-8 p-0"
                      onClick={() => onStartChat?.(candidate)}
                      disabled={!candidate.premium}
                      title={candidate.premium ? "Start chat" : "Premium feature"}
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      className={`h-8 w-8 p-0 ${isRecommended ? "bg-[#ff6b35] hover:bg-[#e55a2b] text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                      onClick={() => {
                        const newStatus = 'applied';
                        onUpdateCandidateStatus?.(candidate.id, newStatus);
                      }}
                    >
                      {isRecommended ? <ThumbsUp className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Button 
              variant="ghost" 
              onClick={onBack}
              className="mb-4 text-gray-600 hover:text-[#ff6b35]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job Management
            </Button>
            <h1 className="text-3xl text-gray-900 mb-2">Candidates for {job.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {job.department}
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {job.applicants} total applicants
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-[95vw] sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={selectedFilter === 'premium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('premium')}
                >
                  <Crown className="w-4 h-4 mr-1" />
                  Premium
                </Button>
                <Button
                  variant={selectedFilter === 'available' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('available')}
                >
                  Available
                </Button>
                <Button
                  variant={selectedFilter === 'high-match' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter('high-match')}
                >
                  <Target className="w-4 h-4 mr-1" />
                  90%+ Match
                </Button>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className="h-8 px-3"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 px-3"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-8 px-3"
              >
                <Table className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-200">
            <TabsTrigger value="recommended" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              theGarage Recommended ({recommendedCandidates.length})
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Manual Applications ({manualApplicants.length})
            </TabsTrigger>
          </TabsList>

          {/* Recommended Candidates */}
          <TabsContent value="recommended">
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2">AI-Powered Recommendations</h3>
                    <p className="opacity-90">
                      Top {recommendedCandidates.length} candidates from our job seeker queues, ranked by compatibility and match score
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">{filteredRecommended.length}</div>
                    <div className="text-sm opacity-90">Candidates shown</div>
                  </div>
                </div>
              </Card>

              {filteredRecommended.length > 0 ? (
                <>
                  {viewMode === 'cards' && renderCardView(filteredRecommended, true)}
                  {viewMode === 'list' && renderListView(filteredRecommended, true)}
                  {viewMode === 'table' && renderTableView(filteredRecommended, true)}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg text-gray-900 mb-2">No recommended candidates found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Manual Applicants */}
          <TabsContent value="manual">
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Direct Applications</h3>
                    <p className="opacity-90">
                      Candidates who applied directly through your job posting
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-medium">{filteredManual.length}</div>
                    <div className="text-sm opacity-90">Applications</div>
                  </div>
                </div>
              </Card>

              {filteredManual.length > 0 ? (
                <>
                  {viewMode === 'cards' && renderCardView(filteredManual, false)}
                  {viewMode === 'list' && renderListView(filteredManual, false)}
                  {viewMode === 'table' && renderTableView(filteredManual, false)}
                </>
              ) : (
                <Card className="p-12 text-center">
                  <Send className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg text-gray-900 mb-2">No manual applications found</h3>
                  <p className="text-gray-600">Try adjusting your search or filters</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}