/**
 * Interviews API Service
 * Handles CRUD operations for interview scheduling and management
 */
import apiClient from './client';

// Interview types
export type InterviewType = 'phone' | 'video' | 'in-person';
export type InterviewStage = 'initial-screening' | 'phone-screening' | 'technical' | 'behavioral' | 'panel' | 'final';
export type InterviewStatus = 'scheduled' | 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no-show' | 'rescheduled';
export type AvailabilityType = 'available' | 'busy' | 'preferred';

// Interview interface (backend format)
export interface Interview {
  id: number;
  title: string;
  job: number;
  job_title: string;
  candidate: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  candidate_id: number;
  candidate_name: string;
  recruiter: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  recruiter_id: number;
  recruiter_name: string;
  application: number | null;
  interview_type: InterviewType;
  interview_type_display: string;
  stage: InterviewStage;
  stage_display: string;
  scheduled_date: string;
  scheduled_time: string;
  end_time: string;
  duration_minutes: number;
  formatted_duration: string;
  location: string | null;
  meeting_link: string | null;
  meeting_id: string | null;
  meeting_password: string | null;
  interviewer_name: string | null;
  interviewer_email: string | null;
  additional_interviewers: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  status: InterviewStatus;
  status_display: string;
  notes: string;
  internal_notes: string;
  candidate_notes: string;
  feedback: Record<string, unknown>;
  candidate_rating: number | null;
  candidate_feedback: string;
  calendar_event_id: string | null;
  calendar_provider: string | null;
  reminder_sent: boolean;
  reminder_sent_at: string | null;
  rescheduled_from: number | null;
  reschedule_count: number;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

// Create interview request
export interface CreateInterviewRequest {
  job: number;
  candidate_id: number;
  recruiter_id?: number;
  application?: number;
  title?: string;
  interview_type: InterviewType;
  stage: InterviewStage;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  additional_interviewers?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  notes?: string;
  internal_notes?: string;
  candidate_notes?: string;
}

// Update interview request
export interface UpdateInterviewRequest {
  title?: string;
  interview_type?: InterviewType;
  stage?: InterviewStage;
  scheduled_date?: string;
  scheduled_time?: string;
  duration_minutes?: number;
  location?: string;
  meeting_link?: string;
  meeting_id?: string;
  meeting_password?: string;
  interviewer_name?: string;
  interviewer_email?: string;
  additional_interviewers?: Array<{
    name: string;
    email: string;
    role: string;
  }>;
  status?: InterviewStatus;
  notes?: string;
  internal_notes?: string;
  candidate_notes?: string;
  feedback?: Record<string, unknown>;
  candidate_rating?: number;
  candidate_feedback?: string;
}

// Reschedule interview request
export interface RescheduleInterviewRequest {
  scheduled_date: string;
  scheduled_time: string;
  reschedule_reason?: string;
}

// Feedback interview request
export interface InterviewFeedbackRequest {
  feedback: Record<string, unknown>;
  candidate_rating?: number;
  candidate_feedback?: string;
  internal_notes?: string;
  status: 'completed' | 'no-show' | 'cancelled';
}

// Interview availability
export interface InterviewAvailability {
  id: number;
  user: number;
  date: string;
  start_time: string;
  end_time: string;
  availability_type: AvailabilityType;
  availability_type_display: string;
  job: number | null;
  notes: string;
  created_at: string;
}

// Create availability request
export interface CreateAvailabilityRequest {
  date: string;
  start_time: string;
  end_time: string;
  availability_type: AvailabilityType;
  job?: number;
  notes?: string;
}

// Interview template
export interface InterviewTemplate {
  id: number;
  name: string;
  description: string;
  interview_type: InterviewType;
  interview_type_display: string;
  stage: InterviewStage;
  stage_display: string;
  duration_minutes: number;
  default_location: string;
  default_meeting_link_template: string | null;
  notes_template: string;
  candidate_notes_template: string;
  created_by: number;
  created_by_name: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

// Interview statistics
export interface InterviewStats {
  total_interviews: number;
  upcoming_count: number;
  completed_count: number;
  cancelled_count: number;
  no_show_count: number;
  by_type: Record<InterviewType, number>;
  by_stage: Record<InterviewStage, number>;
  by_status: Record<InterviewStatus, number>;
}

// Calendar data
export interface CalendarDayData {
  date: string;
  interviews: Interview[];
  total_count: number;
  confirmed_count: number;
  pending_count: number;
}

// Bulk schedule request
export interface BulkScheduleRequest {
  job_id: number;
  candidate_ids: number[];
  interview_data: Partial<CreateInterviewRequest>;
}

// Interview filters
export interface InterviewFilters {
  job_id?: number;
  status?: InterviewStatus;
  interview_type?: InterviewType;
  stage?: InterviewStage;
  start_date?: string;
  end_date?: string;
  upcoming?: boolean;
}

const FILTER_PARAMS: Array<{ key: keyof InterviewFilters; paramName: string; transform?: (v: unknown) => string }> = [
  { key: 'job_id', paramName: 'job_id', transform: String },
  { key: 'status', paramName: 'status' },
  { key: 'interview_type', paramName: 'interview_type' },
  { key: 'stage', paramName: 'stage' },
  { key: 'start_date', paramName: 'start_date' },
  { key: 'end_date', paramName: 'end_date' },
  { key: 'upcoming', paramName: 'upcoming', transform: (v) => (v ? 'true' : 'false') },
];

function buildQueryParams(filters?: InterviewFilters): string {
  if (!filters) return '';

  const params = new URLSearchParams();

  for (const { key, paramName, transform } of FILTER_PARAMS) {
    const value = filters[key];
    if (value === undefined) continue;

    const paramValue = transform ? transform(value) : String(value);
    params.append(paramName, paramValue);
  }

  return params.toString() ? `?${params.toString()}` : '';
}

/**
 * Fetch interviews with optional filters
 */
export async function getInterviews(filters?: InterviewFilters): Promise<Interview[]> {
  const queryString = buildQueryParams(filters);
  const response = await apiClient.request(`/interviews/${queryString}`);

  if (!response.ok) {
    throw new Error('Failed to fetch interviews');
  }

  const data = await response.json();
  return data.data || [];
}

/**
 * Fetch a single interview by ID
 */
export async function getInterview(id: number): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/`);

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to fetch interview');
}

/**
 * Create a new interview
 */
export async function createInterview(interviewData: CreateInterviewRequest): Promise<Interview> {
  const response = await apiClient.request('/interviews/', {
    method: 'POST',
    body: JSON.stringify(interviewData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to create interview');
}

/**
 * Update an existing interview
 */
export async function updateInterview(id: number, interviewData: UpdateInterviewRequest): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(interviewData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to update interview');
}

/**
 * Cancel/delete an interview
 */
export async function cancelInterview(id: number): Promise<void> {
  const response = await apiClient.request(`/interviews/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to cancel interview');
  }
}

