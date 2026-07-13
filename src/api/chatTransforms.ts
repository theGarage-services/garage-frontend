/**
 * Chat data transformation utilities.
 * Transforms raw API responses into UI-ready contact/group formats.
 */
import type {
  Conversation,
  CoffeeChatRequest,
  ConsiderationRequest,
  RecruiterStats,
} from './chat';

// ─── Shared Types ───────────────────────────────────────────────────────────

export type MessageSender = 'job-seeker' | 'recruiter' | 'peer';

export type ApplicationMethod = 'manual' | 'auto' | 'recruiter-consideration' | 'quick-apply';

export interface CoffeeChatContact {
  id: string;
  name: string;
  avatar?: string;
  avatarFallback: string;
  position: string;
  company: string;
  isPremium?: boolean;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  contactType: 'recruiter' | 'job-seeker';
  // Recruiter-specific stats (optional)
  responseRate?: number;
  avgResponseTime?: string;
  successRate?: number;
  totalHires?: number;
}

export interface RecruiterContact {
  id: string;
  name: string;
  avatar?: string;
  avatarFallback: string;
  position: string;
  company: string;
  isPremium?: boolean;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  jobRole: string;
  jobId: string;
  applicationMethod: ApplicationMethod;
  initiatedBy: 'recruiter' | 'job-seeker';
  responseRate?: number;
  avgResponseTime?: string;
  successRate?: number;
  interviewRate?: number;
}

export interface CandidateContact {
  id: string;
  name: string;
  avatar?: string;
  avatarFallback: string;
  position: string;
  company: string;
  isPremium: boolean;
  isOnline: boolean;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  jobRole: string;
  jobId: string;
  applicationMethod: ApplicationMethod;
  initiatedBy: 'recruiter' | 'candidate';
  matchScore?: number;
}

export interface ConsiderationContact {
  id: string;
  considerationId: number;
  name: string;
  avatar?: string;
  avatarFallback: string;
  position: string;
  company: string;
  jobTitle: string;
  jobId: string;
  status: string;
  message: string;
  matchScore?: number;
  hasConversation: boolean;
  isPremium?: boolean;
  isOnline?: boolean;
}

export interface JobRoleGroup {
  roleTitle: string;
  roleId: string;
  company: string;
  totalConversations: number;
  unreadCount: number;
  applicationMethod: ApplicationMethod;
  recruiters: RecruiterContact[];
}

