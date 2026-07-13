import apiClient from './client';

// Queue represents a job queue based on (Industry, Job_Level) bucket
export interface Queue {
  id: string;
  title: string;
  description: string;
  industry: string;
  level: string;
  current: number;
  total: number;
  trend: 'up' | 'down' | 'stable';
  match: number;
  change: number;
  isAuto: boolean;
  userSelected: boolean;
  category: string;
  icon?: any;
  color?: string;
  // UI-specific fields for enhanced display
  estimatedRank?: number;
  totalInQueue?: number;
  avgSalary?: string;
  demandLevel?: 'High' | 'Medium' | 'Low';
  growthRate?: string;
  topCompanies?: string[];
  requiredSkills?: string[];
  timeToHire?: string;
  // Upgrade preview data (used for live profile upgrade simulation)
  upgradedCurrent?: number;
  upgradedMatch?: number;
  upgradedChange?: number;
  // Reason for queue suggestion
  reason?: string;
}

export interface BucketPrediction {
  industry: string;
  industry_probability: number;
  predicted_level: string;
  level_probability: number;
  isSelected: boolean;
}

export interface QueueCandidate {
  id: string;
  rank: number;
  name: string;
  score: number;
  change: number;
  location: string;
  avatar: string;
  trending: 'up' | 'down' | 'stable';
  isUser?: boolean;
  userId?: number | null;
  // Optional fields for enhanced display
  title?: string;
  company?: string;
  experience?: string;
  skills?: string[];
  strengths?: string[];
  certifications?: string[];
}



class QueueService {
  /**
   * Get my bucket (industry/level) prediction from candidate sort service
   * A "bucket" is the (Industry, Job_Level) classification that determines your queue
   */
  async getMyBucketPrediction(): Promise<{
    predicted_industry: string;
    predicted_level: string;
    industry_predictions: BucketPrediction[];
    total_experience_years: number;
  } | null> {
    try {
      console.log('[QueueService] Calling /candidates/candidate-sort/my-profile/');
      const response = await apiClient.request('/candidates/candidate-sort/my-profile/', {
        method: 'GET',
      });
      
      if (!response.ok) {
        console.error(`[QueueService] API returned status ${response.status}`);
        return null;
      }
      
      // Parse the JSON response
      const data = await response.json();
      
      if (!data) {
        console.warn('[QueueService] API returned null data');
        return null;
      }

      // Check if we have prediction data from saved CandidateSortPrediction
      const detailedResults = data.detailed_results;
      
      if (!detailedResults?.industry_predictions || detailedResults.industry_predictions.length === 0) {
        console.warn('[QueueService] No industry_predictions in detailed_results, cannot proceed');
        console.log('[QueueService] Falling back - checking if profile has industry/level set');
        
        // If no predictions, we can still return the profile's current industry/level
        if (data.predicted_industry && data.predicted_level) {
          console.log('[QueueService] Using profile industry/level as fallback');
          return {
            predicted_industry: data.predicted_industry,
            predicted_level: data.predicted_level,
            industry_predictions: [{
              industry: data.predicted_industry,
              industry_probability: 1,
              predicted_level: data.predicted_level,
              level_probability: 1,
              isSelected: true
            }],
            total_experience_years: data.total_experience_years || 0
          };
        }
        
        console.error('[QueueService] No predictions and no profile industry/level');
        return null;
      }

      // Map level predictions by industry for quick lookup
      const levelPredictionsByIndustry = new Map();
      if (detailedResults.level_predictions_by_industry) {
        detailedResults.level_predictions_by_industry.forEach((lp: any) => {
          levelPredictionsByIndustry.set(lp.industry, lp);
        });
        console.log('[QueueService] Mapped level predictions for', levelPredictionsByIndustry.size, 'industries');
      }

      // Transform backend response to BucketPrediction format
      const predictions: BucketPrediction[] = detailedResults.industry_predictions.map(
        (p: any) => {
          const levelPred = levelPredictionsByIndustry.get(p.industry);
          const predictedLevel = levelPred?.predicted_level || data.predicted_level || 'L3';
          const levelProbability = levelPred?.level_predictions?.[0]?.probability || 0.7;

          return {
            industry: p.industry,
            industry_probability: p.probability,
            predicted_level: predictedLevel,
            level_probability: levelProbability,
            isSelected: p.industry === data.predicted_industry
          };
        }
      ) || [];

      const result = {
        predicted_industry: data.predicted_industry,
        predicted_level: data.predicted_level,
        industry_predictions: predictions,
        total_experience_years: data.total_experience_years || 0
      };
      return result;
    } catch (error) {
      console.error('[QueueService] Failed to fetch bucket prediction:', error);
      return null;
    }
  }

