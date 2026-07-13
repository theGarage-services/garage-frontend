import { useState, useCallback } from 'react';
import { recruiterCandidatesApi } from '../../../api/recruiterCandidates';

export function useCandidateActions(candidateId: string, candidateName: string, jobId: string | undefined, initialIsSaved: boolean) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isTogglingSave, setIsTogglingSave] = useState(false);
  const [isDownloadingResume, setIsDownloadingResume] = useState(false);

  const handleDownloadResume = useCallback(async () => {
    if (!candidateId) return;
    setIsDownloadingResume(true);
    try {
      await recruiterCandidatesApi.downloadCandidateResume(candidateId, candidateName, jobId);
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to download resume');
    } finally {
      setIsDownloadingResume(false);
    }
  }, [candidateId, candidateName, jobId]);

  const handleToggleSave = useCallback(async () => {
    if (!candidateId) return;
    setIsTogglingSave(true);
    try {
      if (isSaved) {
        await recruiterCandidatesApi.unsaveCandidate(candidateId, jobId);
        setIsSaved(false);
      } else {
        await recruiterCandidatesApi.saveCandidate(candidateId, jobId);
        setIsSaved(true);
      }
    } catch (error: any) {
      globalThis.alert(error?.message || 'Failed to update saved status');
    } finally {
      setIsTogglingSave(false);
    }
  }, [candidateId, isSaved, jobId]);

  return { isSaved, setIsSaved, isTogglingSave, isDownloadingResume, handleDownloadResume, handleToggleSave };
}
