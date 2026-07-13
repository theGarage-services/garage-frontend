import { useMemo } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Alert } from '../../ui/alert';
import { Video, Plus, Trash2, Lock, Info } from 'lucide-react';
import type { JobData, VideoPrompt } from '../../../api/jobPosts';

interface Step3VideoPromptsProps {
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  errors: Record<string, string>;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

const MAX_PROMPTS = 5;
const MAX_DURATION_SECONDS = 180;

export function Step3VideoPrompts({
  jobData,
  setJobData,
  errors,
  onSaveDraft,
  isSubmitting
}: Readonly<Step3VideoPromptsProps>) {
  const prompts = useMemo(() => jobData.videoPrompts || [], [jobData.videoPrompts]);
  const isLocked = Boolean((jobData as any).promptsLocked);

  const updatePrompts = (next: VideoPrompt[]) => {
    setJobData((prev) => ({ ...prev, videoPrompts: next }));
  };

  const handleChange = (index: number, value: string) => {
    const next = [...prompts];
    next[index] = { ...next[index], questionText: value };
    updatePrompts(next);
  };

  const handleAdd = () => {
    if (prompts.length >= MAX_PROMPTS) return;
    updatePrompts([
      ...prompts,
      {
        order: prompts.length + 1,
        questionText: '',
        maxDurationSeconds: MAX_DURATION_SECONDS
      }
    ]);
  };

  const handleRemove = (index: number) => {
    const next = prompts.filter((_, i) => i !== index);
    updatePrompts(next.map((p, i) => ({ ...p, order: i + 1 })));
  };

  const nonEmptyCount = prompts.filter((p) => p.questionText.trim().length > 0).length;
  const canAdd = prompts.length < MAX_PROMPTS && !isLocked;
  const canRemove = prompts.length > 0 && !isLocked;
  const isComplete = prompts.length === 0 || (prompts.length <= MAX_PROMPTS && prompts.every((p) => p.questionText.trim().length > 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Video className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Video Prompts</h2>
          <p className="text-gray-600">
            Add up to {MAX_PROMPTS} questions every candidate must answer on video (max 3 minutes each). Leave empty to skip video prompts.
          </p>
        </div>
      </div>

      {isLocked && (
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 mt-0.5" />
            <div>
              <p className="font-medium">Prompts are locked</p>
              <p className="text-sm">
                This job has already received applications, so the prompts cannot be edited.
              </p>
            </div>
          </div>
        </Alert>
      )}

      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4 text-gray-500" />
          <p className="text-sm text-gray-600">
            Candidates will record their answers in-app before submitting their application.
          </p>
        </div>

        <div className="space-y-4">
          {prompts.map((prompt, index) => (
            <div key={prompt.id ?? prompt.order} className="flex flex-col sm:flex-row items-start gap-3">
              <div className="flex-1">
                <Label htmlFor={`prompt-${prompt.order}`} className="text-sm font-medium text-gray-700">
                  Prompt {index + 1}
                </Label>
                <Input
                  id={`prompt-${prompt.order}`}
                  value={prompt.questionText}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`e.g., "Tell us about a time you..."`}
                  disabled={isLocked || isSubmitting}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max response time: {prompt.maxDurationSeconds / 60} minute
                </p>
              </div>
              {canRemove && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(index)}
                  disabled={isSubmitting}
                  className="mt-6 text-red-600 hover:text-red-700 hover:bg-red-50"
                  aria-label={`Remove prompt ${index + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {!isLocked && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleAdd}
              disabled={!canAdd || isSubmitting}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add prompt
            </Button>
            <span className="text-sm text-gray-500">
              {nonEmptyCount} of {MAX_PROMPTS} prompts
            </span>
          </div>
        )}

        {errors.videoPrompts && (
          <p className="text-sm text-red-600 mt-4">{errors.videoPrompts}</p>
        )}

        {!isComplete && !isLocked && (
          <p className="text-sm text-amber-600 mt-4">
            Each added prompt must have question text, and you can have at most {MAX_PROMPTS} prompts.
          </p>
        )}
      </Card>

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onSaveDraft}
          disabled={isSubmitting || isLocked}
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
}
