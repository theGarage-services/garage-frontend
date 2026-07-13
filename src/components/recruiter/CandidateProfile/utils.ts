import type { ExperienceItem } from './types';

export const formatMatchScore = (score: number | undefined | null): string => {
  if (score == null || Number.isNaN(score)) return '0';
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
};

export function getStageCircleClass(completed: boolean, isActive: boolean): string {
  if (completed) {
    return 'bg-green-500 text-white';
  }
  if (isActive) {
    return 'bg-[#ff6b35] text-white';
  }
  return 'bg-gray-200 text-gray-400';
}

export function getNoteBadgeClass(noteType: string): string {
  switch (noteType) {
    case 'positive':
      return 'border-green-500 text-green-700';
    case 'concern':
      return 'border-red-500 text-red-700';
    case 'technical':
      return 'border-blue-500 text-blue-700';
    case 'interview':
      return 'border-purple-500 text-purple-700';
    default:
      return 'border-gray-500 text-gray-700';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'consider': return 'bg-yellow-100 text-yellow-800';
    case 'applied': return 'bg-blue-100 text-blue-800';
    case 'interviews': return 'bg-purple-100 text-purple-800';
    case 'offers': return 'bg-emerald-100 text-emerald-800';
    case 'hired': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'withdrawn': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getStageDisplayName(stage: string): string {
  return stage.split('-').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

export function resolveImageUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;
  return rawUrl.startsWith('http')
    ? rawUrl
    : `${import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/?$/, '')}${rawUrl}`;
}

export const formatExperienceDate = (dateString?: string) => {
  if (!dateString) return '';
  const monthMatch = /^(\d{4})-(\d{2})$/.exec(dateString);
  if (monthMatch) {
    const year = Number(monthMatch[1]);
    const month = Number(monthMatch[2]) - 1;
    return new Date(year, month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  const date = new Date(dateString);
  if (!Number.isNaN(date.getTime())) {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }
  return dateString;
};

export const normalizeUrl = (url?: string) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
};

export const formatExperienceRange = (exp: ExperienceItem) => {
  if (exp.duration) return exp.duration;
  const start = formatExperienceDate(exp.start_date || exp.start_year);
  const end = exp.current ? 'Present' : formatExperienceDate(exp.end_date || exp.end_year);
  if (!start && !end) return '';
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
};

export function buildEnhancedCandidate(source: any) {
  const stageOrder = [
    'consider',
    'applied',
    'interviews',
    'offers',
    'hired'
  ];

  const currentStatus = source?.status || source?.applicationStatus || 'applied';
  const currentStageIndex = stageOrder.indexOf(currentStatus);

  const hiringStages = stageOrder.map((name, index) => ({
    name,
    completed: index <= currentStageIndex,
    date: index === 0 ? source?.appliedDate || null : null,
  }));

  return {
    id: source?.id || '',
    candidate_profile_id: source?.candidate_profile_id || null,
    name: source?.name || 'Unknown Candidate',
    email: source?.email || '',
    phone: source?.phone || '',
    title: source?.title || '',
    currentCompany: source?.current_company || source?.currentCompany || '',
    location: source?.location || '',
    experience: source?.experience || '',
    avatar: resolveImageUrl(source?.avatar || source?.profileImage) || '',
    matchScore: source?.matchScore ?? 0,
    applicationStatus: currentStatus,
    appliedDate: source?.appliedDate || null,
    lastActivity: source?.lastActivity || null,
    lastLogin: source?.lastLogin || null,
    salary: source?.salary || '',
    summary: source?.summary || '',
    skills: Array.isArray(source?.skills) ? source.skills : [],
    education: Array.isArray(source?.education) ? source.education : [],
    experience_detailed: Array.isArray(source?.experience_detailed) ? source.experience_detailed : [],
    socialLinks: source?.socialLinks || {},
    isPremium: source?.isPremium ?? false,
    premiumTier: source?.premiumTier || '',
    queueMetrics: source?.queueMetrics || null,
    analytics: source?.analytics || null,
    hiringStages,
    jobsApplied: Array.isArray(source?.jobsApplied) ? source.jobsApplied : [],
    resumeUrl: source?.resumeUrl || null,
    isSaved: source?.isSaved ?? false,
    scoreBreakdown: source?.scoreBreakdown || source?.score_breakdown || null,
    video_responses: source?.video_responses || source?.videoResponses || [],
  };
}

import { safeOpenWindow } from '@/utils/safe-url';

export function openDocumentPreview(fileUrl: string) {
  safeOpenWindow(fileUrl, '_blank', 'noopener,noreferrer');
}

export function downloadDocument(fileUrl: string, documentType: string) {
  const link = document.createElement('a');
  link.href = fileUrl;
  link.download = `${documentType}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function getDocumentsForEducation<T extends { education_index: number }>(educationDocuments: T[], index: number) {
  return educationDocuments.filter(doc => doc.education_index === index);
}

export function getDocumentsForExperience<T extends { work_history_index: number }>(experienceDocuments: T[], index: number) {
  return experienceDocuments.filter(doc => doc.work_history_index === index);
}
