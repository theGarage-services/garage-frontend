export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'job-seeker' | 'recruiter' | 'admin';
  avatar?: string;
  isInstitutionCreator?: boolean;
  institution?: Institution;
}

export interface Institution {
  id: string;
  institutionName: string;
  institutionType: string;
  industry: string;
  description: string;
  website: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  settings: {
    allowTeamInvites: boolean;
    requireApproval: boolean;
    jobPostingLimit: number;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  description: string;
  requirements: string[];
  benefits: string[];
  logo?: string;
  companyIndustry: string;
  companySize: string;
  workModel: string;
  companyRating: number;
  recruiter?: Recruiter;
  hasApplied?: boolean;
  applicationMethod?: 'manual' | 'quick-apply' | 'recruiter-consideration';
}

export interface Recruiter {
  id: string;
  name: string;
  title: string;
  yearsExperience: number;
  avatar?: string;
  contactInfo?: {
    email: string;
    phone: string;
  };
  candidateId?: string;
}

export interface TrackedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  type: string;
  applicationMethod: 'manual' | 'quick-apply' | 'recruiter-consideration';
  dateApplied: string;
  status: 'consider' | 'applied' | 'interviews' | 'offers' | 'hired' | 'rejected' | 'withdrawn';
  notes?: string;
  recruiterNotes?: string;
  logo?: string;
  recruiter?: Recruiter;
  fullJobData?: Job;
  hasRecruiterContact?: boolean;
  lastRecruiterMessage?: string;
  lastRecruiterMessageTime?: string;
  scheduledChatTime?: string;
  chatHistory?: ChatMessage[];
  interviewScheduled?: InterviewSchedule;
}

export interface ChatMessage {
  id: string;
  sender: 'recruiter' | 'candidate';
  message: string;
  timestamp: string;
  type: 'message' | 'consideration' | 'interview-scheduled';
}

export interface InterviewSchedule {
  date: string;
  time: string;
  type: 'video' | 'phone' | 'in-person';
  duration: string;
  recruiterMessage?: string;
}

export interface Queue {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
  candidateCount: number;
  isActive: boolean;
  requirements: string[];
  benefits: string[];
}

export type ViewType = 
  | 'homepage' 
  | 'job-tracker' 
  | 'profile' 
  | 'notifications' 
  | 'queue-selector' 
  | 'queue-detail' 
  | 'job-details' 
  | 'settings' 
  | 'support' 
  | 'report-issue' 
  | 'job-management' 
  | 'candidate-management' 
  | 'institution-profile' 
  | 'institution-management' 
  | 'join-institution' 
  | 'recruiter-profile' 
  | 'access-management' 
  | 'job-posting' 
  | 'job-candidates' 
  | 'candidate-profile' 
  | 'recruiter-chat' 
  | 'queue-sourcing' 
  | 'my-team' 
  | 'recruiter-stats' 
  | 'platform-overview' 
  | 'success-stories' 
  | 'metrics-dashboard' 
  | 'dual-demo' 
  | 'ecosystem-overview';