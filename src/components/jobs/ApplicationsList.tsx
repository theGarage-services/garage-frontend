import { useState } from 'react';
import { JobApplication } from '../../types/job';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Calendar, MapPin, DollarSign, ExternalLink, Search, Filter } from 'lucide-react';
import { safeOpenWindow } from '@/utils/safe-url';

interface ApplicationsListProps {
  jobs: JobApplication[];
  onEditJob: (job: JobApplication) => void;
}

export function ApplicationsList({ jobs, onEditJob }: Readonly<ApplicationsListProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('dateApplied');

  const getStatusColor = (status: JobApplication['status']) => {
    switch (status) {
      case 'consider': return 'bg-yellow-100 text-yellow-800';
      case 'applied': return 'bg-blue-100 text-blue-800';
      case 'interviews': return 'bg-purple-100 text-purple-800';
      case 'offers': return 'bg-emerald-100 text-emerald-800';
      case 'hired': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'withdrawn': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: JobApplication['status']) => {
    switch (status) {
      case 'consider': return 'Consider';
      case 'applied': return 'Applied';
      case 'interviews': return 'Interviews';
      case 'offers': return 'Offers';
      case 'hired': return 'Hired';
      case 'rejected': return 'Rejected';
      case 'withdrawn': return 'Withdrawn';
      default: return status;
    }
  };

  const filteredAndSortedJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.company.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'dateApplied':
          return new Date(b.dateApplied || b.dateAdded).getTime() - new Date(a.dateApplied || a.dateAdded).getTime();
        case 'lastUpdated':
          return new Date(b.lastUpdated || b.dateAdded).getTime() - new Date(a.lastUpdated || a.dateAdded).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'company':
          return a.company.localeCompare(b.company);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by job title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 bg-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="consider">Consider</SelectItem>
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviews">Interviews</SelectItem>
                <SelectItem value="offers">Offers</SelectItem>
                <SelectItem value="hired">Hired</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="withdrawn">Withdrawn</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dateApplied">Date Applied</SelectItem>
              <SelectItem value="lastUpdated">Last Updated</SelectItem>
              <SelectItem value="title">Job Title</SelectItem>
              <SelectItem value="company">Company</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredAndSortedJobs.length} of {jobs.length} applications
        </p>
      </div>

      {/* Applications Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Job & Company</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location & Salary</TableHead>
              <TableHead>Applied Date</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedJobs.map((job) => (
              <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditJob(job)}>
                <TableCell>
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-muted-foreground">{job.company}</div>
                    {job.recruiterNotes && (
                      <div className="text-xs text-blue-600 mt-1">
                        Recruiter: {job.recruiterNotes}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(job.status)}>
                    {getStatusLabel(job.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {job.location && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="w-3 h-3" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    {job.salary && (
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="w-3 h-3" />
                        <span>{job.salary}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(job.dateApplied || job.dateAdded).toLocaleDateString()}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {job.lastUpdated && (
                    <span className="text-sm">
                      {new Date(job.lastUpdated).toLocaleDateString()}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={(e: { stopPropagation: () => void; }) => {
                        e.stopPropagation();
                        onEditJob(job);
                      }}
                    >
                      Edit
                    </Button>
                    {job.jobUrl && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={(e: { stopPropagation: () => void; }) => {
                          e.stopPropagation();
                          safeOpenWindow(job.jobUrl, '_blank');
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {filteredAndSortedJobs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No applications found matching your criteria.</p>
            {searchTerm || statusFilter !== 'all' ? (
              <p className="text-sm mt-2">Try adjusting your search or filters.</p>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}