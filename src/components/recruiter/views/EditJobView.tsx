/**
 * Edit Job View Component
 */
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { UpdateJobStatusModal } from '../../jobs/UpdateJobStatusModal';
import { DepartmentSelect } from '../../common/DepartmentSelect';
import { IndustrySelect } from '../../common/IndustrySelect';
import {
  ArrowLeft, X, Save, Trash2,
  Plus, Lock
} from 'lucide-react';
import type { ViewType } from '../types';

interface EditJobViewProps {
  editingJob: any;
  setEditingJob: (job: any) => void;
  setCurrentView: (view: ViewType) => void;
  handleSaveJob: () => Promise<void>;
  handleDeleteJob: () => Promise<void>;
  showJobStatusUpdate: boolean;
  jobStatusUpdateTarget: any;
  setShowJobStatusUpdate: (show: boolean) => void;
  setJobStatusUpdateTarget: (target: null) => void;
  handleJobStatusUpdate: (status: any) => Promise<void>;
}

export const EditJobView = ({
  editingJob,
  setEditingJob,
  setCurrentView,
  handleSaveJob,
  handleDeleteJob,
  showJobStatusUpdate,
  jobStatusUpdateTarget,
  setShowJobStatusUpdate,
  setJobStatusUpdateTarget,
  handleJobStatusUpdate
}: EditJobViewProps) => {
  const promptsLocked = Boolean(editingJob?.prompts_locked || editingJob?.applications_count > 0 || editingJob?.applicants > 0);
  const MAX_SALARY_SPREAD = 50000;

  const prompts = (editingJob?.prompts || editingJob?.videoPrompts || []) as { id?: number; order: number; question_text?: string; questionText?: string; max_duration_seconds?: number; maxDurationSeconds?: number }[];

  const updatePrompts = (next: any[]) => {
    setEditingJob({ ...editingJob, prompts: next });
  };

  const handlePromptChange = (index: number, value: string) => {
    const next = [...prompts];
    next[index] = { ...next[index], question_text: value, questionText: value };
    updatePrompts(next);
  };

  const handleAddPrompt = () => {
    if (prompts.length >= 5) return;
    const next = [...prompts, { order: prompts.length + 1, question_text: '', questionText: '', max_duration_seconds: 180, maxDurationSeconds: 180 }];
    updatePrompts(next);
  };

  const handleRemovePrompt = (index: number) => {
    const next = prompts.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i + 1 }));
    updatePrompts(next);
  };

  const handleSalaryMinChange = (value: string) => {
    const minNum = value ? Number.parseFloat(value) : null;
    const maxNum = editingJob.salary_max ?? null;
    if (minNum !== null && maxNum !== null && maxNum - minNum > MAX_SALARY_SPREAD) {
      setEditingJob({ ...editingJob, salary_min: minNum, salary_max: minNum + MAX_SALARY_SPREAD });
    } else {
      setEditingJob({ ...editingJob, salary_min: minNum });
    }
  };

  const handleSalaryMaxChange = (value: string) => {
    const maxNum = value ? Number.parseFloat(value) : null;
    const minNum = editingJob.salary_min ?? null;
    if (maxNum !== null && minNum !== null && maxNum - minNum > MAX_SALARY_SPREAD) {
      setEditingJob({ ...editingJob, salary_max: maxNum, salary_min: maxNum - MAX_SALARY_SPREAD });
    } else {
      setEditingJob({ ...editingJob, salary_max: maxNum });
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <Button
          variant="outline"
          onClick={() => setCurrentView('job-detail')}
          className="text-gray-900 hover:text-[#ff6b35] hover:border-[#ff6b35] border-2 self-start"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Job Details</span>
        </Button>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentView('job-detail')}
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteJob}
            className="text-red-600 hover:text-red-700 hover:border-red-300 border-red-200"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button
            onClick={handleSaveJob}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <h1 className="text-3xl text-gray-900 mb-6">Edit Job Posting</h1>

        <div className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  value={editingJob.title || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <DepartmentSelect
                  value={editingJob.department || ''}
                  onValueChange={(value) => setEditingJob({ ...editingJob, department: value })}
                  triggerClassName="h-10"
                />
              </div>
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={editingJob.location || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-industry">Industry</Label>
                <IndustrySelect
                  value={editingJob.industry || ''}
                  onValueChange={(value) => setEditingJob({ ...editingJob, industry: value })}
                  triggerClassName="h-10"
                />
              </div>
              <div>
                <Label htmlFor="edit-employment-type">Employment Type</Label>
                <Select value={editingJob.employment_type || ''} onValueChange={(value) => setEditingJob({ ...editingJob, employment_type: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-vacancy-type">Vacancy Type</Label>
                <Select value={editingJob.vacancy_type || 'current'} onValueChange={(value) => setEditingJob({ ...editingJob, vacancy_type: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="current">Current Vacancy</SelectItem>
                    <SelectItem value="future">Future Position</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-work-arrangement">Work Arrangement</Label>
                <Select value={editingJob.work_arrangement || ''} onValueChange={(value) => setEditingJob({ ...editingJob, work_arrangement: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="onsite">On Site</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Salary Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Salary Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label htmlFor="edit-salary-min">Minimum Salary</Label>
                <Input
                  id="edit-salary-min"
                  type="number"
                  value={editingJob.salary_min || ''}
                  onChange={(e) => handleSalaryMinChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-salary-max">Maximum Salary</Label>
                <Input
                  id="edit-salary-max"
                  type="number"
                  value={editingJob.salary_max || ''}
                  onChange={(e) => handleSalaryMaxChange(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={editingJob.currency || ''} onValueChange={(value) => setEditingJob({ ...editingJob, currency: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              The salary range cannot exceed {MAX_SALARY_SPREAD.toLocaleString()}.
            </p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-experience-level">Experience Level</Label>
                <Select value={editingJob.experience_level || ''} onValueChange={(value) => setEditingJob({ ...editingJob, experience_level: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="L1">Entry Level (0-2 years)</SelectItem>
                    <SelectItem value="L2">Junior (2-4 years)</SelectItem>
                    <SelectItem value="L3">Mid-Level (4-6 years)</SelectItem>
                    <SelectItem value="L4">Senior (6-10 years)</SelectItem>
                    <SelectItem value="L5">Expert (10+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-education-level">Education Level</Label>
                <Select value={editingJob.education_level || ''} onValueChange={(value) => setEditingJob({ ...editingJob, education_level: value })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="high_school">High School</SelectItem>
                    <SelectItem value="associate">Associate Degree</SelectItem>
                    <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="master">Master's Degree</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Job Description</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-summary">Summary</Label>
                <Textarea
                  id="edit-summary"
                  value={editingJob.summary || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, summary: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Full Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingJob.description || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit-requirements">Requirements (one per line)</Label>
                <Textarea
                  id="edit-requirements"
                  value={editingJob.requirements?.join('\n') || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, requirements: e.target.value.split('\n').filter(Boolean) })}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit-responsibilities">Responsibilities (one per line)</Label>
                <Textarea
                  id="edit-responsibilities"
                  value={editingJob.responsibilities?.join('\n') || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, responsibilities: e.target.value.split('\n').filter(Boolean) })}
                  rows={6}
                />
              </div>
              <div>
                <Label htmlFor="edit-nice-to-have">Nice to Have (one per line)</Label>
                <Textarea
                  id="edit-nice-to-have"
                  value={editingJob.nice_to_have?.join('\n') || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, nice_to_have: e.target.value.split('\n').filter(Boolean) })}
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="edit-benefits">Benefits</Label>
                <Textarea
                  id="edit-benefits"
                  value={editingJob.benefits || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, benefits: e.target.value })}
                  rows={4}
                />
              </div>
            </div>
          </div>

          {/* Video Prompts */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Video Prompts</h3>
            <Card className="p-6">
              {promptsLocked && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <Lock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-900">Prompts are locked</p>
                    <p className="text-sm text-amber-700">
                      This job has already received applications, so the prompts cannot be edited.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {prompts.map((prompt, index) => (
                  <div key={prompt.id ?? index} className="flex items-start gap-3">
                    <div className="flex-1">
                      <Label htmlFor={`edit-prompt-${index}`} className="text-sm font-medium text-gray-700">
                        Prompt {index + 1}
                      </Label>
                      <Textarea
                        id={`edit-prompt-${index}`}
                        value={prompt.question_text || prompt.questionText || ''}
                        onChange={(e) => handlePromptChange(index, e.target.value)}
                        disabled={promptsLocked}
                        rows={2}
                        className="mt-1"
                      />
                    </div>
                    {!promptsLocked && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-6 text-red-600 hover:bg-red-50"
                        onClick={() => handleRemovePrompt(index)}
                        disabled={prompts.length === 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {!promptsLocked && (
                <div className="mt-4 flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddPrompt}
                    disabled={prompts.length >= 5}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add prompt
                  </Button>
                  <span className="text-sm text-gray-500">
                    {prompts.length} of 5 prompts
                  </span>
                </div>
              )}

              {prompts.length === 0 && !promptsLocked && (
                <p className="text-sm text-gray-500 mt-4">
                  No video prompts configured. Candidates will not be required to record video responses.
                </p>
              )}
            </Card>
          </div>

          {/* Status and Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status & Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingJob.status || ''}
                  onValueChange={(value) => setEditingJob({ ...editingJob, status: value })}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-is-urgent">Urgent Position</Label>
                <Select value={editingJob.is_urgent ? 'true' : 'false'} onValueChange={(value) => setEditingJob({ ...editingJob, is_urgent: value === 'true' })}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg">
                    <SelectItem value="true">Yes</SelectItem>
                    <SelectItem value="false">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-hiring-manager">Hiring Manager</Label>
                <Input
                  id="edit-hiring-manager"
                  value={editingJob.hiring_manager || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, hiring_manager: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-internal-job-code">Internal Job Code</Label>
                <Input
                  id="edit-internal-job-code"
                  value={editingJob.internal_job_code || ''}
                  onChange={(e) => setEditingJob({ ...editingJob, internal_job_code: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="edit-recruiter-notes">Recruiter Notes (Internal)</Label>
              <Textarea
                id="edit-recruiter-notes"
                value={editingJob.recruiter_notes || ''}
                onChange={(e) => setEditingJob({ ...editingJob, recruiter_notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          {/* Read-only Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Information (Read-only)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Views Count</Label>
                <Input value={editingJob.views_count || 0} disabled />
              </div>
              <div>
                <Label>Applications Count</Label>
                <Input value={editingJob.applications_count || 0} disabled />
              </div>
              <div>
                <Label>Created At</Label>
                <Input value={new Date(editingJob.created_at).toLocaleString()} disabled />
              </div>
              <div>
                <Label>Updated At</Label>
                <Input value={new Date(editingJob.updated_at).toLocaleString()} disabled />
              </div>
              <div>
                <Label>Published At</Label>
                <Input value={editingJob.published_at ? new Date(editingJob.published_at).toLocaleString() : 'Not published'} disabled />
              </div>
              <div>
                <Label>Predicted Industry</Label>
                <Input value={editingJob.predicted_industry || 'N/A'} disabled />
              </div>
              <div>
                <Label>Predicted Level</Label>
                <Input value={editingJob.predicted_level || 'N/A'} disabled />
              </div>
              <div>
                <Label>Prediction Confidence</Label>
                <Input value={editingJob.prediction_confidence || 'N/A'} disabled />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Job Status Update Modal */}
    {showJobStatusUpdate && jobStatusUpdateTarget && (
      <UpdateJobStatusModal
        job={jobStatusUpdateTarget}
        onClose={() => {
          setShowJobStatusUpdate(false);
          setJobStatusUpdateTarget(null);
        }}
        onUpdate={handleJobStatusUpdate}
      />
    )}
  </div>
  );
};

export default EditJobView;
