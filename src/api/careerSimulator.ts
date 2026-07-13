import apiClient from './client';

export interface SimulationInput {
  target_industry?: string;
  target_level?: string;
  hypothetical_skills?: string[];
}

export interface ScoreBreakdown {
  semantic: number;
  skill_coverage: number;
  experience: number;
  confidence: number;
  education: number;
  industry_alignment: number;
  level_alignment: number;
  composite_score: number;
}

export interface ScenarioResult {
  success: boolean;
  industry?: string;
  level?: string;
  match_percentage?: number;
  score_breakdown?: ScoreBreakdown;
  candidate_info?: Record<string, any>;
  error?: string;
}

export interface SkillGapResult {
  success: boolean;
  coverage: number;
  gaps: string[] | Array<[string, number]>; // Can be strings or [skill, similarity] tuples
  required_skills: string[];
  candidate_skill_count: number;
  required_skill_count: number;
  error?: string;
}

export interface MarketContext {
  industry: string;
  level: string;
  candidate_count: number;
  score_mean: number;
  score_median: number;
  score_std: number;
  top_skills: { skill: string; count: number }[];
}

export interface SuggestedTarget {
  industry: string;
  level: string | null;
  industry_probability: number;
}

export interface SimulationResult {
  success: boolean;
  current: ScenarioResult;
  next: ScenarioResult;
  dream: ScenarioResult;
  dream_baseline: ScenarioResult;
  match_delta: number | null;
  skill_gaps: SkillGapResult;
  profile_years: number | null;
  target_years: number;
  timeline_years: number | null;
  market_context: MarketContext | null;
  suggested_targets: SuggestedTarget[];
  target_industry: string;
  target_level: string;
  baseline_match_percentage: number | null;
  error?: string;
}

export interface Milestone {
  id: number;
  title: string;
  description?: string;
  target_date?: string;
  chapter: 'current' | 'next' | 'dream';
  origin: 'ai_generated' | 'user_edited';
  completed: boolean;
  completed_at?: string;
  required_skills: string[];
  recommendations: string[];
  created_at?: string;
  updated_at?: string;
}

export interface MilestoneInput {
  title: string;
  description?: string;
  target_date?: string;
  chapter: 'current' | 'next' | 'dream';
  completed?: boolean;
  required_skills?: string[];
  recommendations?: string[];
}

export interface CareerChapterSummary {
  current_chapter: string;
  next_chapter: string;
  dream_chapter: string;
  updated_at?: string;
}

export type CareerChapterSummaryInput = Partial<CareerChapterSummary>;

class CareerSimulatorApi {
  async simulate(input: SimulationInput = {}): Promise<SimulationResult> {
    const response = await apiClient.request('/candidates/career-simulate/', {
      method: 'POST',
      body: JSON.stringify({
        target_industry: input.target_industry,
        target_level: input.target_level,
        hypothetical_skills: input.hypothetical_skills || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Career simulation failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async applySimulation(input: SimulationInput = {}): Promise<SimulationResult & { milestones_created: number }> {
    const response = await apiClient.request('/candidates/career-simulate/apply/', {
      method: 'POST',
      body: JSON.stringify({
        target_industry: input.target_industry,
        target_level: input.target_level,
        hypothetical_skills: input.hypothetical_skills || [],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Apply career simulation failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getMilestones(chapter?: string): Promise<Milestone[]> {
    const query = chapter ? `?chapter=${encodeURIComponent(chapter)}` : '';
    const response = await apiClient.request(`/candidates/career-milestones/${query}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch milestones: ${response.status}`);
    }

    const data = await response.json();
    return data.milestones || [];
  }

  async createMilestone(milestone: MilestoneInput): Promise<{ id: number; success: boolean }> {
    const response = await apiClient.request('/candidates/career-milestones/', {
      method: 'POST',
      body: JSON.stringify(milestone),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create milestone: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async updateMilestone(
    milestoneId: number,
    updates: Partial<MilestoneInput> & { completed?: boolean }
  ): Promise<{ success: boolean }> {
    const response = await apiClient.request(`/candidates/career-milestones/${milestoneId}/`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update milestone: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async deleteMilestone(milestoneId: number): Promise<{ success: boolean }> {
    const response = await apiClient.request(`/candidates/career-milestones/${milestoneId}/`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete milestone: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  async getChapterSummary(): Promise<CareerChapterSummary> {
    const response = await apiClient.request('/candidates/career-chapter-summary/', {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chapter summary: ${response.status}`);
    }

    return response.json();
  }

  async updateChapterSummary(updates: CareerChapterSummaryInput): Promise<CareerChapterSummary> {
    const response = await apiClient.request('/candidates/career-chapter-summary/', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update chapter summary: ${response.status} ${errorText}`);
    }

    return response.json();
  }
}

export const careerSimulatorApi = new CareerSimulatorApi();
