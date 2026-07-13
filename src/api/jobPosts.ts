/**
 * Job Posts API Service
 * Handles CRUD operations and ML predictions for job posts
 */
import apiClient from './client';
import { buildProfileImageUrl } from './recruiterProfile';

// Job post status types
export type JobStatus = 'draft' | 'published' | 'paused' | 'closed';

// Work arrangement types
export type WorkArrangement = 'remote' | 'hybrid' | 'onsite';

// Employment types
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

// Experience levels
export type ExperienceLevel = 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

// Education levels
export type EducationLevel = 'high-school' | 'associate' | 'bachelor' | 'master' | 'phd' | 'none';

// Currency options
export type Currency = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'JPY';

// Portfolio submission type
export type PortfolioType = 'link' | 'document';

// Targeting mode
export type TargetingMode = 'recommended' | 'manual';

// Vacancy type
export type VacancyType = 'current' | 'future';

// Video prompt shape used during job posting
export interface VideoPrompt {
  id?: number;
  order: number;
  questionText: string;
  maxDurationSeconds: number;
}

// Video prompt shape returned by the backend
export interface JobPostPrompt {
  id: number;
  order: number;
  question_text: string;
  max_duration_seconds: number;
}

// Candidate video response returned by the backend
export interface PromptResponse {
  id: number;
  prompt: number;
  prompt_order: number;
  question_text: string;
  max_duration_seconds: number;
  video_url: string | null;
  duration_seconds: number;
  attempt_count: number;
  recorded_at: string;
}

// Job Data Interface (frontend camelCase format)
export interface JobData {
  title: string;
  department: string;
  location: string;
  industry: string;
  workArrangement: WorkArrangement;
  employmentType: EmploymentType;
  vacancyType: VacancyType;
  salaryMin: string;
  salaryMax: string;
  currency: Currency;
  experienceLevel: ExperienceLevel | '';
  educationLevel: EducationLevel | '';
  summary: string;
  description: string;
  responsibilities: string;
  requirements: string;
  niceToHave: string;
  benefits: string;
  selectedQueues: string[];
  targetingMode: TargetingMode;
  applicationDeadline: string;
  startDate: string;
  isUrgent: boolean;
  requiresCoverLetter: boolean;
  requiresPortfolio: boolean;
  portfolioSubmissionType: PortfolioType;
  portfolioDescription: string;
  numberOfCandidates: string;
  interviewRounds: Record<string, number>;
  hiringManager: string;
  recruiterNotes: string;
  internalJobCode: string;
  videoPrompts: VideoPrompt[];
  predicted_industry?: string;
  predicted_level?: string;
}

// Backend Job Post Interface (snake_case format from API)
export interface JobPost {
  id: number;
  title: string;
  department: string | null;
  company_name: string | null;
  company_id: number | null;
  location: string;
  industry: string | null;
  work_arrangement: WorkArrangement;
  employment_type: EmploymentType;
  vacancy_type: VacancyType | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: Currency;
  experience_level: ExperienceLevel | '';
  education_level: EducationLevel | null;
  summary: string | null;
  description: string;
  responsibilities: string | null;
  requirements: string | null;
  nice_to_have: string | null;
  benefits: string | null;
  targeting_mode: TargetingMode;
  selected_queues: string[];
  application_deadline: string | null;
  start_date: string | null;
  is_urgent: boolean;
  requires_portfolio: boolean;
  portfolio_submission_type: PortfolioType | null;
  portfolio_description: string | null;
  number_of_candidates: number;
  interview_rounds: Record<string, number>;
  hiring_manager: string | null;
  recruiter_notes: string | null;
  internal_job_code: string | null;
  status: JobStatus;
  views_count: number;
  applications_count: number;
  predicted_industry: string | null;
  predicted_level: ExperienceLevel | null;
  prediction_confidence: number | null;
  prompts: JobPostPrompt[];
  prompts_locked: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  recruiter: number;
  // Candidate-facing greenzone context (added by algorithmic-monoculture work)
  greenzone_status?: string | null;
  greenzone_reason?: string | null;
}

// ML Prediction Result
export interface JobPredictionResult {
  predicted_industry: string | null;
  predicted_level: string | null;
  industry_confidence: number | null;
  level_confidence: number | null;
  industry_predictions: Array<{
    industry: string;
    probability: number;
    rank: number;
  }>;
  level_predictions: Array<{
    level: string;
    probability: number;
    rank: number;
  }>;
}

