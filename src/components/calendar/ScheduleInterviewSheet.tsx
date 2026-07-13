import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar, Clock, User, VideoIcon, FileText, MapPin, X, CheckCircle, Maximize2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createInterview, type Interview, type CreateInterviewRequest } from '@/api/interviews';

interface Candidate {
  id: string;
  name: string;
  email?: string;
  position?: string;
}

interface ScheduleInterviewSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  jobId?: string;
  availableJobs?: Array<{ id: string | number; title: string }>;
  onScheduled?: (interviewData: any) => void;
  onExpandToFullscreen?: (formData: any) => void;
}

export const ScheduleInterviewSheet: React.FC<ScheduleInterviewSheetProps> = ({
  open,
  onOpenChange,
  candidate,
  jobId,
  availableJobs,
  onScheduled,
  onExpandToFullscreen
}) => {
  const [interviewData, setInterviewData] = useState({
    type: '',
    stage: '',
    date: '',
    time: '',
    duration: '60',
    interviewer: '',
    location: '',
    meetingLink: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleScheduleInterview = async () => {
    if (!candidate || !interviewData.type || !interviewData.stage || !interviewData.date || !interviewData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);

      const selectedJobId = jobId || (availableJobs && availableJobs.length > 0 ? String(availableJobs[0].id) : undefined);
      if (!selectedJobId) {
        toast.error('No job selected for this interview');
        setIsSubmitting(false);
        return;
      }

      const interviewRequest: CreateInterviewRequest = {
        job: Number.parseInt(selectedJobId, 10),
        candidate_id: Number.parseInt(candidate.id),
        interview_type: interviewData.type as Interview['interview_type'],
        stage: interviewData.stage as Interview['stage'],
        scheduled_date: interviewData.date,
        scheduled_time: interviewData.time,
        duration_minutes: Number.parseInt(interviewData.duration, 10),
        title: `${candidate.position || 'Interview'} - ${candidate.name}`,
        location: interviewData.location,
        meeting_link: interviewData.meetingLink,
        interviewer_name: interviewData.interviewer,
        notes: interviewData.notes,
      };

      const createdInterview = await createInterview(interviewRequest);

      // Reset form
      setInterviewData({
        type: '',
        stage: '',
        date: '',
        time: '',
        duration: '60',
        interviewer: '',
        location: '',
        meetingLink: '',
        notes: ''
      });

      onScheduled?.(createdInterview);
      onOpenChange(false);

      toast.success('Interview scheduled successfully!');
    } catch (error) {
      toast.error('Failed to schedule interview');
      console.error('Error scheduling interview:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Accessibility - Hidden but present for screen readers */}
        <DialogHeader className="sr-only">
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>
            {candidate ? `Schedule an interview with ${candidate.name}` : 'Schedule a new interview with a candidate'}
          </DialogDescription>
        </DialogHeader>

        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white p-6 rounded-t-lg">
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Schedule Interview</h2>
              <p className="text-white/90 text-sm">Set up an interview with your candidate</p>
            </div>
          </div>

          {/* Candidate Info Card */}
          {candidate && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg">{candidate.name}</h3>
                  {candidate.position && (
                    <p className="text-white/80 text-sm">{candidate.position}</p>
                  )}
                  {candidate.email && (
                    <p className="text-white/70 text-sm truncate">{candidate.email}</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-5">
          {/* Interview Type & Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <VideoIcon className="w-4 h-4 text-[#ff6b35]" />
                Interview Type *
              </Label>
              <Select value={interviewData.type} onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="phone">📞 Phone Call</SelectItem>
                  <SelectItem value="video">🎥 Video Call</SelectItem>
                  <SelectItem value="in-person">🏢 In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <CheckCircle className="w-4 h-4 text-[#ff6b35]" />
                Interview Stage *
              </Label>
              <Select value={interviewData.stage} onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, stage: value }))}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]">
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="initial-screening">Initial Screening</SelectItem>
                  <SelectItem value="technical">Technical Interview</SelectItem>
                  <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                  <SelectItem value="panel">Panel Interview</SelectItem>
                  <SelectItem value="final">Final Interview</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date, Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-4 h-4 text-[#ff6b35]" />
                Date *
              </Label>
              <Input
                type="date"
                value={interviewData.date}
                onChange={(e) => setInterviewData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Clock className="w-4 h-4 text-[#ff6b35]" />
                Time *
              </Label>
              <Input
                type="time"
                value={interviewData.time}
                onChange={(e) => setInterviewData(prev => ({ ...prev, time: e.target.value }))}
                className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Duration</Label>
              <Select value={interviewData.duration} onValueChange={(value: any) => setInterviewData(prev => ({ ...prev, duration: value }))}>
                <SelectTrigger className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[100]">
                  <SelectItem value="30">30 min</SelectItem>
                  <SelectItem value="45">45 min</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Interviewer */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <User className="w-4 h-4 text-[#ff6b35]" />
              Interviewer Name
            </Label>
            <Input
              placeholder="e.g., John Smith"
              value={interviewData.interviewer}
              onChange={(e) => setInterviewData(prev => ({ ...prev, interviewer: e.target.value }))}
              className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
            />
          </div>

          {/* Location & Meeting Link */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <MapPin className="w-4 h-4 text-[#ff6b35]" />
                Location <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                placeholder="Office address or location"
                value={interviewData.location}
                onChange={(e) => setInterviewData(prev => ({ ...prev, location: e.target.value }))}
                className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <VideoIcon className="w-4 h-4 text-[#ff6b35]" />
                Meeting Link <span className="text-gray-400 text-sm">(Optional)</span>
              </Label>
              <Input
                placeholder="Zoom, Teams, or Google Meet link"
                value={interviewData.meetingLink}
                onChange={(e) => setInterviewData(prev => ({ ...prev, meetingLink: e.target.value }))}
                className="h-11 border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35]"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-gray-700">
              <FileText className="w-4 h-4 text-[#ff6b35]" />
              Interview Notes <span className="text-gray-400 text-sm">(Optional)</span>
            </Label>
            <Textarea
              placeholder="Add any special instructions, topics to cover, or preparation notes..."
              value={interviewData.notes}
              onChange={(e) => setInterviewData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              className="border-gray-300 focus:border-[#ff6b35] focus:ring-[#ff6b35] resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-lg flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 h-12 border-2"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (!candidate) return;
              onExpandToFullscreen?.({
                candidateId: candidate.id,
                candidateName: candidate.name,
                candidateEmail: candidate.email,
                position: candidate.position,
                ...interviewData
              });
              onOpenChange(false);
            }}
            variant="outline"
            className="h-12 px-4 border-2 border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
          >
            <Maximize2 className="w-5 h-5 mr-2" />
            Fullscreen
          </Button>
          <Button
            onClick={handleScheduleInterview}
            disabled={!interviewData.type || !interviewData.stage || !interviewData.date || !interviewData.time || isSubmitting}
            className="flex-1 h-12 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Calendar className="w-5 h-5 mr-2" />
            )}
            {isSubmitting ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};