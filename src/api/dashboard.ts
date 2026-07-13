/**
 * Dashboard API Service
 * Provides aggregated dashboard statistics for recruiters
 */
import apiClient from './client';

// Dashboard Stats Interfaces
export interface JobPostingsStats {
  total: number;
  this_week: number;
  this_month: number;
}

export interface CandidatesStats {
  total: number;
  this_week: number;
  this_month: number;
}

export interface InterviewsStats {
  total: number;
  upcoming: number;
  this_week: number;
}

export interface CoffeeChatsStats {
  total: number;
  this_month: number;
}

export interface DashboardStats {
  job_postings: JobPostingsStats;
  candidates: CandidatesStats;
  interviews: InterviewsStats;
  coffee_chats: CoffeeChatsStats;
}

export interface RecentJobAnalytics {
  id: number;
  title: string;
  department: string;
  location: string;
  posted_date: string;
  status: string;
  views: number;
  applications: number;
  interviews: number;
  hires: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_jobs: RecentJobAnalytics[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
  error?: string;
}

export interface RealtimeMetrics {
  active_users: number;
  online_recruiters: number;
  active_jobs: number;
  pending_applications: number;
  scheduled_interviews: number;
  new_signups: number;
  messages_exchanged: number;
  successful_matches: number;
}

export interface PerformanceMetrics {
  application_success_rate: number;
  avg_time_to_hire_days: number;
  recruiter_efficiency: number;
  platform_satisfaction: number;
}

export interface HourlyActivity {
  hour: string;
  applications: number;
  views: number;
  messages: number;
}

export interface GeographicMetric {
  region: string;
  jobs: number;
  fill_rate: number;
  color: string;
}

export interface PlatformDashboardData {
  realtime: RealtimeMetrics;
  performance: PerformanceMetrics;
  hourly_activity: HourlyActivity[];
  geographic: GeographicMetric[];
}

export interface PlatformDashboardResponse {
  success: boolean;
  data?: PlatformDashboardData;
  error?: string;
}

/**
 * Dashboard API
 * Handles all dashboard-related API calls
 */
export const dashboardApi = {
  /**
   * Get comprehensive recruiter dashboard statistics
   * Returns aggregated stats for job postings, candidates, interviews, coffee chats,
   * and recent jobs with analytics
   */
  async getDashboardStats(): Promise<DashboardResponse> {
    const response = await apiClient.request('/jobposts/dashboard/stats/', {
      method: 'GET',
    });
    return response.json();
  },

  /**
   * Get platform-wide dashboard statistics for MetricsDashboard
   * Returns realtime, performance, hourly activity, and geographic data
   */
  async getPlatformStats(): Promise<PlatformDashboardResponse> {
    const response = await apiClient.request('/jobposts/platform/dashboard/', {
      method: 'GET',
    });
    return response.json();
  },
};

export default dashboardApi;