// Transform frontend JobData to backend snake_case format (for JobPostCreateUpdateSerializer)
export function transformJobDataForCreate(jobData: JobData): Record<string, unknown> {
  return {
    title: jobData.title,
    department: jobData.department || null,
    location: jobData.location,
    industry: jobData.industry || null,
    work_arrangement: jobData.workArrangement,
    employment_type: jobData.employmentType,
    vacancy_type: jobData.vacancyType || 'current',
    salary_min: jobData.salaryMin ? Number.parseFloat(jobData.salaryMin) : null,
    salary_max: jobData.salaryMax ? Number.parseFloat(jobData.salaryMax) : null,
    currency: jobData.currency,
    experience_level: jobData.experienceLevel,
    education_level: jobData.educationLevel || null,
    summary: jobData.summary || null,
    description: jobData.description,
    responsibilities: jobData.responsibilities || null,
    requirements: jobData.requirements || null,
    nice_to_have: jobData.niceToHave || null,
    benefits: jobData.benefits || null,
    targeting_mode: jobData.targetingMode,
    selected_queues: jobData.selectedQueues || [],
    application_deadline: jobData.applicationDeadline || null,
    start_date: jobData.startDate || null,
    is_urgent: jobData.isUrgent,
    requires_cover_letter: jobData.requiresCoverLetter,
    requires_portfolio: jobData.requiresPortfolio,
    portfolio_submission_type: jobData.requiresPortfolio ? jobData.portfolioSubmissionType : null,
    portfolio_description: jobData.requiresPortfolio ? jobData.portfolioDescription : null,
    number_of_candidates: Number.parseInt(jobData.numberOfCandidates) || 1,
    interview_rounds: jobData.interviewRounds,
    hiring_manager: jobData.hiringManager || null,
    recruiter_notes: jobData.recruiterNotes || null,
    internal_job_code: jobData.internalJobCode || null,
    video_prompts: jobData.videoPrompts || [],
    prompts: (jobData.videoPrompts || [])
      .filter((p) => p.questionText.trim().length > 0)
      .map((p, index) => ({
        order: p.order || index + 1,
        question_text: p.questionText,
        max_duration_seconds: p.maxDurationSeconds || 180,
      })),
  };
}

// Transform frontend JobData to backend format
export function transformJobDataForBackend(jobData: JobData): Omit<JobPost, 'id' | 'recruiter' | 'created_at' | 'updated_at' | 'published_at' | 'views_count' | 'applications_count' | 'predicted_industry' | 'predicted_level' | 'prediction_confidence'> {
  return {
    title: jobData.title,
    department: jobData.department || null,
    company_name: null,
    company_id: null,
    location: jobData.location,
    industry: jobData.industry || null,
    work_arrangement: jobData.workArrangement,
    employment_type: jobData.employmentType,
    vacancy_type: jobData.vacancyType || 'current',
    salary_min: jobData.salaryMin ? Number.parseFloat(jobData.salaryMin) : null,
    salary_max: jobData.salaryMax ? Number.parseFloat(jobData.salaryMax) : null,
    currency: jobData.currency,
    experience_level: jobData.experienceLevel,
    education_level: jobData.educationLevel || null,
    summary: jobData.summary || null,
    description: jobData.description,
    responsibilities: jobData.responsibilities || null,
    requirements: jobData.requirements || null,
    nice_to_have: jobData.niceToHave || null,
    benefits: jobData.benefits || null,
    targeting_mode: jobData.targetingMode,
    selected_queues: jobData.selectedQueues || [],
    application_deadline: jobData.applicationDeadline || null,
    start_date: jobData.startDate || null,
    is_urgent: jobData.isUrgent,
    requires_portfolio: jobData.requiresPortfolio,
    portfolio_submission_type: jobData.requiresPortfolio ? jobData.portfolioSubmissionType : null,
    portfolio_description: jobData.requiresPortfolio ? jobData.portfolioDescription : null,
    number_of_candidates: Number.parseInt(jobData.numberOfCandidates) || 1,
    interview_rounds: jobData.interviewRounds,
    hiring_manager: jobData.hiringManager || null,
    recruiter_notes: jobData.recruiterNotes || null,
    internal_job_code: jobData.internalJobCode || null,
    prompts: (jobData.videoPrompts || [])
      .filter((p) => p.questionText.trim().length > 0)
      .map((p) => {
        const prompt: JobPostPrompt = {
          id: p.id ?? 0,
          order: p.order,
          question_text: p.questionText,
          max_duration_seconds: p.maxDurationSeconds,
        };
        if (!p.id) {
          delete (prompt as any).id;
        }
        return prompt;
      }),
    prompts_locked: false,
    status: 'draft',
  };
}