/**
 * Reschedule an interview
 */
export async function rescheduleInterview(id: number, rescheduleData: RescheduleInterviewRequest): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/reschedule/`, {
    method: 'POST',
    body: JSON.stringify(rescheduleData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to reschedule interview');
}

/**
 * Submit feedback for an interview
 */
export async function submitFeedback(id: number, feedbackData: InterviewFeedbackRequest): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/feedback/`, {
    method: 'POST',
    body: JSON.stringify(feedbackData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to submit feedback');
}

/**
 * Confirm an interview
 */
export async function confirmInterview(id: number): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/confirm/`, {
    method: 'POST',
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to confirm interview');
}

/**
 * Mark interview as completed
 */
export async function completeInterview(id: number): Promise<Interview> {
  const response = await apiClient.request(`/interviews/${id}/complete/`, {
    method: 'POST',
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to complete interview');
}

/**
 * Get calendar data grouped by date
 */
export async function getInterviewCalendar(startDate?: string, endDate?: string): Promise<CalendarDayData[]> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.request(`/interviews/calendar/${queryString}`);

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch calendar data');
}

/**
 * Get upcoming interviews
 */
export async function getUpcomingInterviews(limit?: number): Promise<Interview[]> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.request(`/interviews/upcoming/${queryString}`);

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch upcoming interviews');
}

/**
 * Get all interviews for the current user (past + future) for calendar navigation
 */
export async function getMyInterviews(): Promise<Interview[]> {
  const response = await apiClient.request('/interviews/');

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch interviews');
}

/**
 * Get interview statistics
 */
export async function getInterviewStats(): Promise<InterviewStats> {
  const response = await apiClient.request('/interviews/stats/');

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to fetch interview stats');
}

/**
 * Bulk schedule interviews
 */
export async function bulkScheduleInterviews(bulkData: BulkScheduleRequest): Promise<{
  scheduled: Array<{ candidate_id: number; interview_id: number }>;
  failed: Array<{ candidate_id: number; error: string }>;
  scheduled_count: number;
  failed_count: number;
}> {
  const response = await apiClient.request('/interviews/bulk_schedule/', {
    method: 'POST',
    body: JSON.stringify(bulkData),
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  }
  throw new Error('Failed to bulk schedule interviews');
}

/**
 * Get interviews for a specific job
 */
export async function getJobInterviews(jobId: number): Promise<Interview[]> {
  const response = await apiClient.request(`/interviews/job/${jobId}/`);

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch job interviews');
}

/**
 * Get interviews for a specific candidate
 */
export async function getCandidateInterviews(candidateId: number): Promise<Interview[]> {
  const response = await apiClient.request(`/interviews/candidate/${candidateId}/`);

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch candidate interviews');
}

/**
 * Fetch interview availability slots
 */
export async function getAvailability(filters?: {
  start_date?: string;
  end_date?: string;
  user_id?: number;
}): Promise<InterviewAvailability[]> {
  const params = new URLSearchParams();

  if (filters) {
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.user_id) params.append('user_id', filters.user_id.toString());
  }

  const queryString = params.toString() ? `?${params.toString()}` : '';
  const response = await apiClient.request(`/interviews/availability/${queryString}`);

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch availability');
}

/**
 * Create availability slot
 */
export async function createAvailability(availabilityData: CreateAvailabilityRequest): Promise<InterviewAvailability> {
  const response = await apiClient.request('/interviews/availability/', {
    method: 'POST',
    body: JSON.stringify(availabilityData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to create availability slot');
}

/**
 * Delete availability slot
 */
export async function deleteAvailability(id: number): Promise<void> {
  const response = await apiClient.request(`/interviews/availability/${id}/`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete availability slot');
  }
}

/**
 * Fetch interview templates
 */
export async function getInterviewTemplates(): Promise<InterviewTemplate[]> {
  const response = await apiClient.request('/interviews/templates/');

  if (response.ok) {
    const data = await response.json();
    return data.data || [];
  }
  throw new Error('Failed to fetch interview templates');
}

/**
 * Create interview template
 */
export async function createInterviewTemplate(templateData: Partial<InterviewTemplate>): Promise<InterviewTemplate> {
  const response = await apiClient.request('/interviews/templates/', {
    method: 'POST',
    body: JSON.stringify(templateData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to create interview template');
}

/**
 * Use template to create interview
 */
export async function useInterviewTemplate(
  templateId: number,
  data: {
    job_id: number;
    candidate_id: number;
    scheduled_date: string;
    scheduled_time: string;
  }
): Promise<Interview> {
  const response = await apiClient.request(`/interviews/templates/${templateId}/use/`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (response.ok) {
    const data = await response.json();
    return data.data;
  }
  throw new Error('Failed to use interview template');
}
