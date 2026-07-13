import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Crown, 
  Sparkles, 
  BarChart3, 
  Target, 
  Zap,
  Lock,
  ArrowRightLeft,
  Check,
  X,
  AlertCircle,
  Brain,
  Briefcase,
  Wrench,
  Stethoscope,
  Plane,
  Landmark,
  Cpu,
  Paintbrush,
  GraduationCap,
  Phone,
  TrendingUp,
  ChefHat,
  HardHat,
  Palette,
  Megaphone,
  DollarSign,
  Dumbbell,
  Users,
  Shirt,
  Wheat,
  Car,
  Gavel,
  BadgeDollarSign
} from 'lucide-react';
import { queueService, type BucketPrediction as QueueServiceBucketPrediction } from '../../api/queueService';
import { candidateProfileService } from '@/api/candidateProfile';

// Industry and Level choices from backend
const INDUSTRY_CHOICES = [
  { value: 'accountant', label: 'Accountant', icon: '💰' },
  { value: 'advocate', label: 'Advocate', icon: '⚖️' },
  { value: 'agriculture', label: 'Agriculture', icon: '🌾' },
  { value: 'apparel', label: 'Apparel', icon: '👔' },
  { value: 'arts', label: 'Arts', icon: '🎨' },
  { value: 'automobile', label: 'Automobile', icon: '🚗' },
  { value: 'aviation', label: 'Aviation', icon: '✈️' },
  { value: 'banking', label: 'Banking', icon: '🏦' },
  { value: 'bpo', label: 'Business Process Outsourcing', icon: '📞' },
  { value: 'business-development', label: 'Business Development', icon: '📈' },
  { value: 'chef', label: 'Chef', icon: '👨‍🍳' },
  { value: 'construction', label: 'Construction', icon: '🏗️' },
  { value: 'consultant', label: 'Consultant', icon: '💼' },
  { value: 'designer', label: 'Designer', icon: '✏️' },
  { value: 'digital-marketing', label: 'Digital Marketing', icon: '📱' },
  { value: 'education', label: 'Education', icon: '📚' },
  { value: 'engineering', label: 'Engineering', icon: '⚙️' },
  { value: 'finance', label: 'Finance', icon: '💵' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'healthcare', label: 'Healthcare', icon: '🏥' },
  { value: 'hr', label: 'Human Resources', icon: '👥' },
  { value: 'information-technology', label: 'Information Technology', icon: '💻' },
  { value: 'public-relations', label: 'Public Relations', icon: '📢' },
  { value: 'sales', label: 'Sales', icon: '🤝' },
];

const EXP_LEVEL_LABELS: Record<string, string> = {
  'L1': 'Entry Level (0-2 years)',
  'L2': 'Associate (2-4 years)',
  'L3': 'Professional (4-7 years)',
  'L4': 'Senior (7-10 years)',
  'L5': 'Principal (10+ years)',
};

interface BucketPrediction {
  industry: string;
  industry_probability: number;
  predicted_level: string;
  level_probability: number;
  isSelected: boolean;
}

interface BucketManagerProps {
  user: any;
  onBucketSelect?: (bucket: BucketPrediction) => void;
  selectedBucketId?: string | null;
  showSwap?: boolean;
}

// Helper to get industry icon by value
const getIndustryIcon = (value: string): string => {
  // Normalize to lowercase and handle both formats (API returns uppercase)
  const normalizedValue = value.toLowerCase().replaceAll('_', '-');
  const icon = INDUSTRY_CHOICES.find(i => i.value === normalizedValue)?.icon || '📋';
  return icon;
};

const getIndustryLabel = (value: string): string => {
  const normalizedValue = value.toLowerCase().replaceAll('_', '-');
  return INDUSTRY_CHOICES.find(i => i.value === normalizedValue)?.label || value;
};

