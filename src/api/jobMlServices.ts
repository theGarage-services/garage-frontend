/**
 * Job ML Services API
 * Handles ML service invocations for job posting workflow
 * - jobpost_sort_service: Predicts industry and experience level
 * - jobpost_rank_service: Filters and ranks candidates for a job
 */

import apiClient from './client';
import type { JobData } from './jobPosts';

// ML Prediction result types
export interface MLSortPredictions {
  predictedIndustry?: string;
  predictedLevel?: string;
  industryConfidence?: number;
  levelConfidence?: number;
}

export interface MLRankCandidate {
  id?: string;
  candidate_id?: string;
  candidate_name?: string;
  match_score?: number;
  score_breakdown?: {
    match_percentage?: number;
    composite_score?: number;
    semantic?: number;
    skill_jaccard?: number;
    education_score?: number;
    experience_score?: number;
    industry_alignment?: number;
    level_alignment?: number;
    skill_gaps?: string[];
  };
}

export interface MLRankResult {
  job_id: number;
  job_title: string;
  total_input_candidates: number;
  filtered_candidates_count: number;
  ranked_candidates: MLRankCandidate[];
  skipped_candidates: { candidate_id: string; reason: string }[];
}

// Invoke jobpost_sort_service to predict industry and level and save to database
export async function predictJobIndustryAndLevel(jobId: number, jobData: JobData): Promise<{
  success: boolean;
  data?: {
    predicted_industry: string;
    predicted_level: string;
    industry_confidence: number;
    level_confidence: number;
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
  };
  message?: string;
}> {
  try {
    // Validate required fields
    if (!jobData.title || !jobData.description || !jobData.workArrangement || !jobData.experienceLevel) {
      return {
        success: false,
        message: 'Missing required fields: title, description, workArrangement, or experienceLevel',
      };
    }

    // Call predict-and-save endpoint which saves predictions to JobPost model
    const response = await apiClient.request(`/jobposts/${jobId}/ml/predict-and-save/`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Failed to get ML predictions',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error in predictJobIndustryAndLevel:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Invoke jobpost_rank_service to filter and rank candidates
export async function rankCandidatesForJob(
  jobId: number,
  candidates: any[] = [],
  options?: { top_n?: number }
): Promise<{
  success: boolean;
  data?: MLRankResult;
  error?: string;
}> {
  try {
    const response = await apiClient.request('/jobposts/ml/rank/candidates/', {
      method: 'POST',
      body: JSON.stringify({
        job_id: jobId,
        candidates,
        top_n: options?.top_n || 10,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || 'Failed to rank candidates',
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error in rankCandidatesForJob:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

// Combined function to invoke jobpost_sort_service only
export async function invokeMLServicesForJob(
  jobId: number,
  jobData: JobData
): Promise<{
  success: boolean;
  sortResult?: {
    predictions: MLSortPredictions;
    rawData: any;
  };
  error?: string;
}> {
  try {
    // Invoke jobpost_sort_service to predict industry and level
    console.log('Invoking jobpost_sort_service for job:', jobId);
    const sortResponse = await predictJobIndustryAndLevel(jobId, jobData);

    if (!sortResponse.success) {
      return {
        success: false,
        error: `Sort service failed: ${sortResponse.message}`,
      };
    }

    const predictions: MLSortPredictions = {
      predictedIndustry: sortResponse.data?.predicted_industry || undefined,
      predictedLevel: sortResponse.data?.predicted_level || undefined,
      industryConfidence: sortResponse.data?.industry_confidence || undefined,
      levelConfidence: sortResponse.data?.level_confidence || undefined,
    };

    return {
      success: true,
      sortResult: {
        predictions,
        rawData: sortResponse.data,
      },
    };
  } catch (error) {
    console.error('Error invoking ML services:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}
