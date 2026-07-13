import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { AppHeader } from '../layout/AppHeader';
import { Label } from '../ui/label';
import { 
  CheckCircle2, 
  XCircle, 
  Briefcase,
  DollarSign,
  MapPin,
  Eye,
  FileText,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react';
import { Input } from '../ui/input';
import { approvalService, type QueueApproval } from '../../api/approvals';

interface ApprovalQueueProps {
  user: any;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  pendingApprovals?: any[];
}

export function ApprovalQueue({
  user,
  onNavigate,
  onLogout,
  pendingApprovals = []
}: Readonly<ApprovalQueueProps>) {
  const [selectedItem, setSelectedItem] = useState<QueueApproval | null>(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'job-posting' | 'offer' | 'budget'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [approvals, setApprovals] = useState<QueueApproval[]>(pendingApprovals);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchApprovals() {
      setIsLoading(true);
      try {
        const data = await approvalService.getPendingApprovals();
        if (!cancelled) {
          setApprovals(data);
        }
      } catch (error) {
        console.error('Error fetching approvals:', error);
        if (!cancelled) {
          setApprovals([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchApprovals();
    return () => { cancelled = true; };
  }, []);

  // Generic handler for approval actions (approve/reject)
  const handleApprovalAction = async (item: QueueApproval, action: 'approve' | 'reject') => {
    try {
      if (action === 'approve') {
        await approvalService.approve(item.id, { comment: approvalComment });
      } else {
        await approvalService.reject(item.id, { comment: approvalComment });
      }
      setApprovals(prev => prev.filter(a => a.id !== item.id));
      setSelectedItem(null);
      setApprovalComment('');
    } catch (error) {
      console.error(`Error ${action}ing approval:`, error);
    }
  };

  const handleApprove = async (item: QueueApproval) => {
    await handleApprovalAction(item, 'approve');
  };

  const handleReject = async (item: QueueApproval) => {
    await handleApprovalAction(item, 'reject');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35]"></div>
        <span className="ml-3 text-gray-600">Loading approvals...</span>
      </div>
    );
  }

  const filteredApprovals = approvals.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = searchQuery === '' || 
      JSON.stringify(item.data).toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submittedBy.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'job-posting':
        return <Briefcase className="w-5 h-5" />;
      case 'offer':
        return <FileText className="w-5 h-5" />;
      case 'budget':
        return <DollarSign className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'job-posting':
        return 'from-blue-500 to-blue-600';
      case 'offer':
        return 'from-green-500 to-green-600';
      case 'budget':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge className="bg-red-100 text-red-700 border-red-200">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Low</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const getUserRole = () => {
    if (user?.role === 'lead') return 'recruiter';
    if (user?.role === 'master') return 'admin';
    return 'recruiter';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-gray-100">
      <AppHeader
        userRole={getUserRole()}
        user={user}
        currentView="approval-queue"
        onNavigate={onNavigate}
        onLogout={onLogout}
      />

      <div className="pt-16">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl text-white mb-2">Approval Queue</h1>
                  <p className="text-orange-100">Review and approve pending requests</p>
                </div>
              </div>
              <Badge className="bg-white text-[#ff6b35] text-lg px-4 py-2 self-start sm:self-auto">
                {filteredApprovals.length} Pending
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters and Search */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-[95vw] sm:max-w-md w-full">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    placeholder="Search approvals..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35]"
                  >
                    <option value="all">All Types</option>
                    <option value="job-posting">Job Postings</option>
                    <option value="offer">Offers</option>
                    <option value="budget">Budget Requests</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Approval Items */}
          {filteredApprovals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredApprovals.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(item.type)} rounded-xl flex items-center justify-center text-white shrink-0`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 capitalize">
                            {item.type.replace('-', ' ')}
                          </h3>
                          {getUrgencyBadge(item.urgency)}
                        </div>
                        <p className="text-sm text-gray-600">{formatDate(item.submittedAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submitted By */}
                  <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={item.submittedBy.avatar || undefined} />
                      <AvatarFallback className="bg-gray-300 text-gray-700 text-xs">
                        {item.submittedBy.name.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.submittedBy.name}</p>
                      <p className="text-xs text-gray-600">{item.submittedBy.email}</p>
                    </div>
                  </div>

                  {/* Content Preview */}
                  <div className="mb-4 space-y-2">
                    {item.type === 'job-posting' && (
                      <>
                        <h4 className="font-medium text-gray-900">{item.data.title}</h4>
                        <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {item.data.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {item.data.salaryRange}
                          </div>
                        </div>
                      </>
                    )}

                    {item.type === 'offer' && (
                      <>
                        <h4 className="font-medium text-gray-900">{item.data.candidateName}</h4>
                        <p className="text-sm text-gray-600">{item.data.position}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                          <span>💰 {item.data.salary}</span>
                          <span>📊 {item.data.equity}</span>
                          <span>🎁 {item.data.bonus}</span>
                        </div>
                      </>
                    )}

                    {item.type === 'budget' && (
                      <>
                        <h4 className="font-medium text-gray-900">{item.data.amount}</h4>
                        <p className="text-sm text-gray-600">{item.data.purpose}</p>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItem(item)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedItem(item);
                        // Auto-focus approve
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedItem(item)}
                      className="border-red-200 text-red-600 hover:bg-red-50 self-center"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600">
                {searchQuery || filterType !== 'all' 
                  ? 'No approvals match your search criteria'
                  : 'No pending approvals at the moment'}
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Review Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-[95vw] sm:max-w-[95vw] sm:max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-start sm:items-center gap-3 min-w-0">
                  <div className={`w-12 h-12 bg-gradient-to-br ${getTypeColor(selectedItem.type)} rounded-xl flex items-center justify-center text-white shrink-0`}>
                    {getTypeIcon(selectedItem.type)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-medium text-gray-900 capitalize">
                      {selectedItem.type.replace('-', ' ')} Approval
                    </h3>
                    <p className="text-sm text-gray-600">Submitted {formatDate(selectedItem.submittedAt)}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 self-start"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Submitted By */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Submitted by</p>
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedItem.submittedBy.avatar || undefined} />
                    <AvatarFallback className="bg-gray-300 text-gray-700">
                      {selectedItem.submittedBy.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-gray-900">{selectedItem.submittedBy.name}</p>
                    <p className="text-sm text-gray-600">{selectedItem.submittedBy.email}</p>
                  </div>
                </div>
              </div>

              {/* Full Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Details</h4>
                {selectedItem.type === 'job-posting' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Position</p>
                      <p className="font-medium text-gray-900">{selectedItem.data.title}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Department</p>
                        <p className="text-gray-900">{selectedItem.data.department}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Type</p>
                        <p className="text-gray-900">{selectedItem.data.type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="text-gray-900">{selectedItem.data.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Salary Range</p>
                        <p className="text-gray-900">{selectedItem.data.salaryRange}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Description</p>
                      <p className="text-gray-900">{selectedItem.data.description}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Requirements</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.data.requirements.map((req: string) => (
                          <li key={req} className="text-gray-900">{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'offer' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Candidate</p>
                        <p className="font-medium text-gray-900">{selectedItem.data.candidateName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Position</p>
                        <p className="text-gray-900">{selectedItem.data.position}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Base Salary</p>
                        <p className="text-gray-900">{selectedItem.data.salary}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Start Date</p>
                        <p className="text-gray-900">{selectedItem.data.startDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Equity</p>
                        <p className="text-gray-900">{selectedItem.data.equity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Sign-on Bonus</p>
                        <p className="text-gray-900">{selectedItem.data.bonus}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedItem.type === 'budget' && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Amount Requested</p>
                      <p className="text-2xl font-medium text-gray-900">{selectedItem.data.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Purpose</p>
                      <p className="text-gray-900">{selectedItem.data.purpose}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Breakdown</p>
                      <ul className="list-disc list-inside space-y-1">
                        {selectedItem.data.breakdown.map((item: string) => (
                          <li key={item} className="text-gray-900">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              {/* Comment */}
              <div className="mb-6">
                <Label htmlFor="comment">Add Comment (Optional)</Label>
                <Textarea
                  id="comment"
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder="Add notes or feedback..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Button
                  onClick={() => handleReject(selectedItem)}
                  variant="outline"
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedItem)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}