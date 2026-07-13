import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { educationDocumentService } from '../../api/educationDocuments';
import { experienceDocumentService, type ExperienceDocument } from '../../api/experienceDocuments';
import { CandidateProfileHeader } from './CandidateProfile/CandidateProfileHeader';
import { CandidateProfileSidebar } from './CandidateProfile/CandidateProfileSidebar';
import { flagCandidateProfileAsFraud } from '../../api/fraud';
import { CandidateProfileTabs } from './CandidateProfile/CandidateProfileTabs';
import { CandidateProfileError } from './CandidateProfile/CandidateProfileError';
import { CandidateProfileLoading } from './CandidateProfile/CandidateProfileLoading';
import { useCandidateDetails } from './CandidateProfile/useCandidateDetails';
import { useCandidateActions } from './CandidateProfile/useCandidateActions';
import { buildEnhancedCandidate } from './CandidateProfile/utils';
import type { EducationDocument, RecruiterCandidateProfilePageProps } from './CandidateProfile/types';

export function RecruiterCandidateProfilePage({
  candidate,
  onBack,
  onNavigate,
  onUpdateStatus,
  onScheduleInterview,
  onSendMessage,
  availableJobs,
  setSelectedCandidate
}: Readonly<RecruiterCandidateProfilePageProps>) {
  const { id: routeId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const jobIdFromRoute = searchParams.get('job_id') ?? undefined;
  const { candidateDetails, isLoading, errorMessage, setCandidateDetails } = useCandidateDetails(routeId, jobIdFromRoute, candidate);
  const currentJobId = candidateDetails?.current_job_id ?? jobIdFromRoute;
  const [educationDocuments, setEducationDocuments] = useState<EducationDocument[]>([]);
  const [experienceDocuments, setExperienceDocuments] = useState<ExperienceDocument[]>([]);

  useEffect(() => {
    const loadDocuments = async () => {
      const profileId = candidateDetails?.candidate_profile_id;
      if (!profileId) return;
      try {
        const docs = await educationDocumentService.getDocuments({ candidate_id: profileId });
        setEducationDocuments(docs);
      } catch (error) {
        console.error('Failed to load education documents:', error);
      }
    };
    void loadDocuments();
  }, [candidateDetails?.candidate_profile_id]);

  useEffect(() => {
    const loadExperienceDocuments = async () => {
      const profileId = candidateDetails?.candidate_profile_id;
      if (!profileId) return;
      try {
        const docs = await experienceDocumentService.getDocuments({ candidate_id: profileId });
        setExperienceDocuments(docs);
      } catch (error) {
        console.error('Failed to load experience documents:', error);
      }
    };
    void loadExperienceDocuments();
  }, [candidateDetails?.candidate_profile_id]);

  const source = candidateDetails || candidate;
  const enhancedCandidate = buildEnhancedCandidate(source);

  const {
    isSaved,
    setIsSaved,
    isTogglingSave,
    isDownloadingResume,
    handleDownloadResume,
    handleToggleSave
  } = useCandidateActions(
    enhancedCandidate.id,
    enhancedCandidate.name,
    currentJobId,
    enhancedCandidate.isSaved
  );

  useEffect(() => {
    if (candidateDetails?.isSaved !== undefined) {
      setIsSaved(candidateDetails.isSaved);
    }
  }, [candidateDetails?.isSaved, setIsSaved]);

  if (isLoading) {
    return <CandidateProfileLoading />;
  }

  if (!candidateDetails && !candidate) {
    return <CandidateProfileError onBack={onBack} errorMessage={errorMessage} />;
  }

  let saveButtonLabel: string;
  if (isTogglingSave) {
    saveButtonLabel = 'Saving...';
  } else if (isSaved) {
    saveButtonLabel = 'Saved';
  } else {
    saveButtonLabel = 'Save';
  }

  const handleFlagFraud = async (reason: string) => {
    await flagCandidateProfileAsFraud(enhancedCandidate.id, reason);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <CandidateProfileHeader
          onBack={onBack}
          candidate={enhancedCandidate}
          isDownloadingResume={isDownloadingResume}
          handleDownloadResume={handleDownloadResume}
          isTogglingSave={isTogglingSave}
          isSaved={isSaved}
          saveButtonLabel={saveButtonLabel}
          handleToggleSave={handleToggleSave}
          onFlagFraud={handleFlagFraud}
        />

        <div className="grid lg:grid-cols-4 gap-8">
          <CandidateProfileSidebar
            candidate={enhancedCandidate}
            candidateDetails={candidateDetails}
            currentJobId={currentJobId}
            routeId={routeId}
            availableJobs={availableJobs}
            setCandidateDetails={setCandidateDetails}
            onUpdateStatus={onUpdateStatus}
            onSendMessage={onSendMessage}
            onScheduleInterview={onScheduleInterview}
            setSelectedCandidate={setSelectedCandidate}
            onNavigate={onNavigate}
          />

          <div className="lg:col-span-3">
            <CandidateProfileTabs
              candidate={enhancedCandidate}
              routeId={routeId}
              currentJobId={currentJobId}
              educationDocuments={educationDocuments}
              experienceDocuments={experienceDocuments}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