// Transform backend JobPost to frontend format
export function transformJobPostForFrontend(jobPost: JobPost): JobData {
  return {
    title: jobPost.title,
    department: jobPost.department || '',
    location: jobPost.location,
    industry: jobPost.industry || '',
    workArrangement: jobPost.work_arrangement,
    employmentType: jobPost.employment_type,
    vacancyType: jobPost.vacancy_type || 'current',
    salaryMin: jobPost.salary_min?.toString() || '',
    salaryMax: jobPost.salary_max?.toString() || '',
    currency: jobPost.currency,
    experienceLevel: jobPost.experience_level,
    educationLevel: (jobPost.education_level as EducationLevel) || 'none',
    summary: jobPost.summary || '',
    description: jobPost.description,
    responsibilities: jobPost.responsibilities || '',
    requirements: jobPost.requirements || '',
    niceToHave: jobPost.nice_to_have || '',
    benefits: jobPost.benefits || '',
    selectedQueues: [],
    targetingMode: jobPost.targeting_mode,
    applicationDeadline: jobPost.application_deadline || '',
    startDate: jobPost.start_date || '',
    isUrgent: jobPost.is_urgent,
    requiresCoverLetter: false,
    requiresPortfolio: jobPost.requires_portfolio,
    portfolioSubmissionType: jobPost.portfolio_submission_type || 'link',
    portfolioDescription: jobPost.portfolio_description || '',
    numberOfCandidates: jobPost.number_of_candidates.toString(),
    interviewRounds: jobPost.interview_rounds,
    hiringManager: jobPost.hiring_manager || '',
    recruiterNotes: jobPost.recruiter_notes || '',
    internalJobCode: jobPost.internal_job_code || '',
    videoPrompts: (jobPost.prompts || []).map((p) => ({
      id: p.id,
      order: p.order,
      questionText: p.question_text,
      maxDurationSeconds: p.max_duration_seconds,
    })),
  };
}

// Normalize any job object (from props, router state, or API) to a full shape with defaults
export function normalizeJobData(job: any): any {
  return {
    id: job?.id ?? '',
    title: job?.title ?? '',
    company: job?.company ?? 'Unknown Company',
    companyId: job?.companyId ?? job?.company_id ?? null,
    department: job?.department ?? '',
    location: job?.location ?? '',
    salary: job?.salary ?? 'Salary not specified',
    type: job?.type ?? 'Full-time',
    description: job?.description ?? '',
    summary: job?.summary ?? '',
    responsibilities: job?.responsibilities ?? [],
    requirements: job?.requirements ?? [],
    niceToHave: job?.niceToHave ?? job?.nice_to_have ?? [],
    benefits: job?.benefits ?? [],
    skills: job?.skills ?? [],
    companyIndustry: job?.companyIndustry ?? job?.industry ?? 'Technology',
    industry: job?.industry ?? '',
    workModel: job?.workModel ?? job?.work_arrangement ?? 'hybrid',
    workArrangement: job?.workArrangement ?? job?.work_arrangement ?? 'hybrid',
    employmentType: job?.employmentType ?? job?.employment_type ?? 'full-time',
    vacancyType: job?.vacancyType ?? job?.vacancy_type ?? 'current',
    experienceLevel: job?.experienceLevel ?? job?.experience_level ?? 'Mid Level',
    educationLevel: job?.educationLevel ?? job?.education_level ?? '',
    companySize: job?.companySize ?? 'Unknown',
    companyRating: job?.companyRating ?? 4,
    hasApplied: job?.hasApplied ?? false,
    isApplied: job?.isApplied ?? false,
    applied: job?.applied ?? false,
    applicationMethod: job?.applicationMethod ?? 'manual',
    recruiter: job?.recruiter ?? null,
    logo: job?.logo ?? job?.company_logo ?? undefined,
    isUrgent: job?.isUrgent ?? job?.is_urgent ?? false,
    applicationDeadline: job?.applicationDeadline ?? job?.application_deadline ?? '',
    startDate: job?.startDate ?? job?.start_date ?? '',
    requiresCoverLetter: job?.requiresCoverLetter ?? job?.requires_cover_letter ?? false,
    requiresPortfolio: job?.requiresPortfolio ?? job?.requires_portfolio ?? false,
    portfolioSubmissionType: job?.portfolioSubmissionType ?? job?.portfolio_submission_type ?? 'link',
    portfolioDescription: job?.portfolioDescription ?? job?.portfolio_description ?? '',
    interviewRounds: job?.interviewRounds ?? job?.interview_rounds ?? {},
    hiringManager: job?.hiringManager ?? job?.hiring_manager ?? '',
    selectedQueues: job?.selectedQueues ?? job?.selected_queues ?? [],
    currency: job?.currency ?? 'USD',
    videoPrompts: job?.videoPrompts ?? job?.video_prompts ?? job?.prompts ?? [],
    isSaved: job?.isSaved ?? job?.is_saved ?? false,
    greenzoneStatus: job?.greenzoneStatus ?? job?.greenzone_status ?? null,
    greenzoneReason: job?.greenzoneReason ?? job?.greenzone_reason ?? null,
  };
}

