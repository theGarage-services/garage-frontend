import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import {
  Brain, TrendingUp, TrendingDown, Clock, Target, Zap,
  Rocket, ChartBar, Crown, X
} from 'lucide-react';
import { queueService } from '../../api/queueService';

interface QueueIntelligenceProps {
  queue: any;
  userPosition: number;
  onClose: () => void;
  user?: any;
}

export function QueueIntelligence({ queue, onClose, user }: Readonly<QueueIntelligenceProps>) {
  const [activeSection, setActiveSection] = useState<'predictions' | 'optimization' | 'market' | 'timing'>('predictions');
  const [bucketPrediction, setBucketPrediction] = useState<{
    predicted_industry: string;
    predicted_level: string;
    total_experience_years: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's bucket prediction to personalize intelligence
  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const fetchBucket = async () => {
      setIsLoading(true);
      try {
        const prediction = await queueService.getMyBucketPrediction();
        setBucketPrediction(prediction);
      } catch (error) {
        console.error('Failed to fetch bucket prediction:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBucket();
  }, [queue.id, user]);

  // Default data with bucket-aware personalization
  const userBucket = bucketPrediction;
  const xpYears = userBucket?.total_experience_years || 0;

  const data = {
    predictions: {
      interviewProbability: Math.min(95, 60 + xpYears * 3),
      timeToInterview: xpYears > 5 ? '8-12 days' : '12-16 days',
      movementTrend: 'upward',
      nextRankChange: xpYears > 5 ? '+5-8 positions' : '+3-5 positions',
      confidenceScore: Math.min(98, 75 + xpYears * 2),
      factors: [
        { factor: 'Profile Completeness', impact: 'positive', weight: 85 },
        { factor: 'Experience Level', impact: xpYears > 5 ? 'positive' : 'neutral', weight: 80 + xpYears },
        { factor: 'Skill Match', impact: 'neutral', weight: 75 },
        { factor: 'Market Demand', impact: 'positive', weight: 88 }
      ]
    },
    optimization: {
      immediateActions: [
        {
          action: 'Add AWS certification',
          impact: '+8-12 positions',
          timeRequired: '2-3 weeks',
          difficulty: 'Medium',
          roi: 'High'
        },
        {
          action: 'Complete Python project showcase',
          impact: '+5-7 positions',
          timeRequired: '1 week',
          difficulty: 'Low',
          roi: 'Medium'
        },
        {
          action: 'Get LinkedIn recommendation',
          impact: '+2-4 positions',
          timeRequired: '2-3 days',
          difficulty: 'Low',
          roi: 'Low'
        }
      ],
      longTermStrategy: [
        {
          strategy: 'Specialize in Machine Learning',
          timeline: '3-6 months',
          impact: '+25-35 positions',
          description: 'Market shows 340% growth in ML roles'
        },
        {
          strategy: 'Target specific companies',
          timeline: '1-2 months',
          impact: '+15-20 positions',
          description: 'Focus on companies with 80%+ hiring rate'
        }
      ]
    },
    market: {
      salaryTrends: {
        current: '$95,000 - $125,000',
        projected6m: '$98,000 - $130,000',
        trend: 'increasing',
        change: '+4.2%'
      },
      demandMetrics: {
        jobPostings: 1247,
        weeklyGrowth: 12.5,
        competitionIndex: 'Medium',
        hiringVelocity: 'Fast'
      },
      topCompanies: [
        { name: 'Google', openings: 23, hiringRate: 89, avgSalary: '$145k' },
        { name: 'Microsoft', openings: 31, hiringRate: 82, avgSalary: '$132k' },
        { name: 'Amazon', openings: 19, hiringRate: 76, avgSalary: '$128k' },
        { name: 'Meta', openings: 15, hiringRate: 71, avgSalary: '$138k' }
      ],
      skills: {
        hottest: ['PyTorch', 'Kubernetes', 'Snowflake'],
        declining: ['SAS', 'SPSS'],
        emerging: ['MLOps', 'DataOps', 'Vertex AI']
      }
    },
    timing: {
      bestDays: ['Tuesday', 'Wednesday', 'Thursday'],
      bestTimes: ['9-11 AM', '2-4 PM'],
      seasonalTrends: {
        current: 'Peak hiring season',
        next: 'Continued growth (Q1)',
        recommendation: 'Optimal time to apply'
      },
      weeklyPattern: [
        { day: 'Mon', activity: 68, applications: 450 },
        { day: 'Tue', activity: 89, applications: 650 },
        { day: 'Wed', activity: 92, applications: 680 },
        { day: 'Thu', activity: 85, applications: 590 },
        { day: 'Fri', activity: 45, applications: 320 },
        { day: 'Sat', activity: 12, applications: 80 },
        { day: 'Sun', activity: 8, applications: 45 }
      ]
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getROIColor = (roi: string) => {
    switch (roi) {
      case 'High': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-7xl h-[95vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white mb-1">Queue Intelligence AI</h1>
              <p className="text-blue-100">Advanced analytics for {queue.title}</p>
              <Badge className="bg-white/20 text-white border-white/30 mt-2">
                <Crown className="w-3 h-3 mr-1" />
                Premium Feature
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

        {/* Navigation */}
        <div className="border-b border-gray-200 px-8 bg-gray-50/50">
          <div className="flex gap-8">
            {[
              { id: 'predictions', label: 'AI Predictions', icon: Zap },
              { id: 'optimization', label: 'Optimization', icon: Rocket },
              { id: 'market', label: 'Market Intel', icon: ChartBar },
              { id: 'timing', label: 'Timing Analysis', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`py-5 px-3 border-b-3 font-semibold transition-all duration-300 flex items-center gap-2 ${
                    activeSection === tab.id
                      ? 'border-purple-500 text-purple-600 bg-purple-50/30'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
                  } rounded-t-lg`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-gray-50/30 to-white">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
              <span className="ml-3 text-gray-600">Loading intelligence data...</span>
            </div>
          ) : (
            <>
          {/* AI Predictions Tab */}
          {activeSection === 'predictions' && (
            <div className="space-y-8">
              {/* Main Prediction Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100/50 border-2 border-green-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Interview Probability</h3>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {data.predictions.interviewProbability}%
                    </div>
                    <Badge className="bg-green-100 text-green-800">High Confidence</Badge>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Expected Timeline</h3>
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {data.predictions.timeToInterview}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">Based on trends</Badge>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100/50 border-2 border-purple-200">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Next Movement</h3>
                    <div className="text-2xl font-bold text-purple-600 mb-2">
                      {data.predictions.nextRankChange}
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">This week</Badge>
                  </div>
                </Card>
              </div>

              {/* Influencing Factors */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">AI Analysis: Key Factors</h3>
                <div className="grid gap-4">
                  {data.predictions.factors.map((factor) => (
                    <div key={factor.factor} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center gap-4">
                        <div className={`w-4 h-4 rounded-full ${
                          factor.impact === 'positive' ? 'bg-green-500' :
                          factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'
                        }`} />
                        <span className="font-semibold text-gray-900">{factor.factor}</span>
                        <Badge className={getImpactColor(factor.impact)}>
                          {factor.impact}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${factor.weight}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 w-8">{factor.weight}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Optimization Tab */}
          {activeSection === 'optimization' && (
            <div className="space-y-8">
              {/* Immediate Actions */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">⚡ Immediate Impact Actions</h3>
                <div className="grid gap-6">
                  {data.optimization.immediateActions.map((action) => (
                    <div key={action.action} className="p-6 bg-gradient-to-r from-orange-50 to-orange-100/30 rounded-xl border-2 border-orange-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{action.action}</h4>
                          <div className="flex items-center gap-4 mb-3">
                            <Badge className={getDifficultyColor(action.difficulty)}>
                              {action.difficulty}
                            </Badge>
                            <Badge className={getROIColor(action.roi)}>
                              {action.roi} ROI
                            </Badge>
                            <span className="text-sm text-gray-600">⏱️ {action.timeRequired}</span>
                          </div>
                          <div className="text-lg font-bold text-orange-600">{action.impact}</div>
                        </div>
                        <Button className="bg-[#ff6b35] hover:bg-[#e55a2b] text-white">
                          Start Now
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Long-term Strategy */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">🎯 Long-term Strategy</h3>
                <div className="grid gap-6">
                  {data.optimization.longTermStrategy.map((strategy) => (
                    <div key={strategy.strategy} className="p-6 bg-gradient-to-r from-blue-50 to-blue-100/30 rounded-xl border-2 border-blue-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{strategy.strategy}</h4>
                          <p className="text-gray-600 mb-3">{strategy.description}</p>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-blue-100 text-blue-800">
                              📅 {strategy.timeline}
                            </Badge>
                            <div className="text-lg font-bold text-blue-600">{strategy.impact}</div>
                          </div>
                        </div>
                        <Button variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                          View Plan
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Market Intelligence Tab */}
          {activeSection === 'market' && (
            <div className="space-y-8">
              {/* Salary Trends */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">💰 Salary Intelligence</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Current Range</span>
                      <span className="font-bold text-green-600">{data.market.salaryTrends.current}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">6M Projection</span>
                      <span className="font-bold text-blue-600">{data.market.salaryTrends.projected6m}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Growth Rate</span>
                      <span className="font-bold text-purple-600">{data.market.salaryTrends.change}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📊 Market Demand</h3>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-700">Active Job Postings</span>
                      <span className="font-bold text-orange-600">{data.market.demandMetrics.jobPostings}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="font-medium text-gray-700">Weekly Growth</span>
                      <span className="font-bold text-green-600">+{data.market.demandMetrics.weeklyGrowth}%</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-gray-700">Hiring Velocity</span>
                      <span className="font-bold text-blue-600">{data.market.demandMetrics.hiringVelocity}</span>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Companies */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">🏢 Top Hiring Companies</h3>
                <div className="grid gap-4">
                  {data.market.topCompanies.map((company) => (
                    <div key={company.name} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {company.name[0]}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{company.name}</h4>
                          <p className="text-sm text-gray-600">{company.openings} open positions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">{company.hiringRate}%</div>
                          <div className="text-xs text-gray-500">Hiring Rate</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-blue-600">{company.avgSalary}</div>
                          <div className="text-xs text-gray-500">Avg Salary</div>
                        </div>
                        <Button size="sm" variant="outline">
                          View Jobs
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Skills Intelligence */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">🎯 Skills Intelligence</h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Hottest Skills
                    </h4>
                    <div className="space-y-2">
                      {data.market.skills.hottest.map((skill) => (
                        <Badge key={skill} className="bg-green-100 text-green-800 w-full justify-center">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Emerging Skills
                    </h4>
                    <div className="space-y-2">
                      {data.market.skills.emerging.map((skill) => (
                        <Badge key={skill} className="bg-blue-100 text-blue-800 w-full justify-center">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" />
                      Declining Skills
                    </h4>
                    <div className="space-y-2">
                      {data.market.skills.declining.map((skill) => (
                        <Badge key={skill} className="bg-red-100 text-red-800 w-full justify-center">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Timing Analysis Tab */}
          {activeSection === 'timing' && (
            <div className="space-y-8">
              {/* Optimal Timing */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-100/30 border-2 border-green-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">⏰ Optimal Application Times</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Best Days</h4>
                      <div className="flex gap-2">
                        {data.timing.bestDays.map((day) => (
                          <Badge key={day} className="bg-green-100 text-green-800">
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Best Times</h4>
                      <div className="flex gap-2">
                        {data.timing.bestTimes.map((time) => (
                          <Badge key={time} className="bg-blue-100 text-blue-800">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/30 border-2 border-blue-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">📈 Seasonal Trends</h3>
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white rounded-lg border">
                      <span className="font-medium text-gray-700">Current Period</span>
                      <Badge className="bg-green-100 text-green-800">
                        {data.timing.seasonalTrends.current}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white rounded-lg border">
                      <span className="font-medium text-gray-700">Next Quarter</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {data.timing.seasonalTrends.next}
                      </Badge>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm font-medium text-green-800">
                        💡 {data.timing.seasonalTrends.recommendation}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Weekly Activity Pattern */}
              <Card className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6">📊 Weekly Activity Patterns</h3>
                <div className="grid grid-cols-7 gap-4">
                  {data.timing.weeklyPattern.map((day) => (
                    <div key={day.day} className="text-center">
                      <div className="mb-2">
                        <div 
                          className="w-full bg-gray-200 rounded-full h-24 flex items-end justify-center relative overflow-hidden"
                        >
                          <div
                            className="bg-gradient-to-t from-[#ff6b35] to-[#ff8c42] w-full transition-all duration-500 rounded-b-full"
                            style={{ height: `${day.activity}%` }}
                          />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                            {day.activity}%
                          </span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900">{day.day}</div>
                      <div className="text-xs text-gray-500">{day.applications} apps</div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm text-orange-800">
                    💡 <strong>Pro Tip:</strong> Tuesday-Thursday show highest recruiter activity. 
                    Apply during 9-11 AM or 2-4 PM for maximum visibility.
                  </p>
                </div>
              </Card>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}