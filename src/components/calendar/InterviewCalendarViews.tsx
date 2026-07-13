import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Loader2 } from 'lucide-react';
import { type Interview } from '@/api/interviews';

function formatTime(timeStr: string) {
  const [hours, minutes] = timeStr.split(':');
  const hour = Number.parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'rescheduled':
      return 'bg-orange-100 text-orange-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

interface InterviewCardProps {
  interview: Interview;
  onEdit: (interview: Interview) => void;
}

function WeekInterviewCard({ interview, onEdit }: Readonly<InterviewCardProps>) {
  return (
    <button
      type="button"
      className="mb-2 p-3 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg text-xs shadow-md hover:shadow-lg transition-all cursor-pointer text-left w-full"
      onClick={(e) => { e.stopPropagation(); onEdit(interview); }}
    >
      <div className="font-medium truncate mb-1">{interview.candidate_name}</div>
      <div className="flex items-center gap-1.5 opacity-90">
        <span>{formatTime(interview.scheduled_time)}</span>
      </div>
    </button>
  );
}

function DayInterviewCard({ interview, onEdit }: Readonly<InterviewCardProps>) {
  return (
    <button
      type="button"
      className="mb-3 p-4 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white rounded-lg border-0 shadow-lg hover:shadow-xl transition-all cursor-pointer text-left w-full block"
      onClick={(e) => { e.stopPropagation(); onEdit(interview); }}
    >
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12">
          <AvatarFallback className="bg-white text-[#ff6b35] font-semibold">
            {interview.candidate_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-semibold text-lg mb-1">{interview.candidate_name}</div>
          <div className="text-sm opacity-90 mb-3">{interview.job_title}</div>
          <div className="flex items-center gap-3 text-sm">
            <span>{formatTime(interview.scheduled_time)}</span>
            <span>&bull;</span>
            <span>{interview.duration_minutes}m</span>
          </div>
        </div>
        <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
      </div>
    </button>
  );
}

function MonthInterviewPill({ interview, onEdit }: Readonly<InterviewCardProps>) {
  return (
    <button
      type="button"
      className="text-xs p-2 bg-[#ff6b35] text-white rounded truncate shadow-sm cursor-pointer hover:bg-[#e55a2b] text-left w-full block"
      onClick={(e) => { e.stopPropagation(); onEdit(interview); }}
    >
      {formatTime(interview.scheduled_time)} - {interview.candidate_name}
    </button>
  );
}

interface CalendarViewsProps {
  viewMode: 'day' | 'week' | 'month';
  currentDate: Date;
  isLoading: boolean;
  hours: number[];
  getWeekDays: () => Date[];
  getMonthDays: () => (Date | null)[];
  getInterviewsForDate: (date: Date) => Interview[];
  getInterviewsForHour: (date: Date, hour: number) => Interview[];
  onMouseDown: (date: Date, hour: number) => void;
  onMouseUp: (date: Date, hour: number) => void;
  onEdit: (interview: Interview) => void;
  onDayClick: (day: Date) => void;
}

export function CalendarViews({
  viewMode,
  currentDate,
  isLoading,
  hours,
  getWeekDays,
  getMonthDays,
  getInterviewsForDate,
  getInterviewsForHour,
  onMouseDown,
  onMouseUp,
  onEdit,
  onDayClick,
}: Readonly<CalendarViewsProps>) {
  if (viewMode === 'week') {
    return (
      <Card className="bg-white shadow-xl border-0">
        <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div className="p-4 text-center text-sm font-medium text-gray-500">Time</div>
          {getWeekDays().map((day) => {
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div
                key={day.toISOString()}
                className={`p-4 text-center border-l border-gray-200 ${isToday ? 'bg-[#ff6b35] text-white' : 'bg-gray-50'}`}
              >
                <div className="text-xs font-medium mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-xl font-semibold">{day.getDate()}</div>
              </div>
            );
          })}
        </div>
        <div className="divide-y divide-gray-200">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8">
              <div className="p-4 text-center text-sm text-gray-500 border-r border-gray-200">
                {hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}
              </div>
              {getWeekDays().map((day) => {
                const dayInterviews = getInterviewsForHour(day, hour);
                return (
                  <div key={day.toISOString()} className="border-l border-gray-200 min-h-[100px] relative">
                    <button
                      type="button"
                      aria-label={`Schedule interview for ${day.toLocaleDateString()}`}
                      className="absolute inset-0 w-full h-full hover:bg-blue-50 transition-colors z-0"
                      onMouseDown={() => onMouseDown(day, hour)}
                      onMouseUp={() => onMouseUp(day, hour)}
                    />
                    <div className="relative z-10 p-3">
                      {isLoading ? (
                        <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin" /></div>
                      ) : (
                        dayInterviews.map((interview) => (
                          <WeekInterviewCard key={interview.id} interview={interview} onEdit={onEdit} />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (viewMode === 'day') {
    return (
      <Card className="bg-white shadow-xl border-0">
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="text-xl font-semibold">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>
        <div className="divide-y divide-gray-200">
          {hours.map((hour) => {
            const hourInterviews = getInterviewsForHour(currentDate, hour);
            return (
              <div key={hour} className="grid grid-cols-12 relative">
                <button
                  type="button"
                  aria-label={`Schedule interview at ${hour % 12 || 12} ${hour < 12 ? 'AM' : 'PM'}`}
                  className="absolute inset-0 w-full h-full hover:bg-blue-50 transition-colors z-0"
                  onMouseDown={() => onMouseDown(currentDate, hour)}
                  onMouseUp={() => onMouseUp(currentDate, hour)}
                />
                <div className="col-span-2 p-6 text-sm text-gray-500 border-r border-gray-200 font-medium relative z-10">
                  {hour % 12 || 12} {hour < 12 ? 'AM' : 'PM'}
                </div>
                <div className="col-span-10 p-6 min-h-[120px] relative z-10">
                  {isLoading ? (
                    <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>
                  ) : (
                    hourInterviews.map((interview) => (
                      <DayInterviewCard key={interview.id} interview={interview} onEdit={onEdit} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  }

  // month view
  return (
    <Card className="bg-white shadow-xl border-0">
      <div className="grid grid-cols-7 border-b border-gray-200">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {(() => {
          let emptyCount = 0;
          return getMonthDays().map((day) => {
            if (!day) {
              emptyCount += 1;
              return <div key={`empty-${emptyCount}`} className="p-4 border border-gray-200 bg-gray-50/50 min-h-[140px]" />;
            }
            const dayInterviews = getInterviewsForDate(day);
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <div key={day.toISOString()} className="border border-gray-200 min-h-[140px] relative">
                <button
                  type="button"
                  aria-label={`View interviews for ${day.toLocaleDateString()}`}
                  className="absolute inset-0 w-full h-full hover:bg-blue-50 transition-colors z-0"
                  onClick={() => onDayClick(day)}
                />
                <div className="relative z-10 p-4">
                  <div className={`text-sm font-medium mb-3 ${isToday ? 'w-9 h-9 flex items-center justify-center rounded-full bg-[#ff6b35] text-white' : 'text-gray-700'}`}>
                    {day.getDate()}
                  </div>
                  <div className="space-y-1.5">
                    {dayInterviews.slice(0, 3).map((interview) => (
                      <MonthInterviewPill key={interview.id} interview={interview} onEdit={onEdit} />
                    ))}
                    {dayInterviews.length > 3 && (
                      <div className="text-xs text-gray-500 font-medium">+{dayInterviews.length - 3} more</div>
                    )}
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>
    </Card>
  );
}
