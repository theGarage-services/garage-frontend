import { useState, useEffect, useMemo } from 'react';
import { Card } from '../../ui/card';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Alert, AlertDescription } from '../../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { QueueCard } from './QueueCard';
import {
  Target,
  Sparkles,
  Settings,
  Lightbulb,
  Brain,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  Save,
  Code
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { JobData } from '../../../api/jobPosts';

interface Queue {
  id: string;
  name: string;
  industry: string;
  icon: LucideIcon;
  color: string;
  members: number;
  avgSalary: string;
  matchScore?: number;
  description: string;
  topSkills: string[];
  hiringTrends: string;
  responseRate: string;
}

interface Step4QueuesProps {
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  errors: Record<string, string>;
  availableQueues: Queue[];
  isLoadingQueues: boolean;
  isAnalyzing: boolean;
  predictedIndustry: string;
  predictedLevel: string;
  getQueueColor: (color: string) => string;
  onBackToBasicInfo: () => void;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

export function Step4Queues({
  jobData,
  setJobData,
  errors,
  availableQueues,
  isLoadingQueues,
  isAnalyzing,
  predictedIndustry,
  predictedLevel,
  getQueueColor,
  onBackToBasicInfo,
  onSaveDraft,
  isSubmitting
}: Readonly<Step4QueuesProps>) {
  const [manualIndustry, setManualIndustry] = useState<string>(predictedIndustry);
  const [manualLevel, setManualLevel] = useState<string>(predictedLevel);

  const matchedQueues = useMemo(() => {
    const matchIndustry = (predicted: string, queueIndustry: string) => {
      const p = predicted.trim().toLowerCase();
      const q = queueIndustry.trim().toLowerCase();
      return p === q || p.includes(q) || q.includes(p);
    };

    const buildSyntheticQueue = (industry: string): Queue => {
      const slug = industry.toLowerCase().replace(/\s+/g, '-').replaceAll('&', 'and');
      return {
        id: `queue-${slug}`,
        name: industry,
        industry,
        icon: Code,
        color: 'blue',
        members: 0,
        avgSalary: '',
        matchScore: 0,
        description: '',
        topSkills: [],
        hiringTrends: '',
        responseRate: ''
      };
    };

    // Always match the displayed prediction so the single QueueCard matches the AI Predictions section.
    if (predictedIndustry) {
      const primaryQueue = availableQueues.find((q) =>
        matchIndustry(predictedIndustry, q.industry)
      );
      return [primaryQueue ?? buildSyntheticQueue(predictedIndustry)];
    }

    return [];
  }, [availableQueues, predictedIndustry]);
  const predictionsFetched = Boolean(predictedIndustry || predictedLevel);

  // Sync manual overrides with parent predictions
  useEffect(() => {
    setManualIndustry(predictedIndustry);
    setManualLevel(predictedLevel);
  }, [predictedIndustry, predictedLevel]);

  const handleQueueToggle = (queueId: string) => {
    setJobData((prev) => ({
      ...prev,
      selectedQueues: prev.selectedQueues.includes(queueId)
        ? prev.selectedQueues.filter((id) => id !== queueId)
        : [...prev.selectedQueues, queueId]
    }));
  };


  // Early return with loading state if queues are being fetched
  if (isLoadingQueues) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-medium text-gray-900">Queue Targeting</h2>
            <p className="text-gray-600">Choose which job seeker queues to target with this posting</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-pulse text-purple-600">Loading recommended queues...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
          <Target className="w-6 h-6 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-medium text-gray-900">Queue Targeting</h2>
          <p className="text-gray-600">Choose which job seeker queues to target with this posting</p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-purple-600 bg-purple-50 px-4 py-2 rounded-lg">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm font-medium">AI Analyzing...</span>
          </div>
        )}
        {predictionsFetched && !isAnalyzing && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-lg">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Predictions Saved to Job Post</span>
          </div>
        )}
      </div>

      <Tabs
        value={jobData.targetingMode}
        onValueChange={(value: string) =>
          setJobData((prev) => ({ ...prev, targetingMode: value as 'recommended' | 'manual' }))
        }
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recommended" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Recommended
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Manual Selection
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-6">
          {predictionsFetched && (predictedIndustry || predictedLevel) && (
            <Card className="p-4 bg-purple-50 border-purple-200">
              <h4 className="font-medium text-purple-900 mb-2">AI Predictions</h4>
              <div className="space-y-1 text-sm text-purple-700">
                {predictedIndustry && <div>Predicted Industry: <span className="font-medium">{predictedIndustry}</span></div>}
                {predictedLevel && <div>Predicted Level: <span className="font-medium">{predictedLevel}</span></div>}
              </div>
            </Card>
          )}

          {matchedQueues.length === 0 ? (
            predictionsFetched ? (
              <Alert className="border-orange-200 bg-orange-50">
                <Lightbulb className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  No matching queues found for this job posting. Try switching to Manual Selection to refine the target industry.
                </AlertDescription>
              </Alert>
            ) : (
              <Card className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Need More Information</h3>
                <p className="text-gray-600 mb-4">
                  Our AI needs more details about the job to provide accurate queue recommendations. Please fill out the
                  job title, department, and description in previous steps.
                </p>
                <Button variant="outline" onClick={onBackToBasicInfo}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Go Back to Basic Info
                </Button>
              </Card>
            )
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matchedQueues.map((queue) => (
                <QueueCard
                  key={queue.id}
                  queue={queue}
                  isSelected={jobData.selectedQueues.includes(queue.id)}
                  onToggle={() => handleQueueToggle(queue.id)}
                  getQueueColor={getQueueColor}
                  industry={predictedIndustry}
                  level={predictedLevel}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="manual" className="space-y-6">
          <Card className="p-4 bg-blue-50 border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Adjust AI Predictions</h4>
            <p className="text-sm text-blue-700 mb-4">Fine-tune the industry and level predictions if needed:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manualIndustry" className="text-sm font-medium text-gray-900">Industry</Label>
                <select
                  id="manualIndustry"
                  value={manualIndustry}
                  onChange={(e) => setManualIndustry(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select industry...</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Business Development">Business Development</option>
                  <option value="Sales">Sales</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Education">Education</option>
                  <option value="Construction">Construction</option>
                  <option value="Arts">Arts</option>
                  <option value="Consultant">Consultant</option>
                </select>
              </div>

              <div>
                <Label htmlFor="manualLevel" className="text-sm font-medium text-gray-900">Job Level</Label>
                <select
                  id="manualLevel"
                  value={manualLevel}
                  onChange={(e) => setManualLevel(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select level...</option>
                  <option value="L1">L1 - Entry Level</option>
                  <option value="L2">L2 - Mid Level</option>
                  <option value="L3">L3 - Senior</option>
                  <option value="L4">L4 - Manager/Director</option>
                  <option value="L5">L5 - Executive</option>
                </select>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
        <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>

      {errors.queues && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">{errors.queues}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
