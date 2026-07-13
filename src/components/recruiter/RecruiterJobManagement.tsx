import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ScheduleInterviewSheet } from '../calendar/ScheduleInterviewSheet';
import { jobManagementApi, type JobPosting } from '../../api/jobManagement';
import type { QueueCandidateLocal, CandidateTab, RecruiterJobManagementProps } from './types';
import {
  transformJobPosting,
  transformQueueCandidate,
  transformJobApplication,
  createCandidatesData,
  createFilteredJobs,
  handleFetchError,
  cleanJobDataForUpdate
} from './utils';
import {
  JobDetailView,
  EditJobView,
  CandidatesView,
  ListView
} from './views';
import { JobResultsView } from '../jobs/JobResultsView';
import { UpdateJobStatusModal } from '../jobs/UpdateJobStatusModal';

// Handler creators (extracted to reduce component complexity)
const createConsiderationRequestHandler = (
  selectedJob: any,
  fetchQueueCandidates: (id: number) => Promise<void>
) => async (candidate: any) => {
  if (!selectedJob) return;
  if (selectedJob.status !== 'published') {
    alert('Consideration requests can only be sent for published jobs.');
    return;
  }
  try {
    const response = await jobManagementApi.sendConsiderationRequest(
      Number.parseInt(candidate.id),
      selectedJob.id,
      `Hi ${candidate.name}, I came across your profile and think you'd be a great fit for our ${selectedJob.title} position.`,
      candidate.matchScore
    );
    if (response.success) {
      candidate.applicationStatus = 'consider';
      alert(`Consideration request sent to ${candidate.name}!`);
      fetchQueueCandidates(selectedJob.id);
    } else {
      alert(`Failed: ${response.error}`);
    }
  } catch (err: unknown) {
    console.error('[createConsiderationRequestHandler] Error:', err);
    alert(handleFetchError(err, 'Failed to send consideration request.'));
  }
};

const createAcceptConsiderationHandler = (
  selectedJob: any,
  fetchQueueCandidates: (id: number) => Promise<void>
) => async (candidate: any, videoResponseIds?: number[]) => {
  if (!candidate.considerationRequestId) {
    alert('No consideration request found for this candidate.');
    return;
  }
  try {
    const response = await jobManagementApi.acceptConsiderationRequest(candidate.considerationRequestId, '', videoResponseIds);
    if (response.success) {
      alert(`Consideration accepted for ${candidate.name}`);
      if (selectedJob) fetchQueueCandidates(selectedJob.id);
    } else {
      alert(`Failed: ${response.error}`);
    }
  } catch (err: any) {
    console.error('Failed to accept consideration request', err);
    alert('Failed to accept consideration request');
  }
};

const createWithdrawConsiderationHandler = (
  fetchQueueCandidates: (id: number) => Promise<void>,
  selectedJob: any
) => async (candidate: any) => {
  if (!candidate.considerationRequestId) {
    alert('No consideration request to withdraw.');
    return;
  }
  try {
    const response = await jobManagementApi.withdrawConsiderationRequest(candidate.considerationRequestId);
    if (response.success) {
      alert(`Consideration request withdrawn from ${candidate.name}.`);
      if (selectedJob) fetchQueueCandidates(selectedJob.id);
    } else {
      alert(`Failed: ${response.error}`);
    }
  } catch (err: unknown) {
    console.error('[createWithdrawConsiderationHandler] Error:', err);
    alert('Failed to withdraw consideration request.');
  }
};

const createRevokeApplicationHandler = (
  fetchManuallyAppliedCandidates: (id: number) => Promise<void>,
  selectedJob: any
) => async (candidate: any) => {
  if (!candidate.originalId) {
    alert('No application to revoke.');
    return;
  }
  if (!confirm(`Are you sure you want to revoke the application from ${candidate.name}?`)) {
    return;
  }
  try {
    const response = await jobManagementApi.revokeApplication(candidate.originalId);
    if (response.success) {
      alert(`Application revoked from ${candidate.name}.`);
      if (selectedJob) fetchManuallyAppliedCandidates(selectedJob.id);
    } else {
      alert(`Failed: ${response.error}`);
    }
  } catch (err: unknown) {
    console.error('[createRevokeApplicationHandler] Error:', err);
    alert('Failed to revoke application.');
  }
};

