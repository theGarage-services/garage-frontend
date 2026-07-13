import { useState, useCallback } from 'react';
import { jobPostsApi } from '../../../api/jobPosts';
import type { JobPostPrompt, PromptResponse } from '../../../api/jobPosts';

export interface UseVideoApplicationReturn {
  prompts: JobPostPrompt[];
  responses: Record<number, PromptResponse>;
  promptsLoading: boolean;
  uploadingPromptId: number | null;
  uploadError: string | null;
  setUploadError: (error: string | null) => void;
  loadPrompts: (jobId: number) => void;
  uploadResponse: (prompt: JobPostPrompt, blob: Blob, durationSeconds: number) => Promise<void>;
  isComplete: boolean;
  reset: () => void;
}

export function useVideoApplication(): UseVideoApplicationReturn {
  const [prompts, setPrompts] = useState<JobPostPrompt[]>([]);
  const [responses, setResponses] = useState<Record<number, PromptResponse>>({});
  const [promptsLoading, setPromptsLoading] = useState(false);
  const [uploadingPromptId, setUploadingPromptId] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  const loadPrompts = useCallback((jobId: number) => {
    setActiveJobId(jobId);
    setPromptsLoading(true);
    setUploadError(null);
    jobPostsApi.getJobPrompts(jobId)
      .then((result) => {
        if (result.success) {
          setPrompts(result.data);
        } else {
          setPrompts([]);
        }
      })
      .catch((err) => {
        console.error('Failed to load prompts:', err);
        setPrompts([]);
      })
      .finally(() => setPromptsLoading(false));
  }, []);

  const uploadResponse = useCallback(async (prompt: JobPostPrompt, blob: Blob, durationSeconds: number) => {
    if (!activeJobId) return;
    setUploadingPromptId(prompt.id);
    setUploadError(null);
    try {
      const result = await jobPostsApi.uploadPromptResponse(activeJobId, prompt.id, blob, durationSeconds);
      if (result.success && result.data) {
        const response = result.data;
        setResponses((prev) => ({ ...prev, [prompt.id]: response }));
      } else {
        setUploadError(result.error || 'Upload failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploadingPromptId(null);
    }
  }, [activeJobId]);

  const reset = useCallback(() => {
    setPrompts([]);
    setResponses({});
    setPromptsLoading(false);
    setUploadingPromptId(null);
    setUploadError(null);
    setActiveJobId(null);
  }, []);

  const isComplete = prompts.length > 0 && prompts.every((p) => responses[p.id]);

  return {
    prompts,
    responses,
    promptsLoading,
    uploadingPromptId,
    uploadError,
    setUploadError,
    loadPrompts,
    uploadResponse,
    isComplete,
    reset,
  };
}
