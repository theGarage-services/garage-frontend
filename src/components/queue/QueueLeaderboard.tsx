import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { X, Crown, Medal, Award, TrendingUp, Users, Eye, Star, MapPin, Briefcase } from 'lucide-react';
import { queueService, type QueueCandidate } from '../../api/queueService';

interface QueueLeaderboardProps {
  onClose: () => void;
  queueTitle: string;
  userPosition: number;
  // Bucket (Industry, Level) for ranking - same as queue
  industry?: string;
  level?: string;
}

interface LeaderboardCandidate extends Omit<QueueCandidate, 'rank'> {
  position: number;
  isCurrentUser?: boolean;
  trend: 'up' | 'down' | 'stable';
  positionChange: number;
}

export function QueueLeaderboard({ onClose, queueTitle, userPosition, industry, level }: Readonly<QueueLeaderboardProps>) {
  const [selectedCandidate, setSelectedCandidate] = useState<LeaderboardCandidate | null>(null);
  const [viewMode, setViewMode] = useState<'leaderboard' | 'profile'>('leaderboard');
  const [candidates, setCandidates] = useState<LeaderboardCandidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data from backend (bucket = queue with Industry/Level)
  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Use industry/level from props, or derive from queueTitle
      const bucketIndustry = industry || 'information-technology';
      const bucketLevel = level || 'L3';

      setIsLoading(true);
      try {
        // Get ranked candidates from bucket (same Industry/Level)
        const data = await queueService.getBucketLeaderboard(bucketIndustry, bucketLevel);
        // Transform API data to include UI-specific fields
        const transformedCandidates: LeaderboardCandidate[] = data.map((c: QueueCandidate, index: number) => ({
          ...c,
          position: index + 1,
          trend: index % 3 === 0 ? 'up' : index % 3 === 1 ? 'stable' : 'down',
          positionChange: Math.floor(Math.random() * 5),
          avatar: c.avatar || '/api/placeholder/40/40'
        }));
        setCandidates(transformedCandidates);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
        setCandidates([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [industry, level, queueTitle]);

  // Fallback mock data if API fails or returns empty
  const topCandidates: LeaderboardCandidate[] = candidates.length > 0 ? candidates : [
    {
      id: '1',
      name: 'Jane Doe',
      position: 1,
      score: 98,
      change: 0,
      avatar: '/api/placeholder/40/40',
      title: 'Senior Data Engineer',
      company: 'Google',
      location: 'San Francisco, CA',
      experience: '8 years',
      skills: ['Python', 'TensorFlow', 'AWS', 'Kubernetes', 'SQL'],
      strengths: ['Machine Learning Architecture', 'Data Pipeline Design', 'Team Leadership'],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional', 'Certified Kubernetes Administrator'],
      trend: 'stable',
      trending: 'stable',
      positionChange: 0
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      position: 2,
      score: 96,
      change: 2,
      avatar: '/api/placeholder/40/40',
      title: 'Lead Data Scientist',
      company: 'Meta',
      location: 'Menlo Park, CA',
      experience: '7 years',
      skills: ['Python', 'PyTorch', 'Spark', 'Docker', 'PostgreSQL'],
      strengths: ['Deep Learning', 'A/B Testing', 'Product Analytics'],
      certifications: ['Meta AI Specialist', 'AWS Machine Learning', 'Databricks Certified'],
      trend: 'up',
      trending: 'up',
      positionChange: 2
    },
    {
      id: '3',
      name: 'Emily Watson',
      position: 3,
      score: 94,
      change: -1,
      avatar: '/api/placeholder/40/40',
      title: 'Principal Data Engineer',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      experience: '9 years',
      skills: ['Scala', 'Kafka', 'Spark', 'Python', 'Cassandra'],
      strengths: ['Real-time Data Processing', 'System Design', 'Mentoring'],
      certifications: ['Confluent Kafka Expert', 'AWS Big Data', 'Databricks Professional'],
      trend: 'down',
      trending: 'down',
      positionChange: -1
    },
    {
      id: '4',
      name: 'David Park',
      position: 4,
      score: 92,
      change: 3,
      avatar: '/api/placeholder/40/40',
      title: 'Senior ML Engineer',
      company: 'Uber',
      location: 'San Francisco, CA',
      experience: '6 years',
      skills: ['Python', 'Go', 'TensorFlow', 'MLflow', 'Redis'],
      strengths: ['MLOps', 'Model Deployment', 'Distributed Systems'],
      certifications: ['Google Cloud ML Engineer', 'Kubernetes Administrator', 'MLflow Certified'],
      trend: 'up',
      trending: 'up',
      positionChange: 3
    },
    {
      id: 'current-user',
      name: 'Mike Perry',
      position: userPosition,
      score: 78,
      change: 5,
      avatar: '/api/placeholder/40/40',
      title: 'Data Analyst',
      company: 'BMO Financial Group',
      location: 'Toronto, ON',
      experience: '3 years',
      skills: ['Python', 'SQL', 'Tableau', 'R', 'Excel'],
      strengths: ['Data Visualization', 'Statistical Analysis', 'Business Intelligence'],
      certifications: ['Tableau Desktop Specialist', 'Google Analytics'],
      isCurrentUser: true,
      trend: 'up',
      trending: 'up',
      positionChange: 5
    }
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-600">#{position}</span>;
    }
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <div className="flex items-center text-green-600 text-xs">
        <TrendingUp className="w-3 h-3 mr-1" />
        +{change}
      </div>;
    }
    if (trend === 'down') {
      return <div className="flex items-center text-red-600 text-xs">
        <TrendingUp className="w-3 h-3 mr-1 rotate-180" />
        {change}
      </div>;
    }
    return <div className="text-gray-400 text-xs">—</div>;
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-medium text-white mb-1">{queueTitle} Leaderboard</h1>
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-purple-100">Premium Feature</span>
              </div>
            </div>
          </div>

          <Button variant="outline" onClick={onClose} className="bg-white/10 border-white/20 text-white hover:bg-white/20 self-start sm:self-auto">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
          {/* Leaderboard */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
                <span className="ml-3 text-gray-600">Loading leaderboard...</span>
              </div>
            ) : (
            <>
            <div className="mb-6">
              <h2 className="text-xl font-medium text-gray-900 mb-2">Top Candidates</h2>
              <p className="text-gray-600">See how you compare with other professionals in this queue</p>
            </div>

            <div className="space-y-3">
              {topCandidates.map((candidate) => (
                <Card 
                  key={candidate.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    candidate.isCurrentUser 
                      ? 'border-[#ff6b35] bg-orange-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedCandidate(candidate);
                    setViewMode('profile');
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3">
                      {getRankIcon(candidate.position)}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={candidate.avatar} />
                        <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">{candidate.name}</h3>
                        {candidate.isCurrentUser && (
                          <Badge className="bg-[#ff6b35] text-white">You</Badge>
                        )}
                        <div className="text-2xl font-medium text-gray-700">{candidate.score}</div>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {candidate.title} at {candidate.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {candidate.location}
                        </span>
                        <span>{candidate.experience} experience</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      {getTrendIcon(candidate.trend, candidate.positionChange)}
                      <Button size="sm" variant="outline" className="ml-0 sm:ml-4">
                        <Eye className="w-4 h-4 mr-2" />
                        View Profile
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Show more candidates */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 mb-4">Showing top 5 candidates out of 255 total</p>
              <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-50">
                <Users className="w-4 h-4 mr-2" />
                View All Candidates
              </Button>
            </div>
            </>
          )}
          </div>

          {/* Candidate Profile Panel */}
          {selectedCandidate && viewMode === 'profile' && (
            <div className="w-full lg:w-96 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Details</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode('leaderboard')}
                  className="self-start sm:self-auto"
                >
                  Back
                </Button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="text-center">
                  <Avatar className="w-20 h-20 mx-auto mb-4">
                    <AvatarImage src={selectedCandidate.avatar} />
                    <AvatarFallback className="text-lg">
                      {selectedCandidate.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium text-gray-900 mb-1">{selectedCandidate.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{selectedCandidate.title}</p>
                  <p className="text-sm text-gray-500">{selectedCandidate.company}</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {getRankIcon(selectedCandidate.position)}
                    <span className="font-medium text-gray-900">Rank #{selectedCandidate.position}</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Technical Skills</h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills?.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    )) || <span className="text-sm text-gray-500">No skills listed</span>}
                  </div>
                </div>

                {/* Strengths */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Key Strengths</h5>
                  <div className="space-y-2">
                    {selectedCandidate.strengths?.map((strength) => (
                      <div key={strength} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-700">{strength}</span>
                      </div>
                    )) || <span className="text-sm text-gray-500">No strengths listed</span>}
                  </div>
                </div>

                {/* Certifications */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-3">Certifications</h5>
                  <div className="space-y-2">
                    {selectedCandidate.certifications?.map((cert) => (
                      <div key={cert} className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-600" />
                        <span className="text-sm text-gray-700">{cert}</span>
                      </div>
                    )) || <span className="text-sm text-gray-500">No certifications listed</span>}
                  </div>
                </div>

                {/* Performance Insights */}
                <div className="bg-white rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Performance Insights</h5>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-gray-600">Overall Score</span>
                      <span className="font-medium text-gray-900">{selectedCandidate.score}/100</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-gray-600">Experience Level</span>
                      <span className="font-medium text-gray-900">{selectedCandidate.experience}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <span className="text-sm text-gray-600">Recent Trend</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(selectedCandidate.trend, selectedCandidate.positionChange)}
                      </div>
                    </div>
                  </div>
                </div>

                {!selectedCandidate.isCurrentUser && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-2">Learn from this profile</h5>
                    <p className="text-sm text-blue-700 mb-3">
                      This candidate ranks higher due to their advanced certifications and specialized skills.
                    </p>
                    <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Get Similar Skills
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}