// Transform raw API job data into the full component-ready shape
export function transformJobData(apiJob: any, recruiterData: any): any {
  return {
    id: String(apiJob.id),
    title: apiJob.title,
    company: apiJob.company_name || apiJob.department || 'Unknown Company',
    companyId: apiJob.company_id ?? null,
    department: apiJob.department || '',
    location: apiJob.location,
    salary: apiJob.salary_min && apiJob.salary_max
      ? `$${Math.round(apiJob.salary_min)}k - $${Math.round(apiJob.salary_max)}k`
      : 'Salary not specified',
    type: apiJob.employment_type || 'Full-time',
    description: apiJob.description || '',
    summary: apiJob.summary || '',
    responsibilities: apiJob.responsibilities ? apiJob.responsibilities.split('\n').filter((r: string) => r.trim()) : [],
    requirements: apiJob.requirements ? apiJob.requirements.split('\n').filter((r: string) => r.trim()) : [],
    niceToHave: apiJob.nice_to_have ? apiJob.nice_to_have.split('\n').filter((n: string) => n.trim()) : [],
    benefits: apiJob.benefits ? apiJob.benefits.split('\n').filter((b: string) => b.trim()) : [],
    skills: apiJob.target_skills || [],
    companyIndustry: apiJob.industry || 'Technology',
    industry: apiJob.industry || '',
    workModel: apiJob.work_arrangement || 'hybrid',
    workArrangement: apiJob.work_arrangement || 'hybrid',
    employmentType: apiJob.employment_type || 'full-time',
    vacancyType: apiJob.vacancy_type || 'current',
    experienceLevel: apiJob.experience_level || 'Mid Level',
    educationLevel: apiJob.education_level || '',
    companySize: apiJob.department ? `${apiJob.department} Team` : 'Unknown',
    companyRating: 4,
    hasApplied: apiJob.has_applied || false,
    isApplied: apiJob.has_applied || false,
    applied: apiJob.has_applied || false,
    applicationMethod: apiJob.application_method || ('manual' as const),
    status: apiJob.application_status || undefined,
    dateApplied: apiJob.date_applied || undefined,
    recruiter: recruiterData,
    logo: apiJob.company_logo ? buildProfileImageUrl(apiJob.company_logo) : undefined,
    isUrgent: apiJob.is_urgent || false,
    applicationDeadline: apiJob.application_deadline || '',
    startDate: apiJob.start_date || '',
    requiresCoverLetter: apiJob.requires_cover_letter || false,
    requiresPortfolio: apiJob.requires_portfolio || false,
    portfolioSubmissionType: apiJob.portfolio_submission_type || 'link',
    portfolioDescription: apiJob.portfolio_description || '',
    interviewRounds: apiJob.interview_rounds || {},
    hiringManager: apiJob.hiring_manager || '',
    selectedQueues: apiJob.selected_queues || [],
    videoPrompts: (apiJob.prompts || []).map((p: any) => ({
      id: p.id,
      order: p.order,
      questionText: p.question_text,
      maxDurationSeconds: p.max_duration_seconds,
    })),
    currency: apiJob.currency || 'USD',
    isSaved: apiJob.is_saved ?? false,
    greenzoneStatus: apiJob.greenzone_status ?? null,
    greenzoneReason: apiJob.greenzone_reason ?? null,
  };
}

