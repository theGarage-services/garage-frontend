export interface RecruiterCandidateProfilePageProps {
  candidate?: any;
  onBack: () => void;
  onNavigate?: (view: string) => void;
  onUpdateStatus?: (candidateId: string, status: string) => void;
  onScheduleInterview?: (candidate: any, interviewData: any) => void;
  onSendMessage?: (candidate: any) => void;
  onSaveNotes?: (candidateId: string, notes: any[]) => void;
  availableJobs?: any[];
  setSelectedCandidate?: (candidate: any) => void;
}

export interface ExperienceItem {
  title?: string;
  company?: string;
  location?: string;
  duration?: string;
  start_date?: string;
  end_date?: string;
  start_year?: string;
  end_year?: string;
  current?: boolean;
  description?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface EducationItem {
  id?: string;
  degree?: string;
  field?: string;
  school?: string;
  institution?: string;
  location?: string;
  year?: string;
  start_year?: string;
  end_year?: string;
  start_date?: string;
  end_date?: string;
  current?: boolean;
  gpa?: string;
  activities?: string;
}

export interface EducationDocument {
  id: number;
  education_index: number;
  document_type: 'transcript' | 'degree_certificate';
  file_url: string;
  uploaded_at: string;
}

export interface ExperienceDocument {
  id: number;
  work_history_index: number;
  document_type: 'employment_letter';
  file_url: string;
  uploaded_at: string;
}

export interface NoteItem {
  id: string;
  type: string;
  author: string;
  date: string;
  timestamp: string;
  content: string;
}
