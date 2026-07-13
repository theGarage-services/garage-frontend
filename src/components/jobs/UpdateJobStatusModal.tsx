import { useState, useEffect } from 'react';
import { X, Save, Clock, Users, TrendingUp, CheckCircle, Info, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { jobPostsApi } from '../../api/jobPosts';

interface UpdateJobStatusModalProps {
  job: any;
  onClose: () => void;
  onUpdate: (statusData: any) => void;
}

export function UpdateJobStatusModal({ job, onClose, onUpdate }: Readonly<UpdateJobStatusModalProps>) {
  const [hiringStatus, setHiringStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch current hiring status from API
  useEffect(() => {
    const fetchHiringStatus = async () => {
      if (!job?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await jobPostsApi.getJobHiringStatus(job.id);

        if (response.success && response.data) {
          setHiringStatus(response.data);
        } else {
          setError('Failed to load hiring status');
        }
      } catch (err: any) {
        console.error('Error fetching hiring status:', err);
        setError(err.message || 'Failed to load hiring status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiringStatus();
  }, [job?.id]);

  // Use API data or fallback
  const currentStatus = hiringStatus || {
    stage: 'open',
    positions_filled: 0,
    total_positions: job.numberOfCandidates || 1,
    applications_count: 0,
    interview_count: 0,
    planned_interview_count: 0,
    custom_message: '',
    is_visible: true,
    last_updated: new Date().toISOString()
  };

  const [formData, setFormData] = useState({
    stage: currentStatus.stage,
    positionsFilled: currentStatus.positions_filled,
    plannedInterviewCount: currentStatus.planned_interview_count,
    customMessage: currentStatus.custom_message,
    isVisible: currentStatus.is_visible
  });

  // Update form data when hiring status loads
  useEffect(() => {
    if (hiringStatus) {
      setFormData({
        stage: hiringStatus.stage,
        positionsFilled: hiringStatus.positions_filled,
        plannedInterviewCount: hiringStatus.planned_interview_count,
        customMessage: hiringStatus.custom_message,
        isVisible: hiringStatus.is_visible
      });
    }
  }, [hiringStatus]);

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stage options
  const stageOptions = [
    {
      value: 'open',
      label: 'Open - Accepting Applications',
      icon: Clock,
      description: 'Job is open and actively accepting applications'
    },
    {
      value: 'reviewing',
      label: 'Reviewing Applications',
      icon: Users,
      description: 'Currently reviewing submitted applications'
    },
    {
      value: 'interviewing',
      label: 'Conducting Interviews',
      icon: Activity,
      description: 'Actively interviewing candidates'
    },
    {
      value: 'final',
      label: 'Final Selection Phase',
      icon: TrendingUp,
      description: 'Making final decisions and preparing offers'
    },
    {
      value: 'partial',
      label: 'Positions Partially Filled',
      icon: CheckCircle,
      description: 'Some positions filled, still hiring'
    },
    {
      value: 'filled',
      label: 'All Positions Filled',
      icon: CheckCircle,
      description: 'All positions have been filled'
    }
  ];


  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (formData.positionsFilled < 0) {
      newErrors.positionsFilled = 'Cannot be negative';
    }
    if (formData.positionsFilled > currentStatus.totalPositions) {
      newErrors.positionsFilled = `Cannot exceed total positions (${currentStatus.totalPositions})`;
    }
    if (formData.stage === 'interviewing' && formData.plannedInterviewCount <= 0) {
      newErrors.plannedInterviewCount = 'Please specify how many candidates you plan to interview';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSaving(true);

    try {
      const response = await jobPostsApi.updateJobHiringStatus(job.id, {
        stage: formData.stage,
        positions_filled: formData.positionsFilled,
        planned_interview_count: formData.plannedInterviewCount,
        custom_message: formData.customMessage,
        is_visible: formData.isVisible
      });

      if (response.success && response.data) {
        onUpdate(response.data);
        onClose();
      } else {
        setError(response.error || 'Failed to update hiring status');
      }
    } catch (err: any) {
      console.error('Error updating hiring status:', err);
      setError(err.message || 'Failed to update hiring status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#ff6b35] rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Hiring Status</h2>
              <p className="text-sm text-gray-600">{job.title}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Error display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Auto-populated metrics */}
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Current Metrics (Auto-Updated)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4">
                <p className="text-xs text-gray-600 mb-1">Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{currentStatus.applications_count}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-600 mb-1">In Interviews</p>
                <p className="text-2xl font-semibold text-purple-600">{currentStatus.interview_count}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-600 mb-1">Total Positions</p>
                <p className="text-2xl font-semibold text-gray-900">{currentStatus.total_positions}</p>
              </Card>
            </div>
          </div>

          {/* Current Hiring Stage */}
          <div>
            <Label htmlFor="stage" className="text-base mb-2 block">
              Current Hiring Stage *
            </Label>
            <Select value={formData.stage} onValueChange={(value) => setFormData(prev => ({ ...prev, stage: value }))}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[9999]">
                {stageOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-3 py-1">
                        <Icon className="w-4 h-4 text-gray-600" />
                        <div>
                          <p className="font-medium">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Positions Filled */}
          <div>
            <Label htmlFor="positionsFilled" className="text-base mb-2 block">
              Positions Filled
            </Label>
            <Input
              id="positionsFilled"
              type="number"
              min="0"
              max={currentStatus.totalPositions}
              value={formData.positionsFilled}
              onChange={(e) => {
                const value = Math.max(0, Math.min(currentStatus.totalPositions, Number.parseInt(e.target.value) || 0));
                setFormData(prev => ({ ...prev, positionsFilled: value }));
              }}
              className={`h-12 ${errors.positionsFilled ? 'border-red-300' : ''}`}
            />
            {errors.positionsFilled && (
              <p className="text-sm text-red-600 mt-1">{errors.positionsFilled}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              How many of the {currentStatus.total_positions} positions have been filled?
            </p>
          </div>

          {/* Planned Interview Count (only for interviewing stage) */}
          {formData.stage === 'interviewing' && (
            <div>
              <Label htmlFor="plannedInterviewCount" className="text-base mb-2 block">
                Planned Interview Candidates
              </Label>
              <Input
                id="plannedInterviewCount"
                type="number"
                min="1"
                value={formData.plannedInterviewCount}
                onChange={(e) => {
                  const value = Math.max(1, Number.parseInt(e.target.value) || 0);
                  setFormData(prev => ({ ...prev, plannedInterviewCount: value }));
                }}
                className={`h-12 ${errors.plannedInterviewCount ? 'border-red-300' : ''}`}
              />
              {errors.plannedInterviewCount && (
                <p className="text-sm text-red-600 mt-1">{errors.plannedInterviewCount}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Currently interviewing {currentStatus.interview_count} of {formData.plannedInterviewCount} planned candidates
              </p>
            </div>
          )}

          {/* Custom Message */}
          <div>
            <Label htmlFor="customMessage" className="text-base mb-2 block">
              Custom Status Message (Optional)
            </Label>
            <Textarea
              id="customMessage"
              value={formData.customMessage}
              onChange={(e) => setFormData(prev => ({ ...prev, customMessage: e.target.value }))}
              placeholder="Add a message for candidates about the hiring progress..."
              className="min-h-[100px]"
              maxLength={280}
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-500">Share insights with job seekers</p>
              <p className="text-xs text-gray-500">{formData.customMessage.length}/280</p>
            </div>
          </div>

          {/* Status Visibility */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Share Hiring Status with Candidates</h4>
              <p className="text-sm text-gray-600">Allow job seekers to see this hiring progress</p>
            </div>
            <Switch
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVisible: checked }))}
            />
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Note:</strong> Application and interview counts are automatically updated from your kanban board. 
              Premium job seekers will see this status information when viewing your job posting.
            </AlertDescription>
          </Alert>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6 flex flex-col sm:flex-row sm:justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || isLoading}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Update Status'}
          </Button>
        </div>
      </Card>
    </div>
  );
}