type ViewType = 'list' | 'job-detail' | 'edit-job' | 'candidates' | 'results';

const createDeleteJobHandler = (
  editingJob: any,
  setCurrentView: (view: ViewType) => void,
  setSelectedJob: (job: any) => void,
  setEditingJob: (job: null) => void,
  fetchJobPostings: () => Promise<void>
) => async () => {
  if (!editingJob) return;
  if (!confirm('Are you sure you want to delete this job post? This action cannot be undone.')) {
    return;
  }
  try {
    const response = await jobManagementApi.deleteJobPosting(editingJob.id);
    if (response.success) {
      setCurrentView('list');
      setSelectedJob(null);
      setEditingJob(null);
      fetchJobPostings();
    } else {
      alert(`Failed: ${response.error}`);
    }
  } catch (err) {
    console.error('[createDeleteJobHandler] Error:', err);
    alert('Failed to delete job post.');
  }
};

const createSaveJobHandler = (
  editingJob: any,
  setCurrentView: (view: ViewType) => void,
  setSelectedJob: (job: any) => void,
  setEditingJob: (job: null) => void,
  fetchJobPostings: () => Promise<void>
) => async () => {
  if (!editingJob) return;
  try {
    const cleanedData = cleanJobDataForUpdate(editingJob);
    const response = await jobManagementApi.updateJobPosting(editingJob.id, cleanedData);
    if (response.success) {
      setCurrentView('job-detail');
      setSelectedJob(editingJob);
      setEditingJob(null);
      fetchJobPostings();
    } else {
      const errorMsg = response.error || (response as any).errors ? JSON.stringify((response as any).errors) : 'Unknown error';
      alert(`Failed: ${errorMsg}`);
    }
  } catch (err) {
    console.error('[createSaveJobHandler] Error:', err);
    alert('Failed to save job.');
  }
};

const createJobStatusUpdateHandler = (
  jobStatusUpdateTarget: any,
  setShowJobStatusUpdate: (show: boolean) => void,
  setJobStatusUpdateTarget: (target: null) => void,
  fetchJobPostings: () => Promise<void>
) => async (updatedStatus: any) => {
  if (!jobStatusUpdateTarget) return;
  try {
    const response = await jobManagementApi.updateJobHiringStatus(jobStatusUpdateTarget.id, updatedStatus);
    if (response.success) {
      jobStatusUpdateTarget.hiringStatus = updatedStatus;
      fetchJobPostings();
    }
  } catch {
    alert('Failed to update job status.');
  }
  setShowJobStatusUpdate(false);
  setJobStatusUpdateTarget(null);
};