// Job Posts API
export const jobPostsApi = {
  /**
   * Get all job posts
   */
  async getJobPosts(): Promise<{ success: boolean; data: JobPost[] }> {
    const response = await apiClient.request('/jobposts/', { method: 'GET' });
    return response.json();
  },

  /**
   * Get a single job post by ID
   */
  async getJobPostById(id: number): Promise<{ success: boolean; data: JobPost }> {
    const response = await apiClient.request(`/jobposts/${id}/`, { method: 'GET' });
    return response.json();
  },

  /**
   * Create a new job post (as draft or publish)
   */
  async createJobPost(
    jobData: JobData,
    action: 'draft' | 'publish' = 'draft',
    companyId?: string
  ): Promise<{ success: boolean; data: JobPost; message?: string; approval_required?: boolean; approval_id?: string }> {
    const backendData = {
      ...transformJobDataForCreate(jobData),
      action,
      company: companyId,
    };
    const response = await apiClient.request('/jobposts/', {
      method: 'POST',
      body: JSON.stringify(backendData),
    });
    return response.json();
  },

  /**
   * Update an existing job post
   */
  async updateJobPost(id: number, jobData: Partial<JobData>): Promise<{ success: boolean; data: JobPost; message?: string }> {
    const backendData = transformJobDataForBackend(jobData as JobData);
    const response = await apiClient.request(`/jobposts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(backendData),
    });
    return response.json();
  },

  /**
   * Delete a job post
   */
  async deleteJobPost(id: number): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.request(`/jobposts/${id}/`, { method: 'DELETE' });
    return response.json();
  },

  /**
   * Get ML predictions for job data (without saving)
   */
  async predictJobIndustryAndLevel(jobData: JobData): Promise<{ success: boolean; data: JobPredictionResult }> {
    // Transform to backend format
    const backendData = transformJobDataForBackend(jobData);
    
    // Format for prediction service
    const predictionData = {
      job_title: backendData.title,
      job_description: `${backendData.summary || ''}\n${backendData.description}`,
      job_level_skills: `${backendData.requirements || ''}\n${backendData.nice_to_have || ''}`,
      job_work_type: backendData.work_arrangement,
      job_level_name: backendData.experience_level,
      job_industry: backendData.industry || '',
    };

    const response = await apiClient.request('/jobposts/ml/predict/', {
      method: 'POST',
      body: JSON.stringify(predictionData),
    });
    return response.json();
  },

  /**
   * Save job post and run ML prediction
   * Creates job first, then runs prediction and saves results
   */
  async createJobPostWithPrediction(jobData: JobData, companyId?: string): Promise<{ 
    success: boolean; 
    data: JobPost & { predictions: JobPredictionResult }; 
    message?: string;
    approval_required?: boolean;
    approval_id?: string;
  }> {
    // Step 1: Create the job post first (as publish)
    const createResponse = await this.createJobPost(jobData, 'publish', companyId);
    if (!createResponse.success) {
      return { 
        success: false, 
        data: createResponse.data as JobPost & { predictions: JobPredictionResult }, 
        message: createResponse.message 
      };
    }

    // If approval is required, skip ML prediction
    if (createResponse.approval_required) {
      return {
        success: true,
        data: createResponse.data as JobPost & { predictions: JobPredictionResult },
        message: createResponse.message,
        approval_required: true,
        approval_id: createResponse.approval_id,
      };
    }
    
    const jobId = createResponse.data.id;
    
    // Step 2: Run prediction and save to the created job
    const response = await apiClient.request(`/jobposts/${jobId}/ml/predict-and-save/`, {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    });
    return response.json();
  },

  /**
   * Publish a draft job post
   */
  async publishJobPost(id: number): Promise<{ success: boolean; data: JobPost; message?: string }> {
    const response = await apiClient.request(`/jobposts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'published', action: 'publish' }),
    });
    return response.json();
  },

  /**
   * Run ML prediction and save results on an existing job post
   */
  async predictAndSaveJobPost(id: number): Promise<{ success: boolean; data: JobPost & { predictions: JobPredictionResult }; message?: string }> {
    const response = await apiClient.request(`/jobposts/${id}/ml/predict-and-save/`, {
      method: 'POST',
      body: JSON.stringify({ status: 'published' }),
    });
    return response.json();
  },

  /**
   * Get job applications for a specific job
   */
  async getJobApplications(jobId: number): Promise<{ success: boolean; data: any[]; message?: string }> {
    const response = await apiClient.request(`/jobposts/${jobId}/apply/`, {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get all job applications for the current authenticated user (candidate)
   * Returns applications with job details, status, notes, and interview info
   */
  async getMyApplications(): Promise<{
    success: boolean;
    data: {
      id: number;
      job_id: number;
      title: string;
      company: string;
      location: string;
      salary: string;
      status: string;
      date_applied: string;
      last_updated: string;
      notes: string;
      recruiter_notes: string;
      interview_date: string | null;
      job_url: string;
      match_score: number | null;
    }[];
    count: number;
  }> {
    const response = await apiClient.request('/jobposts/my-applications/', {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get hiring status for a job (recruiter only)
   * Returns stage, positions filled, application counts, custom message
   */
  async getJobHiringStatus(jobId: number): Promise<{
    success: boolean;
    data: {
      job_id: number;
      job_title: string;
      stage: 'open' | 'reviewing' | 'interviewing' | 'offer-pending' | 'filled' | 'closed';
      positions_filled: number;
      total_positions: number;
      applications_count: number;
      interview_count: number;
      planned_interview_count: number;
      custom_message: string;
      is_visible: boolean;
      last_updated: string;
    };
    message?: string;
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/hiring-status/`, {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Update hiring status for a job (recruiter only)
   * Update stage, positions filled, planned interviews, custom message, visibility
   */
  async updateJobHiringStatus(jobId: number, statusData: {
    stage?: string;
    positions_filled?: number;
    planned_interview_count?: number;
    custom_message?: string;
    is_visible?: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data?: {
      job_id: number;
      job_title: string;
      stage: string;
      positions_filled: number;
      total_positions: number;
      applications_count: number;
      interview_count: number;
      planned_interview_count: number;
      custom_message: string;
      is_visible: boolean;
      last_updated: string;
    };
    error?: string;
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/hiring-status/`, {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
    return response.json();
  },

  /**
   * Filter and rank candidates for a job based on candidate preferences and classification
   * Only returns candidates whose preferences match the job and who are in the same industry/level
   */
  async rankFilteredCandidates(jobId: number, candidates: any[], options?: { top_n?: number }): Promise<{
    success: boolean;
    data: {
      job_id: number;
      job_title: string;
      total_input_candidates: number;
      filtered_candidates_count: number;
      ranked_candidates: any[];
      skipped_candidates: { candidate_id: string; reason: string }[];
    };
    error?: string;
  }> {
    const response = await apiClient.request('/jobposts/ml/rank/candidates/', {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        candidates: candidates,
        top_n: options?.top_n || 20,
      }),
    });
    return response.json();
  },

  /**
   * Perform bulk operations on job applications (recruiter only)
   * Supported operations: update_status, move_to_stage, send_message, schedule_interviews
   */
  async bulkOperations(jobId: number, operationData: {
    operation: 'update_status' | 'move_to_stage' | 'send_message' | 'schedule_interviews';
    application_ids: number[];
    status?: string;
    feedback?: string;
    stage?: string;
    message?: string;
    message_type?: string;
    interview_date?: string;
    interview_format?: string;
    interview_duration?: number;
    notes?: string;
  }): Promise<{
    success: boolean;
    message: string;
    updated_count?: number;
    new_status?: string;
    stage?: string;
    recipient_count?: number;
    message_preview?: string;
    scheduled_count?: number;
    interview_date?: string;
    interview_format?: string;
    error?: string;
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/bulk-operations/`, {
      method: 'POST',
      body: JSON.stringify(operationData),
    });
    return response.json();
  },

  /**
   * Get platform-wide statistics
   * Returns active job seekers, response times, match rates, etc.
   */
  async getPlatformStats(): Promise<{
    success: boolean;
    data: {
      active_job_seekers: number;
      avg_response_time_days: number;
      match_success_rate: number;
      active_job_posts: number;
      total_applications: number;
      last_updated: string;
    };
  }> {
    const response = await apiClient.request('/jobposts/platform/stats/', {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get scheduled interviews for a job (recruiter only)
   */
  async getJobInterviews(jobId: number): Promise<{
    success: boolean;
    count: number;
    data: {
      id: string;
      candidate_id: string;
      candidate_name: string;
      job_id: string;
      job_title: string;
      scheduled_date: string;
      scheduled_time: string;
      duration_minutes: number;
      interview_type: 'phone' | 'video' | 'onsite';
      meeting_url: string | null;
      status: string;
      notes: string;
    }[];
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/interviews/`, {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get public recruiter profile by user ID
   * Used for job details page to show recruiter info
   */
  async getRecruiterPublicProfile(userId: number): Promise<{
    success: boolean;
    data: {
      name: string;
      title: string;
      company: string | null;
      avatar: string | null;
      bio: string | null;
      location: string | null;
      website: string | null;
      linkedin: string | null;
      email: string | null;
    };
  }> {
    const response = await apiClient.request(`/accounts/recruiter/${userId}/public-profile/`, {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get job seeker queue statistics
   * Returns real queue data with member counts, salaries, skills from actual candidate profiles
   */
  async getQueueStats(): Promise<{
    success: boolean;
    count: number;
    data: {
      id: string;
      name: string;
      industry: string;
      members: number;
      avg_salary_min: number;
      avg_salary_max: number;
      top_skills: string[];
      match_score?: number;
      description: string;
      response_rate: string;
      hiring_trend: string;
    }[];
  }> {
    const response = await apiClient.request('/jobposts/queues/stats/', {
      method: 'GET',
    });
    return response.json();
  },

  // Get jobs for a specific company
  async getCompanyJobs(companyId: string): Promise<JobPost[]> {
    const response = await apiClient.request(`/jobposts/?company=${companyId}&status=published`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch company jobs');
    }

    const data = await response.json();
    return data.data || data.results || data;
  },

  // Get personal notes for a specific job
  async getJobNotes(jobId: string): Promise<{ success: boolean; notes: string; data: any }> {
    const response = await apiClient.request(`/jobposts/${jobId}/notes/`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job notes');
    }

    return response.json();
  },

  // Save personal notes for a specific job
  async saveJobNotes(jobId: string, notes: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.request(`/jobposts/${jobId}/notes/`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to save job notes');
    }

    return response.json();
  },

  // Update personal notes for a specific job
  async updateJobNotes(jobId: string, notes: string): Promise<{ success: boolean; data: any }> {
    const response = await apiClient.request(`/jobposts/${jobId}/notes/`, {
      method: 'PUT',
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update job notes');
    }

    return response.json();
  },

  // Delete personal notes for a specific job
  async deleteJobNotes(jobId: string): Promise<{ success: boolean }> {
    const response = await apiClient.request(`/jobposts/${jobId}/notes/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete job notes');
    }

    return response.json();
  },

  // Get video screening prompts for a job
  async getJobPrompts(jobId: number | string): Promise<{
    success: boolean;
    count: number;
    data: JobPostPrompt[];
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/prompts/`, {
      method: 'GET',
    });
    return response.json();
  },

  // Upload a candidate video response for a specific prompt
  async uploadPromptResponse(
    jobId: number | string,
    promptId: number | string,
    videoBlob: Blob,
    durationSeconds: number
  ): Promise<{ success: boolean; data?: PromptResponse; error?: string; message?: string }> {
    const formData = new FormData();
    formData.append('video_file', videoBlob, 'response.webm');
    formData.append('duration_seconds', String(durationSeconds));

    const response = await apiClient.request(`/jobposts/${jobId}/prompts/${promptId}/response/`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: result.message || 'Failed to upload video response',
      };
    }
    return result;
  },

  // Get the current candidate's uploaded video responses for a job (read-only)
  async getMyPromptResponses(jobId: number | string): Promise<{
    success: boolean;
    count: number;
    data: PromptResponse[];
  }> {
    const response = await apiClient.request(`/jobposts/${jobId}/my-responses/`, {
      method: 'GET',
    });
    return response.json();
  },

  // Get all personal notes for current user
  async getAllJobNotes(): Promise<{
    success: boolean;
    count: number;
    data: {
      id: number;
      job: number;
      job_title: string;
      company: string;
      notes: string;
      created_at: string;
      updated_at: string;
    }[];
  }> {
    const response = await apiClient.request('/jobposts/notes/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch job notes');
    }

    return response.json();
  },
};

export default jobPostsApi;
