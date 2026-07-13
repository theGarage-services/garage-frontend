import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { CheckCircle } from 'lucide-react';
import { getStageCircleClass, getStageDisplayName } from './utils';

export interface CandidateProfileOverviewProps {
  candidate: any;
}

export function CandidateProfileOverview({ candidate }: Readonly<CandidateProfileOverviewProps>) {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl text-gray-900 mb-4">Professional Summary</h3>
        <p className="text-gray-700 leading-relaxed mb-6">{candidate.summary}</p>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg text-gray-900 mb-3">Key Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Experience:</span>
                <span className="text-gray-900">{candidate.experience}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expected Salary:</span>
                <span className="text-gray-900">{candidate.salary}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applied:</span>
                <span className="text-gray-900">
                  {candidate.appliedDate
                    ? new Date(candidate.appliedDate).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Activity:</span>
                <span className="text-gray-900">
                  {(candidate.lastLogin || candidate.lastActivity)
                    ? new Date(candidate.lastLogin || candidate.lastActivity).toLocaleDateString()
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {candidate.queueMetrics && (
            <div>
              <h4 className="text-lg text-gray-900 mb-3">Current Queues</h4>
              <div className="space-y-2">
                {candidate.queueMetrics.currentQueues.map((queue: string, index: number) => (
                  <div key={queue} className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                    <span className="text-sm text-gray-700">{queue}</span>
                    <Badge variant="outline" className="text-[#ff6b35] border-[#ff6b35]">
                      #{candidate.queueMetrics.queueRankings[index]}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-xl text-gray-900 mb-4">Technical Skills</h3>
        {candidate.skills.length === 0 ? (
          <p className="text-gray-500">No skills recorded.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill: string) => (
              <Badge key={String(skill)} variant="secondary" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h3 className="text-xl text-gray-900 mb-6">Hiring Progress</h3>
        <div className="space-y-4">
          {candidate.hiringStages.map((stage: { completed: boolean; name: string; date: string | number | Date | null }, index: number) => (
            <div key={stage.name} className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                getStageCircleClass(stage.completed, candidate.applicationStatus === stage.name)
              }`}>
                {stage.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${
                    candidate.applicationStatus === stage.name ? 'text-[#ff6b35]' : 'text-gray-700'
                  }`}>
                    {getStageDisplayName(stage.name)}
                  </span>
                  {stage.date && (
                    <span className="text-sm text-gray-500">
                      {new Date(stage.date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
