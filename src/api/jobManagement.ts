/**
 * Job Management API Service
 * Provides API functions for recruiter job management including:
 * - Job postings CRUD
 * - Queue candidates with AI matching
 * - Consideration requests
 * - Job applications
 */
import apiClient from './client';

// Interfaces for API responses
export interface JobPosting {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  status: 'draft' | 'published' | 'paused' | 'closed';
  postedDate: string;
  applicants: number;
  views: number;
  interviews: number;
  offers: number;
  queue: string;
  queueId: string;
  numberOfCandidates: number;
  description: string;
  requirements: string[];
  responsibilities: string[];
  hiringStatus?: {
    stage: string;
    positionsFilled: number;
    totalPositions: number;
    applicationsCount: number;
    interviewCount: number;
    plannedInterviewCount: number;
    customMessage: string;
    isVisible: boolean;
    lastUpdated: string;
  };
}

export interface ScoreBreakdown {
  semantic?: number;
  skill_jaccard?: number;
  education_score?: number;
  experience_score?: number;
  industry_alignment?: number;
  level_alignment?: number;
  composite_score?: number;
  match_percentage?: number;
  skill_gaps?: string[];
}

export interface QueueCandidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  queuePosition: number;
  matchScore: number;
  isAIRecommended: boolean;
  avatar: string | null;
  skills: string[];
  currentCompany: string;
  applicationStatus: string;
  lastActivity: string;
  joinedQueue: string;
  aiRecommendation?: {
    reason: string;
    strengths: string[];
    concerns: string[];
  };
  considerationStatus?: string;
  considerationMatchScore?: number;
  predicted_industry?: string;
  scoreBreakdown?: ScoreBreakdown;
}

export interface ConsiderationRequest {
  id: number;
  recruiter: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  candidate: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  job: number;
  job_details: {
    id: number;
    title: string;
    department: string;
    location: string;
    company: string | null;
  };
  message: string;
  status: 'pending' | 'accepted' | 'declined' | 'under_consideration' | 'interview_stage' | 'offer' | 'hired';
  status_display: string;
  match_score: number | null;
  candidate_response: string;
  responded_at: string | null;
  conversation: number | null;
  job_application: number | null;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  candidate: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  job: number;
  status: string;
  applied_at: string;
  cover_letter?: string;
  match_score?: number;
}

export interface QueueCandidatesResponse {
  success: boolean;
  job_id: number;
  job_title: string;
  industry: string;
  experience_level: string;
  total_queue_candidates: number;
  ai_recommended_count: number;
  consideration_summary: {
    total: number;
    pending: number;
    accepted: number;
    declined: number;
    available: number;
  };
  ai_recommended: QueueCandidate[];
  all_queue: QueueCandidate[];
}

export interface ConsiderationRequestsResponse {
  success: boolean;
  job_id: number;
  job_title: string;
  count: number;
  data: ConsiderationRequest[];
}

/**
 * Job Management API
 */