export function RecruiterJobManagement({ onNavigate, onLogout, user, setGlobalSelectedCandidate }: Readonly<RecruiterJobManagementProps>) {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('active');
  const [currentView, setCurrentView] = useState<'list' | 'job-detail' | 'edit-job' | 'candidates' | 'results'>('list');
  const [editingJob, setEditingJob] = useState<any>(null);
  const [candidateTab, setCandidateTab] = useState<CandidateTab>('ai-recommended');
  const [showInterviewSheet, setShowInterviewSheet] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState<any>(null);
  const [showJobStatusUpdate, setShowJobStatusUpdate] = useState(false);
  const [jobStatusUpdateTarget, setJobStatusUpdateTarget] = useState<any>(null);

  // Data states
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [queueCandidates, setQueueCandidates] = useState<QueueCandidateLocal[]>([]);
  const [aiRecommendedCandidates, setAiRecommendedCandidates] = useState<QueueCandidateLocal[]>([]);
  const [manuallyAppliedCandidates, setManuallyAppliedCandidates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();

  // Fetch job postings on mount
  useEffect(() => { fetchJobPostings(); }, []);

  // Pre-select job from URL query param after jobs are loaded
  useEffect(() => {
    const jobIdFromUrl = searchParams.get('job_id');
    if (!jobIdFromUrl || jobPostings.length === 0) return;

    const jobId = Number.parseInt(jobIdFromUrl, 10);
    const job = jobPostings.find((j) => j.id === jobId);
    if (job) {
      setSelectedJob(job);
      setCurrentView('job-detail');
    }
  }, [jobPostings, searchParams]);

  // Fetch candidates when entering candidates view
  useEffect(() => {
    if (currentView === 'candidates' && selectedJob) {
      fetchQueueCandidates(selectedJob.id);
      fetchManuallyAppliedCandidates(selectedJob.id);
    }
  }, [currentView, selectedJob?.id]);

  // Fetch functions
  const fetchJobPostings = async () => {
    setIsLoading(true);
    try {
      const response = await jobManagementApi.getJobPostings();
      if (response.success && response.data) {
        setJobPostings(response.data.map(transformJobPosting));
        setError(null);
      } else {
        setError(response.error || 'Failed to load job postings');
      }
    } catch (err) {
      setError(handleFetchError(err, 'Failed to load job postings'));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQueueCandidates = async (jobId: number) => {
    setIsLoadingCandidates(true);
    try {
      const response = await jobManagementApi.getQueueCandidates(jobId, true, 10);
      if (response.success) {
        const transformedAi = response.ai_recommended.map(transformQueueCandidate);
        const transformedAll = response.all_queue.map(transformQueueCandidate);
        setAiRecommendedCandidates(transformedAi);
        setQueueCandidates(transformedAll);
      } else {
        console.warn('[fetchQueueCandidates] Backend returned success=false:', response);
      }
    } catch (err) {
      console.error('Error loading queue candidates:', err);
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  const fetchManuallyAppliedCandidates = async (jobId: number) => {
    try {
      const response = await jobManagementApi.getJobApplications(jobId);
      if (response.success && response.data) {
        setManuallyAppliedCandidates(response.data.map(transformJobApplication));
      }
    } catch (err) {
      console.error('Error loading job applications:', err);
    }
  };

  // Computed data
  const candidatesData = createCandidatesData(aiRecommendedCandidates, queueCandidates, manuallyAppliedCandidates, selectedJob?.industry);
  const filteredJobs = createFilteredJobs(jobPostings, searchQuery, filterStatus, activeTab);

  // Handler functions
  const handleViewJob = (job: any) => {
    setSelectedJob(job);
    setCurrentView('job-detail');
  };

  const handleEditJob = (job: any) => {
    setEditingJob({ ...job });
    setCurrentView('edit-job');
  };

  const handleSaveJob = createSaveJobHandler(editingJob, setCurrentView, setSelectedJob, setEditingJob, fetchJobPostings);
  const handleDeleteJob = createDeleteJobHandler(editingJob, setCurrentView, setSelectedJob, setEditingJob, fetchJobPostings);

  const handleViewCandidates = (job: any) => {
    setSelectedJob(job);
    setCurrentView('candidates');
  };

  const handleViewResults = (job: any) => {
    setSelectedJob(job);
    setCurrentView('results');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedJob(null);
    setEditingJob(null);
  };

  const handleSendMessage = (candidate: any) => {
    alert(`Opening message thread with ${candidate.name}`);
  };

  const handleViewProfile = (candidate: any) => {
    setGlobalSelectedCandidate?.(candidate);
    const jobQuery = selectedJob?.id == null ? '' : `?job_id=${selectedJob.id}`;
    onNavigate?.(`/recruiter/candidates/${candidate.id}${jobQuery}`);
  };

  const handleScheduleInterview = (candidate: any) => {
    setInterviewCandidate(candidate);
    setShowInterviewSheet(true);
  };

  const handleUpdateJobStatus = (job: any) => {
    setJobStatusUpdateTarget(job);
    setShowJobStatusUpdate(true);
  };

  const handleJobStatusUpdate = createJobStatusUpdateHandler(
    jobStatusUpdateTarget,
    setShowJobStatusUpdate,
    setJobStatusUpdateTarget,
    fetchJobPostings
  );

  const handleSendConsiderationRequest = createConsiderationRequestHandler(selectedJob, fetchQueueCandidates);
  const handleAcceptConsiderationRequest = createAcceptConsiderationHandler(selectedJob, fetchQueueCandidates);
  const handleWithdrawConsiderationRequest = createWithdrawConsiderationHandler(fetchQueueCandidates, selectedJob);
  const handleRevokeApplication = createRevokeApplicationHandler(fetchManuallyAppliedCandidates, selectedJob);

  const handleFlagFraud = (candidate: any) => {
    setAiRecommendedCandidates(prev => prev.filter(c => c.id !== candidate.id));
    setQueueCandidates(prev => prev.filter(c => c.id !== candidate.id));
    setManuallyAppliedCandidates(prev => prev.filter(c => c.id !== candidate.id));
  };

  // View rendering
  switch (currentView) {
    case 'results':
      if (!selectedJob) break;
      return (
        <>
          <JobResultsView
            job={selectedJob}
            onBack={handleBackToList}
            onViewProfile={(candidate: any) => {
              handleViewProfile(candidate);
            }}
          />
          {showJobStatusUpdate && jobStatusUpdateTarget && (
            <UpdateJobStatusModal
              job={jobStatusUpdateTarget}
              onClose={() => {
                setShowJobStatusUpdate(false);
                setJobStatusUpdateTarget(null);
              }}
              onUpdate={handleJobStatusUpdate}
            />
          )}
        </>
      );

    case 'job-detail':
      if (!selectedJob) break;
      return (
        <JobDetailView
          selectedJob={selectedJob}
          handleBackToList={handleBackToList}
          handleEditJob={handleEditJob}
          handleViewCandidates={handleViewCandidates}
          handleUpdateJobStatus={handleUpdateJobStatus}
          handleViewResults={handleViewResults}
          showJobStatusUpdate={showJobStatusUpdate}
          jobStatusUpdateTarget={jobStatusUpdateTarget}
          setShowJobStatusUpdate={setShowJobStatusUpdate}
          setJobStatusUpdateTarget={setJobStatusUpdateTarget}
          handleJobStatusUpdate={handleJobStatusUpdate}
        />
      );

    case 'edit-job':
      if (!editingJob) break;
      return (
        <EditJobView
          editingJob={editingJob}
          setEditingJob={setEditingJob}
          setCurrentView={setCurrentView}
          handleSaveJob={handleSaveJob}
          handleDeleteJob={handleDeleteJob}
          showJobStatusUpdate={showJobStatusUpdate}
          jobStatusUpdateTarget={jobStatusUpdateTarget}
          setShowJobStatusUpdate={setShowJobStatusUpdate}
          setJobStatusUpdateTarget={setJobStatusUpdateTarget}
          handleJobStatusUpdate={handleJobStatusUpdate}
        />
      );

    case 'candidates':
      if (!selectedJob) break;
      return (
        <>
          <CandidatesView
            selectedJob={selectedJob}
            candidatesData={candidatesData}
            queueCandidates={queueCandidates}
            aiRecommendedCandidates={aiRecommendedCandidates}
            isLoadingCandidates={isLoadingCandidates}
            candidateTab={candidateTab}
            setCandidateTab={setCandidateTab}
            handleBackToList={handleBackToList}
            handleViewProfile={handleViewProfile}
            handleSendMessage={handleSendMessage}
            handleSendConsiderationRequest={handleSendConsiderationRequest}
            handleAcceptConsiderationRequest={handleAcceptConsiderationRequest}
            handleWithdrawConsiderationRequest={handleWithdrawConsiderationRequest}
            handleRevokeApplication={handleRevokeApplication}
            handleScheduleInterview={handleScheduleInterview}
            onFlagFraud={handleFlagFraud}
            showJobStatusUpdate={showJobStatusUpdate}
            jobStatusUpdateTarget={jobStatusUpdateTarget}
            setShowJobStatusUpdate={setShowJobStatusUpdate}
            setJobStatusUpdateTarget={setJobStatusUpdateTarget}
            handleJobStatusUpdate={handleJobStatusUpdate}
          />
          {showInterviewSheet && interviewCandidate && (
            <ScheduleInterviewSheet
              open={showInterviewSheet}
              onOpenChange={(open) => setShowInterviewSheet(open)}
              candidate={interviewCandidate}
            />
          )}
        </>
      );

    case 'list':
    default:
      return (
        <ListView
          user={user}
          onNavigate={onNavigate}
          onLogout={onLogout}
          filteredJobs={filteredJobs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isLoading={isLoading}
          error={error}
          handleViewJob={handleViewJob}
          fetchJobPostings={fetchJobPostings}
        />
      );
  }
}

export default RecruiterJobManagement;
