import { useState, useEffect, useCallback } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Video,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react';
import { getInterviews, type Interview } from '@/api/interviews';
import { toast } from 'sonner';


interface MiniCalendarWidgetProps {
  onScheduleInterview?: () => void;
}

interface CalendarGridProps {
  days: (Date | null)[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getInterviewsForDate: (date: Date) => Interview[];
}

function CalendarGrid({ days, selectedDate, onSelectDate, getInterviewsForDate }: Readonly<CalendarGridProps>) {
  let emptyCount = 0;
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day) => {
        if (!day) {
          emptyCount += 1;
          return <div key={`empty-${emptyCount}`} className="p-2" />;
        }

        const dayInterviews = getInterviewsForDate(day);
        const isToday = day.toDateString() === new Date().toDateString();
        const isSelected = day.toDateString() === selectedDate.toDateString();

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={`
              relative p-2 text-sm rounded-lg transition-all
              ${isToday ? 'bg-[#ff6b35] text-white font-semibold' : ''}
              ${isSelected && !isToday ? 'bg-orange-100 text-[#ff6b35] font-medium' : ''}
              ${!isToday && !isSelected ? 'hover:bg-gray-100 text-gray-700' : ''}
            `}
          >
            <div className="flex flex-col items-center">
              <span>{day.getDate()}</span>
              {dayInterviews.length > 0 && (
                <div className="flex gap-0.5 mt-1">
                  {dayInterviews[0] && (
                    <div key="dot-1" className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#ff6b35]'}`} />
                  )}
                  {dayInterviews[1] && (
                    <div key="dot-2" className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#ff6b35]'}`} />
                  )}
                  {dayInterviews[2] && (
                    <div key="dot-3" className={`w-1 h-1 rounded-full ${isToday ? 'bg-white' : 'bg-[#ff6b35]'}`} />
                  )}
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

const formatTime = (timeStr: string) => {
  const [hours, minutes] = timeStr.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

const getTypeIcon = (type: Interview['interview_type']) => {
  switch (type) {
    case 'video':
      return <Video className="w-3 h-3" />;
    case 'phone':
      return <Phone className="w-3 h-3" />;
    case 'in-person':
      return <MapPin className="w-3 h-3" />;
    default:
      return <CalendarIcon className="w-3 h-3" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rescheduled':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

interface InterviewListProps {
  isLoading: boolean;
  interviews: Interview[];
}

function InterviewList({ isLoading, interviews }: Readonly<InterviewListProps>) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-[#ff6b35]" />
      </div>
    );
  }

  if (interviews.length > 0) {
    return (
      <>
        {interviews.map((interview) => (
          <div
            key={interview.id}
            className="p-3 bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-[#ff6b35] text-white text-xs">
                  {interview.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">
                  {interview.candidate_name}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  {getTypeIcon(interview.interview_type)}
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(interview.scheduled_time)}</span>
                  <span>•</span>
                  <span>{interview.duration_minutes}m</span>
                </div>
              </div>
              <Badge className={`${getStatusColor(interview.status)} text-xs`}>
                {interview.status}
              </Badge>
            </div>
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="text-center py-6 text-gray-500">
      <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
      <p className="text-sm">No interviews scheduled</p>
    </div>
  );
}

export function MiniCalendarWidget({ onScheduleInterview }: Readonly<MiniCalendarWidgetProps>) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getTodaysInterviews = () => {
    return getInterviewsForDate(selectedDate);
  };

  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  const todaysInterviews = getTodaysInterviews();

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg text-gray-900 mb-1">Interview Calendar</h3>
          <p className="text-sm text-gray-600">
            {interviews.length} interviews scheduled
          </p>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={previousMonth}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <h4 className="font-medium text-gray-900">
          {currentDate.toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
          })}
        </h4>
        <Button variant="ghost" size="sm" onClick={nextMonth}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-6">
        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {[
          { id: 'sun', label: 'S' },
          { id: 'mon', label: 'M' },
          { id: 'tue', label: 'T' },
          { id: 'wed', label: 'W' },
          { id: 'thu', label: 'T' },
          { id: 'fri', label: 'F' },
          { id: 'sat', label: 'S' },
        ].map((item) => (
            <div
              key={item.id}
              className="text-center text-xs font-medium text-gray-500 p-1"
            >
              {item.label}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#ff6b35]" />
          </div>
        ) : (
          <CalendarGrid
            days={getMonthDays()}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            getInterviewsForDate={getInterviewsForDate}
          />
        )}
      </div>

      {/* Today's Schedule */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h4 className="font-medium text-gray-900">
            {selectedDate.toDateString() === new Date().toDateString()
              ? "Today's Schedule"
              : selectedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
          </h4>
          {todaysInterviews.length > 0 && (
            <Badge className="bg-[#ff6b35] text-white">
              {todaysInterviews.length}
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <InterviewList isLoading={isLoading} interviews={todaysInterviews} />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200">
        <div className="text-center p-2 bg-green-50 rounded-lg">
          <div className="text-sm font-semibold text-green-700">
            {isLoading ? '-' : interviews.filter((i) => i.status === 'confirmed').length}
          </div>
          <div className="text-xs text-green-600">Confirmed</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded-lg">
          <div className="text-sm font-semibold text-yellow-700">
            {isLoading ? '-' : interviews.filter((i) => i.status === 'pending').length}
          </div>
          <div className="text-xs text-yellow-600">Pending</div>
        </div>
        <div className="text-center p-2 bg-blue-50 rounded-lg">
          <div className="text-sm font-semibold text-blue-700">
            {isLoading ? '-' : interviews.filter((i) => i.interview_type === 'video').length}
          </div>
          <div className="text-xs text-blue-600">Video</div>
        </div>
      </div>

      {/* Schedule Interview Button */}
      {onScheduleInterview && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button 
            onClick={onScheduleInterview}
            className="w-full bg-[#ff6b35] hover:bg-[#e55a2b] text-white"
            size="sm"
          >
            Schedule Interview
          </Button>
        </div>
      )}
    </Card>
  );
}