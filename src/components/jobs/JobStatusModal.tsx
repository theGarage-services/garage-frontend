import { useState, useEffect } from 'react';
import { X, CheckCircle, Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { jobPostsApi } from '../../api/jobPosts';

interface JobStatusModalProps {
  job: any;
  isPremium: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function JobStatusModal({ job, isPremium, onClose, onUpgrade }: Readonly<JobStatusModalProps>) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch hiring status from API
  useEffect(() => {
    const fetchHiringStatus = async () => {
      if (!job?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await jobPostsApi.getJobHiringStatus(job.id);

        if (!response.success) {
          setError('Failed to load hiring status');
        }
      } catch (err: any) {
        console.error('Error fetching hiring status:', err);
        setError(err.message || 'Failed to load hiring status');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHiringStatus();
  }, [job?.id]);

  // Show upgrade prompt for basic users
  if (!isPremium) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-[90vw] sm:max-w-[95vw] sm:max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Premium Feature</h2>
            <p className="text-gray-600">Get real-time hiring status updates for all job postings</p>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Current Hiring Stage</h3>
                <p className="text-sm text-gray-600">Know exactly where they are in the process</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Positions Filled vs Remaining</h3>
                <p className="text-sm text-gray-600">See how many spots are still available</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Application & Interview Counts</h3>
                <p className="text-sm text-gray-600">Understand the competition level</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Updates from Hiring Teams</h3>
                <p className="text-sm text-gray-600">Direct insights from recruiters</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onUpgrade || onClose}
              className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            Starting at $9.99/month
          </p>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-[90vw] sm:max-w-[95vw] sm:max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
          <div className="text-center">
            <div className="animate-pulse text-gray-600">Loading hiring status...</div>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card className="max-w-[90vw] sm:max-w-[95vw] sm:max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <div className="text-center">
            <h3 className="text-lg text-red-600 mb-2">Error Loading Status</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Show detailed status for premium users
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-[90vw] sm:max-w-[95vw] sm:max-w-lg w-full p-8 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Premium Feature</h2>
          <p className="text-gray-600">Get real-time hiring status updates for all job postings</p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Current Hiring Stage</h3>
              <p className="text-sm text-gray-600">Know exactly where they are in the process</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Positions Filled vs Remaining</h3>
              <p className="text-sm text-gray-600">See how many spots are still available</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Application & Interview Counts</h3>
              <p className="text-sm text-gray-600">Understand the competition level</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Updates from Hiring Teams</h3>
              <p className="text-sm text-gray-600">Direct insights from recruiters</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onUpgrade || onClose}
            className="flex-1 bg-gradient-to-r from-[#ff6b35] to-[#ff8c42] hover:from-[#e55a2b] hover:to-[#ff6b35] text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          Starting at $9.99/month
        </p>
      </Card>
    </div>
  );
}
