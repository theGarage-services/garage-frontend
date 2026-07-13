import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  User,
  FileText,
  Save,
  X,
  Briefcase,
  Trash2,
  Pencil,
  Loader2
} from 'lucide-react';
import { type Interview } from '@/api/interviews';
import { type JobPost } from '@/api/jobPosts';
import { type Candidate } from '@/api/recruiterCandidates';

interface FormData {
  candidateName: string;
  candidateEmail: string;
  candidateId: string;
  jobId: string;
  position: string;
  type: string;
  stage: string;
  date: string;
  time: string;
  duration: string;
  interviewer: string;
  location: string;
  meetingLink: string;
  notes: string;
}

interface InterviewScheduleFormProps {
  formData: FormData;
  setFormData: (updater: (prev: FormData) => FormData) => void;
  candidates: Candidate[];
  isLoadingCandidates: boolean;
  publishedJobs: JobPost[];
  isLoadingJobs: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  interviews: Interview[];
  onClose: () => void;
  onSchedule: () => void;
  onUpdate: () => void;
  onCancel: () => void;
}

function buildSuggestions(stage: string, formDate: string, interviews: Interview[]) {
  const suggestions: { icon: React.ComponentType<{ className?: string }>; title: string; description: string; type: string }[] = [];

  suggestions.push({
    icon: Clock,
    title: 'Optimal Time Slots',
    description: 'Schedule between 10 AM - 12 PM or 2 PM - 4 PM for best response rates',
    type: 'time'
  });

  if (stage === 'initial-screening') {
    suggestions.push({
      icon: Clock,
      title: 'Duration Suggestion',
      description: 'Initial screenings typically work best at 30-45 minutes',
      type: 'duration'
    });
  } else if (stage === 'technical' || stage === 'panel') {
    suggestions.push({
      icon: Clock,
      title: 'Duration Suggestion',
      description: 'Technical/Panel interviews typically need 60-90 minutes',
      type: 'duration'
    });
  }

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const busyHours = interviews.filter(i => {
    const interviewDate = parseLocalDate(i.scheduled_date);
    return interviewDate.toDateString() === (formDate ? parseLocalDate(formDate).toDateString() : new Date().toDateString());
  }).length;

  if (busyHours > 3) {
    suggestions.push({
      icon: Clock,
      title: 'Schedule Consideration',
      description: 'This day has multiple interviews scheduled. Consider spreading out interviews.',
      type: 'availability'
    });
  }

  return suggestions;
}

