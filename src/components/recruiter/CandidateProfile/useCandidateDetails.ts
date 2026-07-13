import { useState, useEffect } from 'react';
import { recruiterCandidatesApi, type CandidateDetail } from '../../../api/recruiterCandidates';

export function useCandidateDetails(routeId: string | undefined, jobId: string | undefined, initialCandidate?: any) {
  const [candidateDetails, setCandidateDetails] = useState<CandidateDetail | null>(initialCandidate || null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!routeId) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const fetched = await recruiterCandidatesApi.fetchCandidateDetails(routeId, jobId);
        setCandidateDetails(fetched);
      } catch (error: any) {
        setErrorMessage(error?.message || 'Unable to load candidate details');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchCandidate();
  }, [routeId, jobId]);

  return { candidateDetails, isLoading, errorMessage, setCandidateDetails };
}
