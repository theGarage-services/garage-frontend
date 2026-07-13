import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Search, Zap, X, Check, Star, ArrowLeft, Crown, Bot, Lock, RotateCcw } from 'lucide-react';
import { queueService, type Queue, type BucketPrediction } from '../../api/queueService';
import { AppHeader } from '../layout/AppHeader';
import { INDUSTRY_CHOICES } from './BucketManager';

const INDUSTRY_ICONS: Record<string, string> = {
  'accountant': '💰', 'advocate': '⚖️', 'agriculture': '🌾', 'apparel': '👔',
  'arts': '🎨', 'automobile': '🚗', 'aviation': '✈️', 'banking': '🏦',
  'bpo': '📞', 'business-development': '📈', 'chef': '👨‍🍳', 'construction': '🏗️',
  'consultant': '💼', 'designer': '✏️', 'digital-marketing': '📱', 'education': '📚',
  'engineering': '⚙️', 'finance': '💵', 'fitness': '💪', 'healthcare': '🏥',
  'hr': '👥', 'information-technology': '💻', 'public-relations': '📢', 'sales': '🤝',
};

const EXP_LEVEL_LABELS: Record<string, string> = {
  'L1': 'Entry Level', 'L2': 'Associate', 'L3': 'Professional', 'L4': 'Senior', 'L5': 'Principal',
};

function getIndustryEmoji(industry: string): string {
  return INDUSTRY_ICONS[industry.toLowerCase().replaceAll('_', '-')] || '📋';
}

interface QueueSelectorProps {
  onClose?: () => void;
  currentQueues?: string[];
  onUpdateQueues?: (selectedQueues: string[]) => void;
  queueStatuses?: Record<string, boolean>;
  onUpdateQueueStatuses?: (statuses: Record<string, boolean>) => void;
  user?: any;
  onNavigate?: (view: string) => void;
  onLogout?: () => void;
}

interface IndustryPickerGridProps {
  selectedBuckets: Array<{ industry: string; level: string }>;
  aiPredictionIds: Set<string>;
  predictedIndustry: string;
  predictedLevel: string;
  searchQuery: string;
  onToggle: (industry: string) => void;
  onReplaceRequest: (industry: string) => void;
}

