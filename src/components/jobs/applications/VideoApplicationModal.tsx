import { useEffect } from 'react';
import { Button } from '../../ui/button';
import { VideoPromptRecorder } from './VideoPromptRecorder';
import { useVideoApplication } from './useVideoApplication';
import type { PromptResponse } from '../../../api/jobPosts';

interface VideoApplicationModalProps {
  jobId: number;
  onComplete: (responses: PromptResponse[]) => void;
  onCancel: () => void;
  submitLabel?: string;
  submitLoading?: boolean;
}

export function VideoApplicationModal({
  jobId,
  onComplete,
  onCancel,
  submitLabel = 'Submit Application',
  submitLoading = false,
}: Readonly<VideoApplicationModalProps>) {
  const {
    prompts,
    responses,
    promptsLoading,
    uploadingPromptId,
    uploadError,
    loadPrompts,
    uploadResponse,
    isComplete,
  } = useVideoApplication();

  useEffect(() => {
    loadPrompts(jobId);
  }, [jobId, loadPrompts]);

  const handleComplete = () => {
    const uploadedResponses = prompts.map((p) => responses[p.id]).filter(Boolean);
    onComplete(uploadedResponses);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-[95vw] sm:max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Video Application</h2>
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-2xl"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 mb-6">
          Please record a short video response for each question below. Your application will be submitted once all prompts are answered.
        </p>

        {promptsLoading ? (
          <div className="py-12 text-center text-gray-600">Loading prompts...</div>
        ) : prompts.length === 0 ? (
          <div className="py-12 text-center text-gray-600">
            No video prompts required. You can close this and continue.
          </div>
        ) : (
          <div className="space-y-6">
            {prompts.map((prompt) => (
              <VideoPromptRecorder
                key={prompt.id}
                questionText={prompt.question_text}
                maxDurationSeconds={prompt.max_duration_seconds}
                onUpload={(blob, duration) => uploadResponse(prompt, blob, duration)}
                isUploading={uploadingPromptId === prompt.id}
                uploadError={uploadingPromptId === prompt.id ? null : uploadError}
                retakeCount={responses[prompt.id]?.attempt_count || 0}
                maxRetakes={3}
              />
            ))}

            {uploadError && (
              <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{uploadError}</div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onCancel} disabled={submitLoading || uploadingPromptId !== null}>
                Cancel
              </Button>
              <Button onClick={handleComplete} disabled={submitLoading || !isComplete || uploadingPromptId !== null}>
                {submitLoading ? 'Submitting...' : submitLabel}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