const INDUSTRY_ICON_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'accountant': BadgeDollarSign,
  'advocate': Gavel,
  'agriculture': Wheat,
  'apparel': Shirt,
  'arts': Paintbrush,
  'automobile': Car,
  'aviation': Plane,
  'banking': Landmark,
  'bpo': Phone,
  'business-development': TrendingUp,
  'chef': ChefHat,
  'construction': HardHat,
  'consultant': Briefcase,
  'designer': Palette,
  'digital-marketing': Megaphone,
  'education': GraduationCap,
  'engineering': Wrench,
  'finance': DollarSign,
  'fitness': Dumbbell,
  'healthcare': Stethoscope,
  'hr': Users,
  'information-technology': Cpu,
  'public-relations': Megaphone,
  'sales': TrendingUp,
};

const INDUSTRY_COLORS: Record<string, string> = {
  'accountant': 'bg-gradient-to-br from-green-500 to-emerald-600',
  'advocate': 'bg-gradient-to-br from-red-500 to-rose-600',
  'agriculture': 'bg-gradient-to-br from-green-500 to-lime-600',
  'apparel': 'bg-gradient-to-br from-pink-500 to-rose-500',
  'arts': 'bg-gradient-to-br from-purple-500 to-violet-500',
  'automobile': 'bg-gradient-to-br from-blue-500 to-indigo-600',
  'aviation': 'bg-gradient-to-br from-sky-500 to-blue-600',
  'banking': 'bg-gradient-to-br from-emerald-500 to-green-600',
  'bpo': 'bg-gradient-to-br from-orange-500 to-amber-500',
  'business-development': 'bg-gradient-to-br from-blue-500 to-cyan-600',
  'chef': 'bg-gradient-to-br from-red-500 to-orange-500',
  'construction': 'bg-gradient-to-br from-yellow-500 to-amber-600',
  'consultant': 'bg-gradient-to-br from-slate-500 to-gray-600',
  'designer': 'bg-gradient-to-br from-pink-500 to-fuchsia-500',
  'digital-marketing': 'bg-gradient-to-br from-indigo-500 to-purple-500',
  'education': 'bg-gradient-to-br from-yellow-500 to-orange-500',
  'engineering': 'bg-gradient-to-br from-orange-500 to-red-500',
  'finance': 'bg-gradient-to-br from-emerald-500 to-teal-600',
  'fitness': 'bg-gradient-to-br from-green-500 to-teal-500',
  'healthcare': 'bg-gradient-to-br from-teal-500 to-cyan-600',
  'hr': 'bg-gradient-to-br from-indigo-500 to-blue-500',
  'information-technology': 'bg-gradient-to-br from-blue-500 to-indigo-600',
  'public-relations': 'bg-gradient-to-br from-violet-500 to-purple-500',
  'sales': 'bg-gradient-to-br from-green-500 to-emerald-500',
};

export function getIndustryLucideIcon(value: string): React.ComponentType<any> {
  const normalizedValue = value.toLowerCase().replaceAll('_', '-');
  return INDUSTRY_ICON_COMPONENTS[normalizedValue] || Briefcase;
}

export function getIndustryColor(value: string): string {
  const normalizedValue = value.toLowerCase().replaceAll('_', '-');
  return INDUSTRY_COLORS[normalizedValue] || 'bg-gradient-to-br from-blue-500 to-indigo-600';
}

