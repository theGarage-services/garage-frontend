import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Brain, Target, TrendingUp, Zap,
  Star, ArrowRight, Crown, CheckCircle, X, Rocket
} from 'lucide-react';
import { queueService } from '../../api/queueService';

interface SmartQueueRecommendationsProps {
  currentQueues: string[];
  userProfile: any;
  onClose: () => void;
  onJoinQueue: (queueId: string) => void;
}

export function SmartQueueRecommendations({
  currentQueues,
  onClose,
  onJoinQueue
}: Readonly<SmartQueueRecommendationsProps>) {
  const [selectedCategory, setSelectedCategory] = useState<'perfect' | 'growth' | 'strategic' | 'trending'>('perfect');
  const [recommendations, setRecommendations] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch available buckets as recommendations
  useEffect(() => {
    const fetchBuckets = async () => {
      setIsLoading(true);
      try {
        const buckets = await queueService.getAvailableBuckets();
        // Transform buckets to recommendations format
        const bucketRecommendations = buckets.map(b => ({
          id: `${b.industry}-${b.level}`,
          title: `${b.industry} (${b.level})`,
          matchScore: Math.min(95, 60 + b.candidate_count / 100),
          difficulty: b.candidate_count > 500 ? 'High' : b.candidate_count > 200 ? 'Medium' : 'Low',
          candidateCount: b.candidate_count,
          category: b.candidate_count > 500 ? 'trending' : b.candidate_count > 200 ? 'growth' : 'perfect'
        }));

        // Group by category
        const grouped = {
          perfect: bucketRecommendations.filter(r => r.category === 'perfect'),
          growth: bucketRecommendations.filter(r => r.category === 'growth'),
          strategic: bucketRecommendations.slice(0, 3), // Top 3 as strategic
          trending: bucketRecommendations.filter(r => r.category === 'trending')
        };
        setRecommendations(grouped);
      } catch (error) {
        console.error('Failed to fetch bucket recommendations:', error);
        setRecommendations({ perfect: [], growth: [], strategic: [], trending: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchBuckets();
  }, []);

  // Fallback mock data if API fails
  const defaultRecommendations = {
    perfect: [],
    growth: [],
    strategic: [],
    trending: []
  };

  const recs = recommendations || defaultRecommendations;

  const categories = [
    { id: 'perfect', label: 'Perfect Matches', icon: Target, color: 'text-green-600' },
    { id: 'growth', label: 'Growth Opportunities', icon: TrendingUp, color: 'text-blue-600' },
    { id: 'strategic', label: 'Strategic Moves', icon: Crown, color: 'text-purple-600' },
    { id: 'trending', label: 'Trending Queues', icon: Zap, color: 'text-orange-600' }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const currentRecommendations = recs[selectedCategory] || [];

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] via-[#ff8c42] to-[#ff6b35] p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Smart Queue Recommendations</h1>
              <p className="text-orange-100">AI-powered career opportunities tailored for you</p>
              <Badge className="bg-white/20 text-white border-white/30 mt-2">
                <Rocket className="w-3 h-3 mr-1" />
                Powered by theGarage AI
              </Badge>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onClose} 
            className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Category Navigation */}
        <div className="border-b border-gray-200 px-4 sm:px-8 bg-gray-50/50 overflow-x-auto">
          <div className="flex gap-4 sm:gap-8 min-w-max">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`py-5 px-3 border-b-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? 'border-[#ff6b35] text-[#ff6b35] bg-orange-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  } rounded-t-lg`}
                >
                  <Icon className="w-4 h-4" />
                  {category.label}
                  <Badge className="bg-white/80 text-gray-600 text-xs">
                    {recommendations[category.id as keyof typeof recommendations]?.length || 0}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/30 to-white">
          <div className="space-y-8">
            {/* Category Description */}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-gray-600">
                {selectedCategory === 'perfect' && 'Queues that perfectly match your current skills and experience'}
                {selectedCategory === 'growth' && 'Opportunities to expand into new roles and responsibilities'}
                {selectedCategory === 'strategic' && 'High-impact positions that could accelerate your career'}
                {selectedCategory === 'trending' && 'Rapidly growing fields with exceptional opportunities'}
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="grid gap-8">
              {isLoading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
                  <span className="ml-3 text-gray-600">Loading recommendations...</span>
                </div>
              )}
              {!isLoading && currentRecommendations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">No recommendations available at this time.</p>
                </div>
              )}
              {!isLoading && currentRecommendations.map((rec: any) => {
                const IconComponent = rec.icon;
                const isAlreadyInQueue = currentQueues.includes(rec.id);
                
                return (
                  <Card key={rec.id} className="p-8 hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-orange-200">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Left Section - Basic Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
                          <div className={`w-20 h-20 ${rec.color} rounded-3xl flex items-center justify-center shadow-2xl`}>
                            <IconComponent className="w-10 h-10 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                              <h3 className="text-2xl font-semibold text-gray-900">{rec.title}</h3>
                              <div className="flex items-center gap-2">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">{rec.matchScore}</span>
                                </div>
                                <div className="text-sm text-gray-600">Match Score</div>
                              </div>
                            </div>
                            
                            <p className="text-gray-600 mb-4 text-lg">{rec.reason}</p>
                            
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                              <Badge className={getDifficultyColor(rec.difficulty)}>
                                {rec.difficulty} Difficulty
                              </Badge>
                              <Badge className="bg-green-100 text-green-800">
                                {rec.growthRate} Growth
                              </Badge>
                              <Badge className="bg-blue-100 text-blue-800">
                                {rec.hiringRate}% Hiring Rate
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <div className="text-xl font-bold text-blue-600">#{rec.currentRank}</div>
                            <div className="text-sm text-gray-600">Projected Rank</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                            <div className="text-xl font-bold text-green-600">{rec.avgSalary}</div>
                            <div className="text-sm text-gray-600">Salary Range</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <div className="text-xl font-bold text-purple-600">{rec.totalCandidates}</div>
                            <div className="text-sm text-gray-600">Total Candidates</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
                            <div className="text-xl font-bold text-orange-600">{rec.timeToInterview}</div>
                            <div className="text-sm text-gray-600">Time to Interview</div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Details */}
                      <div className="w-full lg:w-96 space-y-6">
                        {/* Advantages */}
                        <div>
                          <h4 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Your Advantages
                          </h4>
                          <div className="space-y-2">
                            {rec.advantages?.map((advantage: string) => (
                              <div key={advantage} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                                <Star className="w-3 h-3 text-green-600" />
                                <span className="text-sm text-green-800">{advantage}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Areas to Improve */}
                        <div>
                          <h4 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Areas to Develop
                          </h4>
                          <div className="space-y-2">
                            {rec.gaps?.map((gap: string) => (
                              <div key={gap} className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                                <ArrowRight className="w-3 h-3 text-orange-600" />
                                <span className="text-sm text-orange-800">{gap}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Top Companies */}
                        <div>
                          <h4 className="font-semibold text-blue-700 mb-3">Top Hiring Companies</h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.companies?.map((company: string) => (
                              <Badge key={company} className="bg-blue-100 text-blue-800">
                                {company}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4">
                          {isAlreadyInQueue ? (
                            <Button disabled className="w-full bg-gray-100 text-gray-500">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Already in Queue
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => onJoinQueue(rec.id)}
                              className="w-full bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#e67a38] text-white shadow-lg"
                            >
                              <Rocket className="w-4 h-4 mr-2" />
                              Join This Queue
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* AI Insights */}
            <Card className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <div className="text-center">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center justify-center gap-3">
                  <Brain className="w-8 h-8 text-blue-600" />
                  AI Career Intelligence
                </h3>
                <p className="text-gray-700 mb-6 max-w-[95vw] sm:max-w-3xl mx-auto">
                  Our AI analyzed 50,000+ career transitions, current market trends, and your unique profile 
                  to generate these personalized recommendations. Each suggestion is ranked based on match score, 
                  growth potential, and market demand.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">94%</div>
                    <div className="text-sm text-gray-600">Average Match Score</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">2.3x</div>
                    <div className="text-sm text-gray-600">Faster Career Growth</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">$15k</div>
                    <div className="text-sm text-gray-600">Average Salary Increase</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}