  /**
   * Get ranked candidates for a bucket (industry/level group)
   * Uses candidate-rank service to rank profiles in the same bucket
   */
  async getBucketLeaderboard(industry: string, level: string, forceRefresh = false): Promise<QueueCandidate[]> {
    try {
      const response = await apiClient.request('/candidates/candidate-rank/rank-profiles/', {
        method: 'POST',
        body: JSON.stringify({
          job_industry: industry,
          job_level: level,
          top_k: 50,
          force_refresh: forceRefresh
        }),
      });
      const data = await response.json();
      const result = data?.result;
      if (!result?.candidates) return [];

      // Transform to QueueCandidate format
      return result.candidates.map((c: any, index: number) => ({
        id: c.profile_id?.toString() || `c-${index}`,
        rank: index + 1,
        name: c.candidate_info?.full_name || `Candidate #${index + 1}`,
        score: Math.round(c.score * 100),
        change: 0,
        location: 'Unknown',
        avatar: '',
        trending: 'stable',
        userId: c.user_id ?? null,
        title: c.candidate_info?.job_title || '',
        company: c.candidate_info?.current_company || '',
        experience: c.candidate_info?.years_exp ? `${c.candidate_info.years_exp} years` : '',
        skills: c.candidate_info?.skills || [],
        bio: c.candidate_info?.bio || '',
        education: c.candidate_info?.education || [],
        work_history: c.candidate_info?.work_history || [],
        industry: c.candidate_info?.industry || ''
      }));
    } catch (error) {
      console.error('Failed to fetch bucket leaderboard:', error);
      return [];
    }
  }

  /**
   * Get all available buckets (industry/level groups)
   * These are the available (Industry, Job_Level) combinations
   */
  async getAvailableBuckets(): Promise<Array<{
    industry: string;
    level: string;
    candidate_count: number;
  }>> {
    try {
      const response = await apiClient.request('/candidates/candidate-rank/groups/', {
        method: 'GET',
      });
      const data = await response.json();
      return data?.data?.groups || [];
    } catch (error) {
      console.error('Failed to fetch available buckets:', error);
      return [];
    }
  }

  /**
   * Update bucket (industry/level) for premium user
   * Uses candidate-sort update endpoint to change the user's bucket
   */
  async updateBucket(profileId: number, newIndustry: string, newLevel: string): Promise<boolean> {
    try {
      await apiClient.request(`/candidates/candidate-sort/profile/${profileId}/update/`, {
        method: 'POST',
        body: JSON.stringify({
          industry: newIndustry,
          exp_level: newLevel,
          apply_predictions: true
        }),
      });
      return true;
    } catch (error) {
      console.error('Failed to update bucket:', error);
      return false;
    }
  }

  /**
   * Re-run prediction on my profile (for bucket refresh)
   */
  async refreshMyBucketPrediction(): Promise<boolean> {
    try {
      await apiClient.request('/candidates/candidate-sort/predict-my-profile/', {
        method: 'POST',
      });
      return true;
    } catch (error) {
      console.error('Failed to refresh bucket prediction:', error);
      return false;
    }
  }

  /**
   * Alias for getAvailableBuckets - used by QueueSelector.tsx
   * Returns available queues (buckets) for selection
   */
  async getAvailableQueues(): Promise<Array<{
    industry: string;
    level: string;
    candidate_count: number;
  }>> {
    return this.getAvailableBuckets();
  }