function BucketManager({ user, onBucketSelect, selectedBucketId, showSwap = true }: Readonly<BucketManagerProps>) {
  const isPremium = user?.isPremium || false;
  const [predictions, setPredictions] = useState<BucketPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const allIndustries = INDUSTRY_CHOICES;

  // Fetch bucket predictions from candidate sort service
  useEffect(() => {
    const fetchPredictions = async () => {
      setIsLoading(true);
      console.log('[BucketManager] Fetching bucket predictions...');
      try {
        // Get bucket predictions from candidate-sort service
        const result = await queueService.getMyBucketPrediction();

        if (result?.industry_predictions && result.industry_predictions.length > 0) {
          // Transform predictions to BucketPrediction format with selection state
          const bucketPredictions: BucketPrediction[] = result.industry_predictions.map((pred: QueueServiceBucketPrediction) => ({
            industry: pred.industry,
            industry_probability: pred.industry_probability,
            predicted_level: pred.predicted_level,
            level_probability: pred.level_probability,
            isSelected: pred.industry === selectedBucketId || pred.isSelected
          }));
          setPredictions(bucketPredictions);
        } else {
          // No predictions available - set empty state
          console.warn('[BucketManager] No bucket predictions available from candidate-sort service', result);
          setPredictions([]);
        }
      } catch (error) {
        console.error('[BucketManager] Failed to fetch bucket predictions:', error);
        setPredictions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPredictions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Determine visible buckets based on premium status
  const visibleBuckets = isPremium ? predictions : predictions.slice(0, 3);
  const hiddenBuckets = isPremium ? [] : predictions.slice(3);

  const getConfidenceColor = (probability: number) => {
    if (probability >= 0.7) return 'bg-green-500';
    if (probability >= 0.4) return 'bg-yellow-500';
    return 'bg-orange-500';
  };


  const handleBucketClick = (bucket: BucketPrediction) => {
    if (onBucketSelect) {
      onBucketSelect(bucket);
    }
  };

  const handleSwapBucket = async (newIndustry: string) => {
    const selectedPrediction = predictions.find(p => p.industry === newIndustry);
    if (!selectedPrediction) return;

    // Get current user profile to get profileId
    try {
      const profile = await candidateProfileService.getProfile();
      if (!profile?.id) {
        console.error('No profile ID found for bucket swap');
        return;
      }

      // Call backend to update bucket
      const success = await queueService.updateBucket(
        profile.id,
        newIndustry,
        selectedPrediction.predicted_level
      );

      if (success) {
        // Update local state
        const updatedPredictions = predictions.map(p => ({
          ...p,
          isSelected: p.industry === newIndustry
        }));
        setPredictions(updatedPredictions);
        setShowSwapModal(false);

        // Notify parent
        const selectedBucket = updatedPredictions.find(p => p.industry === newIndustry);
        if (selectedBucket && onBucketSelect) {
          onBucketSelect(selectedBucket);
        }
      } else {
        console.error('Failed to swap bucket on backend');
      }
    } catch (error) {
      console.error('Error swapping bucket:', error);
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-white/80 border-orange-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ff6b35]"></div>
          <span className="ml-3 text-gray-600">Loading bucket predictions...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Brain className="w-5 h-5 text-[#ff6b35]" />
            <h3 className="text-lg font-semibold text-gray-900">AI Bucket Predictions</h3>
            {isPremium && (
              <Badge className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Based on your profile, our AI predicts these (Industry, Job Level) buckets with confidence scores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-orange-200 text-gray-700">
            <BarChart3 className="w-3 h-3 mr-1" />
            {isPremium ? '5' : '3'} Buckets
          </Badge>
        </div>
      </div>

      {/* Empty State - No Predictions */}
      {!isLoading && predictions.length === 0 && (
        <Card className="p-6 bg-white/80 border-orange-100">
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-orange-500" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">No Bucket Predictions Available</h4>
            <p className="text-sm text-gray-500 mb-4 max-w-[95vw] sm:max-w-md">
              Complete your profile with work history, skills, and education to get AI-powered bucket predictions that match your qualifications.
            </p>
            <Button
              onClick={async () => {
                setIsLoading(true);
                try {
                  // Try to refresh predictions
                  await queueService.refreshMyBucketPrediction();
                  // Re-fetch predictions
                  const result = await queueService.getMyBucketPrediction();
                  if (result?.industry_predictions && result.industry_predictions.length > 0) {
                    const bucketPredictions: BucketPrediction[] = result.industry_predictions.map((pred: QueueServiceBucketPrediction) => ({
                      industry: pred.industry,
                      industry_probability: pred.industry_probability,
                      predicted_level: pred.predicted_level,
                      level_probability: pred.level_probability,
                      isSelected: pred.isSelected
                    }));
                    setPredictions(bucketPredictions);
                  }
                } catch (error) {
                  console.error('Failed to refresh predictions:', error);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Generate Predictions
            </Button>
          </div>
        </Card>
      )}

      {/* Bucket Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleBuckets.map((bucket, index) => (
          <Card
            key={bucket.industry}
            className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
              bucket.isSelected
                ? 'border-[#ff6b35] bg-gradient-to-br from-orange-50 to-orange-100/50 ring-2 ring-orange-200'
                : 'border-gray-100 hover:border-orange-200 bg-white/80'
            }`}
            onClick={() => handleBucketClick(bucket)}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getIndustryIcon(bucket.industry)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">
                      {getIndustryLabel(bucket.industry)}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {EXP_LEVEL_LABELS[bucket.predicted_level]}
                    </p>
                  </div>
                </div>
                {index === 0 && (
                  <Badge className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white border-0 text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Top Match
                  </Badge>
                )}
              </div>

              {/* Confidence Score */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <span className="text-gray-500">Industry Confidence</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(bucket.industry_probability * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getConfidenceColor(bucket.industry_probability)}`}
                    style={{ width: `${bucket.industry_probability * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                  <span className="text-gray-500">Level Confidence</span>
                  <span className="font-medium text-gray-900">
                    {Math.round(bucket.level_probability * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${getConfidenceColor(bucket.level_probability)}`}
                    style={{ width: `${bucket.level_probability * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Status */}
              {bucket.isSelected ? (
                <div className="flex items-center gap-2 text-sm text-[#ff6b35]">
                  <Check className="w-4 h-4" />
                  <span className="font-medium">Active Queue</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Target className="w-4 h-4" />
                  <span>Click to select</span>
                </div>
              )}
            </div>
          </Card>
        ))}

        {/* Premium: Hidden Buckets Teaser */}
        {!isPremium && hiddenBuckets.length > 0 && (
          <Card className="p-4 border-2 border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mb-3">
              <Lock className="w-6 h-6 text-gray-400" />
            </div>
            <h4 className="font-medium text-gray-900 mb-1">+{hiddenBuckets.length} More Buckets</h4>
            <p className="text-xs text-gray-500 mb-3">
              Upgrade to Premium to see all {predictions.length} AI predictions
            </p>
            <Badge className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Premium
            </Badge>
          </Card>
        )}
      </div>

      {/* Premium: Swap Bucket Feature */}
      {showSwap && isPremium && (
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 border-orange-200">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-lg flex items-center justify-center shadow-lg">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">Swap Your Bucket</h4>
              <p className="text-sm text-gray-600 mb-3">
                Premium members can swap their current queue for any of the {INDUSTRY_CHOICES.length} predefined industries
              </p>
              <Button
                onClick={() => setShowSwapModal(true)}
                className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
              >
                <Zap className="w-4 h-4 mr-2" />
                Swap Bucket
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Swap Bucket Modal */}
      {showSwap && showSwapModal && isPremium && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-[95vw] sm:max-w-2xl max-h-[80vh] overflow-hidden bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-orange-50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Swap Your Bucket</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Select a new industry bucket from our predefined options
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSwapModal(false)}
                  className="rounded-full w-10 h-10 p-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Industry Grid */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {allIndustries.map((industry) => {
                  const isCurrentlySelected = predictions.some(
                    p => p.industry === industry.value && p.isSelected
                  );
                  
                  return (
                    <button
                      key={industry.value}
                      onClick={() => handleSwapBucket(industry.value)}
                      disabled={isCurrentlySelected}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isCurrentlySelected
                          ? 'border-green-300 bg-green-50 cursor-not-allowed'
                          : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-xl">{industry.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${
                            isCurrentlySelected ? 'text-green-800' : 'text-gray-900'
                          }`}>
                            {industry.label}
                          </p>
                          {isCurrentlySelected && (
                            <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                              <Check className="w-3 h-3" />
                              <span>Current</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning */}
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium mb-1">Important Note</p>
                  <p className="text-sm text-yellow-700">
                    Swapping your bucket will change your queue position and may affect your visibility to recruiters 
                    in the new industry. Your AI confidence scores will be recalculated.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50/50">
              <Button
                variant="outline"
                onClick={() => setShowSwapModal(false)}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Export component and helpers
export { BucketManager, INDUSTRY_CHOICES, EXP_LEVEL_LABELS, getIndustryIcon, getIndustryLabel };
