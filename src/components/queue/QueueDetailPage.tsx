import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, TrendingUp, TrendingDown, Users, Target, Crown, Award, BarChart3, Brain, Bot, Trophy, Medal, Zap, Activity, Clock, MapPin, Building, Eye, Share2, Bookmark, CheckCircle, User, Shuffle, RefreshCw } from 'lucide-react';
import { ProfileDropdown } from '../profile/ProfileDropdown';
import { CoffeeChatRequest } from '../chat/CoffeeChatRequest';
import { ProfileComparison } from '../profile/ProfileComparison';
import { QueueIntelligence } from './QueueIntelligence';
import { queueService } from '../../api/queueService';
import { getIndustryLabel, getIndustryLucideIcon, getIndustryColor } from './BucketManager';

interface QueueDetailPageProps {
  queue?: any;
  onBack: () => void;
  onNavigate: (view: string) => void;
  user?: any;
  onLogout?: () => void;
}

interface Candidate {
  id: string;
  rank: number;
  name: string;
  score: number;
  change: number;
  location: string;
  avatar: string;
  trending: string;
  isUser?: boolean;
  userId?: number | null;
  title?: string;
  company?: string;
  experience?: string;
  skills?: string[];
  bio?: string;
  education?: any[];
  work_history?: any[];
  industry?: string;
}

/** Map raw leaderboard candidates and tag the current user */
function mapLeaderboardWithUser(leaderboard: any[], userId: number | null): Candidate[] {
  return leaderboard.map((c) => ({
    id: c.profile_id?.toString() || c.id?.toString() || '',
    rank: c.rank,
    name: c.name,
    score: c.score,
    change: c.change || 0,
    location: c.location || 'Unknown',
    avatar: c.avatar || '👤',
    trending: c.trending || 'stable',
    userId: c.userId ?? null,
    isUser: c.userId != null && userId != null && Number(c.userId) === userId,
    title: c.title || '',
    company: c.company || '',
    experience: c.experience || '',
    skills: c.skills || [],
    bio: c.bio || '',
    education: c.education || [],
    work_history: c.work_history || [],
    industry: c.industry || ''
  }));
}

/** Build queue state from fetched API data */
function buildQueueFromData(
  details: any,
  mapped: Candidate[],
  industry: string,
  level: string,
  overrideMatch?: number
): any {
  const title = getIndustryLabel(industry);
  const IconComponent = getIndustryLucideIcon(industry);
  const color = getIndustryColor(industry);
  const userEntry = mapped.find((c) => c.isUser);
  return {
    id: `${industry}-${level}`,
    title,
    industry,
    level,
    description: `${title} professionals at ${level} level`,
    icon: IconComponent,
    color,
    current: userEntry?.rank || details?.current || 0,
    total: details?.total || mapped.length || 0,
    trend: userEntry
      ? userEntry.trending === 'up'
        ? 'up'
        : userEntry.trending === 'down'
          ? 'down'
          : 'stable'
      : 'stable',
    match: overrideMatch ?? userEntry?.score ?? 0,
    change: userEntry?.change || 0,
    isAuto: false,
    reason: `AI recommended this queue based on your profile alignment with ${title} at ${level} level.`,
  };
}

/** Build fallback queue when API fetch fails */
function buildFallbackQueue(industry: string, level: string): any {
  return {
    id: `${industry}-${level}`,
    title: getIndustryLabel(industry),
    industry,
    level,
    description: `${getIndustryLabel(industry)} at ${level} level`,
    icon: getIndustryLucideIcon(industry),
    color: getIndustryColor(industry),
    current: 0,
    total: 0,
    trend: 'stable',
    match: 0,
    change: 0,
    isAuto: false,
  };
}

/** Trend icon + change display */
function TrendDisplay({ trend, change }: Readonly<{ trend: string; change: number }>) {
  const icons = {
    up: <TrendingUp className="w-5 h-5 text-green-600" />,
    down: <TrendingDown className="w-5 h-5 text-red-600" />,
    stable: <div className="w-5 h-5 text-yellow-600">—</div>,
  };
  const colors = {
    up: 'text-green-600',
    down: 'text-red-600',
    stable: 'text-yellow-600',
  };
  return (
    <div className="flex items-center justify-center gap-1 mb-1">
      {icons[trend as keyof typeof icons] || icons.stable}
      <span className={`text-2xl font-medium ${colors[trend as keyof typeof colors] || colors.stable}`}>
        {change > 0 ? '+' : ''}{change}
      </span>
    </div>
  );
}

