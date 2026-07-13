import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { safeOpenWindow } from '@/utils/safe-url';
import { getJobInterviews, type Interview } from '@/api/interviews';
import { jobPostsApi, normalizeJobData, transformJobData, type PromptResponse } from '../../../api/jobPosts';
import { candidateProfileService } from '../../../api/candidateProfile';
import { recruiterProfileService, buildProfileImageUrl } from '../../../api/recruiterProfile';
import { declineConsideration } from '../../../api/chat';

async function fetchRecruiterData(recruiterId: number, department: string | null) {
  try {
    const r = await recruiterProfileService.getPublicProfile(recruiterId);
    if (r) {
      return {
        id: String(recruiterId),
        name: r.name,
        title: r.title,
        company: r.company || department || '',
        avatar: buildProfileImageUrl(r.avatar),
        yearsExperience: 5,
        linkedinUrl: r.linkedin,
        contactInfo: { email: r.email || '', phone: '' }
      };
    }
  } catch (err) {
    console.error('Failed to fetch recruiter profile:', err);
  }
  return undefined;
}

export function useJobDetails(jobProp: any, onJobApplication?: (job: any, method: string) => void) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const [jobData, setJobData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!jobProp);
  const [error, setError] = useState<string | null>(null);
  const [jobNotes, setJobNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [pendingConsideration, setPendingConsideration] = useState<{ id: number; status: string; message: string } | null>(null);
  const [scheduledInterviews, setScheduledInterviews] = useState<Interview[]>([]);
  const [videoResponses, setVideoResponses] = useState<PromptResponse[]>([]);

  // Load job data from prop, router state, or API
  useEffect(() => {
    // Use prop or router state as temporary placeholder while API loads
    if (jobProp) {
      setJobData(normalizeJobData(jobProp));
    } else if (location.state?.job) {
      setJobData(normalizeJobData(location.state.job));
    }

    if (!id) {
      setError('No job ID provided');
      setIsLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const response = await jobPostsApi.getJobPostById(Number(id));
        if (!response.success || !response.data) {
          setError('Failed to load job details');
          return;
        }
        const apiJob = response.data;
        const recruiterData = apiJob.recruiter
          ? await fetchRecruiterData(apiJob.recruiter, apiJob.department)
          : undefined;
        setJobData(transformJobData(apiJob, recruiterData));
      } catch (err: any) {
        console.error('Error fetching job:', err);
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id, jobProp, location.state?.job]);

  // Load job notes
  useEffect(() => {
    if (!jobData?.id) return;
    jobPostsApi.getJobNotes(jobData.id)
      .then(result => {
        if (result.success && result.data) setJobNotes(result.data.notes || '');
      })
      .catch(err => console.error('Failed to load job notes:', err));
  }, [jobData?.id]);

  // Load scheduled interviews
  useEffect(() => {
    if (!jobData?.id) return;
    getJobInterviews(Number.parseInt(jobData.id, 10))
      .then(interviews => setScheduledInterviews(interviews))
      .catch(err => console.error('Failed to fetch scheduled interviews:', err));
  }, [jobData?.id]);

  // Load candidate's uploaded video responses for this job
  useEffect(() => {
    if (!jobData?.id) return;
    jobPostsApi.getMyPromptResponses(Number(jobData.id))
      .then(result => {
        if (result.success) {
          setVideoResponses(result.data);
        } else {
          setVideoResponses([]);
        }
      })
      .catch(err => {
        console.error('Failed to fetch video responses:', err);
        setVideoResponses([]);
      });
  }, [jobData?.id]);

  // Load pending consideration
  useEffect(() => {
    if (!jobData?.id) return;

    if (jobData.hasPendingConsideration && jobData.pendingConsiderationId) {
      setPendingConsideration({
        id: jobData.pendingConsiderationId,
        status: 'pending',
        message: jobData.pendingConsiderationMessage || ''
      });
      return;
    }

    candidateProfileService.getReceivedConsiderationRequestsForJob(Number(jobData.id))
      .then(result => {
        if (result.success && result.data.length > 0) {
          const consideration = result.data.find((c: any) => c.status === 'pending')
            || result.data.find((c: any) => c.status === 'accepted')
            || result.data[0];
          setPendingConsideration({
            id: consideration.id,
            status: consideration.status,
            message: consideration.message
          });
        } else {
          setPendingConsideration(null);
        }
      })
      .catch(err => {
        console.error('Error fetching consideration requests:', err);
        setPendingConsideration(null);
      });
  }, [jobData?.id]);

  const handleSaveNotes = useCallback(async (notes: string) => {
    if (!jobData?.id) return;
    setIsSavingNotes(true);
    try {
      await jobPostsApi.saveJobNotes(jobData.id, notes);
      setJobNotes(notes);
    } catch (err) {
      console.error('Failed to save job notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  }, [jobData?.id]);

  const handleJoinCall = useCallback((meetingUrl: string) => {
    safeOpenWindow(meetingUrl, '_blank');
  }, []);

  const handleAcceptInterest = useCallback(async (videoResponseIds?: number[]) => {
    if (pendingConsideration?.status !== 'pending' || !jobData) {
      return { success: false, error: 'No pending consideration' };
    }
    try {
      const result = await candidateProfileService.acceptConsiderationRequest(
        pendingConsideration.id,
        'Thank you for your interest! I would like to proceed.',
        videoResponseIds
      );
      if (result.requires_video_prompts) {
        return {
          success: false,
          requiresVideoPrompts: true,
          missingPromptIds: result.missing_prompt_ids || []
        };
      }
      if (result.success) {
        setPendingConsideration(null);
        setJobData({
          ...jobData,
          hasApplied: true, isApplied: true,
          applicationMethod: 'recruiter-consideration',
          hasPendingConsideration: false,
          pendingConsiderationId: null,
          pendingConsiderationMessage: null
        });
        alert('Interest accepted! Your profile has been shared with the recruiter.');
      } else {
        alert(`Failed to accept interest: ${result.error}`);
      }
      return result;
    } catch (err: any) {
      console.error('Error accepting interest:', err);
      alert('Failed to accept interest. Please try again.');
      return { success: false, error: err.message };
    }
  }, [pendingConsideration, jobData]);

  const handleRejectInvitation = useCallback(async () => {
    if (!pendingConsideration || (pendingConsideration.status !== 'pending' && pendingConsideration.status !== 'accepted') || !jobData) return;
    try {
      await declineConsideration(pendingConsideration.id, 'Thank you, but I am not interested at this time.');
      setPendingConsideration(null);
      setJobData({
        ...jobData,
        hasPendingConsideration: false,
        pendingConsiderationId: null,
        pendingConsiderationMessage: null
      });
      alert('Invitation rejected.');
    } catch (err: any) {
      console.error('Failed to reject invitation:', err);
      alert('Failed to reject invitation. Please try again.');
    }
  }, [pendingConsideration, jobData]);

  const handleQuickApply = useCallback(async () => {
    if (!jobData) return;
    if (pendingConsideration?.status === 'pending') {
      await handleAcceptInterest();
      return;
    }
    if (jobData.hasApplied || jobData.isApplied || pendingConsideration?.status === 'accepted') {
      alert('You have already applied to this job.');
      return;
    }
    try {
      const result = await candidateProfileService.quickApplyToJob(Number(jobData.id), `Quick apply for ${jobData.title}`);
      if (result.success) {
        onJobApplication?.(jobData, 'quick-apply');
        setJobData({ ...jobData, hasApplied: true, isApplied: true, applicationMethod: 'quick-apply' });
        alert('Application submitted successfully!');
      } else {
        alert(`Failed to apply: ${result.error}`);
      }
    } catch (err: any) {
      console.error('Error applying to job:', err);
      alert('Failed to apply. Please try again.');
    }
  }, [jobData, pendingConsideration, handleAcceptInterest, onJobApplication]);

  return {
    jobData,
    setJobData,
    isLoading,
    error,
    jobNotes,
    isSavingNotes,
    pendingConsideration,
    setPendingConsideration,
    scheduledInterviews,
    videoResponses,
    handleSaveNotes,
    handleJoinCall,
    handleAcceptInterest,
    handleRejectInvitation,
    handleQuickApply
  };
}
