export interface JobApplication {
  jobUrl: any;
  id: string;
  title: string;
  company: string;
  status: 'consider' | 'applied' | 'interviews' | 'offers' | 'hired' | 'rejected' | 'withdrawn';
  dateAdded: string;
  dateApplied: string;
  lastUpdated: string;
  location: string;
  salary: string;
  notes?: string;
  recruiterNotes?: string;
  interviewDate?: string;
  interviewType?: 'phone' | 'video' | 'onsite';
  interviewNotes?: string;
}
