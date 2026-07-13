import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../ui/button';
import { AppHeader } from '../layout/AppHeader';
import {
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { CalendarViews } from './InterviewCalendarViews';
import { InterviewScheduleForm } from './InterviewSchedule';
import { toast } from 'sonner';
import {
  getInterviews,
  createInterview,
  updateInterview,
  cancelInterview,
  type Interview,
  type CreateInterviewRequest,
  type UpdateInterviewRequest
} from '@/api/interviews';
import { jobPostsApi, type JobPost } from '@/api/jobPosts';
import { recruiterCandidatesApi, type Candidate } from '@/api/recruiterCandidates';


interface InterviewCalendarProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
  prefilledData?: {
    candidateId?: string;
    candidateName?: string;
    candidateEmail?: string;
    position?: string;
    type?: string;
    stage?: string;
    date?: string;
    time?: string;
    duration?: string;
    interviewer?: string;
    location?: string;
    meetingLink?: string;
    notes?: string;
  };
}

const DEFAULT_FORM_DATA = {
  candidateName: '',
  candidateEmail: '',
  candidateId: '',
  jobId: '',
  position: '',
  type: '',
  stage: '',
  date: '',
  time: '',
  duration: '60',
  interviewer: '',
  location: '',
  meetingLink: '',
  notes: ''
};

