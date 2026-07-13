/**
 * Job Detail View Component
 * Displays detailed job information with actions
 */
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { UpdateJobStatusModal } from '../../jobs/UpdateJobStatusModal';
import {
  ArrowLeft,
  Edit,
  Users,
  Activity,
  BarChart3,
  Building2,
  MapPin,
  DollarSign,
  CheckCircle,
  Target
} from 'lucide-react';
import { getStatusColor } from '../utils';
import { candidateProfileService } from '../../../api/candidateProfile';
import { useState, useEffect } from 'react';

interface JobDetailViewProps {
  selectedJob: any;
  handleBackToList: () => void;
  handleEditJob: (job: any) => void;
  handleViewCandidates: (job: any) => void;
  handleUpdateJobStatus: (job: any) => void;
  handleViewResults: (job: any) => void;
  showJobStatusUpdate: boolean;
  jobStatusUpdateTarget: any;
  setShowJobStatusUpdate: (show: boolean) => void;
  setJobStatusUpdateTarget: (target: null) => void;
  handleJobStatusUpdate: (status: any) => Promise<void>;
}

export const JobDetailView = ({
  selectedJob,
  handleBackToList,
  handleEditJob,
  handleViewCandidates,
  handleUpdateJobStatus,
  handleViewResults,
  showJobStatusUpdate,
  jobStatusUpdateTarget,
  setShowJobStatusUpdate,
  setJobStatusUpdateTarget,
  handleJobStatusUpdate
}: JobDetailViewProps) => {
  // State for candidate counts
  const [candidateCount, setCandidateCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState<boolean>(false);

  // Fetch candidate count based on job's industry and experience level
  useEffect(() => {
    const fetchCandidateCount = async () => {
      if (!selectedJob?.industry && !selectedJob?.experience_level) {
        setCandidateCount(0);
        return;
      }

      setIsLoadingCount(true);
      try {
        // Use predicted values if available, otherwise use manual values
        const industry = selectedJob?.predicted_industry || selectedJob?.industry;
        const experienceLevel = selectedJob?.predicted_level || selectedJob?.experience_level;
        
        if (industry || experienceLevel) {
          const result = await candidateProfileService.getCandidateCountByIndustryLevel(
            industry,
            experienceLevel
          );
          setCandidateCount(result.count);
        } else {
          setCandidateCount(0);
        }
      } catch (error) {
        console.error('Error fetching candidate count:', error);
        setCandidateCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchCandidateCount();
  }, [selectedJob?.industry, selectedJob?.experience_level, selectedJob?.predicted_industry, selectedJob?.predicted_level]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <Button
            variant="outline"
            onClick={handleBackToList}
            className="text-gray-900 hover:text-[#ff6b35] hover:border-[#ff6b35] border-2 self-start"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Back to Job List</span>
          </Button>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => handleEditJob(selectedJob)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Job
          </Button>
          <Button variant="outline" onClick={() => handleViewCandidates(selectedJob)}>
            <Users className="w-4 h-4 mr-2" />
            View Candidates
          </Button>
          <Button
            variant="outline"
            onClick={() => handleUpdateJobStatus(selectedJob)}
            className="border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white"
          >
            <Activity className="w-4 h-4 mr-2" />
            Update Job Status
          </Button>
          <Button
            onClick={() => handleViewResults(selectedJob)}
            className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#d4461f] text-white"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Results
          </Button>
        </div>
      </div>

      <Card className="p-8">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl text-gray-900 mb-2">{selectedJob.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                {selectedJob.department}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {selectedJob.location}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {selectedJob.salary}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[#ff6b35] border-[#ff6b35]">
                Queue: {selectedJob.queue}
              </Badge>
              <Badge variant="outline" className="text-blue-600 border-blue-300">
                {isLoadingCount ? 'Loading...' : `${candidateCount} candidates in queue`}
              </Badge>
            </div>
          </div>
          <Badge className={getStatusColor(selectedJob.status)}>
            {selectedJob.status}
          </Badge>
        </div>

        {/* Job Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl text-blue-600 mb-1">{selectedJob.applicants}</div>
            <div className="text-sm text-blue-600">Applicants</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl text-green-600 mb-1">{selectedJob.views}</div>
            <div className="text-sm text-green-600">Views</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl text-purple-600 mb-1">{selectedJob.interviews}</div>
            <div className="text-sm text-purple-600">Interviews</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl text-orange-600 mb-1">{selectedJob.offers}</div>
            <div className="text-sm text-orange-600">Offers</div>
          </div>
        </div>

        {/* Job Description */}
        <div className="space-y-6">
          <div>
            <h3 className="text-xl text-gray-900 mb-3">Job Description</h3>
            <p className="text-gray-700 leading-relaxed">{selectedJob.description}</p>
          </div>

          <div>
            <h3 className="text-xl text-gray-900 mb-3">Requirements</h3>
            <ul className="space-y-2">
              {selectedJob.requirements?.map((req: string) => (
                <li key={req} className="flex items-start gap-2 text-gray-700">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl text-gray-900 mb-3">Responsibilities</h3>
            <ul className="space-y-2">
              {selectedJob.responsibilities?.map((resp: string) => (
                <li key={resp} className="flex items-start gap-2 text-gray-700">
                  <Target className="w-5 h-5 text-[#ff6b35] mt-0.5 flex-shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>
    </div>

    {/* Job Status Update Modal */}
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
  </div>
  );
};

export default JobDetailView;