  /**
   * Get the user's manually selected buckets (premium override)
   */
  async getSelectedBuckets(): Promise<{
    selected_buckets: Array<{ industry: string; level: string }>;
    selected_bucket_scores: Array<{ industry: string; level: string; industry_probability: number; level_probability: number }>;
    predicted_industry: string | null;
    predicted_level: string | null;
  } | null> {
    try {
      const response = await apiClient.request('/candidates/candidate-sort/selected-buckets/', {
        method: 'GET',
      });
      if (!response.ok) {
        console.error(`[QueueService] getSelectedBuckets returned status ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[QueueService] Failed to get selected buckets:', error);
      return null;
    }
  }

  /**
   * Update the user's manually selected buckets (premium override)
   * selectedBuckets: array of up to 4 { industry, level } objects
   */
  async updateSelectedBuckets(selectedBuckets: Array<{ industry: string; level: string }>): Promise<{
    success: boolean;
    selected_buckets: Array<{ industry: string; level: string }>;
    selected_bucket_scores: Array<{ industry: string; level: string; industry_probability: number; level_probability: number }>;
    predicted_industry: string | null;
    predicted_level: string | null;
  } | null> {
    try {
      const response = await apiClient.request('/candidates/candidate-sort/selected-buckets/', {
        method: 'PUT',
        body: JSON.stringify({ selected_buckets: selectedBuckets }),
      });
      if (!response.ok) {
        console.error(`[QueueService] updateSelectedBuckets returned status ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[QueueService] Failed to update selected buckets:', error);
      return null;
    }
  }

  /**
   * Get statistics for a specific bucket (industry/level group)
   */
  async getBucketStats(industry: string, level: string): Promise<{
    success: boolean;
    job_industry: string;
    job_level: string;
    candidate_count: number;
    years_stats: { mean: number | null; median: number | null; min: number | null; max: number | null };
    top_skills: Array<{ skill: string; count: number }>;
  } | null> {
    try {
      const response = await apiClient.request(
        `/candidates/candidate-rank/group-stats/?job_industry=${encodeURIComponent(industry)}&job_level=${encodeURIComponent(level)}`,
        { method: 'GET' }
      );
      if (!response.ok) {
        console.error(`[QueueService] getBucketStats returned status ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[QueueService] Failed to get bucket stats:', error);
      return null;
    }
  }

  /**
   * Get the authenticated user's match score against a specific bucket
   */
  async getMyBucketMatchScore(industry: string, level: string): Promise<{
    success: boolean;
    match_percentage: number;
    score_breakdown: Record<string, number>;
  } | null> {
    try {
      const response = await apiClient.request(
        `/candidates/candidate-rank/my-match-score/?industry=${encodeURIComponent(industry)}&level=${encodeURIComponent(level)}`,
        { method: 'GET' }
      );
      if (!response.ok) {
        console.error(`[QueueService] getMyBucketMatchScore returned status ${response.status}`);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('[QueueService] Failed to get my bucket match score:', error);
      return null;
    }
  }

  /**
   * Build a Queue object from backend data for a specific industry/level.
   * This is a metadata-only call; the ranked leaderboard is fetched separately
   * via getBucketLeaderboard to avoid triggering duplicate ML ranking work.
   */
  async getBucketDetails(industry: string, level: string): Promise<Partial<Queue> | null> {
    try {
      const [stats, buckets] = await Promise.all([
        this.getBucketStats(industry, level),
        this.getAvailableBuckets(),
      ]);

      const bucket = buckets.find(b => b.industry === industry && b.level === level);
      // stats.candidate_count is the live DB count for the bucket; fallback to
      // the groups endpoint count if stats are unavailable.
      const total = stats?.candidate_count ?? bucket?.candidate_count ?? 0;

      return {
        id: `${industry}-${level}`,
        title: industry,
        description: `${industry} professionals at ${level} level`,
        industry,
        level,
        total,
        trend: 'stable',
        isAuto: false,
        category: 'custom',
      };
    } catch (error) {
      console.error('[QueueService] Failed to get bucket details:', error);
      return null;
    }
  }
}

export const queueService = new QueueService();