export interface CandidateRoleGroup {
  roleTitle: string;
  roleId: string;
  totalConversations: number;
  unreadCount: number;
  candidates: CandidateContact[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function buildAvatarFallback(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

function toContactType(role?: string): 'recruiter' | 'job-seeker' {
  return role === 'recruiter' ? 'recruiter' : 'job-seeker';
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function getContactType(
  contact: CoffeeChatContact | RecruiterContact | CandidateContact | ConsiderationContact
): MessageSender {
  if ('jobRole' in contact) return 'recruiter';
  if ('considerationId' in contact) return 'recruiter';
  if ('contactType' in contact) {
    return contact.contactType === 'recruiter' ? 'recruiter' : 'job-seeker';
  }
  return 'job-seeker';
}

// ─── Transform: Conversations → Coffee Chat Contacts ──────────────────────

const DEFAULT_COFFEE_CHAT_FILTERS = {
  showRecruiters: true,
  showJobSeekers: true,
};

export function transformConversationsToCoffeeChatContacts(
  conversations: Conversation[],
  searchQuery: string = '',
  filters?: { showRecruiters: boolean; showJobSeekers: boolean }
): CoffeeChatContact[] {
  const resolvedFilters = { ...DEFAULT_COFFEE_CHAT_FILTERS, ...filters };
  const contacts: CoffeeChatContact[] = conversations
    .filter((c) => c.conversation_type === 'coffee')
    .map((c) => {
      const other = c.other_participant || c.participants?.[0];
      const detail = c.participant_details?.find(
        (p) => p.user.id === other?.id
      );
      return {
        id: c.id.toString(),
        name: other?.full_name || other?.username || 'Unknown',
        avatar: other?.avatar || undefined,
        avatarFallback: buildAvatarFallback(
          other?.full_name || other?.username || '?'
        ),
        position: other?.role ? other.role.replaceAll('_', ' ') : 'Professional',
        company: c.job_details?.company || '',
        isOnline: detail?.is_online || false,
        lastMessage: c.last_message_preview || 'No messages yet',
        lastMessageTime: formatTime(c.last_message_at),
        unreadCount: c.unread_count || 0,
        contactType: toContactType(other?.role),
      };
    })
    .filter((contact) => {
      const sq = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name.toLowerCase().includes(sq) ||
        contact.position.toLowerCase().includes(sq);
      const matchesFilter =
        (resolvedFilters.showRecruiters && contact.contactType === 'recruiter') ||
        (resolvedFilters.showJobSeekers && contact.contactType === 'job-seeker');
      return matchesSearch && matchesFilter;
    });

  return contacts;
}

// ─── Transform: Conversations → Recruiters Grouped by Job ───────────────────

export function transformConversationsToRecruitersByRole(
  conversations: Conversation[],
  searchQuery: string = ''
): JobRoleGroup[] {
  const groups: JobRoleGroup[] = conversations
    .filter((c) => c.conversation_type === 'job')
    .reduce((acc: JobRoleGroup[], c) => {
      const roleTitle = c.job_details?.title || c.title || 'Unknown Position';
      const roleId = c.job_details?.id?.toString() || c.job?.toString() || c.id.toString();
      const company = c.job_details?.company || 'Unknown Company';

      let group = acc.find((g) => g.roleId === roleId);
      if (!group) {
        group = {
          roleTitle,
          roleId,
          company,
          totalConversations: 0,
          unreadCount: 0,
          applicationMethod: c.application_method || 'manual',
          // eslint-disable-next-line sonarjs/no-duplicated-branches
          recruiters: [],
        };
        acc.push(group);
      }

      const other = c.other_participant || c.participants?.[0];
      const detail = c.participant_details?.find((p) => p.user.id === other?.id);

      group.recruiters.push({
        id: c.id.toString(),
        name: other?.full_name || other?.username || 'Unknown',
        avatar: other?.avatar || undefined,
        avatarFallback: buildAvatarFallback(
          other?.full_name || other?.username || '?'
        ),
        position: other?.role || 'Recruiter',
        company,
        isOnline: detail?.is_online || false,
        lastMessage: c.last_message_preview || 'No messages yet',
        lastMessageTime: formatTime(c.last_message_at),
        unreadCount: c.unread_count || 0,
        jobRole: roleTitle,
        jobId: roleId,
        applicationMethod: c.application_method || 'manual',
        initiatedBy: (c.initiated_by || 'recruiter') as 'recruiter' | 'job-seeker',
      });

      group.totalConversations++;
      group.unreadCount += c.unread_count || 0;

      return acc;
    }, []);

  // Apply search filter
  return groups
    .map((roleGroup) => ({
      ...roleGroup,
      recruiters: roleGroup.recruiters.filter(
        (recruiter) =>
          recruiter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          recruiter.position.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((roleGroup) => roleGroup.recruiters.length > 0);
}

// ─── Transform: Received Considerations → Contacts ────────────────────────────

export function transformReceivedConsiderationsToContacts(
  considerations: ConsiderationRequest[]
): ConsiderationContact[] {
  return considerations.map((req) => {
    const recruiter = req.recruiter;
    return {
      id: req.conversation?.toString() || `consideration-${req.id}`,
      considerationId: req.id,
      name: recruiter?.full_name || recruiter?.username || 'Unknown Recruiter',
      avatar: recruiter?.avatar || undefined,
      avatarFallback: buildAvatarFallback(
        recruiter?.full_name || recruiter?.username || '?'
      ),
      position: 'Recruiter',
      company: req.job_details?.company || '',
      jobTitle: req.job_details?.title || 'Unknown Position',
      jobId: req.job?.toString() || req.job_details?.id?.toString() || '',
      status: req.status,
      message: req.message,
      matchScore: req.match_score,
      hasConversation: !!req.conversation,
      isPremium: recruiter?.is_premium || false,
      isOnline: false,
    };
  });
}

export function computeConsiderationUnreadCount(
  considerations: ConsiderationRequest[]
): number {
  return considerations.filter((c) => c.status === 'pending').length;
}

// ─── Transform: Received Coffee Chats → Contacts (Recruiter view) ───────────

export function transformReceivedCoffeeChatsToContacts(
  coffeeChats: CoffeeChatRequest[]
): CoffeeChatContact[] {
  return coffeeChats.map((req) => {
    const requester = req.requester;
    return {
      id: req.id.toString(),
      name: requester?.full_name || requester?.username || 'Unknown',
      avatar: requester?.avatar || undefined,
      avatarFallback: buildAvatarFallback(
        requester?.full_name || requester?.username || '?'
      ),
      position: requester?.role || 'Professional',
      company: '',
      isPremium: requester?.is_premium || false,
      isOnline: false,
      lastMessage: req.message,
      lastMessageTime: formatTime(req.created_at),
      unreadCount: 0,
      contactType: toContactType(requester?.role),
    };
  });
}

// ─── Transform: Conversations → Candidates Grouped by Job ───────────────────

const DEFAULT_CANDIDATE_FILTERS = {
  showRecruiterInitiated: true,
  showCandidateInitiated: true,
};

export function transformConversationsToCandidatesByRole(
  conversations: Conversation[],
  searchQuery: string = '',
  filters?: {
    showRecruiterInitiated: boolean;
    showCandidateInitiated: boolean;
  }
): CandidateRoleGroup[] {
  const resolvedFilters = { ...DEFAULT_CANDIDATE_FILTERS, ...filters };
  const groups: CandidateRoleGroup[] = conversations
    .filter((c) => c.conversation_type === 'job')
    .reduce((acc: CandidateRoleGroup[], c) => {
      const roleTitle = c.job_details?.title || c.title || 'Unknown Position';
      const roleId = c.job_details?.id?.toString() || c.job?.toString() || c.id.toString();

      let group = acc.find((g) => g.roleId === roleId);
      if (!group) {
        group = {
          roleTitle,
          roleId,
          totalConversations: 0,
          unreadCount: 0,
          candidates: [],
        };
        acc.push(group);
      }

      const other = c.other_participant || c.participants?.[0];

      group.candidates.push({
        id: c.id.toString(),
        name: other?.full_name || other?.username || 'Unknown',
        avatar: other?.avatar || undefined,
        avatarFallback: buildAvatarFallback(
          other?.full_name || other?.username || '?'
        ),
        position: other?.role ? other.role.replaceAll('_', ' ') : 'Candidate',
        company: c.job_details?.company || '',
        isPremium: other?.is_premium || false,
        isOnline: false,
        lastMessage: c.last_message_preview || 'No messages yet',
        lastMessageTime: formatTime(c.last_message_at),
        unreadCount: c.unread_count || 0,
        jobRole: roleTitle,
        jobId: roleId,
        applicationMethod: c.application_method || 'manual',
        initiatedBy: (c.initiated_by || 'candidate') as 'recruiter' | 'candidate',
      });

      group.totalConversations++;
      group.unreadCount += c.unread_count || 0;

      return acc;
    }, []);

  return groups
    .map((roleGroup) => ({
      ...roleGroup,
      candidates: roleGroup.candidates.filter((candidate) => {
        const sq = searchQuery.toLowerCase();
        const matchesSearch =
          candidate.name.toLowerCase().includes(sq) ||
          candidate.position.toLowerCase().includes(sq);
        const matchesFilter =
          (resolvedFilters.showRecruiterInitiated && candidate.initiatedBy === 'recruiter') ||
          (resolvedFilters.showCandidateInitiated && candidate.initiatedBy === 'candidate');
        return matchesSearch && matchesFilter;
      }),
    }))
    .filter((roleGroup) => roleGroup.candidates.length > 0);
}

// ─── Transform: Sent Considerations → Pending List ──────────────────────────

export function getPendingSentConsiderations(
  considerations: ConsiderationRequest[]
): ConsiderationRequest[] {
  return considerations.filter((s) => !s.conversation && s.status !== 'hired');
}

// ─── Unread Count Helpers ───────────────────────────────────────────────────

export function computeTotalCoffeeChatUnread(
  contacts: CoffeeChatContact[]
): number {
  return contacts.reduce((sum, c) => sum + c.unreadCount, 0);
}

export function computeTotalRoleGroupUnread(
  groups: JobRoleGroup[] | CandidateRoleGroup[]
): number {
  return groups.reduce((sum, g) => sum + g.unreadCount, 0);
}

// ─── Recruiter Stats Helpers ─────────────────────────────────────────────────

export function getRecruiterStats(contact: Record<string, any>, realStats?: RecruiterStats | null) {
  if (realStats) {
    return {
      responseRate: realStats.response_rate ?? 0,
      avgResponseTime: realStats.avg_response_time ?? 'N/A',
      successRate: realStats.success_rate ?? 0,
      fourthStat: {
        value: realStats.interview_rate ?? realStats.total_hires ?? 'N/A',
        label: realStats.interview_rate === undefined ? 'Total Hires' : 'Interview Rate',
        isPercentage: realStats.interview_rate !== undefined,
      },
    };
  }

  // Fallback to legacy contact properties (will all be 0 / 'N/A' until backend fills them)
  return {
    responseRate: contact.responseRate ?? 0,
    avgResponseTime: contact.avgResponseTime ?? 'N/A',
    successRate: contact.successRate ?? 0,
    fourthStat: {
      value: contact.interviewRate ?? contact.totalHires ?? 'N/A',
      label: contact.interviewRate === undefined ? 'Total Hires' : 'Interview Rate',
      isPercentage: contact.interviewRate !== undefined,
    },
  };
}