export function InterviewScheduleForm({
  formData,
  setFormData,
  candidates,
  isLoadingCandidates,
  publishedJobs,
  isLoadingJobs,
  isEditing,
  isUpdating,
  isDeleting,
  interviews,
  onClose,
  onSchedule,
  onUpdate,
  onCancel,
}: Readonly<InterviewScheduleFormProps>) {
  const handleCandidateChange = (value: string) => {
    const selectedCandidate = candidates.find(c => c.id === value);
    setFormData(prev => ({
      ...prev,
      candidateId: value,
      candidateName: selectedCandidate?.name || prev.candidateName,
      candidateEmail: selectedCandidate?.email || prev.candidateEmail
    }));
  };

  const handleJobChange = (value: string) => {
    const selectedJob = publishedJobs.find(j => String(j.id) === value);
    setFormData(prev => ({
      ...prev,
      jobId: value,
      position: selectedJob?.title || ''
    }));
  };

  return (
    <div className="w-1/3 border-l border-gray-200 bg-white overflow-y-auto max-h-screen">
      <div className="p-8 sticky top-0 bg-white border-b border-gray-200 z-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-xl font-semibold">
            {isEditing ? 'Edit Interview' : 'Schedule Interview'}
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {formData.date && (
          <div className="space-y-3 mb-6">
            {buildSuggestions(formData.stage, formData.date, interviews).map((suggestion) => {
              const Icon = suggestion.icon;
              return (
                <div key={suggestion.title} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Icon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-blue-900 mb-1">{suggestion.title}</div>
                      <div className="text-xs text-blue-700">{suggestion.description}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-8 space-y-6">
        {/* Candidate Selection */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-[#ff6b35]" /> Candidate *
          </Label>
          <Select value={formData.candidateId} onValueChange={handleCandidateChange} disabled={isEditing || isLoadingCandidates}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={isLoadingCandidates ? 'Loading candidates...' : 'Select a candidate'} />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name} ({candidate.email})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Position */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <Briefcase className="w-4 h-4 text-[#ff6b35]" /> Position *
          </Label>
          <Select value={formData.jobId} onValueChange={handleJobChange} disabled={isEditing || isLoadingJobs}>
            <SelectTrigger className="h-11">
              <SelectValue placeholder={isLoadingJobs ? 'Loading jobs...' : 'Select a position'} />
            </SelectTrigger>
            <SelectContent>
              {publishedJobs.map((job) => (
                <SelectItem key={job.id} value={String(job.id)}>{job.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type & Stage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base">Interview Type *</Label>
            <Select value={formData.type} onValueChange={(value: string) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">📞 Phone</SelectItem>
                <SelectItem value="video">🎥 Video</SelectItem>
                <SelectItem value="in-person">🏢 In-Person</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-base">Stage *</Label>
            <Select value={formData.stage} onValueChange={(value: string) => setFormData(prev => ({ ...prev, stage: value }))}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select stage" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="initial-screening">Initial Screening</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="behavioral">Behavioral</SelectItem>
                <SelectItem value="panel">Panel</SelectItem>
                <SelectItem value="final">Final</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base">
              <CalendarIcon className="w-4 h-4 text-[#ff6b35]" /> Date *
            </Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              min={isEditing ? undefined : new Date().toISOString().split('T')[0]}
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4 text-[#ff6b35]" /> Time *
            </Label>
            <Input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
              className="h-11"
            />
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="text-base">Duration</Label>
          <Select value={formData.duration} onValueChange={(value: string) => setFormData(prev => ({ ...prev, duration: value }))}>
            <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 min</SelectItem>
              <SelectItem value="45">45 min</SelectItem>
              <SelectItem value="60">1 hour</SelectItem>
              <SelectItem value="90">1.5 hours</SelectItem>
              <SelectItem value="120">2 hours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Interviewer */}
        <div className="space-y-2">
          <Label className="text-base">Interviewer Name</Label>
          <Input
            placeholder="e.g., John Smith"
            value={formData.interviewer}
            onChange={(e) => setFormData(prev => ({ ...prev, interviewer: e.target.value }))}
            className="h-11"
          />
        </div>

        {/* Location */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <MapPin className="w-4 h-4 text-[#ff6b35]" /> Location
          </Label>
          <Input
            placeholder="Office address"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="h-11"
          />
        </div>

        {/* Meeting Link */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <Video className="w-4 h-4 text-[#ff6b35]" /> Meeting Link
          </Label>
          <Input
            placeholder="Zoom/Teams/Meet link"
            value={formData.meetingLink}
            onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
            className="h-11"
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-[#ff6b35]" /> Notes
          </Label>
          <Textarea
            placeholder="Add interview notes..."
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Close</Button>
              <Button type="button" variant="destructive" onClick={onCancel} disabled={isDeleting} className="flex-1 h-11">
                {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                {isDeleting ? 'Cancelling...' : 'Cancel Interview'}
              </Button>
              <Button type="button" onClick={onUpdate} disabled={isUpdating || !formData.type || !formData.stage || !formData.date || !formData.time} className="flex-1 h-11 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white">
                {isUpdating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
                {isUpdating ? 'Updating...' : 'Update'}
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-11">Cancel</Button>
              <Button type="button" onClick={onSchedule} disabled={!formData.candidateName || !formData.type || !formData.stage || !formData.date || !formData.time} className="flex-1 h-11 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white">
                <Save className="w-4 h-4 mr-2" /> Schedule
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
