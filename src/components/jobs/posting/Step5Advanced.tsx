import { useState } from 'react';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Switch } from '../../ui/switch';
import { Alert } from '../../ui/alert';
import { Button } from '../../ui/button';
import { Settings, Info, Save } from 'lucide-react';
import type { JobData } from '../../../api/jobPosts';

interface Step5AdvancedProps {
  jobData: JobData;
  setJobData: React.Dispatch<React.SetStateAction<JobData>>;
  onSaveDraft: () => void;
  isSubmitting: boolean;
}

const INTERVIEW_STAGES = [
  {
    id: 'phone-screening',
    label: 'Phone Screening',
    icon: '📞',
    description: 'Initial phone/video call to screen candidates'
  },
  {
    id: 'technical-interview',
    label: 'Technical Interview',
    icon: '💻',
    description: 'Technical skills assessment and coding challenges'
  },
  {
    id: 'final-interview',
    label: 'Final Interview',
    icon: '🎯',
    description: 'Final round with hiring manager or team leads'
  }
];

export function Step5Advanced({ jobData, setJobData, onSaveDraft, isSubmitting }: Readonly<Step5AdvancedProps>) {
  const [localRounds, setLocalRounds] = useState<Record<string, number>>(jobData.interviewRounds);

  const updateInterviewRounds = (stageId: string, value: number) => {
    const newRounds = { ...localRounds, [stageId]: value };
    setLocalRounds(newRounds);
    setJobData((prev) => ({ ...prev, interviewRounds: newRounds }));
  };

  const totalRounds = Object.values(localRounds).reduce((sum, count) => sum + (count || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
          <Settings className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <h2 className="text-2xl font-medium text-gray-900">Advanced Settings</h2>
          <p className="text-gray-600">Configure deadlines, requirements, and preferences</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="applicationDeadline" className="text-base">
            Application Deadline
          </Label>
          <Input
            id="applicationDeadline"
            type="date"
            value={jobData.applicationDeadline}
            onChange={(e) => setJobData((prev) => ({ ...prev, applicationDeadline: e.target.value }))}
            className="mt-2 h-12"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty for no deadline</p>
        </div>

        <div>
          <Label htmlFor="startDate" className="text-base">
            Expected Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={jobData.startDate}
            onChange={(e) => setJobData((prev) => ({ ...prev, startDate: e.target.value }))}
            className="mt-2 h-12"
          />
          <p className="text-xs text-gray-500 mt-1">When should the candidate start?</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Application Requirements</h3>

        <div className="space-y-4 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900">Cover Letter Required</h4>
              <p className="text-sm text-gray-600">Candidates must submit a cover letter with their application</p>
            </div>
            <Switch
              checked={jobData.requiresCoverLetter}
              onCheckedChange={(checked: boolean) =>
                setJobData((prev) => ({ ...prev, requiresCoverLetter: checked }))
              }
            />
          </div>
        </div>

        <div className="space-y-4 border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="font-medium text-gray-900">Portfolio Required</h4>
              <p className="text-sm text-gray-600">Candidates must submit a portfolio or work samples</p>
            </div>
            <Switch
              checked={jobData.requiresPortfolio}
              onCheckedChange={(checked: boolean) =>
                setJobData((prev) => ({ ...prev, requiresPortfolio: checked }))
              }
            />
          </div>

          {jobData.requiresPortfolio && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <div>
                <Label htmlFor="portfolioDescription" className="text-base">
                  Portfolio Description
                </Label>
                <Textarea
                  id="portfolioDescription"
                  value={jobData.portfolioDescription}
                  onChange={(e) =>
                    setJobData((prev) => ({ ...prev, portfolioDescription: e.target.value }))
                  }
                  placeholder="Describe what kind of portfolio or work samples you're looking for..."
                  className="mt-2 min-h-[80px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Let candidates know what you expect in their portfolio
                </p>
              </div>

              <div>
                <Label id="portfolio-submission-label" className="text-base mb-3 block">Preferred Submission Method</Label>
                <div className="space-y-2" role="radiogroup" aria-labelledby="portfolio-submission-label">
                  {['link', 'document'].map((type) => (
                    <div
                      key={type}
                      role="radio"
                      aria-checked={jobData.portfolioSubmissionType === type}
                      tabIndex={0}
                      onClick={() => setJobData((prev) => ({ ...prev, portfolioSubmissionType: type as 'link' | 'document' }))}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          setJobData((prev) => ({ ...prev, portfolioSubmissionType: type as 'link' | 'document' }));
                        }
                      }}
                      className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        jobData.portfolioSubmissionType === type
                          ? 'border-[#ff6b35] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="portfolioSubmission"
                        checked={jobData.portfolioSubmissionType === type}
                        onChange={() => setJobData((prev) => ({ ...prev, portfolioSubmissionType: type as 'link' | 'document' }))}
                        className="mt-0.5"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                      <div>
                        <h5 className="font-medium text-gray-900">
                          {type === 'link' ? 'Portfolio Link' : 'Upload Document'}
                        </h5>
                        <p className="text-sm text-gray-600">
                          {type === 'link'
                            ? 'Candidates provide a URL to their online portfolio or website'
                            : 'Candidates upload portfolio files (PDF, images, etc.)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Posting Options</h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 border border-gray-200 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Urgent Hiring</h4>
            <p className="text-sm text-gray-600">Mark this as an urgent position to attract faster responses</p>
          </div>
          <Switch
            checked={jobData.isUrgent}
            onCheckedChange={(checked: boolean) => setJobData((prev) => ({ ...prev, isUrgent: checked }))}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Interview Process</h3>
        <p className="text-sm text-gray-600">
          Configure how many rounds you want for each interview type. Set to 0 to skip that stage.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {INTERVIEW_STAGES.map((stage) => (
            <div key={stage.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start gap-3">
                <span className="text-xl">{stage.icon}</span>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{stage.label}</h4>
                      <p className="text-sm text-gray-600">{stage.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Label htmlFor={`rounds-${stage.id}`} className="text-sm font-medium whitespace-nowrap">
                        Rounds:
                      </Label>
                      <Input
                        id={`rounds-${stage.id}`}
                        type="number"
                        min="0"
                        max="5"
                        value={localRounds[stage.id] || 0}
                        onChange={(e) => {
                          const value = Math.max(0, Math.min(5, Number.parseInt(e.target.value) || 0));
                          updateInterviewRounds(stage.id, value);
                        }}
                        className="w-20 h-10 text-center"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalRounds > 0 && (
          <Alert className="border-blue-200 bg-blue-50 w-full">
            <div className="space-y-3 col-start-2 w-full">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <h4 className="font-medium text-blue-900">Interview Process Summary</h4>
              </div>
              <div className="space-y-2">
                {INTERVIEW_STAGES.map(
                  (stage) =>
                    localRounds[stage.id] > 0 && (
                      <div key={stage.id} className="text-sm text-blue-700 flex items-baseline gap-2">
                        <span className="flex-shrink-0">{stage.icon}</span>
                        <span>{stage.label}: {localRounds[stage.id]} round{localRounds[stage.id] > 1 ? 's' : ''}</span>
                      </div>
                    )
                )}
              </div>
              <p className="text-sm text-blue-700">
                Candidates will see this interview process in your job posting, helping them understand what to expect.
              </p>
            </div>
          </Alert>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Internal Information</h3>

        <div>
          <Label htmlFor="numberOfCandidates" className="text-base">
            Number of Candidates Being Hired
          </Label>
          <Input
            id="numberOfCandidates"
            type="number"
            min="1"
            max="100"
            value={jobData.numberOfCandidates}
            onChange={(e) => {
              const value = Math.max(1, Math.min(100, Number.parseInt(e.target.value) || 1));
              setJobData((prev) => ({ ...prev, numberOfCandidates: value.toString() }));
            }}
            placeholder="1"
            className="mt-2 h-12"
          />
          <p className="text-xs text-gray-500 mt-1">
            How many candidates are you looking to hire for this position?
          </p>
        </div>

        <div>
          <Label htmlFor="hiringManager" className="text-base">
            Hiring Manager
          </Label>
          <Input
            id="hiringManager"
            value={jobData.hiringManager}
            onChange={(e) => setJobData((prev) => ({ ...prev, hiringManager: e.target.value }))}
            placeholder="John Smith"
            className="mt-2 h-12"
          />
        </div>

        <div>
          <Label htmlFor="internalJobCode" className="text-base">
            Internal Job Code
          </Label>
          <Input
            id="internalJobCode"
            value={jobData.internalJobCode}
            onChange={(e) => setJobData((prev) => ({ ...prev, internalJobCode: e.target.value }))}
            placeholder="ENG-2024-001"
            className="mt-2 h-12"
          />
        </div>

        <div>
          <Label htmlFor="recruiterNotes" className="text-base">
            Recruiter Notes
          </Label>
          <Textarea
            id="recruiterNotes"
            value={jobData.recruiterNotes}
            onChange={(e) => setJobData((prev) => ({ ...prev, recruiterNotes: e.target.value }))}
            placeholder="Internal notes for the recruiting team..."
            className="mt-2 min-h-[100px]"
          />
          <p className="text-xs text-gray-500 mt-1">These notes are only visible to your recruiting team</p>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
        <Button variant="outline" onClick={onSaveDraft} disabled={isSubmitting}>
          <Save className="w-4 h-4 mr-2" />
          Save Draft
        </Button>
      </div>
    </div>
  );
}
