import apiClient from './client';

export interface ComparisonProfile {
  profile_id: number;
  user_id: number;
  name: string;
  avatar: string | null;
  job_title: string;
  current_company: string;
  bio: string;
  skills: string;
  education: any[];
  work_history: any[];
  certifications: any[];
  projects: any[];
  exp_level: string;
  industry: string;
  match_percentage: number;
  score_breakdown: Record<string, number>;
}

export interface ComparisonResult {
  score_difference: number;
  shared_skills: string[];
  current_only_skills: string[];
  compare_only_skills: string[];
  current_total_years: number;
  compare_total_years: number;
}

export interface ProfileComparisonResponse {
  success: boolean;
  current: ComparisonProfile;
  compare: ComparisonProfile;
  comparison: ComparisonResult;
}

export interface ComparisonSkillItem {
  name: string;
  you: number;
  them: number;
  required: number;
  advantage: 'you' | 'them' | 'even';
  gap: number;
}

export interface ComparisonExperience {
  totalYears: number;
  relevantYears: number;
  companies: string[];
  industries: string[];
  leadership: number;
  certifications: number;
}

export interface ComparisonInsight {
  type: 'strength' | 'improvement' | 'strategic' | 'opportunity';
  title: string;
  description: string;
  action: string;
}

export interface ComparisonData {
  currentName: string;
  currentAvatar: string | null;
  compareName: string;
  compareAvatar: string | null;
  overall: {
    yourScore: number;
    theirScore: number;
    difference: number;
    yourRank: number;
    theirRank: number;
    strengthAreas: string[];
    improvementAreas: string[];
  };
  skills: ComparisonSkillItem[];
  experience: {
    you: ComparisonExperience;
    them: ComparisonExperience;
  };
  insights: ComparisonInsight[];
}

function extractCompanies(workHistory: any[]): string[] {
  const companies = new Set<string>();
  workHistory.forEach((job) => {
    if (job?.company) companies.add(job.company);
  });
  return Array.from(companies);
}

function extractIndustries(workHistory: any[]): string[] {
  const industries = new Set<string>();
  workHistory.forEach((job) => {
    if (job?.industry) industries.add(job.industry);
  });
  return Array.from(industries);
}

function countLeadershipRoles(workHistory: any[]): number {
  let count = 0;
  const leadershipKeywords = ['lead', 'manager', 'director', 'head', 'principal', 'senior', 'architect'];
  workHistory.forEach((job) => {
    const title = (job?.title || '').toLowerCase();
    if (leadershipKeywords.some((kw) => title.includes(kw))) count++;
  });
  return count;
}

function buildSkillComparison(
  currentSkills: string,
  compareSkills: string
): ComparisonSkillItem[] {
  const allSkills = new Set<string>();
  currentSkills.split(',').forEach((s) => allSkills.add(s.trim().toLowerCase()));
  compareSkills.split(',').forEach((s) => allSkills.add(s.trim().toLowerCase()));

  return Array.from(allSkills)
    .filter((s) => s.length > 0)
    .map((skill) => {
      const currentHas = currentSkills.toLowerCase().includes(skill);
      const compareHas = compareSkills.toLowerCase().includes(skill);
      const you = currentHas ? 85 : 30;
      const them = compareHas ? 85 : 30;
      const advantage: 'you' | 'them' | 'even' =
        currentHas && !compareHas ? 'you' : compareHas && !currentHas ? 'them' : 'even';
      return {
        name: skill,
        you,
        them,
        required: 70,
        advantage,
        gap: Math.abs(you - them),
      };
    })
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 12);
}

