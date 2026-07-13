import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Edit3, Crown, Sparkles, Eye, Zap, X, Target, Bot, Check } from 'lucide-react';
import { LiveProfileUpgrade } from './LiveProfileUpgrade';
import { BucketManager, getIndustryIcon, getIndustryLabel } from './BucketManager';
import { AppHeader } from '../layout/AppHeader';
import { queueService, type BucketPrediction } from '../../api/queueService';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

interface MyQueuesProps {
  onQueueClick?: (queue: any) => void;
  className?: string;
  onBack?: () => void;
  showAsPage?: boolean;
  user?: any;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}


interface QueueInfoBannerProps {
  showUpgradePreview: boolean;
  isPremium: boolean;
}

function QueueInfoBanner({ showUpgradePreview, isPremium }: Readonly<QueueInfoBannerProps>) {
  if (showUpgradePreview) {
    return (
      <p className="text-sm text-gray-700">
        <Sparkles className="w-4 h-4 text-purple-600 inline mr-1" />
        <span className="font-medium text-purple-600">Preview Mode:</span> See how profile upgrades could improve your queue positions.
        <br />
        <span className="font-medium text-[#ff6b35]">{isPremium ? 'Enhanced AI' : '3'} queues</span> {isPremium ? 'with premium features' : '+ AI recommendations'} with enhanced auto-apply matching.
      </p>
    );
  }

  if (isPremium) {
    return (
      <p className="text-sm text-gray-700">
        <span className="font-medium text-[#ff6b35]">3 AI-recommended queues + 2 manual queues</span> optimized for your profile with premium insights. These queues determine which jobs you get auto-applied to.
      </p>
    );
  }

  return (
    <p className="text-sm text-gray-700">
      <span className="font-medium text-[#ff6b35]">3 AI-recommended queues</span>{' '}automatically optimized based on your profile and preferences.{' '}
      <span className="ml-2 text-orange-600 font-medium">
        Upgrade to Premium to add 2 manual queues of your choice!
      </span>
    </p>
  );
}

interface ProfileImprovementSectionProps {
  showUpgradePreview: boolean;
  isPremium: boolean;
  userQueues: string[];
  selectedBuckets?: Array<{ industry: string; level: string }>;
  onClosePreview: () => void;
}

function ProfileImprovementSection({
  showUpgradePreview,
  isPremium,
  userQueues,
  selectedBuckets,
  onClosePreview
}: Readonly<ProfileImprovementSectionProps>) {
  if (!showUpgradePreview) return null;

  if (isPremium) {
    return (
      <div className="mb-6">
        <LiveProfileUpgrade userQueues={userQueues} selectedBuckets={selectedBuckets} />
      </div>
    );
  }

  return (
    <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 via-orange-50 to-blue-50 rounded-xl border-2 border-blue-200 relative">
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <Crown className="w-5 h-5 text-orange-500" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onClosePreview}
          className="rounded-full w-8 h-8 p-0 hover:bg-blue-100"
        >
          <X className="w-4 h-4 text-gray-600" />
        </Button>
      </div>
      <div className="pr-16">
        <h3 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          Profile Improvement Simulator
        </h3>

        <div className="mb-4">
          <p className="text-sm text-gray-700 mb-3">
            The <strong>Profile Improvement Simulator</strong> shows you exactly how adding skills, certifications, or experience would improve your queue rankings.
          </p>

          <div className="bg-white/80 rounded-lg p-4 mb-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              What You'll Discover:
            </h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Your new queue ranking after adding specific skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Which certifications would boost you the most</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Estimated time to improve your position</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <span>Priority recommendations based on your profile</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 rounded-lg p-3 mb-4 border border-orange-200">
            <p className="text-sm text-orange-800">
              <strong>Example:</strong> Adding &quot;AWS Certification&quot; could improve your match percentage from 65% to 78% in the Data Engineer queue, increasing your visibility to recruiters.
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            <strong>Upgrade to Premium</strong> to see your personalized improvement predictions and new rankings across all your queues.
          </p>
        </div>

        <Button
          size="sm"
          className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white shadow-lg"
          onClick={() => alert('Upgrade to Premium to unlock Profile Improvement Simulator and see your new rankings!')}
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to See Your New Rankings
        </Button>
      </div>
    </div>
  );
}

interface BasicUserNoticeProps {
  userQueues: string[];
  onTrySimulator: () => void;
}

