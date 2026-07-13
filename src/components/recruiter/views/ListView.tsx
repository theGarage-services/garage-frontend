/**
 * List View Component
 * Displays job postings list with search and filters
 */
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { AppHeader } from '../../layout/AppHeader';
import {
  Search,
  Filter,
  Plus,
  Loader2,
  AlertCircle,
  Building2,
  MapPin,
  DollarSign,
  Clock,
  Users,
  Eye,
  Briefcase
} from 'lucide-react';
import type { JobPosting } from '@/api/jobManagement';
import { getStatusColor } from '../utils';

interface ListViewProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  filteredJobs: JobPosting[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterStatus: string;
  setFilterStatus: (status: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
  error: string | null;
  handleViewJob: (job: any) => void;
  fetchJobPostings: () => Promise<void>;
}

const getJobsByTab = (jobs: JobPosting[], tab: string) => {
  switch (tab) {
    case 'active':
      return jobs.filter(job => job.status === 'published');
    case 'draft':
      return jobs.filter(job => job.status === 'draft');
    case 'closed':
      return jobs.filter(job => job.status === 'closed' || job.status === 'paused');
    case 'all':
    default:
      return jobs;
  }
};

const getEmptyMessage = (tab: string, hasSearchOrFilter: boolean) => {
  const baseMessages: Record<string, { title: string; desc: string }> = {
    active: { title: 'No active job postings', desc: hasSearchOrFilter ? 'Try adjusting your search or filters' : 'Publish a job posting to see it here' },
    draft: { title: 'No draft job postings', desc: hasSearchOrFilter ? 'Try adjusting your search or filters' : 'Create a draft job posting to see it here' },
    closed: { title: 'No closed or paused job postings', desc: hasSearchOrFilter ? 'Try adjusting your search or filters' : 'Closed or paused job postings will appear here' },
    all: { title: 'No job postings found', desc: hasSearchOrFilter ? 'Try adjusting your search or filters' : 'Create your first job posting to get started' }
  };
  return baseMessages[tab] || baseMessages.all;
};

const JobCard = ({ job, handleViewJob }: { job: JobPosting; handleViewJob: (job: any) => void }) => (
  <Card
    key={job.id}
    className="p-6 hover:shadow-lg transition-all duration-300 group cursor-pointer"
    onClick={() => handleViewJob(job)}
  >
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl text-gray-900 group-hover:text-[#ff6b35] transition-colors">{job.title}</h3>
          <Badge className={getStatusColor(job.status)}>
            {job.status}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Building2 className="w-4 h-4" />
            {job.department}
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {job.location}
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="w-4 h-4" />
            {job.salary}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {job.experience}
          </div>
        </div>

        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {job.applicants} applicants
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            {job.views} views
          </div>
        </div>
      </div>
    </div>
  </Card>
);

const EmptyState = ({ title, description }: { title: string; description: string }) => (
  <Card className="p-12 text-center">
    <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-400" />
    <h3 className="text-lg text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </Card>
);

export const ListView = ({
  user,
  onNavigate,
  onLogout,
  filteredJobs,
  searchQuery,
  setSearchQuery,
  filterStatus,
  setFilterStatus,
  activeTab,
  setActiveTab,
  isLoading,
  error,
  handleViewJob,
  fetchJobPostings
}: ListViewProps) => {
  const jobsByTab = getJobsByTab(filteredJobs, activeTab);
  const hasSearchOrFilter = Boolean(searchQuery) || filterStatus !== 'all';
  const emptyMessage = getEmptyMessage(activeTab, hasSearchOrFilter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole="recruiter"
        user={user}
        currentView="job-management"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      {/* Page Title & Controls Section */}
      <div className="pt-20 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white pb-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold mb-2">Job Management</h1>
              <p className="text-white/90">Create, manage, and track your job postings</p>
            </div>

            <Button
              onClick={() => onNavigate('job-posting')}
              className="bg-white text-[#ff6b35] hover:bg-white/90 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Job Posting
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Filters and Search */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-none sm:max-w-[95vw] sm:max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search job postings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full sm:w-48 h-10">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-gray-600">
              {isLoading ? 'Loading...' : `${jobsByTab.length} job${jobsByTab.length === 1 ? '' : 's'} found`}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <Card className="p-12 text-center mt-4">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-gray-400 animate-spin" />
              <h3 className="text-lg text-gray-900 mb-2">Loading job postings...</h3>
            </Card>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <Card className="p-12 text-center border-red-200 mt-4">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg text-gray-900 mb-2">Error loading jobs</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={fetchJobPostings} variant="outline">
                Retry
              </Button>
            </Card>
          )}
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white border border-gray-200">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="closed">Closed/Paused</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <div className="space-y-4">
              {jobsByTab.length === 0 && !isLoading && (
                <EmptyState title={emptyMessage.title} description={emptyMessage.desc} />
              )}

              {jobsByTab.map((job) => (
                <JobCard key={job.id} job={job} handleViewJob={handleViewJob} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ListView;
