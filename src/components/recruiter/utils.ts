/**
 * Utility functions for Job Management
 */
import type { JobPosting } from '../../api/jobManagement';
import { jobManagementApi } from '../../api/jobManagement';
import type { QueueCandidateLocal } from './types';

/**
 * Format a match score for display.
 * Shows whole numbers without decimals (e.g. 92) and decimals when present (e.g. 87.5).
 */
export const formatMatchScore = (score: number | undefined | null): string => {
  if (score == null || Number.isNaN(score)) return '0';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'published': return 'bg-green-100 text-green-800';
    case 'paused': return 'bg-yellow-100 text-yellow-800';
    case 'closed': return 'bg-gray-100 text-gray-800';
    case 'draft': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

function normalizeToArray(value: any): any[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

export const transformJobPosting = (job: any): JobPosting => ({
  ...job,
  postedDate: job.postedDate || new Date().toISOString(),
  applicants: job.applicants || job.applications_count || 0,
  views: job.views || job.views_count || 0,
  interviews: job.interviews || 0,
  offers: job.offers || 0,
  salary: job.salary || job.salary_display || '',
  experience: job.experience || job.experience_level_display || '',
  description: job.description || job.summary || '',
  requirements: normalizeToArray(job.requirements),
  responsibilities: normalizeToArray(job.responsibilities),
  nice_to_have: normalizeToArray(job.nice_to_have),
  queue: job.queue || job.selected_queues || '',
});

export const transformQueueCandidate = (c: any): QueueCandidateLocal => {
  const transformed = {
    id: c.id.toString(),
    name: c.name,
    title: c.title,
    location: c.location,
    experience: c.experience,
    queuePosition: c.queue_position === undefined ? (c.queuePosition || 0) : c.queue_position,
    matchScore: c.match_score === undefined ? (c.matchScore || 0) : c.match_score,
    isAIRecommended: c.is_ai_recommended === undefined ? (c.isAIRecommended || false) : c.is_ai_recommended,
    avatar: c.avatar || null,
    skills: c.skills || [],
    currentCompany: c.current_company === undefined ? (c.currentCompany || 'Unknown') : c.current_company,
    applicationDate: c.joined_queue === undefined ? c.joinedQueue : c.joined_queue,
    applicationStatus: c.application_status === undefined ? (c.applicationStatus || 'available') : c.application_status,
    lastActivity: c.last_activity === undefined ? (c.lastActivity || new Date().toISOString()) : c.last_activity,
    lastLogin: c.last_login === undefined ? (c.lastLogin || undefined) : c.last_login,
    joinedQueue: c.joined_queue === undefined ? c.joinedQueue : c.joined_queue,
    resume: `${c.name.toLowerCase().replace(/\s+/g, '-')}-resume.pdf`,
    aiRecommendation: c.ai_recommendation === undefined ? c.aiRecommendation : c.ai_recommendation,
    predicted_industry: c.predicted_industry,
    considerationRequestId: c.consideration_request_id || c.considerationRequestId,
    scoreBreakdown: c.score_breakdown === undefined ? c.scoreBreakdown : c.score_breakdown,
  };
  console.log('[transformQueueCandidate] Input:', c);
  console.log('[transformQueueCandidate] Output:', transformed);
  return transformed;
};

export const transformJobApplication = (app: any) => ({
  id: `manual-${app.id}`,
  originalId: app.id,
  name: app.candidate.full_name || app.candidate.username,
  title: 'Applicant',
  location: 'Unknown',
  experience: 'Unknown',
  avatar: null,
  skills: [],
  currentCompany: 'Unknown',
  applicationDate: app.applied_at,
  applicationStatus: app.status,
  lastActivity: app.applied_at,
  resumeId: `resume-${app.id}`,
  profileId: `profile-${app.candidate.id}`,
  match_score: app.match_score,
});

export const createCandidatesData = (
  aiRecommended: QueueCandidateLocal[],
  queueCandidates: QueueCandidateLocal[],
  manuallyApplied: any[],
  jobIndustry?: string
) => {
  const normalize = (ind?: string) => ind?.trim().toLowerCase().replace(/\s+/g, '-').replaceAll('_', '-') || '';
  const normalizedJobIndustry = normalize(jobIndustry);
  
  const filteredQueue = [...queueCandidates].filter(c => {
    const predictedIndustry = normalize(c.predicted_industry);
    const matches = !normalizedJobIndustry || predictedIndustry === normalizedJobIndustry;
    return matches;
  });
  
  filteredQueue.sort((a, b) => {
    if (a.isAIRecommended && !b.isAIRecommended) return -1;
    if (!a.isAIRecommended && b.isAIRecommended) return 1;
    if (a.isAIRecommended && b.isAIRecommended) return (b.matchScore || 0) - (a.matchScore || 0);
    return (a.queuePosition || 0) - (b.queuePosition || 0);
  });
  
  return {
    'ai-recommended': aiRecommended,
    'all-queue': filteredQueue,
    'manually-applied': manuallyApplied
  };
};

export const createFilteredJobs = (
  jobPostings: JobPosting[],
  searchQuery: string,
  filterStatus: string,
  activeTab: string
) => jobPostings.filter(job => {
  const jobStatus = job.status || 'draft'; // Default to draft if status is missing
  const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       job.department.toLowerCase().includes(searchQuery.toLowerCase());
  const matchesStatus = filterStatus === 'all' || jobStatus === filterStatus;
  const matchesTab = activeTab === 'all' ||
                    (activeTab === 'active' && (jobStatus === 'published' || jobStatus === 'draft')) ||
                    (activeTab === 'draft' && jobStatus === 'draft') ||
                    (activeTab === 'closed' && (jobStatus === 'closed' || jobStatus === 'paused'));
  return matchesSearch && matchesStatus && matchesTab;
});

export const handleJobStatusChange = async (
  job: any,
  newStatus: 'draft' | 'published' | 'paused' | 'closed',
  fetchJobPostings: () => Promise<void>
) => {
  try {
    const response = await jobManagementApi.updateJobPosting(job.id, { status: newStatus });
    if (response.success) {
      await fetchJobPostings();
      return true;
    } else {
      alert(`Failed to update job status: ${response.error}`);
      return false;
    }
  } catch (err) {
    console.error('Error updating job status:', err);
    alert('Failed to update job status');
    return false;
  }
};

export const cleanJobDataForUpdate = (job: any) => {
  // Remove display fields and computed fields that shouldn't be sent to backend
  const {
    id,
    salary_display,
    experience_level_display,
    employment_type_display,
    vacancy_type_display,
    work_arrangement_display,
    education_level_display,
    status_display,
    recruiter_name,
    postedDate,
    applicants,
    views,
    interviews,
    offers,
    salary,
    experience,
    queue,
    predicted_industry,
    predicted_level,
    prediction_confidence,
    created_at,
    updated_at,
    views_count,
    applications_count,
    published_at,
    ...cleanedJob
  } = job;

  // Convert data types and handle array fields
  const dataToSave = {
    ...cleanedJob,
    salary_min: cleanedJob.salary_min ? Number.parseFloat(cleanedJob.salary_min) : null,
    salary_max: cleanedJob.salary_max ? Number.parseFloat(cleanedJob.salary_max) : null,
    number_of_candidates: cleanedJob.number_of_candidates ? Number.parseInt(cleanedJob.number_of_candidates) : null,
    // Convert dates to YYYY-MM-DD format
    application_deadline: cleanedJob.application_deadline ? new Date(cleanedJob.application_deadline).toISOString().split('T')[0] : null,
    start_date: cleanedJob.start_date ? new Date(cleanedJob.start_date).toISOString().split('T')[0] : null,
    // Convert arrays to strings with line breaks
    requirements: Array.isArray(cleanedJob.requirements) ? cleanedJob.requirements.join('\n') : cleanedJob.requirements,
    responsibilities: Array.isArray(cleanedJob.responsibilities) ? cleanedJob.responsibilities.join('\n') : cleanedJob.responsibilities,
    nice_to_have: Array.isArray(cleanedJob.nice_to_have) ? cleanedJob.nice_to_have.join('\n') : cleanedJob.nice_to_have,
    // Video prompts are optional; skip empty ones before sending to the backend
    prompts: (cleanedJob.prompts || [])
      .filter((p: any) => (p.question_text || p.questionText || '').trim().length > 0)
      .map((p: any, index: number) => ({ ...p, order: p.order || index + 1 })),
  };

  // Remove null values to avoid validation errors
  Object.keys(dataToSave).forEach(key => {
    if (dataToSave[key] === null || dataToSave[key] === undefined || dataToSave[key] === '') {
      delete dataToSave[key];
    }
  });

  return dataToSave;
};

export const handleFetchError = (err: unknown, defaultMsg: string): string => {
  console.error(defaultMsg, err);
  return err instanceof Error ? err.message : defaultMsg;
};
