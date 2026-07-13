import { candidateProfileService } from './candidateProfile';
import { initChatFromProfile, createCoffeeChatRequest, createConsiderationRequest } from './chat';

// ── Frontend data shapes for candidate profile sections ──

export interface ProfileAchievement {
  name: string;
  description?: string;
}

export interface ProfileTechnology {
  name: string;
  level?: string;
}

export interface ProfileSkill {
  name: string;
  level: number;
}

export interface ProfileEducation {
  degree: string;
  school: string;
  location: string;
  graduation: string;
  gpa: string | number;
  relevant: string[] | string;
}

export interface ProfileProject {
  name: string;
  github?: string;
  live?: string;
  description: string;
  technologies: string[];
}

export interface ProfileCertification {
  name: string;
  issuer: string;
  date: string;
  credentialId: string;
}

export interface ProfileExperience {
  title: string;
  company: string;
  location: string;
  duration: string;
  description: string;
  achievements: ProfileAchievement[];
  technologies: ProfileTechnology[];
}

// ── Normalise backend JSON fields to frontend shapes ──

/** Map backend work_history items to frontend Experience shape. */
export function mapWorkHistory(raw: any[]): ProfileExperience[] {
  return raw.map((job) => ({
    title: job.role || job.title || job.position || 'Unknown Position',
    company: job.company || 'Unknown Company',
    location: job.location || '',
    duration: job.duration || `${job.start_date || ''} – ${job.end_date || 'Present'}`,
    description: job.responsibilities || job.description || '',
    achievements: Array.isArray(job.achievements)
      ? job.achievements.map((a: any) => (typeof a === 'string' ? { name: a } : { name: a.name || '' }))
      : [],
    technologies: Array.isArray(job.technologies)
      ? job.technologies.map((t: any) => (typeof t === 'string' ? { name: t } : { name: t.name || '' }))
      : [],
  }));
}

/** Map backend education items to frontend Education shape. */
export function mapEducation(raw: any[]): ProfileEducation[] {
  return raw.map((edu) => ({
    degree: edu.degree || '',
    school: edu.institution || edu.school || '',
    location: edu.location || '',
    graduation: edu.graduation || edu.end_year || edu.end_date || '',
    gpa: edu.gpa || '',
    relevant: edu.relevant || edu.coursework || [],
  }));
}

/** Map backend project items to frontend Project shape. */
export function mapProjects(raw: any[]): ProfileProject[] {
  return raw.map((proj) => ({
    name: proj.name || '',
    description: proj.description || '',
    github: proj.github || proj.url || '',
    live: proj.live || proj.demo_url || proj.url || '',
    technologies: Array.isArray(proj.technologies) ? proj.technologies : (proj.tags || []),
  }));
}

/** Map backend certification items to frontend Certification shape. */
export function mapCertifications(raw: any[]): ProfileCertification[] {
  return raw.map((cert) => ({
    name: cert.name || '',
    issuer: cert.issuer || '',
    date: cert.issue_date || cert.date || '',
    credentialId: cert.credential_id || cert.credentialId || '',
  }));
}

// ── API operations ──

export interface ScheduleChatData {
  recipientId: number;
  message: string;
  meeting_type: 'virtual' | 'in-person';
  preferred_date: string;
  preferred_time: string;
  duration: string;
  location?: string;
  meeting_platform: string;
  custom_platform_link?: string;
}

export interface ConsiderationData {
  candidateId: number;
  jobId: number;
  message: string;
}

/**
 * Fetch a candidate's public profile by user ID.
 * Merges API response with optional fallback data (e.g. matchScore from queue state).
 */
export async function fetchPublicCandidateProfile(
  userId: number,
  fallbackData?: Record<string, unknown>
): Promise<{ success: boolean; data: Record<string, unknown> | null; error?: string }> {
  try {
    const response = await candidateProfileService.getPublicCandidateProfile(userId);
    if (response.success && response.data) {
      const apiData = response.data as Record<string, unknown>;
      const merged = fallbackData ? { ...fallbackData, ...apiData } : { ...apiData };
      merged.matchScore = apiData.matchScore ?? fallbackData?.matchScore ?? 0;
      return { success: true, data: merged };
    }
    return { success: false, data: null, error: 'Candidate profile not found' };
  } catch (err: any) {
    return { success: false, data: null, error: err?.message || 'Failed to load candidate profile' };
  }
}

/**
 * Start a direct chat with a candidate from their profile page.
 * Returns the conversation ID so the UI can navigate directly to it.
 */
export async function startChatWithCandidate(userId: number): Promise<{
  conversation_id: number;
  created: boolean;
}> {
  const result = await initChatFromProfile(userId);
  return {
    conversation_id: result.conversation_id,
    created: result.created,
  };
}

/**
 * Send a coffee-chat / schedule-chat request to a candidate.
 */
export async function scheduleCoffeeChat(data: ScheduleChatData): Promise<void> {
  await createCoffeeChatRequest({
    recipient: data.recipientId,
    message: data.message,
    meeting_type: data.meeting_type,
    preferred_date: data.preferred_date,
    preferred_time: data.preferred_time,
    duration: data.duration,
    location: data.location,
    meeting_platform: data.meeting_platform,
    custom_platform_link: data.custom_platform_link,
  });
}

/**
 * Send a job consideration request to a candidate.
 */
export async function sendJobConsideration(data: ConsiderationData): Promise<void> {
  await createConsiderationRequest({
    candidate: data.candidateId,
    job: data.jobId,
    message: data.message,
  });
}