function buildInsights(
  _current: ComparisonProfile,
  compare: ComparisonProfile,
  comparison: ComparisonResult
): ComparisonInsight[] {
  const insights: ComparisonInsight[] = [];

  if (comparison.shared_skills.length > 0) {
    insights.push({
      type: 'strength',
      title: 'Shared Skill Foundation',
      description: `You and ${compare.name} share ${comparison.shared_skills.length} skills, including ${comparison.shared_skills.slice(0, 3).join(', ')}.`,
      action: 'Leverage these shared skills in networking and collaborative opportunities.',
    });
  }

  if (comparison.compare_only_skills.length > 0) {
    insights.push({
      type: 'improvement',
      title: 'Skill Gap Opportunity',
      description: `${compare.name} has ${comparison.compare_only_skills.length} skills you do not currently list, such as ${comparison.compare_only_skills.slice(0, 3).join(', ')}.`,
      action: 'Consider upskilling in these areas to close the gap and improve your ranking.',
    });
  }

  const scoreDiff = comparison.score_difference;
  if (scoreDiff > 5) {
    insights.push({
      type: 'strategic',
      title: 'Ranking Gap Analysis',
      description: `${compare.name} scores ${scoreDiff.toFixed(1)} points higher than you for this bucket.`,
      action: 'Focus on improving semantic match and skill coverage to boost your score.',
    });
  } else if (scoreDiff < -5) {
    insights.push({
      type: 'strength',
      title: 'You Are Ahead',
      description: `You score ${Math.abs(scoreDiff).toFixed(1)} points higher than ${compare.name} for this bucket.`,
      action: 'Maintain your strengths and highlight them in your profile.',
    });
  }

  if (comparison.compare_total_years > comparison.current_total_years + 2) {
    insights.push({
      type: 'improvement',
      title: 'Experience Gap',
      description: `${compare.name} has significantly more work experience (${comparison.compare_total_years} vs ${comparison.current_total_years} years).`,
      action: 'Highlight project impact and leadership to compensate for fewer years.',
    });
  }

  if (insights.length === 0) {
    insights.push({
      type: 'strategic',
      title: 'Competitive Positioning',
      description: 'Your profiles are closely matched. Small optimizations can shift your ranking.',
      action: 'Refine your bio and work-history descriptions for stronger semantic alignment.',
    });
  }

  return insights;
}

export function buildComparisonData(
  response: ProfileComparisonResponse
): ComparisonData {
  const { current, compare, comparison } = response;

  const yourScore = Math.round(current.match_percentage);
  const theirScore = Math.round(compare.match_percentage);

  const skills = buildSkillComparison(current.skills, compare.skills);

  const insights = buildInsights(current, compare, comparison);

  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];

  if (current.score_breakdown.semantic > compare.score_breakdown.semantic) {
    strengthAreas.push('Semantic Profile Match');
  } else {
    improvementAreas.push('Semantic Profile Match');
  }

  if (current.score_breakdown.skill_coverage > compare.score_breakdown.skill_coverage) {
    strengthAreas.push('Skill Coverage');
  } else {
    improvementAreas.push('Skill Coverage');
  }

  if (current.score_breakdown.experience > compare.score_breakdown.experience) {
    strengthAreas.push('Experience Alignment');
  } else {
    improvementAreas.push('Experience Alignment');
  }

  return {
    currentName: current.name,
    currentAvatar: current.avatar,
    compareName: compare.name,
    compareAvatar: compare.avatar,
    overall: {
      yourScore,
      theirScore,
      difference: theirScore - yourScore,
      yourRank: 0,
      theirRank: 0,
      strengthAreas: strengthAreas.length ? strengthAreas : ['Competitive Profile'],
      improvementAreas: improvementAreas.length ? improvementAreas : ['Fine-tune Details'],
    },
    skills,
    experience: {
      you: {
        totalYears: comparison.current_total_years,
        relevantYears: comparison.current_total_years * 0.8,
        companies: extractCompanies(current.work_history),
        industries: [current.industry, ...extractIndustries(current.work_history)],
        leadership: countLeadershipRoles(current.work_history),
        certifications: current.certifications?.length || 0,
      },
      them: {
        totalYears: comparison.compare_total_years,
        relevantYears: comparison.compare_total_years * 0.8,
        companies: extractCompanies(compare.work_history),
        industries: [compare.industry, ...extractIndustries(compare.work_history)],
        leadership: countLeadershipRoles(compare.work_history),
        certifications: compare.certifications?.length || 0,
      },
    },
    insights,
  };
}

export async function compareProfiles(
  compareProfileId: number | null,
  compareUserId: number | null,
  industry: string,
  level: string
): Promise<{ success: boolean; data?: ComparisonData; error?: string }> {
  try {
    const body: Record<string, any> = { industry, level };
    if (compareProfileId != null) {
      body.compare_profile_id = compareProfileId;
    } else if (compareUserId != null) {
      body.compare_user_id = compareUserId;
    }
    const response = await apiClient.request('/candidates/candidate-rank/compare-profiles/', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to compare profiles');
    }

    const result: ProfileComparisonResponse = await response.json();
    if (!result.success) {
      throw new Error('Profile comparison returned unsuccessful');
    }

    return { success: true, data: buildComparisonData(result) };
  } catch (err: any) {
    console.error('Profile comparison error:', err);
    return { success: false, error: err?.message || 'Failed to compare profiles' };
  }
}
