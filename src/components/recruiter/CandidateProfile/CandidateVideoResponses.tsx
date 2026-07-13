import { Card, CardContent } from '../../ui/card';
import { Video, AlertCircle } from 'lucide-react';
import { buildProfileImageUrl } from '../../../api/recruiterProfile';
import type { PromptResponse } from '../../../api/jobPosts';

interface CandidateVideoResponsesProps {
  responses: PromptResponse[];
}

export function CandidateVideoResponses({ responses }: Readonly<CandidateVideoResponsesProps>) {
  if (!responses || responses.length === 0) {
    return (
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Video className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Video Responses</h3>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle className="w-4 h-4" />
            <p className="text-sm">No video responses have been recorded for this candidate yet.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white border border-gray-200 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Video Responses</h3>
        </div>

        <div className="space-y-6">
          {responses.map((response) => (
            <div key={response.id} className="border border-gray-200 rounded-lg p-4">
              <div className="mb-3">
                <span className="text-sm font-medium text-gray-500">Prompt {response.prompt_order}</span>
                <h4 className="text-base font-medium text-gray-900 mt-1">{response.question_text}</h4>
              </div>

              {response.video_url ? (
                <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                  <video
                    src={buildProfileImageUrl(response.video_url)}
                    controls
                    playsInline
                    loop={false}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <track kind="captions" src="" label="No captions" default />
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-500 py-8">
                  <AlertCircle className="w-4 h-4" />
                  <p className="text-sm">Video file is not available.</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                <span>Duration: {formatDuration(response.duration_seconds)}</span>
                <span>Recorded: {formatDate(response.recorded_at)}</span>
                <span>Attempts: {response.attempt_count}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function formatDuration(seconds: number): string {
  if (!seconds) return 'N/A';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function formatDate(value: string | undefined): string {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}
