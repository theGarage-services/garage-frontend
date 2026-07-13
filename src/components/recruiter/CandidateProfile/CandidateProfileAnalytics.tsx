import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Progress } from '../../ui/progress';
import { BarChart3 } from 'lucide-react';

export interface CandidateProfileAnalyticsProps {
  candidate: any;
}

export function CandidateProfileAnalytics({ candidate }: Readonly<CandidateProfileAnalyticsProps>) {
  if (!candidate.analytics) {
    return (
      <Card className="p-12 text-center">
        <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg text-gray-900 mb-2">No Analytics Available</h3>
        <p className="text-gray-600">Candidate analytics are not available.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Performance Metrics</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Response Rate</span>
                <span className="text-sm font-medium">{candidate.analytics.considerations.response_rate}%</span>
              </div>
              <Progress value={candidate.analytics.considerations.response_rate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Interview Rate</span>
                <span className="text-sm font-medium">
                  {candidate.analytics.applications.total > 0
                    ? Math.round((candidate.analytics.interviews.total / candidate.analytics.applications.total) * 100)
                    : 0}%
                </span>
              </div>
              <Progress
                value={
                  candidate.analytics.applications.total > 0
                    ? (candidate.analytics.interviews.total / candidate.analytics.applications.total) * 100
                    : 0
                }
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Avg Match Score</span>
                <span className="text-sm font-medium">{(Number(candidate.analytics.applications.average_match_score) / 100).toFixed(2)}%</span>
              </div>
              <Progress value={candidate.analytics.applications.average_match_score / 100} className="h-2" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Predicted Queues</h3>
          <div className="space-y-3">
            {candidate.analytics.predicted_queues.length > 0 ? (
              candidate.analytics.predicted_queues.map((queue: { industry: string; level: string; industry_probability: number }, index: number) => (
                <div key={`${queue.industry}-${queue.level}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{queue.industry.replaceAll('-', ' ')}</span>
                    <span className="text-xs text-gray-500 ml-2">{queue.level}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{queue.industry_probability}%</span>
                    <Badge className="bg-[#ff6b35] text-white">
                      {index + 1}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No queue predictions available.</p>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg text-gray-900 mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-semibold text-blue-700">{candidate.analytics.applications.total}</div>
            <div className="text-sm text-blue-600">Applications</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-700">{candidate.analytics.considerations.accepted}</div>
            <div className="text-sm text-green-600">Responses</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-semibold text-purple-700">{candidate.analytics.interviews.total}</div>
            <div className="text-sm text-purple-600">Interviews</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-semibold text-orange-700">{candidate.analytics.applications.by_status?.hired ?? 0}</div>
            <div className="text-sm text-orange-600">Placements</div>
          </div>
          <div className="text-center p-4 bg-gray-100 rounded-lg">
            <div className="text-2xl font-semibold text-gray-700">{candidate.analytics.recruiter_notes}</div>
            <div className="text-sm text-gray-600">Notes</div>
          </div>
        </div>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Profile Strength</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Strength</span>
                <span className="text-sm font-medium">{candidate.analytics.profile.strength}%</span>
              </div>
              <Progress value={candidate.analytics.profile.strength} className="h-2" />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Personality test:</span>
              <span className={candidate.analytics.profile.personality_test_completed ? 'text-green-600 font-medium' : 'text-gray-500'}>
                {candidate.analytics.profile.personality_test_completed ? 'Completed' : 'Not completed'}
              </span>
            </div>
            {candidate.analytics.profile.top_personality_traits.length > 0 && (
              <div className="space-y-2">
                <span className="text-sm text-gray-600">Top traits</span>
                <div className="flex flex-wrap gap-2">
                  {candidate.analytics.profile.top_personality_traits.map((trait: { trait: string; score: number }) => (
                    <Badge key={trait.trait} variant="secondary" className="bg-blue-100 text-blue-800">
                      {trait.trait} {trait.score}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg text-gray-900 mb-4">Application Status</h3>
          <div className="space-y-2">
            {Object.entries((candidate.analytics.applications.by_status || {}) as Record<string, number>).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700 capitalize">{status.replaceAll('_', ' ')}</span>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
