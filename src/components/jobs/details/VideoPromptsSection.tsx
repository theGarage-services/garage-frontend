import { Card, CardContent } from '../../ui/card';
import { Video, Clock, FileQuestion } from 'lucide-react';
import { buildProfileImageUrl } from '../../../api/recruiterProfile';
import type { PromptResponse } from '../../../api/jobPosts';

interface VideoPrompt {
  id: number;
  order?: number;
  questionText?: string;
  question_text?: string;
  maxDurationSeconds?: number;
  max_duration_seconds?: number;
}

interface VideoPromptsSectionProps {
  prompts: VideoPrompt[];
  responses: PromptResponse[];
}

function getPromptText(prompt: VideoPrompt): string {
  return (prompt.questionText || prompt.question_text || '').trim();
}

function findResponseForPrompt(responses: PromptResponse[], promptId: number): PromptResponse | undefined {
  return responses.find(response => response.prompt === promptId);
}

function formatDuration(seconds: number | undefined | null): string {
  if (seconds == null || Number.isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function VideoPromptsSection({ prompts, responses }: Readonly<VideoPromptsSectionProps>) {
  if (!prompts || prompts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="w-5 h-5 text-[#ff6b35]" />
          <h3 className="text-lg font-semibold text-gray-900">Video Screening</h3>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Review the video prompts and your recorded responses for this role. Responses cannot be edited here.
        </p>
        <div className="space-y-4">
          {prompts.map((prompt, index) => {
            const questionText = getPromptText(prompt);
            const response = findResponseForPrompt(responses, prompt.id);
            return (
              <div key={prompt.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row items-start gap-3 mb-3">
                  <div className="w-6 h-6 bg-[#ff6b35] text-white rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{questionText || 'Untitled prompt'}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Max {formatDuration(prompt.maxDurationSeconds ?? prompt.max_duration_seconds)} minutes
                    </p>
                  </div>
                </div>
                {response?.video_url ? (
                  <div className="space-y-2">
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                      <video
                        src={buildProfileImageUrl(response.video_url)}
                        controls
                        playsInline
                        loop={false}
                        preload="metadata"
                        className="w-full h-full object-cover"
                      >
                        <track kind="captions" src="" label="No captions" default />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Duration: {formatDuration(response.duration_seconds)}
                      </span>
                      <span>Recorded: {response.recorded_at ? new Date(response.recorded_at).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-3">
                    <FileQuestion className="w-4 h-4" />
                    No response recorded
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
