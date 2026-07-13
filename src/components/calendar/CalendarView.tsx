import { useState, useEffect } from 'react';
import { JobApplication } from '@/types/job';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Calendar, Clock, Video, Phone, MapPin, ChevronLeft, ChevronRight, Loader2, User, FileText, ExternalLink } from 'lucide-react';
import { getMyInterviews, type Interview } from '@/api/interviews';
import { toast } from 'sonner';
import { safeOpenWindow } from '@/utils/safe-url';

interface CalendarViewProps {
  jobs: JobApplication[];
  onEditJob?: (job: JobApplication) => void;
}

const getEventIcon = (type: Interview['interview_type']) => {
  switch (type) {
    case 'phone': return <Phone className="w-4 h-4" />;
    case 'video': return <Video className="w-4 h-4" />;
    case 'in-person': return <MapPin className="w-4 h-4" />;
    default: return <Video className="w-4 h-4" />;
  }
};

const getEventColor = (type: Interview['interview_type']) => {
  switch (type) {
    case 'phone': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'video': return 'bg-green-100 text-green-800 border-green-200';
    case 'in-person': return 'bg-purple-100 text-purple-800 border-purple-200';
    default: return 'bg-green-100 text-green-800 border-green-200';
  }
};

const formatTimeDisplay = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

interface UpcomingInterviewsListProps {
  isLoading: boolean;
  interviews: Interview[];
}

function UpcomingInterviewsList({ isLoading, interviews }: Readonly<UpcomingInterviewsListProps>) {
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No interviews scheduled.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Interviews will appear here when scheduled.
        </p>
      </Card>
    );
  }

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  return (
    <>
      <div className="space-y-3">
        {interviews.slice(0, 5).map((event) => (
          <Card key={event.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getEventColor(event.interview_type)}`}>
                  {getEventIcon(event.interview_type)}
                </div>
                <div>
                  <div className="font-medium">{event.job_title} - {event.candidate_name}</div>
                  <div className="text-sm text-muted-foreground">{event.stage_display}</div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{(() => { const [y, m, d] = event.scheduled_date.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString(); })()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeDisplay(event.scheduled_time)} ({event.formatted_duration})</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {event.meeting_link && (
                  <Button variant="outline" size="sm" onClick={() => safeOpenWindow(event.meeting_link, '_blank')}>
                    Join
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setSelectedInterview(event)}>
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedInterview} onOpenChange={(open) => !open && setSelectedInterview(null)}>
        {selectedInterview && (
          <DialogContent className="sm:max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedInterview.job_title}</DialogTitle>
              <DialogDescription>
                {selectedInterview.stage_display} — {selectedInterview.interview_type_display}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{selectedInterview.candidate_name}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{parseLocalDate(selectedInterview.scheduled_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{formatTimeDisplay(selectedInterview.scheduled_time)} ({selectedInterview.formatted_duration})</span>
              </div>
              {selectedInterview.interviewer_name && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Interviewer: {selectedInterview.interviewer_name}</span>
                </div>
              )}
              {selectedInterview.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedInterview.location}</span>
                </div>
              )}
              {selectedInterview.meeting_link && (
                <div className="flex items-center gap-3">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <a
                    href={selectedInterview.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
              {selectedInterview.notes && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm whitespace-pre-wrap">{selectedInterview.notes}</span>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}

export function CalendarView({ jobs }: Readonly<CalendarViewProps>) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setIsLoading(true);
        const data = await getMyInterviews();
        setInterviews(data);
      } catch (error) {
        toast.error('Failed to fetch interviews');
        console.error('Error fetching interviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const getEventsForDate = (date: Date) => {
    return interviews.filter(interview => {
      const interviewDate = parseLocalDate(interview.scheduled_date);
      return interviewDate.toDateString() === date.toDateString();
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };


  const weekDays = getWeekDays();
  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Interview Schedule</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="font-medium min-w-[140px] text-center">
              {getMonthName(currentDate)}
            </span>
            <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-blue-600" />
          <span>Phone Interview</span>
        </div>
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-green-600" />
          <span>Video Interview</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-600" />
          <span>Onsite Interview</span>
        </div>
      </div>

      {/* Week View */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const eventsForDay = getEventsForDate(day);
            const isToday = day.toDateString() === today.toDateString();
            const isPast = day < today && !isToday;

            return (
              <Card key={day.toISOString()} className={`p-3 min-h-[200px] ${isToday ? 'border-blue-500 bg-blue-50' : ''} ${isPast ? 'opacity-60' : ''}`}>
                <div className="space-y-2">
                  <div className={`text-center ${isToday ? 'font-medium text-blue-700' : ''}`}>
                    <div className="text-xs text-muted-foreground">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg ${isToday ? 'bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    {eventsForDay.map((event) => (
                      <div
                        key={event.id}
                        className={`p-2 rounded-lg border text-xs cursor-pointer hover:shadow-sm transition-shadow ${getEventColor(event.interview_type)}`}
                      >
                        <div className="flex items-center gap-1 mb-1">
                          {getEventIcon(event.interview_type)}
                          <span className="font-medium">{formatTimeDisplay(event.scheduled_time)}</span>
                        </div>
                        <div className="font-medium truncate">{event.job_title}</div>
                        <div className="text-xs opacity-80 truncate">{event.candidate_name}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.formatted_duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* All Interviews List */}
      <div className="space-y-4">
        <h4 className="font-medium">All Interviews</h4>

        <UpcomingInterviewsList isLoading={isLoading} interviews={interviews} />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-medium">{interviews.length}</div>
          <div className="text-sm text-muted-foreground">Total Interviews</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-medium">
            {interviews.filter(i => {
              const interviewDate = parseLocalDate(i.scheduled_date);
              return interviewDate >= today;
            }).length}
          </div>
          <div className="text-sm text-muted-foreground">Upcoming</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-medium">
            {jobs.filter(job => job.status === 'interviews').length}
          </div>
          <div className="text-sm text-muted-foreground">Jobs in Interview</div>
        </Card>
      </div>
    </div>
  );
}