/** Small inline match-breakdown display */
const MatchBreakdownBadge = ({ breakdown }: { breakdown?: Record<string, number> }) => {
  if (!breakdown || Object.keys(breakdown).length === 0) return null;
  const items = [
    { key: 'semantic', label: 'Semantic', color: 'bg-blue-500' },
    { key: 'skill_coverage', label: 'Skill', color: 'bg-purple-500' },
    { key: 'experience', label: 'Exp', color: 'bg-orange-500' },
    { key: 'confidence', label: 'Conf', color: 'bg-green-500' },
    { key: 'education', label: 'Edu', color: 'bg-pink-500' },
    { key: 'industry_alignment', label: 'Ind', color: 'bg-cyan-500' },
    { key: 'level_alignment', label: 'Lvl', color: 'bg-yellow-500' },
  ];
  return (
    <div className="flex flex-wrap gap-1 mt-2 justify-center">
      {items.map(({ key, label, color }) => {
        const val = breakdown[key];
        if (val === undefined || val === null) return null;
        const pct = Math.round(val * 100);
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

/** Queue title, description, auto-badge and reason */
function QueueMeta({ queue }: Readonly<{ queue: any }>) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-3xl font-medium text-gray-900">{queue.title}</h1>
        {queue.isAuto && (
          <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
            <Bot className="w-3 h-3" />
            AI Selected
          </Badge>
        )}
      </div>
      <p className="text-lg text-gray-600 mb-4">{queue.description}</p>
      {queue.isAuto && queue.reason && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 max-w-[95vw] sm:max-w-2xl">
          <p className="text-sm text-blue-700">{queue.reason}</p>
        </div>
      )}
    </div>
  );
}

/** AI Intelligence button with premium styling */
function AIIntelligenceButton({ isPremium, onClick }: Readonly<{ isPremium: boolean; onClick: () => void }>) {
  const premiumClass = "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 text-purple-700 hover:from-purple-100 hover:to-blue-100";
  const basicClass = "bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 text-gray-500 hover:from-orange-50 hover:to-orange-100 hover:border-orange-300 hover:text-orange-700";
  return (
    <Button variant="outline" size="sm" onClick={onClick} className={isPremium ? premiumClass : basicClass}>
      {isPremium ? (
        <>
          <Brain className="w-4 h-4 mr-2" />
          AI Intelligence
        </>
      ) : (
        <>
          <Crown className="w-4 h-4 mr-2" />
          AI Intelligence (Premium)
        </>
      )}
    </Button>
  );
}

/** Premium upsell banner for non-premium users */
function PremiumBanner() {
  return (
    <Card className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200">
      <div className="flex items-center gap-3">
        <Crown className="w-6 h-6 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">Premium Leadership Feature</h3>
          <p className="text-sm text-yellow-700">Access exclusive leaderboards and networking opportunities</p>
        </div>
        <Button size="sm" className="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white">
          Upgrade to Premium
        </Button>
      </div>
    </Card>
  );
}

/** Hook for queue action handlers – returns separate premium and basic handler sets */
function useQueueActions() {
  const [selectedPerson, setSelectedPerson] = useState<any>(null);
  const [showCoffeeChatRequest, setShowCoffeeChatRequest] = useState(false);
  const [showProfileComparison, setShowProfileComparison] = useState(false);
  const [comparisonUser, setComparisonUser] = useState<any>(null);
  const [showQueueIntelligence, setShowQueueIntelligence] = useState(false);

  const handleSendCoffeeChatRequest = (requestData: any) => {
    alert(`Coffee chat request sent to ${requestData.recipientName}! They'll receive your request and can respond through their theGarage notifications.`);
    setShowCoffeeChatRequest(false);
    setSelectedPerson(null);
  };

  const premium = {
    handleCoffeeChatRequest: (person: any) => {
      setSelectedPerson(person);
      setShowCoffeeChatRequest(true);
    },
    handleViewProfile: () => {},
    handleCompareProfile: (person: any) => {
      setComparisonUser(person);
      setShowProfileComparison(true);
    },
    handleOpenQueueIntelligence: () => {
      setShowQueueIntelligence(true);
    },
  };

  const basic = {
    handleCoffeeChatRequest: () => {
      alert('Upgrade to Premium to request coffee chats with other professionals!');
    },
    handleViewProfile: () => {
      alert('Upgrade to Premium to view detailed profiles!');
    },
    handleCompareProfile: () => {
      alert('Upgrade to Premium to access Profile Comparison features!');
    },
    handleOpenQueueIntelligence: () => {
      alert('Upgrade to Premium to access AI Queue Intelligence features!');
    },
  };

  return {
    selectedPerson,
    showCoffeeChatRequest,
    showProfileComparison,
    comparisonUser,
    showQueueIntelligence,
    premium,
    basic,
    handleSendCoffeeChatRequest,
    setShowCoffeeChatRequest,
    setSelectedPerson,
    setShowProfileComparison,
    setShowQueueIntelligence,
    setComparisonUser,
  };
}

/** Analytics tab panel */
function AnalyticsPanel({ bucketStats }: Readonly<{ bucketStats: any }>) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-medium text-gray-900 mb-2">Queue Analytics</h2>
        <p className="text-gray-600">Market insights and hiring trends</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Badge className="bg-blue-100 text-blue-800">Total</Badge>
          </div>
          <div className="text-2xl font-medium text-gray-900 mb-1">{bucketStats?.candidate_count ?? '—'}</div>
          <div className="text-sm text-gray-500">Candidates in Queue</div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <Badge className="bg-green-100 text-green-800">Average</Badge>
          </div>
          <div className="text-2xl font-medium text-gray-900 mb-1">{bucketStats?.years_stats?.mean?.toFixed(1) ?? '—'}</div>
          <div className="text-sm text-gray-500">Years of Experience</div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <Badge className="bg-orange-100 text-orange-800">Range</Badge>
          </div>
          <div className="text-2xl font-medium text-gray-900 mb-1">{bucketStats?.years_stats?.min ?? '—'} – {bucketStats?.years_stats?.max ?? '—'}</div>
          <div className="text-sm text-gray-500">Experience Range (Years)</div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-800">Median</Badge>
          </div>
          <div className="text-2xl font-medium text-gray-900 mb-1">{bucketStats?.years_stats?.median?.toFixed(1) ?? '—'}</div>
          <div className="text-sm text-gray-500">Median Experience</div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Top Skills in Queue</h3>
          {bucketStats?.top_skills && bucketStats.top_skills.length > 0 ? (
            <div className="space-y-3">
              {bucketStats.top_skills.map((skill: { skill: string; count: number }, idx: number) => (
                <div key={skill.skill} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <span className="text-gray-700">{skill.skill}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={Math.max(5, 100 - (idx * 15))} className="w-20" />
                    <span className="text-sm text-gray-500">{skill.count} candidates</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skill data available for this queue.</p>
          )}
        </Card>
        <Card className="p-6">
          <h3 className="font-medium text-gray-900 mb-4">Companies Actively Hiring</h3>
          <p className="text-gray-500">Company hiring data is not yet available for this queue.</p>
        </Card>
      </div>
    </div>
  );
}

interface CandidateCardProps {
  candidate: Candidate;
  isPremium: boolean;
  canCoffeeChat: boolean;
  onViewProfile: (person: any) => void;
  onCompareProfile: (person: any) => void;
  onCoffeeChatRequest: (person: any) => void;
}

function CandidateCard({
  candidate,
  isPremium,
  canCoffeeChat,
  onViewProfile,
  onCompareProfile,
  onCoffeeChatRequest
}: Readonly<CandidateCardProps>) {
  const getRankIcon = () => {
    if (candidate.rank === 1) return <Crown className="w-6 h-6" />;
    if (candidate.rank === 2) return <Medal className="w-6 h-6" />;
    if (candidate.rank === 3) return <Award className="w-6 h-6" />;
    return candidate.avatar;
  };

  const getRankBadgeClass = () => {
    if (candidate.rank <= 3) return 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white';
    return 'bg-gray-100';
  };

  const getTrendIcon = () => {
    if (candidate.trending === 'up') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (candidate.trending === 'down') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <div className="w-4 h-4 text-yellow-600">—</div>;
  };

  const getTrendColor = () => {
    if (candidate.trending === 'up') return 'text-green-600';
    if (candidate.trending === 'down') return 'text-red-600';
    return 'text-yellow-600';
  };

  const canViewDetails = isPremium || candidate.isUser;

  return (
    <Card
      key={candidate.rank}
      className={`p-6 transition-all hover:shadow-lg ${
        candidate.isUser ? 'border-2 border-[#ff6b35] bg-gradient-to-r from-orange-50 to-orange-100/30' : 'border border-gray-200'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getRankBadgeClass()}`}>
            {getRankIcon()}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className={`font-medium ${candidate.isUser ? 'text-[#ff6b35]' : 'text-gray-900'}`}>
                {canViewDetails ? candidate.name : <span className="blur-sm select-none">████████</span>}
              </h3>
              {candidate.isUser && (
                <Badge className="bg-[#ff6b35] text-white text-xs">YOU</Badge>
              )}
              {!isPremium && !candidate.isUser && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs flex items-center gap-1">
                  <Crown className="w-3 h-3" />
                  Premium
                </Badge>
              )}
              {isPremium && <Crown className="w-4 h-4 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {canViewDetails ? candidate.location : <span className="blur-sm select-none">██████</span>}
              </span>
              <span>•</span>
              <span>Rank #{candidate.rank}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-medium text-gray-900">{candidate.score}</div>
            <div className="text-sm text-gray-500">Score</div>
          </div>

          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={`text-sm font-medium ${getTrendColor()}`}>
              {candidate.change > 0 ? '+' : ''}{candidate.change}
            </span>
          </div>

          {!candidate.isUser && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewProfile({
                  id: candidate.userId?.toString() || candidate.rank.toString(),
                  userId: candidate.userId,
                  name: candidate.name,
                  title: candidate.title,
                  company: candidate.company,
                  location: candidate.location,
                  avatar: candidate.avatar,
                  type: 'job-seeker',
                  rank: candidate.rank,
                  score: candidate.score,
                  experience: candidate.experience,
                  skills: candidate.skills,
                  bio: candidate.bio,
                  education: candidate.education,
                  work_history: candidate.work_history,
                  industry: candidate.industry
                })}
                className={isPremium ? '' : 'opacity-60 cursor-not-allowed'}
              >
                <Eye className="w-4 h-4 mr-1" />
                {isPremium ? 'Profile' : 'Profile (Premium)'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onCompareProfile({
                  id: candidate.id,
                  userId: candidate.userId,
                  name: candidate.name,
                  location: candidate.location,
                  avatar: candidate.avatar,
                  type: 'job-seeker',
                  rank: candidate.rank,
                  score: candidate.score
                })}
                className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100"
              >
                <Shuffle className="w-4 h-4 mr-1" />
                Compare
              </Button>
              {canCoffeeChat && (
                <Button
                  size="sm"
                  className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
                  onClick={() => onCoffeeChatRequest({
                    id: candidate.rank.toString(),
                    name: candidate.name,
                    location: candidate.location,
                    avatar: candidate.avatar,
                    type: 'job-seeker',
                    rank: candidate.rank,
                    score: candidate.score
                  })}
                >
                  ☕ Coffee Chat
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function QueueDetailPage({ queue: propQueue, onBack, onNavigate, user, onLogout }: Readonly<QueueDetailPageProps>) {
  const params = useParams<{ industry: string; level: string }>();
  const [loadedQueue, setLoadedQueue] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!propQueue);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [realLeaderboard, setRealLeaderboard] = useState<Candidate[] | null>(null);
  const [bucketStats, setBucketStats] = useState<any>(null);
  const [myScoreBreakdown, setMyScoreBreakdown] = useState<Record<string, number> | null>(null);

  const industry = params.industry;
  const level = params.level;

  useEffect(() => {
    if (propQueue || !industry || !level) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const [details, leaderboard, stats, matchResult] = await Promise.all([
          queueService.getBucketDetails(industry, level),
          queueService.getBucketLeaderboard(industry, level),
          queueService.getBucketStats(industry, level),
          queueService.getMyBucketMatchScore(industry, level),
        ]);
        const currentUserId = user?.id ? Number(user.id) : null;
        const mapped = mapLeaderboardWithUser(leaderboard, currentUserId);
        setRealLeaderboard(mapped);

        const fetchedMatch = matchResult?.success ? matchResult.match_percentage : null;
        const fetchedBreakdown = matchResult?.success ? matchResult.score_breakdown : null;
        setMyScoreBreakdown(fetchedBreakdown);
        setLoadedQueue(buildQueueFromData(details, mapped, industry, level, fetchedMatch ?? undefined));
        setBucketStats(stats);
      } catch (error) {
        console.error('Failed to load queue details:', error);
        setLoadedQueue(buildFallbackQueue(industry, level));
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [industry, level, propQueue, user]);

  const handleRefreshRanking = async () => {
    if (!industry || !level || isRefreshing) return;
    setIsRefreshing(true);
    try {
      const refreshed = await queueService.getBucketLeaderboard(industry, level, true);
      const currentUserId = user?.id ? Number(user.id) : null;
      const mapped = mapLeaderboardWithUser(refreshed, currentUserId);
      setRealLeaderboard(mapped);
    } catch (error) {
      console.error('Failed to refresh ranking:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const isPremium = user?.isPremium || false;
  const userRole = user?.role || 'job-seeker';
  const canCoffeeChat = userRole === 'recruiter' || (userRole === 'job-seeker' && isPremium);
  const navigate = useNavigate();
  const actions = useQueueActions();
  const {
    showCoffeeChatRequest,
    selectedPerson,
    showProfileComparison,
    comparisonUser,
    showQueueIntelligence,
    premium,
    basic,
    handleSendCoffeeChatRequest,
    setShowCoffeeChatRequest,
    setSelectedPerson,
    setShowProfileComparison,
    setShowQueueIntelligence,
    setComparisonUser,
  } = actions;
  const handlers = isPremium ? premium : basic;

  const handleViewProfile = (person: any) => {
    if (!isPremium) {
      alert('Upgrade to Premium to view detailed profiles!');
      return;
    }
    const targetId = person.userId ?? person.id;
    if (!targetId) {
      alert('Unable to load profile: missing candidate ID');
      return;
    }
    const userRole = user?.role || 'job-seeker';
    navigate(`/candidate/${targetId}`, {
      state: { candidate: person, viewerRole: userRole }
    });
  };

  const queue = {
    ...propQueue || loadedQueue,
    industry: (propQueue || loadedQueue)?.industry || params.industry || '',
    level: (propQueue || loadedQueue)?.level || params.level || '',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-[#ff6b35] rounded-full animate-spin mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">
            <span className="text-slate-900">the</span>
            <span className="text-[#ff6b35]">Garage</span>
          </h1>
          <p className="text-gray-600">Loading queue details...</p>
        </div>
      </div>
    );
  }

  if (!queue) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Queue Not Found</h2>
          <p className="text-gray-600 mb-4">The queue you are looking for does not exist.</p>
          <Button onClick={onBack}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Only use real leaderboard data from API
  const leaderboardData = realLeaderboard || [];

  const IconComponent = queue.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-lg shadow-gray-900/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="rounded-full w-10 h-10 p-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <span className="text-xl font-medium">
                  <span className="text-gray-900">the</span>
                  <span className="text-[#ff6b35]">Garage</span>
                </span>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Queue Details</span>
              </div>
            </div>
            
            {/* Right Side */}
            <div className="flex items-center gap-4">
              <ProfileDropdown 
                onNavigate={onNavigate}
                onLogout={onLogout}
                isPremium={isPremium}
                userName={user ? `${user.firstName} ${user.lastName}` : "User"}
                userEmail={user?.email || "user@example.com"}
                userAvatar={user?.avatar}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Queue Header */}
        <div className="mb-8">
          <Card className="p-8 bg-white/80 backdrop-blur-sm border-2 border-orange-100/50 shadow-2xl shadow-orange-500/10">
            <div className="flex items-start gap-6">
              <div className={`w-20 h-20 ${queue.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <QueueMeta queue={queue} />
                  
                  <div className="flex gap-3">
                    <AIIntelligenceButton isPremium={isPremium} onClick={handlers.handleOpenQueueIntelligence} />
                    <Button variant="outline" size="sm">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Watch Queue
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
                
                {/* Key Stats */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
                    <div className="text-2xl font-medium text-gray-900 mb-1">{queue.current > 0 ? `#${queue.current}` : 'Unranked'}</div>
                    <div className="text-sm text-gray-500">Your Rank</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200">
                    <div className="text-2xl font-medium text-gray-900 mb-1">{queue.total}</div>
                    <div className="text-sm text-gray-500">Total Candidates</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200">
                    <div className="text-2xl font-medium text-gray-900 mb-1">{queue.match > 0 ? `${queue.match}%` : '-'}</div>
                    <div className="text-sm text-gray-500">Match Score</div>
                    {myScoreBreakdown && <MatchBreakdownBadge breakdown={myScoreBreakdown} />}
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200">
                    <TrendDisplay trend={queue.trend} change={queue.change} />
                    <div className="text-sm text-gray-500">vs Last Month</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leaderboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          {/* Leaderboard Tab */}
          <TabsContent value="leaderboard" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-medium text-gray-900">Queue Leadership</h2>
                <p className="text-gray-600">Top performers and hiring leaders in {queue.title.toLowerCase()}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshRanking}
                  disabled={isRefreshing}
                  className="flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh'}
                </Button>
                {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={selectedTimeframe === period ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTimeframe(period)}
                    className={selectedTimeframe === period ? 'bg-[#ff6b35] hover:bg-[#e55a2b]' : ''}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {!isPremium && <PremiumBanner />}

            {/* Leadership Tabs */}
            <Tabs defaultValue="job-seekers" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="job-seekers" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Job Seeker Leadership
                </TabsTrigger>
                <TabsTrigger value="recruiters" className="flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Recruiter Leadership
                </TabsTrigger>
              </TabsList>

              {/* Job Seeker Leadership */}
              <TabsContent value="job-seekers" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Top Job Seekers</h3>
                  <p className="text-gray-600">Highest-ranked professionals in this queue</p>
                </div>

                {leaderboardData.length > 0 ? (
                  <div className="grid gap-4">
                    {leaderboardData.map((candidate) => (
                      <CandidateCard
                        key={candidate.rank}
                        candidate={candidate}
                        isPremium={isPremium}
                        canCoffeeChat={canCoffeeChat}
                        onViewProfile={handleViewProfile}
                        onCompareProfile={handlers.handleCompareProfile}
                        onCoffeeChatRequest={handlers.handleCoffeeChatRequest}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-8 text-center">
                    <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Rankings Available</h3>
                    <p className="text-gray-600">Candidate rankings for this queue are not yet available.</p>
                  </Card>
                )}
              </TabsContent>

              {/* Recruiter Leadership */}
              <TabsContent value="recruiters" className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Top Hiring Recruiters</h3>
                  <p className="text-gray-600">Most active recruiters hiring in this queue</p>
                </div>

                <Card className="p-8 text-center">
                  <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Recruiter Data</h3>
                  <p className="text-gray-600">Recruiter activity for this queue is not yet available.</p>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsPanel bucketStats={bucketStats} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-2">AI-Powered Insights</h2>
              <p className="text-gray-600">Personalized recommendations to improve your queue ranking</p>
            </div>

            <Card className="p-8 text-center">
              <Brain className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Insights Coming Soon</h3>
              <p className="text-gray-600 max-w-xl mx-auto">
                AI-powered queue insights and personalized improvement recommendations will be available once we analyze enough candidate data for this queue.
              </p>
            </Card>
          </TabsContent>



          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div>
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Recent Activity</h2>
              <p className="text-gray-600">Your queue activity and ranking changes</p>
            </div>

            <Card className="p-8 text-center">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
              <p className="text-gray-600">Activity tracking for this queue will appear here once available.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Coffee Chat Request Modal */}
      {showCoffeeChatRequest && selectedPerson && (
        <CoffeeChatRequest
          person={selectedPerson}
          onSendRequest={handleSendCoffeeChatRequest}
          onClose={() => {
            setShowCoffeeChatRequest(false);
            setSelectedPerson(null);
          }}
        />
      )}

      {/* Profile Comparison Modal */}
      {showProfileComparison && comparisonUser && (
        <ProfileComparison
          profileId={comparisonUser.id}
          userId={comparisonUser.userId}
          yourRank={queue.current || 0}
          theirRank={comparisonUser.rank || 0}
          queue={queue}
          onClose={() => {
            setShowProfileComparison(false);
            setComparisonUser(null);
          }}
        />
      )}

      {/* Queue Intelligence Modal */}
      {showQueueIntelligence && (
        <QueueIntelligence
          queue={queue}
          userPosition={queue.current}
          onClose={() => setShowQueueIntelligence(false)}
          user={user}
        />
      )}
    </div>
  );
}