function BasicUserNotice({ userQueues, onTrySimulator }: Readonly<BasicUserNoticeProps>) {
  return (
    <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-orange-50 rounded-xl border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Bot className="w-5 h-5 text-blue-500 shrink-0" />
          <div className="min-w-0">
            <h3 className="font-medium text-gray-900 mb-1">Basic Plan - AI Queues Only</h3>
            <p className="text-sm text-gray-600">
              You have <span className="font-medium">{userQueues.length} AI-recommended queues</span> optimized for your profile.{' '}
              <span className="text-orange-600 font-medium ml-1">Upgrade to Premium to add 2 manual queues of your choice!</span>
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50 self-start sm:self-auto"
          onClick={onTrySimulator}
        >
          <Eye className="w-4 h-4 mr-2" />
          Try Simulator Info
        </Button>
      </div>
    </div>
  );
}

interface CustomBucketsSectionProps {
  buckets: Array<{ industry: string; level: string }>;
  predictedIndustry: string;
  predictedLevel: string;
  aiPredictions: BucketPrediction[];
  selectedBucketScores: Array<{ industry: string; level: string; industry_probability: number; level_probability: number }>;
  isPremium: boolean;
  onBucketClick: (bucket: { industry: string; level: string }) => void;
}

function getConfidenceColor(probability: number): string {
  if (probability >= 0.7) return 'bg-green-500';
  if (probability >= 0.4) return 'bg-yellow-500';
  return 'bg-orange-500';
}