export function InterviewCalendar({ 
  onNavigate,
  onLogout,
  user,
  prefilledData
}: Readonly<InterviewCalendarProps>) {
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ date: Date; hour: number } | null>(null);
  const [showScheduleForm, setShowScheduleForm] = useState(!!prefilledData);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form state - initialize with prefilled data
  const [formData, setFormData] = useState({
    ...DEFAULT_FORM_DATA,
    candidateName: prefilledData?.candidateName || '',
    candidateEmail: prefilledData?.candidateEmail || '',
    candidateId: prefilledData?.candidateId || '',
    position: prefilledData?.position || '',
    type: prefilledData?.type || '',
    stage: prefilledData?.stage || '',
    date: prefilledData?.date || '',
    time: prefilledData?.time || '',
    duration: prefilledData?.duration || '60',
    interviewer: prefilledData?.interviewer || '',
    location: prefilledData?.location || '',
    meetingLink: prefilledData?.meetingLink || '',
    notes: prefilledData?.notes || ''
  });

  // Update form when prefilled data changes
  useEffect(() => {
    if (prefilledData) {
      setFormData(prev => ({
        ...prev,
        candidateName: prefilledData.candidateName || prev.candidateName,
        candidateEmail: prefilledData.candidateEmail || prev.candidateEmail,
        candidateId: prefilledData.candidateId || prev.candidateId,
        position: prefilledData.position || prev.position,
        type: prefilledData.type || prev.type,
        stage: prefilledData.stage || prev.stage,
        date: prefilledData.date || prev.date,
        time: prefilledData.time || prev.time,
        duration: prefilledData.duration || prev.duration || '60',
        interviewer: prefilledData.interviewer || prev.interviewer,
        location: prefilledData.location || prev.location,
        meetingLink: prefilledData.meetingLink || prev.meetingLink,
        notes: prefilledData.notes || prev.notes
      }));
      setShowScheduleForm(true);
    }
  }, [prefilledData]);

  // Fetch jobs and candidates when schedule form opens
  useEffect(() => {
    if (showScheduleForm) {
      fetchJobsAndCandidates();
    }
  }, [showScheduleForm]);

  const fetchJobsAndCandidates = async () => {
    try {
      setIsLoadingJobs(true);
      setIsLoadingCandidates(true);

      // Fetch jobs
      const jobsResponse = await jobPostsApi.getJobPosts();
      if (jobsResponse.success) {
        setJobs(jobsResponse.data);
      }

      // Fetch candidates
      const candidatesResponse = await recruiterCandidatesApi.fetchAllCandidates();
      setCandidates(candidatesResponse.candidates);
    } catch (error) {
      console.error('Error fetching jobs/candidates:', error);
      toast.error('Failed to load jobs and candidates');
    } finally {
      setIsLoadingJobs(false);
      setIsLoadingCandidates(false);
    }
  };

  // Real interview data from API
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Jobs and candidates for selectors
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const publishedJobs = useMemo(() => jobs.filter(j => j.status === 'published'), [jobs]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay());
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Fetch interviews from API
  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getInterviews();
      setInterviews(data);
    } catch (error) {
      toast.error('Failed to fetch interviews');
      console.error('Error fetching interviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getInterviewsForDate = (date: Date) => {
    return interviews.filter((interview) => {
      const interviewDate = parseLocalDate(interview.scheduled_date);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const getInterviewsForHour = (date: Date, hour: number) => {
    return interviews.filter((interview) => {
      const interviewDate = parseLocalDate(interview.scheduled_date);
      const interviewTime = interview.scheduled_time.split(':');
      const interviewHour = Number.parseInt(interviewTime[0], 10);
      return (
        interviewDate.toDateString() === date.toDateString() &&
        interviewHour === hour
      );
    });
  };

  const shiftPeriod = (direction: 'prev' | 'next') => {
    const delta = direction === 'prev' ? -1 : 1;
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(newDate.getDate() + delta);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + delta * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + delta);
    }
    setCurrentDate(newDate);
  };

  const handleMouseDown = (date: Date, hour: number) => {
    setIsDragging(true);
    setDragStart({ date, hour });
  };

  const handleMouseUp = (date: Date, hour: number) => {
    if (isDragging && dragStart) {
      const startTime = `${dragStart.hour.toString().padStart(2, '0')}:00`;
      const endHour = Math.max(dragStart.hour, hour) + 1;
      const duration = (endHour - Math.min(dragStart.hour, hour)) * 60;

      setFormData(prev => ({
        ...prev,
        date: date.toISOString().split('T')[0],
        time: startTime,
        duration: duration.toString()
      }));
      setIsEditing(false);
      setSelectedInterview(null);
      setShowScheduleForm(true);
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const handleSchedule = async () => {
    if (!formData.candidateName || !formData.type || !formData.stage || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.jobId) {
      toast.error('Please select a job');
      return;
    }

    if (!formData.candidateId) {
      toast.error('Please select a candidate');
      return;
    }

    try {
      const interviewData: CreateInterviewRequest = {
        job: Number.parseInt(formData.jobId, 10),
        candidate_id: Number.parseInt(formData.candidateId, 10),
        interview_type: formData.type as Interview['interview_type'],
        stage: formData.stage as Interview['stage'],
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        duration_minutes: Number.parseInt(formData.duration, 10),
        title: `${formData.position} - ${formData.candidateName}`,
        location: formData.location,
        meeting_link: formData.meetingLink,
        interviewer_name: formData.interviewer,
        notes: formData.notes,
      };

      await createInterview(interviewData);
      toast.success('Interview scheduled successfully!');
      setShowScheduleForm(false);
      setFormData(DEFAULT_FORM_DATA);
      fetchInterviews(); // Refresh the list
    } catch (error) {
      toast.error('Failed to schedule interview');
      console.error('Error scheduling interview:', error);
    }
  };

  const openEditForm = (interview: Interview) => {
    setSelectedInterview(interview);
    setIsEditing(true);
    const normalizedStage = interview.stage === 'phone-screening' ? 'initial-screening' : interview.stage;
    setFormData({
      candidateName: interview.candidate_name || '',
      candidateEmail: interview.candidate?.email || '',
      candidateId: String(interview.candidate_id),
      jobId: String(interview.job),
      position: interview.job_title || '',
      type: interview.interview_type,
      stage: normalizedStage,
      date: interview.scheduled_date,
      time: interview.scheduled_time,
      duration: String(interview.duration_minutes),
      interviewer: interview.interviewer_name || '',
      location: interview.location || '',
      meetingLink: interview.meeting_link || '',
      notes: interview.notes || ''
    });
    setShowScheduleForm(true);
  };

  const handleUpdateInterview = async () => {
    if (!selectedInterview || isUpdating) return;

    if (!formData.type || !formData.stage || !formData.date || !formData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const updateData: UpdateInterviewRequest = {
        title: `${formData.position} - ${formData.candidateName}`,
        interview_type: formData.type as Interview['interview_type'],
        stage: formData.stage as Interview['stage'],
        scheduled_date: formData.date,
        scheduled_time: formData.time,
        duration_minutes: Number.parseInt(formData.duration, 10),
        location: formData.location || undefined,
        meeting_link: formData.meetingLink || undefined,
        interviewer_name: formData.interviewer || undefined,
        notes: formData.notes || undefined,
      };

      await updateInterview(selectedInterview.id, updateData);
      toast.success('Interview updated successfully!');
      setShowScheduleForm(false);
      setIsEditing(false);
      setSelectedInterview(null);
      setFormData(DEFAULT_FORM_DATA);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to update interview');
      console.error('Error updating interview:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelInterview = async () => {
    if (!selectedInterview) return;

    try {
      setIsDeleting(true);
      await cancelInterview(selectedInterview.id);
      toast.success('Interview cancelled successfully');
      setShowScheduleForm(false);
      setIsEditing(false);
      setSelectedInterview(null);
      setFormData(DEFAULT_FORM_DATA);
      fetchInterviews();
    } catch (error) {
      toast.error('Failed to cancel interview');
      console.error('Error cancelling interview:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      {/* Header */}
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="interview-calendar"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Page Title & Controls Section */}
      <div className="pt-20 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white pb-8 shadow-lg">
        <div className="max-w-[1800px] mx-auto px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Interview Calendar</h1>
              <p className="text-white/90">Manage and schedule interviews</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => shiftPeriod('prev')}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => shiftPeriod('next')}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <h2 className="text-xl font-medium min-w-[200px]">
                {currentDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric'
                })}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg p-1.5 backdrop-blur-sm">
                <Button
                  variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('day')}
                  className={`h-9 px-4 ${viewMode === 'day' ? 'bg-white text-[#ff6b35]' : 'text-white hover:bg-white/20'}`}
                >
                  Day
                </Button>
                <Button
                  variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={`h-9 px-4 ${viewMode === 'week' ? 'bg-white text-[#ff6b35]' : 'text-white hover:bg-white/20'}`}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={`h-9 px-4 ${viewMode === 'month' ? 'bg-white text-[#ff6b35]' : 'text-white hover:bg-white/20'}`}
                >
                  Month
                </Button>
              </div>

              {!showScheduleForm && (
                <Button
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setSelectedInterview(null);
                    setFormData(DEFAULT_FORM_DATA);
                    setShowScheduleForm(true);
                  }}
                  className="bg-white text-[#ff6b35] hover:bg-white/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Interview
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex max-w-[1800px] mx-auto">
        {/* Calendar View */}
        <div className={`${showScheduleForm ? 'w-2/3' : 'w-full'} p-8`}>
          {/* Week View */}
          <CalendarViews
            viewMode={viewMode}
            currentDate={currentDate}
            isLoading={isLoading}
            hours={hours}
            getWeekDays={getWeekDays}
            getMonthDays={getMonthDays}
            getInterviewsForDate={getInterviewsForDate}
            getInterviewsForHour={getInterviewsForHour}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onEdit={openEditForm}
            onDayClick={(day) => { setCurrentDate(day); setViewMode('day'); }}
          />
        </div>

        {showScheduleForm && (
          <InterviewScheduleForm
            formData={formData}
            setFormData={setFormData}
            candidates={candidates}
            isLoadingCandidates={isLoadingCandidates}
            publishedJobs={publishedJobs}
            isLoadingJobs={isLoadingJobs}
            isEditing={isEditing}
            isUpdating={isUpdating}
            isDeleting={isDeleting}
            interviews={interviews}
            onClose={() => {
              setShowScheduleForm(false);
              setIsEditing(false);
              setSelectedInterview(null);
            }}
            onSchedule={handleSchedule}
            onUpdate={handleUpdateInterview}
            onCancel={handleCancelInterview}
          />
        )}
      </div>
    </div>
  );
}