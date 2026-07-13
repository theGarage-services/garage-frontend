import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { RecruiterPersonalityResults } from './RecruiterPersonalityResults';
import { RecruiterCandidateTimeline } from './RecruiterCandidateTimeline';
import { CandidateNotesSection } from './CandidateNotesSection';
import { CandidateProfileOverview } from './CandidateProfileOverview';
import { CandidateProfileExperience } from './CandidateProfileExperience';
import { CandidateProfileAnalytics } from './CandidateProfileAnalytics';
import { CandidateVideoResponses } from './CandidateVideoResponses';
import type { EducationDocument, ExperienceDocument } from './types';

export interface CandidateProfileTabsProps {
  candidate: any;
  routeId: string | undefined;
  currentJobId: string | undefined;
  educationDocuments: EducationDocument[];
  experienceDocuments: ExperienceDocument[];
}

export function CandidateProfileTabs({
  candidate,
  routeId,
  currentJobId,
  educationDocuments,
  experienceDocuments,
}: Readonly<CandidateProfileTabsProps>) {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList className="flex flex-wrap h-auto min-h-9 w-full bg-white border sm:flex-nowrap sm:overflow-x-auto">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="experience">Experience</TabsTrigger>
        <TabsTrigger value="notes">Notes</TabsTrigger>
        <TabsTrigger value="video">Video Responses</TabsTrigger>
        <TabsTrigger value="personality">Personality</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <CandidateProfileOverview candidate={candidate} />
      </TabsContent>

      <TabsContent value="experience" className="space-y-6">
        <CandidateProfileExperience
          candidate={candidate}
          educationDocuments={educationDocuments}
          experienceDocuments={experienceDocuments}
        />
      </TabsContent>

      <TabsContent value="notes" className="space-y-6">
        <CandidateNotesSection candidateId={routeId} jobId={currentJobId} />
      </TabsContent>

      <TabsContent value="video" className="space-y-6">
        <CandidateVideoResponses responses={candidate.video_responses || []} />
      </TabsContent>

      <TabsContent value="personality" className="space-y-6">
        <RecruiterPersonalityResults candidateProfileId={candidate.candidate_profile_id} />
      </TabsContent>

      <TabsContent value="timeline" className="space-y-6">
        <RecruiterCandidateTimeline candidateId={candidate.id} jobId={currentJobId} />
      </TabsContent>

      <TabsContent value="analytics" className="space-y-6">
        <CandidateProfileAnalytics candidate={candidate} />
      </TabsContent>
    </Tabs>
  );
}