function CustomBucketsSection({ buckets, predictedIndustry, predictedLevel, aiPredictions, selectedBucketScores, isPremium, onBucketClick }: Readonly<CustomBucketsSectionProps>) {
  const allBuckets = [
    ...(predictedIndustry ? [{ industry: predictedIndustry, level: predictedLevel }] : []),
    ...buckets,
  ];

  const getPrediction = (industry: string) =>
    aiPredictions.find(p => p.industry === industry);

  const getScore = (industry: string) =>
    selectedBucketScores.find(s => s.industry === industry);

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-[#ff6b35] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl text-gray-900 font-medium">My Selected Buckets</h2>
          <p className="text-sm text-gray-600">
            {isPremium
              ? 'Your default industry + 4 customised secondary buckets.'
              : 'Your active job-search buckets.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allBuckets.map((bucket) => {
          const pred = getPrediction(bucket.industry);
          const score = getScore(bucket.industry);
          const isDefault = bucket.industry === predictedIndustry;
          // Use score for custom buckets, pred for default industry
          const conf = isDefault ? pred : (score ?? pred);

          return (
            <Card
              key={bucket.industry}
              className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                isDefault
                  ? 'border-blue-200 bg-blue-50/40 hover:border-blue-400'
                  : 'border-gray-100 hover:border-orange-200 bg-white/80'
              }`}
              onClick={() => onBucketClick(bucket)}
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getIndustryIcon(bucket.industry)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 text-sm">{getIndustryLabel(bucket.industry)}</h4>
                      <p className="text-xs text-gray-500">{bucket.level}</p>
                    </div>
                  </div>
                  {isDefault && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-400 text-white border-0 text-xs">
                      <Bot className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>

                {/* Confidence bars when prediction/score data exists */}
                {conf && (
                  <>
                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <span className="text-gray-500">Industry Confidence</span>
                        <span className="font-medium text-gray-900">{Math.round(conf.industry_probability * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getConfidenceColor(conf.industry_probability)}`}
                          style={{ width: `${conf.industry_probability * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                        <span className="text-gray-500">Level Confidence</span>
                        <span className="font-medium text-gray-900">{Math.round(conf.level_probability * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all ${getConfidenceColor(conf.level_probability)}`}
                          style={{ width: `${conf.level_probability * 100}%` }}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Status */}
                <div className="flex items-center gap-2 text-sm text-[#ff6b35]">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Active Queue</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function MyQueues({ onQueueClick: _onQueueClick, className = "", showAsPage = false, user, onNavigate, onLogout }: Readonly<MyQueuesProps>) {
  const navigate = useNavigate();
  
  // NEW STRUCTURE:
  // Basic users: 3 AI queues (data-engineer, product-analyst, business-intelligence)
  // Premium users: 3 AI queues + 2 manual queues (senior-analyst, machine-learning)
  const isPremium = user?.isPremium || false;
  
  // User's selected queue IDs - fetched from API
  const [userQueues, setUserQueues] = useState<string[]>([]);
  const [selectedBuckets, setSelectedBuckets] = useState<Array<{ industry: string; level: string }>>([]);
  const [selectedBucketScores, setSelectedBucketScores] = useState<Array<{ industry: string; level: string; industry_probability: number; level_probability: number }>>([]);
  const [predictedIndustry, setPredictedIndustry] = useState('');
  const [predictedLevel, setPredictedLevel] = useState('');
  const [aiPredictions, setAiPredictions] = useState<BucketPrediction[]>([]);

  useEffect(() => {
    const fetchQueues = async () => {
      try {
        // Always fetch AI predictions for confidence data
        const prediction = await queueService.getMyBucketPrediction();
        if (prediction?.industry_predictions) {
          setAiPredictions(prediction.industry_predictions);
        }
        if (prediction?.predicted_industry) {
          setPredictedIndustry(prediction.predicted_industry);
          setPredictedLevel(prediction.predicted_level || '');
        }

        // 1. Try user-selected buckets first (premium customisations)
        const selected = await queueService.getSelectedBuckets();
        if (selected?.predicted_industry) {
          setPredictedIndustry(selected.predicted_industry);
          setPredictedLevel(selected.predicted_level || '');
        }
        if (selected?.selected_buckets?.length) {
          setSelectedBuckets(selected.selected_buckets);
          setSelectedBucketScores(selected.selected_bucket_scores || []);
          setUserQueues(
            selected.selected_buckets.map(b => `${b.industry}-${b.level}`.toLowerCase().replace(/\s+/g, '-'))
          );
          return;
        }

        // 2. Fall back to AI predictions
        if (prediction?.industry_predictions?.length) {
          const queueIds = prediction.industry_predictions.map(
            (p) => `${p.industry}-${prediction.predicted_level}`.toLowerCase().replace(/\s+/g, '-')
          );
          setUserQueues(queueIds);
        } else if (prediction?.predicted_industry) {
          setUserQueues([
            `${prediction.predicted_industry}-${prediction.predicted_level}`.toLowerCase().replace(/\s+/g, '-')
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch user queues:', error);
        setUserQueues([]);
      }
    };

    void fetchQueues();
  }, []);

  const [showUpgradePreview, setShowUpgradePreview] = useState(false);

  const content = (
    <div className={className}>
      {/* My Queues Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-medium text-gray-900">My Queues ({userQueues.length})</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Profile Improvement Preview Toggle - Premium Only */}
            {isPremium && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full px-4 py-2 border border-blue-200/50">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Preview Improvements</span>
                <Switch
                  checked={showUpgradePreview}
                  onCheckedChange={setShowUpgradePreview}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#ff6b35] data-[state=checked]:to-[#ff8c42]"
                />
                <Zap className="w-4 h-4 text-orange-500" />
              </div>
            )}
            {onNavigate && (
              <Button
                size="sm"
                variant="outline"
                className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white shadow-sm"
                onClick={() => onNavigate('queues/selector')}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Edit Queues
              </Button>
            )}
          </div>
        </div>

        {/* Queue Info */}
        <div className="mb-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200">
          <QueueInfoBanner showUpgradePreview={showUpgradePreview} isPremium={isPremium} />
        </div>

        {/* Profile Improvement Preview Section */}
        <ProfileImprovementSection
          showUpgradePreview={showUpgradePreview}
          isPremium={isPremium}
          userQueues={userQueues}
          selectedBuckets={selectedBuckets}
          onClosePreview={() => setShowUpgradePreview(false)}
        />

        {/* Basic User Limitation Notice */}
        {!isPremium && <BasicUserNotice userQueues={userQueues} onTrySimulator={() => setShowUpgradePreview(true)} />}

        {/* User's custom buckets (if customised) otherwise AI predictions */}
        {selectedBuckets.length > 0 ? (
          <CustomBucketsSection
            buckets={selectedBuckets}
            predictedIndustry={predictedIndustry}
            predictedLevel={predictedLevel}
            aiPredictions={aiPredictions}
            selectedBucketScores={selectedBucketScores}
            isPremium={isPremium}
            onBucketClick={(bucket: { industry: string; level: string }) => {
              if (showAsPage) {
                navigate(`/queues/${encodeURIComponent(bucket.industry)}/${encodeURIComponent(bucket.level)}`);
              } else {
                _onQueueClick?.({
                  id: bucket.industry,
                  title: bucket.industry,
                  level: bucket.level,
                  industry: bucket.industry,
                });
              }
            }}
          />
        ) : (
          <div className="mb-8">
            <BucketManager
              user={user}
              showSwap={false}
              onBucketSelect={(bucket) => {
                if (showAsPage) {
                  navigate(`/queues/${encodeURIComponent(bucket.industry)}/${encodeURIComponent(bucket.predicted_level)}`);
                } else {
                  _onQueueClick?.({
                    id: bucket.industry,
                    title: bucket.industry,
                    level: bucket.predicted_level,
                    industry: bucket.industry,
                  });
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  // If used as a standalone page, wrap with proper page structure
  if (showAsPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
        {onNavigate && (
          <AppHeader
            userRole="job-seeker"
            user={user}
            currentView="queues"
            onNavigate={onNavigate}
            onLogout={onLogout || (() => {})}
          />
        )}
        <div className="container mx-auto px-4 py-8">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