export const jobManagementApi = {
  /**
   * Get all job postings for the current recruiter
   */
  async getJobPostings(): Promise<{ success: boolean; data?: JobPosting[]; error?: string }> {
    try {
      const response = await apiClient.request('/jobposts/?my_jobs=true', {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching job postings:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get a single job posting with details
   */
  async getJobPosting(jobId: number): Promise<{ success: boolean; data?: JobPosting; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching job posting:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a job posting
   */
  async updateJobPosting(jobId: number, data: Partial<JobPosting>): Promise<{ success: boolean; data?: JobPosting; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error updating job posting:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get queue candidates for a specific job
   * Returns AI recommended and all queue candidates with consideration status
   */
  async getQueueCandidates(jobId: number, includeAll: boolean = false, topN: number = 10): Promise<QueueCandidatesResponse> {
    try {
      const params = new URLSearchParams({
        include_all: includeAll.toString(),
        top_n: topN.toString(),
      });
      const response = await apiClient.request(`/jobposts/${jobId}/queue-candidates/?${params}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching queue candidates:', error);
      return {
        success: false,
        job_id: jobId,
        job_title: '',
        industry: '',
        experience_level: '',
        total_queue_candidates: 0,
        ai_recommended_count: 0,
        consideration_summary: { total: 0, pending: 0, accepted: 0, declined: 0, available: 0 },
        ai_recommended: [],
        all_queue: [],
      };
    }
  },

  /**
   * Get consideration requests for a specific job
   */
  async getConsiderationRequestsForJob(jobId: number, status?: string): Promise<ConsiderationRequestsResponse> {
    try {
      const params = new URLSearchParams({ job_id: jobId.toString() });
      if (status) {
        params.append('status', status);
      }
      const response = await apiClient.request(`/chat/consideration-requests/for_job/?${params}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching consideration requests:', error);
      return {
        success: false,
        job_id: jobId,
        job_title: '',
        count: 0,
        data: [],
      };
    }
  },

  /**
   * Send a consideration request to a candidate
   */
  async sendConsiderationRequest(candidateId: number, jobId: number, message: string, matchScore?: number): Promise<{ success: boolean; data?: ConsiderationRequest; error?: string }> {
    try {
      const response = await apiClient.request('/chat/consideration-requests/', {
        method: 'POST',
        body: JSON.stringify({
          candidate: candidateId,
          job: jobId,
          message,
          match_score: matchScore,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const errorMsg =
          data.detail
          || (data.non_field_errors?.[0])
          || Object.values(data).flat().find((v: any) => typeof v === 'string')
          || 'Request failed';
        return { success: false, error: errorMsg };
      }
      return { success: true, data };
    } catch (error: any) {
      console.error('Error sending consideration request:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Accept a consideration request (candidate action, but available for testing)
   */
  async acceptConsiderationRequest(requestId: number, responseMessage: string = '', videoResponseIds?: number[]): Promise<{ success: boolean; data?: any; error?: string; requires_video_prompts?: boolean; missing_prompt_ids?: number[] }> {
    try {
      const body: Record<string, any> = { response_message: responseMessage };
      if (videoResponseIds) {
        body.video_response_ids = videoResponseIds;
      }
      const response = await apiClient.request(`/chat/consideration-requests/${requestId}/accept/`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error accepting consideration request:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Withdraw (delete) a consideration request (recruiter only)
   */
  async withdrawConsiderationRequest(requestId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.request(`/chat/consideration-requests/${requestId}/`, {
        method: 'DELETE',
      });
      if (response.status === 204 || response.status === 200) {
        return { success: true };
      }
      const data = await response.json();
      return { success: false, error: data.detail || data.error || 'Failed to withdraw consideration request' };
    } catch (error: any) {
      console.error('Error withdrawing consideration request:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Revoke (delete) a job application (recruiter only)
   */
  async revokeApplication(applicationId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/applications/${applicationId}/`, {
        method: 'DELETE',
      });
      if (response.status === 204 || response.status === 200) {
        return { success: true };
      }
      const data = await response.json();
      return { success: false, error: data.detail || data.error || 'Failed to revoke application' };
    } catch (error: any) {
      console.error('Error revoking application:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get job applications for a specific job
   */
  async getJobApplications(jobId: number): Promise<{ success: boolean; data?: JobApplication[]; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/apply/`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching job applications:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Get job hiring status
   */
  async getJobHiringStatus(jobId: number): Promise<{ success: boolean; data: JobPosting['hiringStatus']; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/hiring-status/`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error fetching job hiring status:', error);
      return { success: false, data: undefined, error: error.message };
    }
  },

  /**
   * Delete a job posting
   */
  async deleteJobPosting(jobId: number): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/`, {
        method: 'DELETE',
      });
      if (response.status === 204 || response.status === 200) {
        return { success: true };
      }
      const data = await response.json();
      return { success: false, error: data.detail || data.error || 'Failed to delete job post' };
    } catch (error: any) {
      console.error('Error deleting job posting:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update job hiring status
   */
  async updateJobHiringStatus(jobId: number, status: Partial<JobPosting['hiringStatus']>): Promise<{ success: boolean; data: JobPosting['hiringStatus']; error?: string }> {
    try {
      const response = await apiClient.request(`/jobposts/${jobId}/hiring-status/`, {
        method: 'PUT',
        body: JSON.stringify(status),
      });
      return await response.json();
    } catch (error: any) {
      console.error('Error updating job hiring status:', error);
      return { success: false, data: undefined, error: error.message };
    }
  },
};

export default jobManagementApi;