function IndustryPickerGrid({ selectedBuckets, aiPredictionIds, predictedIndustry, predictedLevel, searchQuery, onToggle, onReplaceRequest }: Readonly<IndustryPickerGridProps>) {
  const isSelected = (industry: string) => selectedBuckets.some(b => b.industry === industry);
  const isFull = selectedBuckets.length >= 4;

  const filtered = INDUSTRY_CHOICES.filter(ind =>
    ind.value !== predictedIndustry &&
    (!searchQuery || ind.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
     ind.value.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      {filtered.map(industry => {
        const selected = isSelected(industry.value);
        const aiPick = aiPredictionIds.has(`${industry.value}-${predictedLevel}`);

        return (
          <button
            key={industry.value}
            onClick={() => {
              if (selected) onToggle(industry.value);
              else if (isFull) onReplaceRequest(industry.value);
              else onToggle(industry.value);
            }}
            className={`p-3 rounded-xl border-2 text-left transition-all w-full ${
              selected
                ? 'border-green-300 bg-green-50'
                : aiPick
                ? 'border-blue-200 bg-blue-50/30 hover:border-blue-400 hover:bg-blue-50/50'
                : 'border-gray-100 hover:border-orange-200 hover:bg-orange-50'
            } ${isFull && !selected ? 'opacity-70' : ''}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="text-2xl flex-shrink-0">{industry.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className={`font-medium text-sm truncate ${selected ? 'text-green-800' : 'text-gray-900'}`}>
                    {industry.label}
                  </p>
                  {selected && <Check className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />}
                </div>
                {selected && <p className="text-xs text-green-600 mt-1 font-medium">In loadout</p>}
                {!selected && aiPick && (
                  <p className="text-xs text-blue-600 mt-1 font-medium inline-flex items-center gap-0.5">
                    <Zap className="w-3 h-3" />AI pick
                  </p>
                )}
                {!selected && isFull && (
                  <p className="text-xs text-orange-600 mt-1 font-medium">Replace a slot</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface LockedQueuePreviewProps {
  queues: Queue[];
  onUpgrade: () => void;
}

function LockedQueuePreview({ queues, onUpgrade }: Readonly<LockedQueuePreviewProps>) {
  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 opacity-30 pointer-events-none blur-sm">
        {queues.slice(0, 8).map((queue) => {
          const IconComponent = queue.icon;
          return (
            <Card key={queue.id} className="p-5 border border-gray-200 bg-white">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 ${queue.color} rounded-xl flex items-center justify-center`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{queue.title}</h3>
                  <p className="text-xs text-gray-600">{queue.category}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-orange-200 p-8 text-center shadow-xl">
          <Lock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Manual Queue Selection</h3>
          <p className="text-sm text-gray-600 mb-4 max-w-xs">Upgrade to Premium to unlock manual queue selection and customize your job matching experience.</p>
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </div>
  );
}

function SearchFilterSection({ searchQuery, onSearchChange }: Readonly<{ searchQuery: string; onSearchChange: (value: string) => void }>) {
  return (
    <div className="bg-white rounded-xl border border-orange-100 p-4 mb-6 shadow-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search industries..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 border-orange-100 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
        />
      </div>
    </div>
  );
}

interface SlotCardProps {
  bucket: { industry: string; level: string } | null;
  slotNum: number;
  aiPredictionIds: Set<string>;
  onRemove: () => void;
}

function SlotCard({ bucket, slotNum, aiPredictionIds, onRemove }: Readonly<SlotCardProps>) {
  if (!bucket) {
    return (
      <Card className="p-3 border-2 border-dashed border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-300">
            <span className="text-base leading-none">+</span>
          </div>
          <p className="text-sm">Empty slot {slotNum}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-3 border-2 border-orange-200 bg-white group hover:border-orange-300 transition-colors">
      <div className="flex items-center gap-3">
        <div className="text-xl w-9 h-9 flex items-center justify-center bg-orange-50 rounded-lg flex-shrink-0">
          {getIndustryEmoji(bucket.industry)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-medium text-gray-900 text-sm truncate">{bucket.industry}</p>
            {aiPredictionIds.has(`${bucket.industry}-${bucket.level}`) && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs py-0 shrink-0">
                <Zap className="w-2.5 h-2.5 mr-0.5" />AI
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{EXP_LEVEL_LABELS[bucket.level] || bucket.level}</p>
        </div>
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded text-gray-400 hover:text-red-500 flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </Card>
  );
}

interface LoadoutColumnProps {
  selectedBuckets: Array<{ industry: string; level: string }>;
  aiPredictionIds: Set<string>;
  predictedIndustry: string;
  predictedLevel: string;
  onRemove: (index: number) => void;
  onRestoreDefaults: () => void;
}

function LoadoutColumn({ selectedBuckets, aiPredictionIds, predictedIndustry, predictedLevel, onRemove, onRestoreDefaults }: Readonly<LoadoutColumnProps>) {
  const slots = Array.from({ length: 4 }, (_, i) => selectedBuckets[i] ?? null);

  return (
    <div>
      {/* Fixed Primary Industry */}
      {predictedIndustry && (
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Your Default Industry</p>
          <Card className="p-3 border-2 border-blue-200 bg-blue-50/40">
            <div className="flex items-center gap-3">
              <div className="text-xl w-9 h-9 flex items-center justify-center bg-white rounded-lg border border-blue-100 shadow-sm flex-shrink-0">
                {getIndustryEmoji(predictedIndustry)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{predictedIndustry}</p>
                <p className="text-xs text-gray-500">{EXP_LEVEL_LABELS[predictedLevel] || predictedLevel}</p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs py-0 shrink-0">
                <Lock className="w-2.5 h-2.5 mr-0.5" />Fixed
              </Badge>
            </div>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Your Loadout</h2>
          <p className="text-xs text-gray-500 mt-0.5">{selectedBuckets.length}/4 secondary buckets</p>
        </div>
        <Button size="sm" variant="ghost" onClick={onRestoreDefaults} className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2">
          <RotateCcw className="w-3 h-3 mr-1" />Reset to AI
        </Button>
      </div>

      <div className="space-y-2.5">
        <SlotCard
          bucket={slots[0]}
          slotNum={1}
          aiPredictionIds={aiPredictionIds}
          onRemove={() => onRemove(0)}
        />
        <SlotCard
          bucket={slots[1]}
          slotNum={2}
          aiPredictionIds={aiPredictionIds}
          onRemove={() => onRemove(1)}
        />
        <SlotCard
          bucket={slots[2]}
          slotNum={3}
          aiPredictionIds={aiPredictionIds}
          onRemove={() => onRemove(2)}
        />
        <SlotCard
          bucket={slots[3]}
          slotNum={4}
          aiPredictionIds={aiPredictionIds}
          onRemove={() => onRemove(3)}
        />
      </div>
    </div>
  );
}

interface ReplaceSlotModalProps {
  candidateIndustry: string | null;
  selectedBuckets: Array<{ industry: string; level: string }>;
  aiPredictionIds: Set<string>;
  onReplace: (slotIndex: number) => void;
  onCancel: () => void;
}

function ReplaceSlotModal({ candidateIndustry, selectedBuckets, aiPredictionIds, onReplace, onCancel }: Readonly<ReplaceSlotModalProps>) {
  if (!candidateIndustry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-[95vw] sm:max-w-sm w-full p-6 shadow-2xl border border-orange-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Replace which slot?</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Adding <span className="font-medium text-gray-700">{candidateIndustry}</span>
            </p>
          </div>
          <button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="space-y-2">
          {selectedBuckets.map((b) => (
            <button
              key={`${b.industry}-${b.level}`}
              onClick={() => onReplace(selectedBuckets.indexOf(b))}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:border-[#ff6b35] hover:bg-orange-50 transition-all text-left"
            >
              <span className="text-xl">{getIndustryEmoji(b.industry)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">{b.industry}</p>
                <p className="text-xs text-gray-500">{EXP_LEVEL_LABELS[b.level] || b.level}</p>
              </div>
              {aiPredictionIds.has(`${b.industry}-${b.level}`) && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs shrink-0">
                  <Zap className="w-2.5 h-2.5 mr-0.5" />AI
                </Badge>
              )}
            </button>
          ))}
        </div>

        <Button variant="ghost" onClick={onCancel} className="w-full mt-3 text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </Button>
      </Card>
    </div>
  );
}

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PremiumModal({ isOpen, onClose }: Readonly<PremiumModalProps>) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-[95vw] sm:max-w-lg w-full p-8 relative shadow-2xl border-2 border-orange-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-orange-50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-[#ff6b35] to-[#ff8c42] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-500/30">
            <Crown className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">Upgrade to Premium</h3>
          <p className="text-gray-600">
            Take full control of your job search with manual queue selection
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-3 h-3 text-white" />
            </div>
            <div>
              <p className="font-medium text-gray-900">3 AI-Recommended Queues</p>
              <p className="text-sm text-gray-600">Automatically optimized for your profile</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-[#ff6b35]">
            <Star className="w-5 h-5 text-[#ff6b35] mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">+ 4 Custom Buckets</p>
              <p className="text-sm text-gray-600">Choose any industry/level combinations</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
            <Zap className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-gray-900">Advanced Features</p>
              <p className="text-sm text-gray-600">Analytics, priority support, and more</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-orange-200 hover:bg-orange-50"
          >
            Maybe Later
          </Button>
          <Button
            onClick={() => {
              onClose();
              alert('Upgrade flow would open here');
            }}
            className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white shadow-lg"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface QueueSelectorHeaderProps {
  isPremium: boolean;
  onClose: () => void;
}

function QueueSelectorHeader({ isPremium, onClose }: Readonly<QueueSelectorHeaderProps>) {
  return (
    <div className="bg-white/60 backdrop-blur-md border-b border-orange-100 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 hover:bg-orange-50 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl text-gray-900">Queue Management</h1>
                {isPremium && (
                  <Badge className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white border-0 shadow-sm px-3 py-1">
                    <Crown className="w-3 h-3 mr-1.5" />
                    Premium
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isPremium
                  ? 'Manage your AI-recommended queues and custom selections'
                  : 'View your AI-optimized job queues'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm border border-orange-100">
              <div className="w-2 h-2 rounded-full bg-[#ff6b35] animate-pulse"></div>
              <span className="text-gray-700 font-medium">{isPremium ? '5' : '3'} Active Queues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FooterActionsProps {
  isPremium: boolean;
  selectedQueues: string[];
  onSave: () => void;
  onCancel: () => void;
}

function FooterActions({ isPremium, selectedQueues, onSave, onCancel }: Readonly<FooterActionsProps>) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-6 border-t border-orange-100 bg-white/80 backdrop-blur-sm sticky bottom-0 -mx-6 px-6 py-4 rounded-t-xl shadow-lg">
      <div className="text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff6b35]"></div>
            <span className="font-medium text-gray-900">
              {isPremium
                ? `${selectedQueues.length} of 4 Buckets Selected`
                : `${selectedQueues.length} AI Buckets Active`}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-orange-200 text-gray-700 hover:bg-orange-50 hover:border-[#ff6b35]"
        >
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isPremium && (selectedQueues.length === 0 || selectedQueues.length > 4)}
          className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white shadow-md hover:shadow-lg transition-all"
        >
          <Check className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
}

export function QueueSelector({ onClose, currentQueues: _currentQueues = [], onUpdateQueues, queueStatuses = {}, onUpdateQueueStatuses, user, onNavigate, onLogout }: Readonly<QueueSelectorProps>) {
  const isPremium = user?.isPremium || false;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else if (onNavigate) {
      onNavigate('dashboard');
    }
  }, [onClose, onNavigate]);

  const [selectedBuckets, setSelectedBuckets] = useState<Array<{ industry: string; level: string }>>([]);
  const [aiPredictions, setAiPredictions] = useState<BucketPrediction[]>([]);
  const [predictedIndustry, setPredictedIndustry] = useState('');
  const [predictedLevel, setPredictedLevel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const localQueueStatuses = queueStatuses;
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [availableQueues, setAvailableQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [replaceCandidate, setReplaceCandidate] = useState<string | null>(null);

  // Fetch available queues, AI predictions, and selected buckets from backend
  const fetchQueues = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch available queues
      const data = await queueService.getAvailableQueues();
      const transformedQueues: Queue[] = data.map((item: any) => ({
        id: `${item.industry}-${item.level}`,
        title: `${item.industry} - ${item.level}`,
        description: `Queue for ${item.industry} at ${item.level} level`,
        industry: item.industry,
        level: item.level,
        current: 0,
        total: item.candidate_count || 0,
        trend: 'stable',
        match: 0,
        change: 0,
        isAuto: true,
        userSelected: false,
        category: item.industry,
      }));
      setAvailableQueues(transformedQueues);

      // Fetch AI predictions
      const prediction = await queueService.getMyBucketPrediction();
      if (prediction?.industry_predictions) {
        setAiPredictions(prediction.industry_predictions);
      }
      if (prediction?.predicted_industry) {
        setPredictedIndustry(prediction.predicted_industry);
        setPredictedLevel(prediction.predicted_level || 'L3');
      }

      // Fetch user's selected buckets (premium override)
      const selected = await queueService.getSelectedBuckets();
      if (selected?.selected_buckets?.length) {
        setSelectedBuckets(selected.selected_buckets);
      } else if (prediction?.industry_predictions) {
        // Loadout = industries 2-5 (exclude predicted_industry which is fixed)
        const secondary = prediction.industry_predictions
          .filter(p => p.industry !== prediction.predicted_industry)
          .slice(0, 4)
          .map(p => ({ industry: p.industry, level: prediction.predicted_level || p.predicted_level || 'L3' }));
        setSelectedBuckets(secondary);
      }
    } catch (error) {
      console.error('Failed to fetch queue data:', error);
      setAvailableQueues([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchQueues();
  }, [fetchQueues]);

  // Derive selectedQueue IDs from selectedBuckets for UI compatibility
  const selectedQueues = selectedBuckets.map(b => `${b.industry}-${b.level}`);
  const aiPredictionIds = new Set(aiPredictions.map(p => `${p.industry}-${p.predicted_level}`));

  const handleReplaceRequest = (industry: string) => setReplaceCandidate(industry);

  const handleReplaceSlot = (slotIndex: number) => {
    if (!replaceCandidate) return;
    const newBuckets = [...selectedBuckets];
    newBuckets[slotIndex] = { industry: replaceCandidate, level: predictedLevel };
    setSelectedBuckets(newBuckets);
    setReplaceCandidate(null);
  };

  const handleRestoreDefaults = () => {
    // Restore to industries 2-5 (exclude predicted_industry which is fixed)
    const secondary = aiPredictions
      .filter(p => p.industry !== predictedIndustry)
      .slice(0, 4)
      .map(p => ({ industry: p.industry, level: p.predicted_level }));
    setSelectedBuckets(secondary);
  };

  const handleQueueToggle = (industry: string) => {
    // Basic users cannot manually select queues - premium only feature
    if (!isPremium) {
      setShowPremiumPrompt(true);
      return;
    }

    const existingIndex = selectedBuckets.findIndex(b => b.industry === industry);
    if (existingIndex >= 0) {
      setSelectedBuckets(selectedBuckets.filter((_, i) => i !== existingIndex));
    } else if (selectedBuckets.length < 4) {
      setSelectedBuckets([...selectedBuckets, { industry, level: predictedLevel }]);
    }
  };

  const handleSave = async () => {
    // Save selected buckets to backend for premium users
    if (isPremium && selectedBuckets.length > 0) {
      const result = await queueService.updateSelectedBuckets(selectedBuckets);
      if (result?.success) {
        console.log('[QueueSelector] Saved selected buckets:', result.selected_buckets);
      }
    }

    // Also notify parent component with queue IDs for backward compatibility
    if (onUpdateQueues) {
      onUpdateQueues(selectedQueues);
    }

    // Update queue statuses if callback provided
    if (onUpdateQueueStatuses) {
      onUpdateQueueStatuses(localQueueStatuses);
    }

    handleClose();
  };

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
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
          <span className="ml-3 text-gray-600">Loading queues...</span>
        </div>
      ) : (
      <>
      <QueueSelectorHeader isPremium={isPremium} onClose={handleClose} />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {isPremium ? (
          <div className="flex gap-8 items-start">
            {/* Left column — sticky loadout */}
            <div className="w-72 flex-shrink-0 sticky top-24">
              <LoadoutColumn
                selectedBuckets={selectedBuckets}
                aiPredictionIds={aiPredictionIds}
                predictedIndustry={predictedIndustry}
                predictedLevel={predictedLevel}
                onRemove={(i) => setSelectedBuckets(selectedBuckets.filter((_, idx) => idx !== i))}
                onRestoreDefaults={handleRestoreDefaults}
              />
            </div>

            {/* Right column — searchable picker */}
            <div className="flex-1 min-w-0">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Pick Your Buckets</h2>
                <p className="text-sm text-gray-500">
                  Select up to 4 buckets.{' '}
                  <span className="text-blue-600 font-medium inline-flex items-center gap-0.5">
                    <Zap className="w-3 h-3" />AI picks
                  </span>{' '}
                  are highlighted based on your profile.
                </p>
              </div>
              <SearchFilterSection
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
              <IndustryPickerGrid
                selectedBuckets={selectedBuckets}
                aiPredictionIds={aiPredictionIds}
                predictedIndustry={predictedIndustry}
                predictedLevel={predictedLevel}
                searchQuery={searchQuery}
                onToggle={handleQueueToggle}
                onReplaceRequest={handleReplaceRequest}
              />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-center gap-3">
              <Bot className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900 text-sm">AI-managed queues active</p>
                <p className="text-sm text-gray-500">Upgrade to Premium to select your own 4 job-search buckets.</p>
              </div>
            </div>
            <LockedQueuePreview queues={availableQueues} onUpgrade={() => setShowPremiumPrompt(true)} />
          </div>
        )}

        <FooterActions isPremium={isPremium} selectedQueues={selectedQueues} onSave={handleSave} onCancel={handleClose} />
      </div>

      <ReplaceSlotModal
        candidateIndustry={replaceCandidate}
        selectedBuckets={selectedBuckets}
        aiPredictionIds={aiPredictionIds}
        onReplace={handleReplaceSlot}
        onCancel={() => setReplaceCandidate(null)}
      />

      <PremiumModal isOpen={showPremiumPrompt} onClose={() => setShowPremiumPrompt(false)} />
      </>
      )}
    </div>
  );
}
