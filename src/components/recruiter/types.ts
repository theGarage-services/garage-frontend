/**
 * Shared types for Job Management components
 */

export type ViewType = 'list' | 'job-detail' | 'edit-job' | 'candidates' | 'results';
export type CandidateTab = 'ai-recommended' | 'manually-applied' | 'all-queue';

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

export interface QueueCandidateLocal {
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
  applicationDate?: string;
  applicationStatus: string;
  lastActivity: string;
  lastLogin?: string;
  joinedQueue: string;
  resume?: string;
  aiRecommendation?: {
    reason: string;
    strengths: string[];
    concerns: string[];
  };
  predicted_industry?: string;
  considerationRequestId?: number;
  scoreBreakdown?: ScoreBreakdown;
}

export interface WorkExperience {
  company: string;
  role: string;
  duration: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: any;
}

export interface HiringStage {
  name: string;
  completed: boolean;
  date: string | null;
}

export interface HiringProcess {
  currentStage: string;
  stages: HiringStage[];
}

export interface TheGarageProfile {
  joinedDate: string;
  isPremium: boolean;
  completedProjects: string[];
  education: Education[];
  workExperience: WorkExperience[];
  certifications: string[];
  portfolioUrl: string;
  githubUrl: string;
  linkedinUrl: string;
}

export interface Candidate {
  id: string;
  name: string;
  title: string;
  location: string;
  experience: string;
  avatar: string | null;
  skills: string[];
  currentCompany: string;
  applicationDate: string;
  applicationStatus: string;
  status?: string;
  lastActivity: string;
  resumeId: string;
  profileId: string;
  match_score?: number;
  theGarageProfile?: TheGarageProfile;
  hiringProcess?: HiringProcess;
  resume?: string;
  queuePosition?: number;
  matchScore?: number;
  isAIRecommended?: boolean;
  joinedQueue?: string;
  aiRecommendation?: {
    reason: string;
    strengths: string[];
    concerns: string[];
  };
  considerationStatus?: string;
  considerationMatchScore?: number;
  scoreBreakdown?: ScoreBreakdown;
}

export interface CandidatesData {
  'ai-recommended': QueueCandidateLocal[];
  'all-queue': QueueCandidateLocal[];
  'manually-applied': any[];
}

export interface RecruiterJobManagementProps {
  onNavigate: (view: string) => void;
  onLogout: () => void;
  user: any;
  onNavigateToCandidates?: (job: any) => void;
  setGlobalSelectedCandidate?: (candidate: any) => void;
}
